const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const response = require("/opt/response");
const tables = require("/opt/dbtables");
const tableMatches = tables.MATCHES;
const tableScores = tables.USERS_SCORES;

exports.lambdaHandler = async (event, context, callback) => {
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("received:", event);

  // var user_role = event.requestContext.authorizer.claims.role;
  // if(user_role !== "ADMIN"){
  //   return response.GetResponse(401, { message: "Unauthorized" });
  // }

  var requestBody = JSON.parse(event.body);
  if (!requestBody) {
    return response.GetResponse(400, { message: "Request has no body." });
  }
  if (!requestBody.match_id) {
    return response.GetResponse(400, { message: "Match ID is required." });
  }
  if (!requestBody.home_team_score) {
    return response.GetResponse(400, { message: "Home Team Score is required." });
  }
  if (!requestBody.away_team_score) {
    return response.GetResponse(400, { message: "Away Team Score ID is required." });
  }
  var id = requestBody.match_id;
  var home_team_score = requestBody.home_team_score;
  var away_team_score = requestBody.away_team_score;

  var params = {
    TableName: tableMatches,
    Key: { match_id: id },
    UpdateExpression: "set home_team_score = :home_score, away_team_score = :away_score",
    ExpressionAttributeValues: {
      ":home_score": home_team_score,
      ":away_score": away_team_score,
    },
  };

  const result = await docClient.update(params).promise();

  params = {
    TableName: tableScores,
    IndexName: "match_index",
    KeyConditionExpression: "match_id = :match_id",
    ExpressionAttributeValues: { ":match_id": id },
  };

  const resultSearch = await docClient.query(params).promise();

  var promises = [];
  var points;
  for (var i = 0; i < resultSearch.Count; i++) {
    const user_bet = resultSearch.Items[i];
    if (!user_bet.home_team_score || !user_bet.away_team_score || isNaN(user_bet.home_team_score) || isNaN(user_bet.away_team_score)) {
      points = 0;
    } else if (user_bet.home_team_score == home_team_score && user_bet.away_team_score == away_team_score) {
      points = 3;
    } else if (home_team_score == away_team_score && user_bet.home_team_score == user_bet.away_team_score) {
      points = 1;
    } else if ((user_bet.home_team_score - user_bet.away_team_score) * (home_team_score - away_team_score) > 0) {
      points = 1;
    } else {
      points = 0;
    }
    var params = {
      TableName: tableScores,
      Key: { id: user_bet.id },
      UpdateExpression: "set points = :points",
      ExpressionAttributeValues: {
        ":points": points,
      },
    };
    promises.push(docClient.update(params).promise());
  }
  await Promise.all(promises);

  return response.GetResponse(200, { message: "Success" });
};
