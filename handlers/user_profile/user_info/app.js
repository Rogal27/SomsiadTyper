const tables = require("/opt/dbtables");
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const tableName = tables.USERS;

exports.lambdaHandler = async (event, context, callback) => {
  // Send post confirmation data to Cloudwatch logs
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  console.info("Received:", event);

  if (!event.requestContext.hasOwnProperty("authorizer")) {
    callback(null, {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (!event.requestContext.authorizer.claims.sub) {
    callback(null, {
      statusCode: 400,
      body: "User account ID not found in claims",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
  var current_user_id = event.requestContext.authorizer.claims.sub;

  var requestBody = JSON.parse(event.body);

  var requested_user_id;
  if (requestBody && requestedBody.user_id)
    requested_user_id = requestBody.user_id;
  else requested_user_id = current_user_id;

  var params = {
    TableName: tableName,
    Key: {
      user_id: requested_user_id,
    },
  };

  var user_data = await docClient.getItem(params).promise();

  if (!user_data) {
    callback(null, {
      statusCode: 400,
      body: "User with requested ID not found",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (requested_user_id == current_user_id) {
    callback(null, {
      statusCode: 200,
      body: {
        name: user_data.name,
        email: user_data.email,
        photo: user_data.photo,
        contests_won: user_data.contests_won,
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  callback(null, {
    statusCode: 200,
    body: {
      name: user_data.name,
      photo: user_data.photo,
      contests_won: user_data.contests_won,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
};
