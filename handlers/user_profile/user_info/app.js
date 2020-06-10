const tables = require("/opt/dbtables");
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const tableName = tables.USERS;

exports.lambdaHandler = async (event, context) => {
  // Send post confirmation data to Cloudwatch logs
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("Received:", event);

  var current_user_id = event.requestContext.authorizer.claims.sub;

  var requestBody = JSON.parse(event.body);

  var requested_user_id;
  if (requestBody && requestBody.user_id) requested_user_id = requestBody.user_id;
  else requested_user_id = current_user_id;

  var params = {
    TableName: tableName,
    Key: {
      user_id: requested_user_id,
    },
  };

  var user_data = await docClient.get(params).promise();

  if (!user_data) {
    console.info("User with requested ID not found");
    const response = {
      statusCode: 400,
      body: "User with requested ID not found",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }

  if (requested_user_id == current_user_id) {
    console.info("Returning data for user", user_data);
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        name: user_data.Item.name,
        email: user_data.Item.email,
        photo: user_data.Item.photo,
        contests_won: user_data.Item.contests_won,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }

  console.info("Returning data for other user", user_data);

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      name: user_data.Item.name,
      photo: user_data.Item.photo,
      contests_won: user_data.Item.contests_won,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  return response;
};
