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

function ReadMyMatchesResults(){
    var contest = $('#matchContestSelect').val();
    if(contest == null)
        return;

    startLoading();

    $.ajax({
        method: 'POST',
        url: ApiURL + "/readscores",
        headers: {
            Authorization: authToken
        },
        data:JSON.stringify({
            contest_id: contest,
        }),
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

function startLoading(){
    var table = document.getElementById('matches_table');
    var rowCount = table.rows.length;
    for (var i = 1; i < rowCount; i++) {
        table.deleteRow(1);
    }
    
    $("#spinner").css("display","block");
}

function stopLoading(){
    $("#spinner").css("display","none");
}