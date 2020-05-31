const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = 'contests-SomsiadTyper';

exports.lambdaHandler = async (event, context, callback) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);

    var requestBody = JSON.parse(event.body)
    var name = requestBody.name

    var params = {
        TableName : tableName,
        Item: {
            contest_id : "123",
            name: name
        }
    };

    // Call DynamoDB to add the item to the table
    const result = await docClient.put(params).promise();
    
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            name: name
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
};

