const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = 'contests-SomsiadTyper';

exports.lambdaHandler = async (event, context, callback) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accepts GET method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);

    var params = {
        TableName : tableName
    };

    // Call DynamoDB to read the item to the table
    const result = await docClient.scan(params).promise();
    
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            result
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
};

