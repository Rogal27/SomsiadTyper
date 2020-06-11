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

    $('#logOut').click(function() {
        somsiadTyper.signOut();
        window.location = "index.html";
      });

    var name = localStorage.getItem("name");
    var role = localStorage.getItem("role");

    if(!name || !role){
        $.ajax({
            method: 'GET',
            url: ApiURL + "/user_parameters",
            headers: {
                Authorization: authToken
            },
            success: function completeGetRoleRequest(response){
                console.log(response);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                stopLoading();
                window.location = "login.html";
            }
        });
    }


}(jQuery));