window.onload = function(){
    var xhr = new XMLHttpRequest();
        xhr.open('POST', '/userpage');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                var resp = JSON.parse(xhr.responseText);
                localStorage.setItem('data', JSON.stringify(resp));

                var description = document.getElementById('scriptDescription');
                description.innerHTML = resp['data']['instruction'];

                var parameters = document.getElementById('scriptParameters');
                parameters.innerHTML = resp['data']['help'];
            }
        };
        xhr.send(JSON.stringify({"command": "requestScript",
                                 "script": "Analisi_sistematica_completa_v2"
                                    }));

};


