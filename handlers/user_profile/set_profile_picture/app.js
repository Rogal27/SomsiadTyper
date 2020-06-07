const tables = require('/opt/dbtables');
const photos_consts = require('/opt/photos');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = tables.USERS;

exports.lambdaHandler = async (event, context, callback) => {
    // Send post confirmation data to Cloudwatch logs
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);
    var requestBody = JSON.parse(event.body);

    if(!requestBody || !requestBody.photo_length)
    {
        callback(null, {
            statusCode: 400,
            body: "Photo length is required",
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          });
    }

    if(!requestBody || !requestBody.photo)
    {
        callback(null, {
            statusCode: 400,
            body: "Photo is required",
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          });
    }
    
    var photo_length = requestBody.photo_length;

    if(parseInt(photo_length) > 3 * 1024)
    {
        var error = new Error("File size too large.")
        callback(error, {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    var photo = requestBody.photo;

    var id = event.request.userAttributes.sub;
    var photo_link = photos_consts.BUCKET_URL + photos_consts.DEFAULT_PHOTO;


    var profile_photo = new Image();
    profile_photo.src = 

    //Add user to db
    var params = {
        TableName : tableName,
        Item: {
            user_id : id,
            email: user_email,
            name: user_name,
            photo: photo_link,
            role: user_role,
            contests_won: user_contests_won
        }
    };

    // Call DynamoDB to add the item to the table
    const result = await docClient.put(params).promise();

    console.info("DBResult: ", result);

    // Return to Amazon Cognito
    callback(null, event);
};