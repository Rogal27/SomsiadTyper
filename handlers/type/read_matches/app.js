const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tables = require('/opt/dbtables');
const matchTableName = tables.MATCHES;
const scoreTableName = tables.USERS_SCORES;

exports.lambdaHandler = async (event, context, callback) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);
    var requestBody = JSON.parse(event.body);
    var contest_id = requestBody.contest_id;
    console.info('claims:', event.requestContext.authorizer);
    var user_id = event.requestContext.authorizer.claims['sub'];
    var date = new Date().getTime()/1000;

 
    var params = {
        TableName : matchTableName,
        FilterExpression: "#contest_id = :contest_id and #date >= :date",
        ExpressionAttributeNames: {
            "#contest_id": "contest_id",
            "#date": "date"
        },
        ExpressionAttributeValues: { ":contest_id": contest_id, ":date": date }
    
    };

    // Call DynamoDB to read the item to the table
    const matchesToType = await docClient.scan(params).promise();
    var result = [];
    
    for(var i=0; i<matchesToType.Count; i++){
        var utcSeconds = matchesToType.Items[i].date;
        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(utcSeconds);
        matchesToType.Items[i].date = d;
        
        var match_id = matchesToType.Items[i].match_id;    
        var searchParams = {
            TableName : scoreTableName,
            FilterExpression: "#match_id = :match_id",
            ExpressionAttributeNames: {
                "#match_id": "match_id"
            },
            ExpressionAttributeValues: { ":match_id": match_id}
        };
        var resultSearch = await docClient.scan(searchParams).promise();

        var home_team_type="-1";
        var away_team_type="-1";
        if(resultSearch.Count > 0)
        {
            console.log(resultSearch);
            home_team_type = resultSearch.Items[0].home_team_score;
            away_team_type = resultSearch.Items[0].away_team_score;
        }
        
        result.push({
            match_id,
            home_team: matchesToType.Items[i].home_team,
            away_team: matchesToType.Items[i].away_team,
            date: d,
            home_team_type,
            away_team_type
        });
        console.info(result);
    }
    console.info(result);
    
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
