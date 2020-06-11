const tables = require("/opt/dbtables");
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const tableUsers = tables.USERS;

exports.handler = async (event, context) => {
  console.info("Received event:", event);
  var id = event.request.userAttributes.sub;

  var params = {
    TableName: tableUsers,
    Key: {
      user_id: id,
    },
  };

  var result = await docClient.get(params).promise();

  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        role: result.Item.role,
      },
    },
  };

  // Return to Amazon Cognito
  return event;
};
