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
    var home_team = requestBody.home_team;
    var away_team = requestBody.away_team;
    var contest_id = requestBody.contest_id;
    var date =  requestBody.date;
    var id='',m='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',i=0,rb=Math.random()*0xffffffff|0;
    while(i++<36) {
        var c=m[i-1],r=rb&0xf,v=c=='x'?r:(r&0x3|0x8);
        id+=(c=='-'||c=='4')?c:v.toString(16);rb=i%8==0?Math.random()*0xffffffff|0:rb>>4;
    }

    var params = {
        TableName : tableName,
        Item: {
            match_id : id,
            date: date,
            contest_id: contest_id,
            home_team : home_team,
            away_team : away_team
        }
    };

    // Call DynamoDB to add the item to the table
    const result = await docClient.put(params).promise();
    
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            contest_id: contest_id,
            date: date,
            home_team : home_team,
            away_team : away_team
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
};

