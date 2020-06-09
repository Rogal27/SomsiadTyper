var authToken;
somsiadTyper.authToken.then(function setAuthToken(token) {
    if (token) {
        window.location.href = '/type.html';
    }
}).catch(function handleTokenError(error) {
    if(!window.localtion.href == '/login.html')
        window.location.href = '/login.html';
});