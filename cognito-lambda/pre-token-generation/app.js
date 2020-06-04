const tables = require('/opt/dbtables');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = tables.USERS;

exports.handler = (event, context, callback) => {
    console.info(event);

    var id = event.request.userAttributes.sub;

    var params = {
        TableName: tableName,
        Key: {
            user_id: id
        }
    }

    docClient.get(params, function(err, user_data) {
        if (err) 
            console.info(err);
        else
            console.info(user_data);
      });

    event.response = {
        "claimsOverrideDetails": {
            "claimsToAddOrOverride": {
                "Role": "USER",
                "Some_Claim": "sample_value"
            }
        }
    };

    // Return to Amazon Cognito
    callback(null, event);
};