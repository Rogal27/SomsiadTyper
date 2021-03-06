const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const response = require("/opt/response");
const tables = require("/opt/dbtables");
const matchTableName = tables.MATCHES;
const scoreTableName = tables.USERS_SCORES;

exports.lambdaHandler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("received:", event);
  var requestBody = JSON.parse(event.body);
  if (!requestBody) {
    return response.GetResponse(400, { message: "Request has no body." });
  }
  if (!requestBody.contest_id) {
    return response.GetResponse(400, { message: "Contest ID is required." });
  }
  var contest_id = requestBody.contest_id;

  var user_id = event.requestContext.authorizer.claims.sub;
  const date = new Date().getTime() / 1000;

  var params = {
    TableName: matchTableName,
    IndexName: "contest_index",
    KeyConditionExpression: "contest_id = :contest_id",
    FilterExpression: "#match_day >= :date",
    ExpressionAttributeNames: {
      "#match_day": "match_day",
    },
    ExpressionAttributeValues: {
      ":contest_id": contest_id,
      ":date": date,
    },
  };

  const matchesToType = await docClient.query(params).promise();

  console.info("Matches result:", matchesToType);
  var result = [];

  //TODO: make it asynchronous
  for (var i = 0; i < matchesToType.Count; i++) {
    const current_match = matchesToType.Items[i];
    var utcSeconds = current_match.match_day;
    var utc_date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    utc_date.setUTCSeconds(utcSeconds);

    var match_id = current_match.match_id;
    var searchParams = {
      TableName: scoreTableName,
      IndexName: "match_index",
      KeyConditionExpression: "match_id = :match_id AND user_id = :user_id",
      ExpressionAttributeValues: {
        ":match_id": match_id,
        ":user_id": user_id,
      },
    };
    var resultSearch = await docClient.query(searchParams).promise();
    console.info("Users_scores result:", resultSearch);

    var home_team_type = null;
    var away_team_type = null;

    if (resultSearch.Count > 0 && resultSearch.Items[0].home_team_score != null && resultSearch.Items[0].away_team_score != null) {
      home_team_type = resultSearch.Items[0].home_team_score;
      away_team_type = resultSearch.Items[0].away_team_score;
    }

    var match_info = current_match.match_info;

    var match_data = match_info.split("#");

    result.push({
      match_id: current_match.match_id,
      home_team: match_data[0],
      away_team: match_data[1],
      date: utc_date,
      home_team_type: home_team_type,
      away_team_type: away_team_type,
    });
  }

  result.sort(function (a, b) {
    return a.date.getTime() - b.date.getTime();
  });

  console.info("Returned matches:", result);

  return response.GetResponse(200, { result });
};
