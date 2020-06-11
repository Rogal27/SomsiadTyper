module.exports.GetResponse = (code, body) => {
  const response = {
    statusCode: code,
    body: JSON.stringify(body),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  return response;
};
