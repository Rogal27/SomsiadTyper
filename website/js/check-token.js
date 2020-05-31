/*global somsiadTyper _config*/

var somsiadTyper = window.somsiadTyper || {};
somsiadTyper.map = somsiadTyper.map || {};

(function checkScopeWrapper($) {
    var authToken;
    somsiadTyper.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/login.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/login.html';
    });
}(jQuery));