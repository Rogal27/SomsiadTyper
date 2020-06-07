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
    data: JSON.stringify({
      name,
    }),
    success: completeSetUserRequest,
    error: function ajaxError(jqXHR, textStatus, errorThrown) {
      $("#errorLabel").text("Błąd dodawania turnieju");
      $("#alertDiv").css("display", "block");
    },
  });
}

function completeSetUserRequest(response) {
  console.log(response);

  $("#name").val() = "";
  $("#profile_photo").attr("src", "");
}
