function checkDataRegistration(){

    var name = document.getElementById('name').value;
    var surname = document.getElementById('surname').value;
    var email = document.getElementById('email').value;
    var password1 = document.getElementById('pass1').value;
    var password2 = document.getElementById('pass2').value;

    if ((name === "") || (name === undefined) || (name > 30)) {
        showMessage('Wrong name', 'Please, insert your name!!!', 'error');
        return false;
    }
    else if ((surname === "") || (surname === undefined) || (surname.length > 30)){
         showMessage('Wrong surname', 'Please, insert your surname!!!', 'error');
         return false;
    }
    else if ((email.indexOf("@") === (-1)) || (email === "") || (email === undefined) || (email.length > 30)){
        showMessage('Wrong email', 'Invalid email address!!!', 'error');
        return false;
    }
    else if ((password1 === "") || (password1 === undefined)){
         showMessage('Wrong password', 'Please, insert your password!!!', 'error');
         return false;
    }
    else if ((password2 === "") || (password2 === undefined)) {
        showMessage('Wrong password', 'Please, insert your repeated password!!!', 'error');
        return false;
    }
    else if (password1 !== password2){
        showMessage('Wrong password', 'There are two different passwords!!!', 'error');
        return false;
    }
    else if ((password1.length < 8) || (password1.length  > 20)){
        showMessage('Wrong password', 'Password too short!!!', 'error');
        showMessage('Info password', 'Password length should be more than 8 character and less than 20!!!', 'info');
        return false;
    }
    else
        return true;
}

function doRegistration() {
    // controllo dati prima di inviare i dati
    if(checkDataRegistration()){
        var data = {};
        data['name'] = document.getElementById('name').value;
        data['surname'] = document.getElementById('surname').value;
        data['email'] = document.getElementById('email').value;
        data['password'] = document.getElementById('pass1').value;

        var xhr = new XMLHttpRequest();
            xhr.open('PUT', '/registration');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    if(IsJson(xhr.responseText)){
                        var resp = JSON.parse(xhr.responseText);

                        if(resp['result'] === 'Registration success')
                            location.replace("/login");
                        else{
                            showMessage("Registration error", resp['result'], "error");
                        }
                    }
                    else{
                        location.replace(xhr.responseURL);
                    }
                }
            };
            xhr.send(JSON.stringify({"command": "registration",
                                     "data": data
                                        }));
    }
}


function enableDisableButton() {
    var checked = document.getElementById('accept').checked;
    var btn = document.getElementById('registrationBtn');

    if(checked)
        btn.disabled = false;
    else
        btn.disabled = true;

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