

const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = 'userstest-SomsiadTyper';

exports.lambdaHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }

    console.info('received:', event);

    var surname = `Doe ${Math.floor(Math.random() * 100)}`;
    var age = Math.random();

    var params = {
        TableName : tableName,
        Item: {
            Surname : surname,
            Name : 'John',
            Age : age
        }
    };

    // Call DynamoDB to add the item to the table
    const result = await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        body: `Created person: John ${surname} Age: ${age}.`
    }

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);

    return response;
};

