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
  //   return response.GetResponse(401, { message: "Unauthorized" });
  // }

  var requestBody = JSON.parse(event.body);
  if (!requestBody) {
    return response.GetResponse(400, { message: "Request has no body." });
  }
  if (!requestBody.id) {
    return response.GetResponse(400, { message: "Match ID is required required." });
  }
  var id = requestBody.id;

  var params = {
    TableName: tableMatches,
    Key: {
      match_id: id,
    },
  };

  //TODO: Delete match from scores too and maybe recalculate points

  const result = await docClient.delete(params).promise();

  return response.GetResponse(200, { message: "Success" });
};
