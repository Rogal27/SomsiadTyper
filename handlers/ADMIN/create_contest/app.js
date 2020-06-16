const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const response = require("/opt/response");
const tables = require("/opt/dbtables");
const tableContests = tables.CONTESTS;

exports.lambdaHandler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("received:", event);

  var user_role = event.requestContext.authorizer.claims.role;
  if(user_role !== "ADMIN"){
    return response.GetResponse(401, { message: "Unauthorized" });
  }

  var requestBody = JSON.parse(event.body);
  if (!requestBody) {
    return response.GetResponse(400, { message: "Request has no body." });
  }
  if (!requestBody.name) {
    return response.GetResponse(400, { message: "Name is required." });
  }
  var name = requestBody.name;
  const date = new Date().getTime() / 1000;

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

  var params = {
    TableName: tableContests,
    Item: {
      contest_id: id,
      name: name,
      isActive: true,
      startdate: date,
    },
  };

  // Call DynamoDB to add the item to the table
  const result = await docClient.put(params).promise();

  return response.GetResponse(200, { name: name });
};
