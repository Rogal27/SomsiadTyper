const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const response = require("/opt/response");
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
  //   return response.GetResponse(400, { message: "Request has no body." });
  // }

  var requestBody = JSON.parse(event.body);
  if (!requestBody) {
    return response.GetResponse(400, { message: "Request has no body." });
  }
  if (!requestBody.contest_id) {
    return response.GetResponse(400, { message: "Contest ID is required." });
  }
  if (!requestBody.home_team) {
    return response.GetResponse(400, { message: "Home team is required." });
  }
  if (!requestBody.away_team) {
    return response.GetResponse(400, { message: "Away Team is required." });
  }
  if (!requestBody.date) {
    return response.GetResponse(400, { message: "Date is required." });
  }
  var home_team = requestBody.home_team;
  var away_team = requestBody.away_team;
  var contest_id = requestBody.contest_id;
  var date = new Date(requestBody.date).getTime() / 1000;
  const now_date = new Date().getTime() / 1000;
  if (date < now_date) {
    return response.GetResponse(400, { message: "Date must be greater than today." });
  }

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

  var match_info = `${home_team}#${away_team}#${date}`;

  var params = {
    TableName: tableMatches,
    Item: {
      match_id: id,
      match_info: match_info,
      match_day: date,
      contest_id: contest_id,
      home_team: home_team,
      away_team: away_team,
    },
  };

  const result = await docClient.put(params).promise();

  return response.GetResponse(200, {
    match_id: match_id,
    date: date,
    home_team: home_team,
    away_team: away_team,
  });
}
