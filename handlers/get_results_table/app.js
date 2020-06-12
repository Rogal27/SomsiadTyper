const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const response = require("/opt/response");
const tables = require("/opt/dbtables");
const usersTableName = tables.USERS;
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

  const date = new Date().getTime() / 1000;

  var params = {
    TableName: matchTableName,
    IndexName: "contest_index",
    KeyConditionExpression: "contest_id = :contest_id",
    FilterExpression: "#match_day < :date AND attribute_exists(home_team_score) AND attribute_exists(away_team_score)",
    ExpressionAttributeNames: {
      "#match_day": "match_day",
    },
    ExpressionAttributeValues: {
      ":contest_id": contest_id,
      ":date": date,
    },
  };

  const matchesToType = await docClient.query(params).promise();

  // console.info("Matches result:", matchesToType);
  var points_dict = {};
  var pointsFromMatchesPromise = [];
  for (var i = 0; i < matchesToType.Count; i++) {
    const current_match = matchesToType.Items[i];
    var utcSeconds = current_match.match_day;
    var utc_date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    utc_date.setUTCSeconds(utcSeconds);

    var match_id = current_match.match_id;
    var searchParams = {
      TableName: scoreTableName,
      IndexName: "match_index",
      KeyConditionExpression: "match_id = :match_id",
      FilterExpression: "#points >= :min_points",
      ExpressionAttributeNames: {
        "#points": "points",
      },
      ExpressionAttributeValues: {
        ":match_id": match_id,
        ":min_points": 0,
      },
    };
    pointsFromMatchesPromise.push(docClient.query(searchParams).promise());
  }

  const pointsFromMatches = await Promise.all(pointsFromMatchesPromise);
  // console.info("Points from match result:", pointsFromMatches);

  for (var i = 0; i < pointsFromMatches.length; i++) {
    const matchPoints = pointsFromMatches[i];
    for (var j = 0; j < matchPoints.Count; j++) {
      var item = matchPoints.Items[j];
      var user_id = item.user_id;
      if (!points_dict[user_id]) {
        points_dict[user_id] = 0;
      }
      points_dict[user_id] += parseInt(item.points);
    }
  }

  console.info("Points dict", points_dict);
  var usersPromise = [];
  for (var user_key in points_dict) {
    var params = {
      TableName: usersTableName,
      Key: {
        user_id: user_key,
      },
    };
    usersPromise.push(docClient.get(params).promise());
  }

  const usersResult = await Promise.all(usersPromise);
  // console.info("Users Result:", usersResult);
  var result = [];

  for (var i = 0; i < usersResult.length; i++) {
    const user = usersResult[i].Item;
    result.push({
      user_id: user.user_id,
      user_name: user.name,
      user_points: points_dict[user.user_id],
    });
  }

  result.sort(function (a, b) {
    var diff = b.user_points - a.user_points;
    if (diff == 0) {
      a.user_name.localeCompare(b.user_name);
    }
    return diff;
  });

  console.info("Returned array:", result);

  return response.GetResponse(200, { result });
};
