const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tables = require('/opt/dbtables');
const tableName = tables.MATCHES;
const tableScores = tables.USERS_SCORES;

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

    params = {
        TableName : tableScores,
        FilterExpression: "#match_id = :match_id",
        ExpressionAttributeNames: {
            "#match_id": "match_id"
        },
        ExpressionAttributeValues: { ":match_id": id}    
    };

    const resultSearch = await docClient.scan(params).promise();

    var points;
    for(var i=0; i<resultSearch.Count; i++){
        if(resultSearch.Items[i].home_team_score == home_team_score && resultSearch.Items[i].away_team_score == away_team_score)
            points = 3;
        else if(home_team_score == away_team_score && resultSearch.Items[i].home_team_score == resultSearch.Items[i].away_team_score)
            points = 1;
        else if((resultSearch.Items[i].home_team_score - resultSearch.Items[i].away_team_score )*(home_team_score - away_team_score) > 0)
            points = 1;
        else
            points = 0;

        var params = {
            TableName: tableScores,
            Key: { 'id' : resultSearch.Items[i].id },
            UpdateExpression: 'set points = :points',
            ExpressionAttributeValues: {
                ':points' : points,
            }
        };
                
        await docClient.update(params).promise();

    }
 


    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            resultSearch
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
};

