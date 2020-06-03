exports.handler = (event, context, callback) => {
    // Set the user pool autoConfirmUser flag after validating the name property

    if (event.request.userAttributes.hasOwnProperty("name")) {
        if (event.request.userAttributes.name == "") {
            var error = new Error("Name is required");
            callback(error, {});
        }
    }
    else {
        var error = new Error("Name is required");
        callback(error, {});   
    }

    // Return to Amazon Cognito
    callback(null, event);
};