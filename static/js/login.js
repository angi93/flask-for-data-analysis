function checkDataLogin(){

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    if ((email.indexOf("@") === (-1)) || (email === "") || (email === undefined)){
        showMessage("Login error", 'Invalid email address!!!', "error");
        return false;
    }
    else if ((password === "") || (password === undefined)){
         showMessage("Login error", 'Please, insert your password!!!', "error");
         return false;
    }
    else
        return true;
}


function doLogin() {
    // controllo dati prima di inviare i dati
    if(checkDataLogin()){
        var data = {};
        data['email'] = document.getElementById('email').value;
        data['password'] = document.getElementById('password').value;

        var xhr = new XMLHttpRequest();
            xhr.open('PUT', '/login');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var resp = JSON.parse(xhr.responseText);
                    if(resp['result'] === 'Login success')
                        location.replace("/userpage");
                    else
                        showMessage("Login error", resp['result'], "error");
                }
            };
            xhr.send(JSON.stringify({"command": "login",
                                     "data": data
                                        }));
    }
}
