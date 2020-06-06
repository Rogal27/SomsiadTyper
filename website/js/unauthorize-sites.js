var authToken;
somsiadTyper.authToken.then(function setAuthToken(token) {
    if (token) {
        window.location.href = '/type.html';
    }
}).catch(function handleTokenError(error) {
    alert(error);
    window.location.href = '/login.html';
});