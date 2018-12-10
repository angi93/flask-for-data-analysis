function deleteAccount() {
    var conf = confirm("Are you sure to delete this account?");
    if (conf) {
        var xhr = new XMLHttpRequest();
            xhr.open('PUT', '/userdata');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    if(IsJson()){
                        var resp = JSON.parse(xhr.responseText);
                        showMessage("Account settings", resp['result'], "success");
                        location.replace("/");
                    }
                    else{
                        location.replace(xhr.responseURL);
                    }
                }
            };
            xhr.send(JSON.stringify({"command": "removeAccount"}));
    }
}


function checkPasswords() {
    var oldPassword = document.getElementById('oldPassword').value;
    var newPassword1 = document.getElementById('newPassword1').value;
    var newPassword2 = document.getElementById('newPassword2').value;

     if ((oldPassword === "") || (oldPassword === undefined)){
         showMessage('Wrong password', 'Please, insert your old password!!!', 'error');
         return false;
    }
     else if ((newPassword1 === "") || (newPassword1 === undefined)) {
        showMessage('Wrong password', 'Please, insert your password!!!', 'error');
        return false;
    }
     else if ((newPassword2 === "") || (newPassword2 === undefined)) {
        showMessage('Wrong password', 'Please, insert your repeated password!!!', 'error');
        return false;
    }
     else if (newPassword1 !== newPassword2){
        showMessage('Wrong password', 'There are two different passwords!!!', 'error');
        return false;
    }
    else if (newPassword1.length < 8){
        showMessage('Wrong password', 'Password too short!!!', 'error');
        showMessage('Info password', 'Password length should be more than 8 character!!!', 'info');
        return false;
    }
    else
        return true;
}


function changePassword() {
    if(checkPasswords()){
        var data = {};
        data['command'] = 'changePassword';
        data['oldPassword'] = document.getElementById('oldPassword').value;
        data['newPassword'] = document.getElementById('newPassword1').value;

        var xhr = new XMLHttpRequest();
            xhr.open('PUT', '/userdata');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    if(IsJson(xhr.responseText)){
                        var resp = JSON.parse(xhr.responseText);
                        if(resp['result'] === 'Password succesfully changed!!!'){
                            showMessage('Account settings', resp['result'], 'success');
                            modalPassword.style.display = "none";
                        }
                        else{
                            showMessage('Account settings', data['result'], 'error');
                        }
                    }
                    else{
                        location.replace(xhr.responseURL);
                    }
                }
            };
            xhr.send(JSON.stringify(data));
    }
}


// Check if string is in JSON format
function IsJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}