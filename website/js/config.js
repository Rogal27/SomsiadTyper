window._config = {
    cognito: {
        userPoolId: '${USER_POOL_ID}', // e.g. us-east-2_uXboG5pAb
        userPoolClientId: '${USER_POOL_CLIENT_ID}', // e.g. 25ddkmj4v6hfsfvruhpfi7n4hv
        region: '${AWS_REGION}' // e.g. us-east-2
    },
    api: {
        invokeUrl: '${INVOKE_URL}' // e.g. https://rc7nyt4tql.execute-api.us-west-2.amazonaws.com/prod,
    }
};
