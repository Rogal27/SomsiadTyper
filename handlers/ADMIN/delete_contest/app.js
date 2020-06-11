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

  // var user_role = event.requestContext.authorizer.claims.role;
  // if(user_role !== "ADMIN"){
  //   return response.GetResponse(401, { message: "Unauthorized" });
  // }

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
  if (!requestBody.id) {
    const response = {
      statusCode: 400,
      body: "Contest ID is required required.",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }
  var id = requestBody.id;

  var params = {
    TableName: tableContests,
    Key: {
      contest_id: id,
    },
  };

  //TODO: Delete contest from user too or maybe the won contest should stay in his record,
  //but we should delete all matches related to contest

  const result = await docClient.delete(params).promise();

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      id: id,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  return response;
};
