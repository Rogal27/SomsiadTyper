const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tables = require('/opt/dbtables');
const tableName = tables.MATCHES;

exports.lambdaHandler = async (event, context, callback) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);
    var requestBody = JSON.parse(event.body);
    var contest_id = requestBody.contest_id;
    console.info(contest_id)
 
    var params = {
        TableName : tableName,
        FilterExpression: "#contest_id = :contest_id",
        ExpressionAttributeNames: {
            "#contest_id": "contest_id",
        },
        ExpressionAttributeValues: { ":contest_id": contest_id }
    
    };
    

    // Call DynamoDB to read the item to the table
    const result = await docClient.scan(params).promise();
    
    for(var i=0; i<result.Count; i++){
        var utcSeconds = result.Items[i].date;
        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(utcSeconds);
        result.Items[i].date = d;
    }
    
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            result
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    }
    return response;
};
