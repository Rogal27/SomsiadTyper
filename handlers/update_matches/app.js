const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = 'matches-SomsiadTyper';

exports.lambdaHandler = async (event, context, callback) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);

    var requestBody = JSON.parse(event.body);
    var id = requestBody.match_id;
    var home_team_score = requestBody.home_team_score;
    var away_team_score = requestBody.away_team_score;

    var params = {
        TableName: tableName,
        Key: { 'match_id' : id },
        UpdateExpression: 'set home_score = :home_score, away_score = :away_score',
        ExpressionAttributeValues: {
          ':home_score' : home_team_score,
          ':away_score' : away_team_score
        }
      };
      
    // Call DynamoDB to add the item to the table
    const result = await docClient.update(params).promise();
    
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

