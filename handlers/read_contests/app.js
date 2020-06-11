const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const response = require("/opt/response");
const tables = require("/opt/dbtables");
const tableContests = tables.CONTESTS;

exports.lambdaHandler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accepts GET method, you tried: ${event.httpMethod} method.`);
    }

    console.info('Received:', event);

    var params = {
        TableName : tableContests
    };

    const result = await docClient.scan(params).promise();
    
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            result
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
    return response;
};

