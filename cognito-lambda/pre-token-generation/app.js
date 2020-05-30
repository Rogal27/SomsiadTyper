exports.handler = (event, context, callback) => {
    event.response = {
        "claimsOverrideDetails": {
            "claimsToAddOrOverride": {
                "Role": "USER",
                "Some_Claim": "sample_value"
            }
        }
    };

    // Return to Amazon Cognito
    callback(null, event);
};