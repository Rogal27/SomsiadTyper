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
    ReadMatches();
});


function AddContest(){
    var name = $('#contestInput').val();

    $.ajax({
        method: 'POST',
        url: ApiURL + "/createtournament",
        headers: {
            "Authorization": authToken
        },
        data: JSON.stringify({
            name
        }),
        success: completeAddContestRequest,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            $("#errorLabel").text("Błąd dodawania turnieju");
            $("#alertDiv").css("display","block");
        }
    });
}

function completeAddContestRequest(result) {
    $('#contestInput').val(" ");

    ReadContests();
}

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
    var table = document.getElementById('contests_table');
    var rowCount = table.rows.length;
    for (var i = 1; i < rowCount; i++) {
        table.deleteRow(1);
    }
    $('#matchContestSelect')
        .find('option')
        .remove();
    $('#resultContestSelect')
        .find('option')
        .remove();

    var i = response.result.Count;

    var table = document.getElementById("contests_table");
    
    for(var j=0; j<i; j++){
        element = response.result.Items[j];

        var row = table.insertRow(1);

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);

        cell1.innerHTML = i-j;
        cell2.innerHTML = element.name;
        cell3.innerHTML = "<a class='btn btn-danger btn-circle' style='color:white' onclick='DeleteContest(" + '"' + element.contest_id + '"' +  ")'><i class='fas fa-trash'></i></a>";

        $('#matchContestSelect').append('<option value="' + element.contest_id + '">' + element.name + '</option>');
        $('#resultContestSelect').append('<option value="' + element.contest_id + '">' + element.name + '</option>')
    }

    var table = document.getElementById('matches_table');
    var rowCount = table.rows.length;
    if(rowCount <= 2) //first row - headers, second row - new match input
        ReadMatches();
}

function DeleteContest(id){
    $.ajax({
        method: 'POST',
        url: ApiURL + "/deletecontest",
        headers: {
        },
        data: JSON.stringify({
            id
        }),
        success: completeDeleteContestRequest,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            $("#errorLabel").text("Błąd usuwania turnieju");
            $("#alertDiv").css("display","block");
        }
    });
}

function completeDeleteContestRequest(){
    ReadContests();
}

function AddMatch(){
    var contest = $('#matchContestSelect').val();
    var firstTeamName = $("#newMatchFirstTeamName").val();
    var secondTeamName = $("#newMatchSecondTeamName").val();
    var date = new Date($("#newMatchDate").val());
    var hours = $("#newMatchHour").val();

    var splitted_hours = hours.split(":");
    date.setHours(splitted_hours[0]);
    date.setMinutes(splitted_hours[1]);

    $.ajax({
        method: 'POST',
        url: ApiURL + "/addmatch",
        headers: {
        },
        data: JSON.stringify({
            home_team: firstTeamName,
            away_team: secondTeamName,
            contest_id: contest,
            date
        }),
        success: completeAddMatchRequest,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            $("#errorLabel").text("Błąd dodawania meczu");
            $("#alertDiv").css("display","block");
        }
    });
}

function completeAddMatchRequest(){
    $("#newMatchFirstTeamName").val("");
    $("#newMatchSecondTeamName").val("");
    $("#newMatchDate").val(new Date());
    $("#newMatchHour").val("");

    ReadMatches();
}

function ReadMatches(){
    var contest = $('#matchContestSelect').val();
    if(contest == null)
        return;

    $.ajax({
        method: 'POST',
        url: ApiURL + "/readmatches",
        headers: {
        },
        data:JSON.stringify({
            contest_id: contest,
        }),
        success: completeReadMatchesRequest,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            $("#errorLabel").text("Błąd podczas odczytu turniejów");
            $("#alertDiv").css("display","block");
        }
    });
}

function completeReadMatchesRequest(response){
    console.log(response);

    var table = document.getElementById('matches_table');
    var rowCount = table.rows.length;
    for (var i = 2; i < rowCount; i++) {
        table.deleteRow(2);
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
        var resultDate = yyyy+'-'+mm+'-'+dd;

        var minutes = date.getMinutes();
        var hours = date.getHours();
        if(minutes<10)
            minutes='0'+minutes;
        if(hours<10)
            hours='0'+hours;
        var resultTime = hours+":"+minutes;

        var homescore='';
        var awayscore='';
        if(element.home_score)
            homescore = element.home_score;
        if(element.away_score)
            awayscore = element.away_score;

        var row = table.insertRow(2);

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        var cell7 = row.insertCell(6);
        var cell8 = row.insertCell(7);

        cell1.innerHTML = element.match_id;
        cell1.hidden = true;
        cell2.innerHTML = element.home_team;
        cell3.innerHTML = element.away_team;
        cell4.innerHTML = resultDate;
        cell5.innerHTML = resultTime;
        cell6.innerHTML = "<input id='" + element.match_id + "-homeScore' type='number' class='form-control' value='" + homescore + "' />";
        cell7.innerHTML = "<input id='" + element.match_id + "-awayScore' type='number' class='form-control' value='" + awayscore + "' />";
        cell8.innerHTML = "<a class='btn btn-success btn-circle' style='color:white' onclick='UpdateMatch(" + '"' + element.match_id + '"' +  ")'><i class='fas fa-save'></i> </a><a class='btn btn-danger btn-circle' style='color:white' onclick='DeleteMatch(" + '"' + element.match_id + '"' +  ")'><i class='fas fa-trash'></i></a>";
    }
}

function DeleteMatch(id){
    $.ajax({
        method: 'POST',
        url: ApiURL + "/deletematch",
        headers: {
        },
        data: JSON.stringify({
            id
        }),
        success: completeDeleteMatchRequest,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            $("#errorLabel").text("Błąd usuwania meczu");
            $("#alertDiv").css("display","block");
        }
    });
}

function completeDeleteMatchRequest(){
    ReadMatches();
}

function UpdateMatch(id){
    var id_prefix = "#"+id;
    var firstTeamScore = $(id_prefix+"-homeScore").val();
    var secondTeamScore = $(id_prefix+"-awayScore").val();

    $.ajax({
        method: 'POST',
        url: ApiURL + "/updatematches",
        headers: {
        },
        data: JSON.stringify({
            match_id: id,
            home_team_score: firstTeamScore,
            away_team_score: secondTeamScore
        }),
        success: completeUpdateMatchRequest,
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            $("#errorLabel").text("Błąd aktualizacji meczu");
            $("#alertDiv").css("display","block");
        }
    });
}

function completeUpdateMatchRequest(){
    ReadMatches();
}