const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const tables = require("/opt/dbtables");
const tableName = tables.MATCHES;

exports.lambdaHandler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("received:", event);

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
  if (!requestBody.contest_id) {
    const response = {
      statusCode: 400,
      body: "Contest ID is required.",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }
  if (!requestBody.home_team) {
    const response = {
      statusCode: 400,
      body: "Home team is required.",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }
  if (!requestBody.away_team) {
    const response = {
      statusCode: 400,
      body: "Away Team is required.",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }
  if (!requestBody.date) {
    const response = {
      statusCode: 400,
      body: "Date is required.",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }
  var home_team = requestBody.home_team;
  var away_team = requestBody.away_team;
  var contest_id = requestBody.contest_id;
  var date = new Date(requestBody.date).getTime() / 1000;
  const now_date = new Date().getTime() / 1000;
  if (date < now_date) {
    const response = {
      statusCode: 400,
      body: "Date must be greater than today.",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
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
    TableName: tableName,
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

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      contest_id: contest_id,
      date: date,
      home_team: home_team,
      away_team: away_team,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  return response;
};
