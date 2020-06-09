const ApiURL = _config.api.invokeUrl;

var authToken;
somsiadTyper.authToken
  .then(function setAuthToken(token) {
    if (token) {
      authToken = token;
    } else {
      window.location.href = "/login.html";
    }
  })
  .catch(function handleTokenError(error) {
    alert(error);
    window.location.href = "/login.html";
  });

$(document).ready(function () {
  console.log(getUserIdFromURL())
  ReadContests();
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

function submitPhotoForm() {
  $()
}

function getUserIdFromURL(){
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var userId = urlParams.get("userId");

  return userId;
}

function ReadContests(){
  startLoading();

  $.ajax({
      method: 'GET',
      url: ApiURL + "/readcontest",
      headers: {
          Authorization: authToken
      },
      success: completeReadContestRequest,
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
          stopLoading();
          $("#errorLabel").text("Błąd podczas odczytu turniejów");
          $("#alertDiv").css("display","block");
      }
  });
}

function completeReadContestRequest(response){
  stopLoading();

  $('#matchContestSelect')
      .find('option')
      .remove();

  var i = response.result.Count;
  
  for(var j=0; j<i; j++){
      element = response.result.Items[j];
      $('#matchContestSelect').append(`<option value="${element.contest_id}">${element.name}</option>`);
  }

  ReadMyMatchesResults();
}



function startLoading(){
  $("#spinner").css("display","block");
}

function stopLoading(){
  $("#spinner").css("display","none");
}