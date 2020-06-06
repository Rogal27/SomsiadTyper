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

$( document ).ready(function() {
    $('#logOut').click(function() {
        somsiadTyper.signOut();
        window.location = "index.html";
    });

    ReadContests();
});

//TODO: Change it to read contests, which user is assigned for
function ReadContests(){
    $.ajax({
        method: 'GET',
        url: ApiURL + "/readcontest",
        headers: {
        },
        success: completeReadContestRequest,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            $("#errorLabel").text("Błąd podczas odczytu turniejów");
            $("#alertDiv").css("display","block");
        }
    });
}

function completeReadContestRequest(response){
    $('#matchContestSelect')
        .find('option')
        .remove();

    var i = response.result.Count;
    
    for(var j=0; j<i; j++){
        element = response.result.Items[j];
        $('#matchContestSelect').append('<option value="' + element.contest_id + '">' + element.name + '</option>');
    }

    if(true) //first row - headers, second row - new match input
        ReadMatches();
}

function ReadMatches(){
    var contest = $('#matchContestSelect').val();
    if(contest == null)
        return;

    $.ajax({
        method: 'POST',
        url: ApiURL + "/readmatchestotype",
        headers: {
        },
        data:JSON.stringify({
            contest_id: contest,
        }),
        success: completeReadMatchesRequest,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            $("#errorLabel").text("Błąd podczas odczytu meczów");
            $("#alertDiv").css("display","block");
        }
    });
}

function completeReadMatchesRequest(response){
    console.log(response);
}