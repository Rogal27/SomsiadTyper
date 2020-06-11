const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const response = require("/opt/response");
const tables = require("/opt/dbtables");
const tableUsers = tables.USERS;

exports.lambdaHandler = async (event, context) => {
  // Send post confirmation data to Cloudwatch logs
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("Received:", event);
  console.info(event.requestContext.authorizer.claims);

  var current_user_id = event.requestContext.authorizer.claims.sub;

  var requestBody = JSON.parse(event.body);

  var requested_user_id;
  if (requestBody && requestBody.user_id) requested_user_id = requestBody.user_id;
  else requested_user_id = current_user_id;

  var params = {
    TableName: tableUsers,
    Key: {
      user_id: requested_user_id,
    },
  };

  var user_data = await docClient.get(params).promise();

  if (!user_data) {
    console.info("User with requested ID not found");
    return response.GetResponse(400, { message: "User with requested ID not found" });
  }

  if (requested_user_id == current_user_id) {
    console.info("Returning data for user", user_data);
    return response.GetResponse(200, {
      name: user_data.Item.name,
      role: user_data.Item.role
    });
  }

  console.info("Returning data for other user", user_data);

  return response.GetResponse(200, {
    name: user_data.Item.name,
    role: user_data.Item.role
  });
};
