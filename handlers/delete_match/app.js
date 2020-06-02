const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = 'matches-SomsiadTyper';

exports.lambdaHandler = async (event, context, callback) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);

    var requestBody = JSON.parse(event.body);
    var id = requestBody.id;

    var params = {
        TableName : tableName,
        Key:{
            "match_id": id
        }
    };

    //TODO: Delete contest from user too

    // Call DynamoDB to add the item to the table
    const result = await docClient.delete(params).promise();
    
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            id: id
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
};

