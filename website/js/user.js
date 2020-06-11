var binaryString = [];

var authToken;
somsiadTyper.authToken.then(function setAuthToken(token) {
    if (token) {
        authToken = token;
    } else {
        window.location.href = '/login.html';
    }
}).catch(function handleTokenError(error) {
    window.location.href = '/login.html';
});

$(document).ready(function () {
  ReadContests();
  setUser();

  document.getElementById('fileInput').addEventListener('change', function() {

    var reader = new FileReader();
    reader.onload = function() {
  
      var arrayBuffer = this.result;
      var array = new Uint8Array(arrayBuffer);  
      for(var i=0; i<array.length; i++)
        binaryString.push(array[i]);
  
      console.log(binaryString);
  
    }
    reader.readAsArrayBuffer(this.files[0]);
  
  }, false);
});

function setUser() {
  var user_id = getUserIdFromURL();
  var dataToSend = {}
  if(user_id){
    dataToSend = {
      user_id
    }
  }
  else{
    $("#fileInput").css("display","block");
    $("#uploadPhotoButton").css("display","block");
  }

  $.ajax({
    method: "POST",
    url: ApiURL + "/user_info",
    headers: {
      Authorization: authToken,
    },
    data: JSON.stringify(dataToSend),
    success: completeSetUserRequest,
    error: function ajaxError(jqXHR, textStatus, errorThrown) {
      console.log("error");
      //   $("#errorLabel").text("Błąd dodawania turnieju");
      //   $("#alertDiv").css("display", "block");
    },
  });
}

function completeSetUserRequest(response) {
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

  ReadMatchesResults();
}

function ReadMatchesResults(){
  var contest = $('#matchContestSelect').val();
  if(contest == null)
      return;

  startLoading();
  var user_id = getUserIdFromURL();
  var dataToSend;
  if(user_id){
    dataToSend = {
      contest_id: contest,
      user_id
    }
  }
  else{
    dataToSend = {
      contest_id: contest
    }
  }

  $.ajax({
      method: 'POST',
      url: ApiURL + "/readscores",
      headers: {
          Authorization: authToken
      },
      data:JSON.stringify(dataToSend),
      success: completeReadMyMatchesResultsRequest,
      error: function ajaxError(jqXHR, textStatus, errorThrown) {
          stopLoading();
          $("#errorLabel").text("Błąd podczas odczytu wyników");
          $("#alertDiv").css("display","block");
      }
  });
}

function completeReadMyMatchesResultsRequest(response){
  stopLoading();

  var table = document.getElementById('matches_table');
  var rowCount = table.rows.length;
  for (var i = 1; i < rowCount; i++) {
      table.deleteRow(1);
  }

  var size = response.result.length;

  for(var i=0; i<size; i++){
      element = response.result[i];
      var date = new Date(element.date);
      var dd = date.getDate();
      var mm = date.getMonth()+1; 
      var yyyy = date.getFullYear();
      if(dd<10) 
          dd='0'+dd;
      if(mm<10) 
          mm='0'+mm;
      var resultDate = dd+'-'+mm+'-'+yyyy;

      var minutes = date.getMinutes();
      var hours = date.getHours();
      if(minutes<10)
          minutes='0'+minutes;
      if(hours<10)
          hours='0'+hours;
      var resultTime = hours+":"+minutes+" "+resultDate;

      var row = table.insertRow(1);

      var result = "<center>-</center>";
      if(element.away_team_score && element.home_team_score)
          result = element.home_team_score + " - " + element.away_team_score;
      var myType = "<center>-</center>";
      if(element.away_team_type && element.home_team_type)
          myType = element.home_team_type + " - " + element.away_team_type;
      var points = "<center>-</center>";
      if(element.points == 0 || element.points)
          points = element.points;

      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      var cell5 = row.insertCell(4);

      cell1.innerHTML = element.home_team + "-" + element.away_team;
      cell2.innerHTML = resultTime;
      cell3.innerHTML = myType;
      cell4.innerHTML = result;
      cell5.innerHTML = points;
  }
}

function SendPhoto(){
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      alert('W przeglądarce, której używasz nie jest możliwa operacja załączania plików - prosimy skorzystaj z nowszej wersji przeglądarki');
      return;
  }
  input = document.getElementById('fileInput');
  if (!input.files) {
      alert("W przeglądarce, której używasz nie jest możliwa operacja załączania plików - prosimy skorzystaj z nowszej wersji przeglądarki");
  }
  else if (!input.files[0]) {
      alert("Załącz swoje zdjęcie przed naciśnięciem aplikuj");
  }
  else {
      console.log(input.files[0])
      var reader = new FileReader();
      var array = reader.readAsArrayBuffer(input.files[0]);
      var extension = input.files[0].type.split("/");
      extension = extension[1];

      $.ajax({
        method: 'POST',
        url: ApiURL + "/set_profile_picture",
        headers: {
            Authorization: authToken
        },
        data:JSON.stringify({
          photo: binaryString,
          photo_type: extension,
          photo_length: input.files[0].size
        }),
        success: completeUploadPictureRequest,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            stopLoading();
            $("#errorLabel").text("Błąd podczas odczytu wyników");
            $("#alertDiv").css("display","block");
        }
    });
  }
}

function completeUploadPictureRequest(response){
  $("#profile_photo").attr("src", response.photo);
}

function startLoading(){
  $("#spinner").css("display","block");
}

function stopLoading(){
  $("#spinner").css("display","none");
}