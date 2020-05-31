const ApiURL = "https://25m8som1ba.execute-api.us-east-1.amazonaws.com/Dev/";

function AddContest(){
    var name = $('#contestInput').val();

    $.ajax({
            method: 'POST',
            url: ApiURL + "createtournament",
            headers: {
            },
            data: JSON.stringify({
                name
            }),
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            }
        });
}

function completeRequest(result) {
    console.log(result)
    $('#contestInput').val(" ");
}