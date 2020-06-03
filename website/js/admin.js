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
    ReadContests();
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
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
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
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
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
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
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
    var date = $("#newMatchDate").val();
    var hours = $("#newMatchHour").val();
    var firstTeamScore = $("#newMatchFristTeamScore").val();
    var secondTeamScore = $("#newMatchSecondTeamScore").val();

    console.log(contest);
    console.log(firstTeamName);
    console.log(secondTeamName);
    console.log(date);
    console.log(hours);
    console.log(firstTeamScore);
    console.log(secondTeamScore);

    // $.ajax({
    //     method: 'POST',
    //     url: ApiURL + "/createtournament",
    //     headers: {
    //         "Authorization": authToken
    //     },
    //     data: JSON.stringify({
    //         name
    //     }),
    //     success: completeAddContestRequest,
    //     error: function ajaxError(jqXHR, textStatus, errorThrown) {
    //         console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
    //         console.error('Response: ', jqXHR.responseText);
    //         $("#errorLabel").text("Błąd dodawania turnieju");
    //         $("#alertDiv").css("display","block");
    //     }
    // });
}