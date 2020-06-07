const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tables = require('/opt/dbtables');
const tableScores = tables.USERS_SCORES;
exports.lambdaHandler = async (event, context, callback) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);
    console.info('claims:', event.requestContext.authorizer);
    var user_id = event.requestContext.authorizer.claims['sub'];
    var body = JSON.parse(event.body);
    for(var i=0; i<body.matches.length;i++)
    {
        var match = body.matches[i];
        console.info('match', match);
        var match_id = match.match_id;    
        var searchParams = {
            TableName : tableScores,
            IndexName: 'user_index',
            KeyConditionExpression: "user_id = :user_id AND match_id = :match_id",
            ExpressionAttributeValues: { ":user_id": user_id, ":match_id": match_id }
            /*
            FilterExpression: "#match_id = :match_id and #user_id = :user_id",
            ExpressionAttributeNames: {
                "#match_id": "match_id",
                "#user_id": "user_id"
            },
            ExpressionAttributeValues: { ":user_id": user_id, ":match_id": match_id }
            */
        };
        console.info("Search params",searchParams);
        const resultSearch = await docClient.query(searchParams).promise();
        console.info("count", resultSearch);
        var id;
        if(resultSearch.Count > 0)
        {
            id = resultSearch.Items[0].id;
        }
        else
        {
            id = generate_guid();
        }
        var home_team_score = match.home_team_score;
        var away_team_score = match.away_team_score;

        var addParams = {
            TableName : tableScores,
            Item: {
                match_id : match_id,
                home_team_score : home_team_score,
                away_team_score : away_team_score,
                user_id: user_id,
                id: id
            }
        };

        await docClient.put(addParams).promise();
    }
    
    callback(null, {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
};
function generate_guid()
{
    var id='',m='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',i=0,rb=Math.random()*0xffffffff|0;
    while(i++<36) {
        var c=m[i-1],r=rb&0xf,v=c=='x'?r:(r&0x3|0x8);
        id+=(c=='-'||c=='4')?c:v.toString(16);rb=i%8==0?Math.random()*0xffffffff|0:rb>>4;
    }
    return id;
}

