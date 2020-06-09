const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const tables = require("/opt/dbtables");
const tableMatches = tables.MATCHES;

exports.lambdaHandler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("received:", event);

  // var user_role = event.requestContext.authorizer.claims.role;
  // if(user_role !== "ADMIN"){
  //   const response = {
  //     statusCode: 401,
  //     body: "Unauthorized",
  //     headers: {
  //       "Access-Control-Allow-Origin": "*",
  //     },
  //   };
  //   return response;
  // }

  var requestBody = JSON.parse(event.body);
  if (!requestBody.contest_id) {
    const response = {
      statusCode: 400,
      body: "Contest ID not found in body!",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }
  var contest_id = requestBody.contest_id;
  console.info("Contest ID in body:", contest_id);

  var params = {
    TableName: tableMatches,
    IndexName: "contest_index",
    KeyConditionExpression: "contest_id = :contest_id",
    ExpressionAttributeValues: { ":contest_id": contest_id },
  };

  const all_matches = await docClient.query(params).promise();

  var result = [];

  for (var i = 0; i < all_matches.Count; i++) {
    const current_match = all_matches.Items[i];
    var utcSeconds = current_match.match_day;
    var utc_date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    utc_date.setUTCSeconds(utcSeconds);

    var home_team_score = null;
    var away_team_score = null;

    if (current_match.home_team_score != null && current_match.away_team_score != null) {
      home_team_score = current_match.home_team_score;
      away_team_score = current_match.away_team_score;
    }

    var match_info = current_match.match_info;

    var match_data = match_info.split("#");

    result.push({
      match_id: current_match.match_id,
      home_team: match_data[0],
      away_team: match_data[1],
      date: utc_date,
      home_team_score: home_team_score,
      away_team_score: away_team_score,
    });
  }

  result.sort(function (a, b) {
    return a.date.getTime() - b.date.getTime();
  });

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      result,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  return response;
};
