const ApiURL = _config.api.invokeUrl;

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

$(document).ready(function () {
  setUser();
});

function setUser() {
  $.ajax({
    method: "POST",
    url: ApiURL + "/user_info",
    headers: {
      Authorization: authToken,
    },
    success: completeSetUserRequest,
    error: function ajaxError(jqXHR, textStatus, errorThrown) {
      console.log("error");
      //   $("#errorLabel").text("Błąd dodawania turnieju");
      //   $("#alertDiv").css("display", "block");
    },
  });
}

function completeSetUserRequest(response) {
  console.log(response);

  $("#name").text(response.name);
  $("#profile_photo").attr("src", response.photo);
}
