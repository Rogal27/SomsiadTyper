

const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = 'contests-SomsiadTyper';

exports.lambdaHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);

    var name = "Turniej testowy 2";

    var params = {
        TableName : tableName,
        Item: {
            contest_id : 123,
            name: name
        }
    };

    // Call DynamoDB to add the item to the table
    const result = await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        body: `Created toruname ${name}`
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);

    return response;
};

