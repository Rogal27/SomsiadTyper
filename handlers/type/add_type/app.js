const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const response = require("/opt/response");
const tables = require("/opt/dbtables");
const tableScores = tables.USERS_SCORES;

exports.lambdaHandler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("received:", event);
  var user_id = event.requestContext.authorizer.claims.sub;

  var requestBody = JSON.parse(event.body);
  if (!requestBody) {
    const response = {
      statusCode: 400,
      body: "Request has no body.",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }
  if (!requestBody.matches) {
    const response = {
      statusCode: 400,
      body: "Matches are required.",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }
  for (var i = 0; i < requestBody.matches.length; i++) {
    var match = requestBody.matches[i];
    console.info("match", match);

    var match_id = match.match_id;
    var searchParams = {
      TableName: tableScores,
      IndexName: "user_index",
      KeyConditionExpression: "user_id = :user_id AND match_id = :match_id",
      ExpressionAttributeValues: { ":user_id": user_id, ":match_id": match_id },
    };
    const resultSearch = await docClient.query(searchParams).promise();

    console.info("Users_Scores search:", resultSearch);
    var id;
    if (resultSearch.Count > 0) {
      id = resultSearch.Items[0].id;
    } else {
      id = generate_guid();
    }
    var home_team_score = match.home_team_score;
    var away_team_score = match.away_team_score;

    var addParams = {
      TableName: tableScores,
      Item: {
        match_id: match_id,
        home_team_score: home_team_score,
        away_team_score: away_team_score,
        user_id: user_id,
        id: id,
      },
    };

    await docClient.put(addParams).promise();
  }

  const response = {
    statusCode: 200,
    body: "Success",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  return response;
};

function generate_guid() {
  var id = "",
    m = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
    i = 0,
    rb = (Math.random() * 0xffffffff) | 0;
  while (i++ < 36) {
    var c = m[i - 1],
      r = rb & 0xf,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    id += c == "-" || c == "4" ? c : v.toString(16);
    rb = i % 8 == 0 ? (Math.random() * 0xffffffff) | 0 : rb >> 4;
  }
  return id;
}
