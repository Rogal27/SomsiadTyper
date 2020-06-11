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
      body: "Match ID is required required.",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
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

  const response = {
    statusCode: 200,
    body: "Success",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  return response;
};
