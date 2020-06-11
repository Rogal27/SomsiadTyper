const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const response = require("/opt/response");
const photo_consts = require("/opt/photos");
const tables = require("/opt/dbtables");
const tableName = tables.USERS;

const AWS = require("aws-sdk");
const s3Client = new AWS.S3();

exports.lambdaHandler = async (event, context) => {
  // Send post confirmation data to Cloudwatch logs
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  console.info("Received:", event);

  var user_id = event.requestContext.authorizer.claims.sub;

  var requestBody = JSON.parse(event.body);
  if (!requestBody) {
    return response.GetResponse(400, { message: "Request has no body." });
  }
  if (!requestBody.photo_length) {
    return response.GetResponse(400, { message: "Photo length is required" });
  }

  if (!requestBody.photo_type) {
    return response.GetResponse(400, { message: "Photo type is required" });
  }

  if (!requestBody.photo) {
    return response.GetResponse(400, { message: "Photo is required" });
  }

  var photo_type = requestBody.photo_type;

  if (photo_type != "jpg" && photo_type != "png" && photo_type != "jpeg") {
    return response.GetResponse(400, { message: "Photo type not supported" });
  }

  var photo_length = requestBody.photo_length;

  if (parseInt(photo_length) > 3145728) {
    //3145728 is 3MiB
    return response.GetResponse(400, { message: "File size too large. Max size is 3MiB." });
  }

  var photo = requestBody.photo;

  if (photo_length != photo.length) {
    return response.GetResponse(400, { message: "Photo length did not match" });
  }

  var db_params = {
    TableName: tableName,
    Key: {
      user_id: user_id,
    },
  };

  var user_data = await docClient.get(db_params).promise();

  if (!user_data) {
    return response.GetResponse(400, { message: "User with requested ID not found" });
  }

  user_data = user_data.Item;

  var default_photo_path = photo_consts.BUCKET_URL + photo_consts.DEFAULT_PHOTO;
  var user_photo_path = user_data.photo;

  var user_photo_key = user_photo_path.substring(photo_consts.BUCKET_URL.length);

  if (user_photo_path != default_photo_path) {
    let s3_params = {
      Bucket: photo_consts.PHOTOS_BUCKET,
      Key: user_photo_key,
    };

    let result = await s3Client.deleteObject(s3_params).promise();
    console.info("S3 Delete result:", result);
  }

  user_photo_key = user_id + "/profile." + photo_type;

  if (photo_type == "jpg" || photo_type == "jpeg") {
    var content_type = "image/jpeg";
  } else {
    var content_type = "image/png";
  }

  try {
    var buffer = Buffer.from(photo, "base64");
    var s3_params = {
      Bucket: photo_consts.PHOTOS_BUCKET,
      Key: user_photo_key,
      ContentType: content_type,
      Body: buffer,
      //ContentEncoding: "base64",
    };
    var putResult = await s3Client.putObject(s3_params).promise();
  } catch (error) {
    console.info("S3 upload error:", error);
    return response.GetResponse(418, { message: "Error while uploading to S3." });
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

  return response.GetResponse(200, { photo: user_photo_path });
};
