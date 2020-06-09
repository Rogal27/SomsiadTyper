const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const tables = require("/opt/dbtables");
const tableName = tables.USERS_SCORES;
const tableMatches = tables.MATCHES;
exports.lambdaHandler = async (event, context, callback) => {
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("received:", event);
//   var user_id = event.requestContext.authorizer.claims['sub'];
  var requestBody = JSON.parse(event.body);
  var user_id = requestBody.user_id;
  var contest_id = requestBody.contest_id;
  const time = Date.now() / 1000;

  var params = {
    TableName: tableName,
    IndexName: "user_index",
    KeyConditionExpression: "user_id = :user_id",
    ExpressionAttributeValues: { ":user_id": user_id },
  };

  // Call DynamoDB to read the item to the table
  const allUsersMatches = await docClient.query(params).promise();

  var matches = [];
  for (var i = 0; i < allUsersMatches.Count; i++) {
    params = {
      TableName: tableMatches,
      KeyConditionExpression: "match_id = :match_id",
      ExpressionAttributeValues: { ":match_id": allUsersMatches.Items[i].match_id },
    };
    const res = await docClient.query(params).promise();
    if (res.Count != 1) 
    {
        console.info("wrong number of matches with id:", allUsersMatches.Items[i].match_id )
        continue;   
    }
    var match = res.Items[0];
    console.info(match);
    if (match.match_day <= time && match.contest_id == contest_id) {
        var home_team_score,away_team_score, points;
        if (typeof match.home_score !== 'undefined') 
            home_team_score = match.home_score;
        else
            home_team_score = null;
        if (typeof match.away_score !== 'undefined') 
            away_team_score = match.away_score;
        else
            away_team_score = null;

        if (typeof allUsersMatches.Items[i].points !== 'undefined') 
            points = allUsersMatches.Items[i].points;
        else
            points = null;
        
        var utcSeconds = match.match_day;
        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(utcSeconds);
        
        var matchToAdd = {
            "match_id": match.match_id,
            "home_team": match.home_team,
            "away_team": match.away_team,
            "home_team_score": home_team_score,
            "away_team_score":away_team_score,
            "typed_home_team_score": allUsersMatches.Items[i].home_team_score,
            "typed_away_team_score": allUsersMatches.Items[i].away_team_score,
            "match_day": d,
            "points": points
        }
        matches.push(matchToAdd);
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      matches: matches,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  return response;
};
