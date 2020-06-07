const tables = require("/opt/dbtables");
const photo_consts = require("/opt/photos");
const dynamodb = require("aws-sdk/clients/dynamodb");
const AWS = require("aws-sdk");
const docClient = new dynamodb.DocumentClient();

const tableName = tables.USERS;

const s3Client = AWS.S3();

exports.lambdaHandler = async (event, context, callback) => {
  // Send post confirmation data to Cloudwatch logs
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  console.info("Received:", event);

  if (!event.requestContext.hasOwnProperty("authorizer")) {
    callback(null, {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (!event.requestContext.authorizer.claims.sub) {
    callback(null, {
      statusCode: 400,
      body: "User account ID not found in claims",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  var user_id = event.requestContext.authorizer.claims.sub;

  var requestBody = JSON.parse(event.body);

  if (!requestBody || !requestBody.photo_length) {
    callback(null, {
      statusCode: 400,
      body: "Photo length is required",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (!requestBody || !requestBody.photo_type) {
    callback(null, {
      statusCode: 400,
      body: "Photo type is required",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (!requestBody || !requestBody.photo) {
    callback(null, {
      statusCode: 400,
      body: "Photo is required",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  var photo_type = requestBody.photo_type;

  if (photo_type != "jpg" && photo_type != "png" && photo_type != "jpeg") {
    callback(null, {
      statusCode: 400,
      body: "Photo type not supported",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  var photo_length = requestBody.photo_length;

  if (parseInt(photo_length) > 3 * 1024) {
    callback(null, {
      statusCode: 400,
      body: "File size too large",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  var photo = requestBody.photo;

  if (photo_length != photo.length) {
    callback(null, {
      statusCode: 400,
      body: "Photo length did not match",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  var db_params = {
    TableName: tableName,
    Key: {
      user_id: user_id,
    },
  };

  var user_data = await docClient.get(db_params).promise();

  if (!user_data) {
    callback(null, {
      statusCode: 400,
      body: "User with requested ID not found",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  var default_photo_path = photo_consts.BUCKET_URL + photo_consts.DEFAULT_PHOTO;
  var user_photo_path = user_data.photo;

  var user_photo_key = user_photo_path.substring(
    photo_consts.BUCKET_URL.length
  );

  if (user_photo_path != default_photo_path) {
    let s3_params = {
      Bucket: photo_consts.PHOTOS_BUCKET,
      Key: user_photo_key,
    };

    let result = await s3Client.deleteObject(s3_params).promise();
    console.info("S3 Delete result:", result);
  }

  user_photo_key = user_id + "/profile." + photo_type;

  try {
    var s3_params = {
      Bucket: photo_consts.PHOTOS_BUCKET,
      Key: user_photo_key,
      ContentType: "image",
      Body: photo,
    };
    var putResult = await s3Client.putObject(s3_params).promise();
  } catch (error) {
    console.info("S3 upload error:", error);
    callback(null, {
      statusCode: 418,
      body: "Error while uploading to s3",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  user_photo_path = photo_consts.BUCKET_URL + user_photo_key;

  db_params = {
    TableName: tableName,
    Key: {
      user_id: user_id,
    },
    UpdateExpression: "set #photo = :url",
    ExpressionAttributeNames: {
      "#photo": "photo",
    },
    ExpressionAttributeValues: {
      ":url": user_photo_path,
    },
  };

  var db_result = await docClient.update(db_params).promise();

  console.info("DB Update Result: ", db_result);

  callback(null, {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
};
