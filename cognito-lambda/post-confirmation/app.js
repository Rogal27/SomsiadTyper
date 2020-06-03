/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

const tables = require('/opt/dbtables');
const photos_consts = require('/opt/photos');
const dynamodb = require('aws-sdk/clients/dynamodb');
const AWS = require('aws-sdk');
const docClient = new dynamodb.DocumentClient();

const tableName = tables.USERS;
const photos_bucket_name = photos_consts.PHOTOS_BUCKET;
const s3 = new AWS.s3();

exports.handler = async (event, context, callback) => {
    // Send post confirmation data to Cloudwatch logs
    console.info(event);
    var id = event.request.userAttributes.sub;
    var user_email = event.request.userAttributes.email;
    var user_name = event.request.userAttributes.name;
    var user_role = 'USER';
    
    var user_contests_won = [];

    var bucket_params = {
        Bucket: photos_bucket_name
    };

    const s3_website = await s3.getBucketWebsite(bucket_params).promise();

    var photo_link = `${s3_website}/${photos_consts.DEFAULT_PHOTO}`;

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