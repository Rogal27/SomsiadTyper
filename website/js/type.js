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
    var table = document.getElementById('matches_table');
    var rowCount = table.rows.length;
    for (var i = 1; i < rowCount; i++) {
        table.deleteRow(1);
    }

    var size = response.result.Count;

    for(var i=0; i<size; i++){
        element = response.result.Items[i];
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

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);

        cell1.innerHTML = element.match_id;
        cell1.hidden = true;
        cell2.innerHTML = element.home_team + "-" + element.away_team;
        cell3.innerHTML = resultTime;
        cell4.innerHTML = "<input id='" + element.match_id + "-homeScore' type='number' class='form-control' value='" + "-1" + "' />";
        cell5.innerHTML = "<input id='" + element.match_id + "-awayScore' type='number' class='form-control' value='" + "-1" + "' />";
    }
}