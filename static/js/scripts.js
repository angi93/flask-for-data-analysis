function downloadFiles() {
    location.replace("/download");
}

function requestFile(filename) {
    //  salvo in locale il nome del file selezionato che mi servirà quando vado ad effettuare eliminazione
    localStorage.setItem('csvSelected', filename);
    var label = document.getElementById('selectcsv');
    label.innerHTML = filename;

    var xhr = new XMLHttpRequest();
        xhr.open('POST', '/userpage');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                if(IsJson(xhr.responseText)){
                    var resp = JSON.parse(xhr.responseText);
                    makeCsvTable(resp);
                }
                else{
                    location.replace("/login");
                }
            }
            else
                showMessage("Request file", 'File not found!!!', "error");
        };
        xhr.send(JSON.stringify({'command': 'requestFile', 'file': filename}));
 }


function requestResultFile(filename) {
    //  salvo in locale il nome del file selezionato che mi servirà quando vado ad effettuare eliminazione
    localStorage.setItem('resultSelected', filename);
    var resultLabel = document.getElementById('selected_file');
    resultLabel.innerHTML = filename;

    // ricavo estensione file
    var extension = filename.split(".");
    extension = extension[1];

    if(extension === 'csv'){
        var xhr = new XMLHttpRequest();
            xhr.open('POST', '/userpage');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    if(IsJson(xhr.responseText)){
                        var resp = JSON.parse(xhr.responseText);
                        makeCsvResultTable(resp);
                    }
                    else{
                        location.replace(xhr.responseURL);
                    }
                }
                else
                    showMessage("Request file", 'File not found!!!', "error");
            };
            xhr.send(JSON.stringify({'command': 'requestResultFile', 'resultFile': filename}));
    }
    if(extension === 'pdf'){
        // apro nuova tab con il file selezionato
        window.open("/pdf/" + filename);
    }
    if(extension === 'jpg' | extension === 'jpeg' | extension === 'png'){
        // apro nuova tab con il file selezionato
        window.open("/image/" + filename);
    }

 }


function getJson() {
    $.getJSON(jsonfile, function (data) {
        var file_data = '';
        $.each(data, function (key, value) {
            file_data += '<tr>';
            file_data += '<td>' + value.name + '</td>';
            file_data += '<td>'

        })
    })
}


//  creo la tabella per visualizzare il file csv che ricevo dal server
function makeCsvTable(data) {

    //  rimuovo tutti gli elementi all'interno dell'elemento headtable
    var thead = document.getElementById("headtable");

    while (thead.firstChild) {
        thead.removeChild(thead.firstChild);
    }

    //  rimuovo tutti gli elementi all'interno dell'elemento tablebody
    var tbody = document.getElementById("tablebody");
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    var json = JSON.parse(data);

    //  per ogni riga del array
    for (var j = 0; j < json.length; j++) {
        if (j === 0) {
            for (var i = 0; i < json[j].length; i++) {
                var el = document.createElement('th');
                el.setAttribute('scope', 'col');
                el.innerHTML =  '<th>' + json[j][i]+ '</th>';
                thead.appendChild(el);
            }
        }
        if (j > 0) {
            //creo la riga
            var row = document.createElement('tr');
            row.setAttribute('id', 'row' + j);
            tbody.appendChild(row);
            var actualRow = document.getElementById('row' + j);
            for (var k = 0; k < json[j].length; k++) {
                var column = document.createElement('td');
                column.innerHTML = '<td>' + json[j][k]+ '</td>';
                actualRow.appendChild(column);
            }

        }
    }
}


//  creo la tabella per visualizzare il file csv risultato che ricevo dal server
function makeCsvResultTable(data) {

    //  rimuovo tutti gli elementi all'interno dell'elemento headtable
    var thead = document.getElementById("headtable");
    while (thead.firstChild) {
        thead.removeChild(thead.firstChild);
    }

    //  rimuovo tutti gli elementi all'interno dell'elemento tablebody
    var tbody = document.getElementById("tablebody");
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }


    //  per ogni riga del array
    for (var j = 0; j < data.length; j++) {
        if (j === 0) {
            for (var i = 0; i < data[j].length; i++) {
                var el = document.createElement('th');
                el.setAttribute('scope', 'col');
                el.innerHTML =  '<th>' + data[j][i]+ '</th>';
                thead.appendChild(el);
            }
        }
        if (j > 0) {
            //creo la riga
            var row = document.createElement('tr');
            row.setAttribute('id', 'row' + j);
            tbody.appendChild(row);
            var actualRow = document.getElementById('row' + j);
            for (var k = 0; k < data[j].length; k++) {
                var column = document.createElement('td');
                column.innerHTML = '<td>' + data[j][k] + '</td>';
                actualRow.appendChild(column);
            }
        }
    }
}


//  cancellazione di un csv selezionato dell'utente
function deleteCsv() {
    //  leggo il contenuto della variabile salvata in locale contenente il nome del file selezionato
    var csv = localStorage.getItem('csvSelected');
    //  controllo che sia stato selezionato un file
    if(csv === '' || csv == null){
        alert('No file selected!!!');
    }
    else{
        //  chiedo conferma di cancellazione
        var conf = confirm("Are you sure to delete: " + csv + " ?");
        if(conf){
            var xhr = new XMLHttpRequest();
                xhr.open('POST', '/userpage');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        //var resp = JSON.parse(xhr.responseText);
                        location.replace("/userpage");
                    }
                    else
                        showMessage("Delete file", 'Error during file deletion!!!', "error");
                };
                xhr.send(JSON.stringify({'command': 'deleteCsv', 'delete': csv}));

            //  elimino valore variabile locale
            localStorage.setItem('csvSelected','');
        }
    }
}


function deleteResult(){
    //  leggo il contenuto della variabile salvata in locale contenente il nome del file selezionato
    var resultFile = localStorage.getItem('resultSelected');
    //  controllo che sia stato selezionato un file
    if(resultFile === '' || resultFile == null){
        alert('No file selected!!!');
    }
    else{
        //  chiedo conferma di cancellazione
        var conf = confirm("Are you sure to delete: " + resultFile + " ?");
        if(conf){
            var xhr = new XMLHttpRequest();
                xhr.open('POST', '/userpage');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        //var resp = JSON.parse(xhr.responseText);
                        location.replace("/userpage");
                    }
                    else
                        showMessage("Delete file", 'Error during file deletion!!!', "error");
                };
                xhr.send(JSON.stringify({'command': 'deleteCsvResult', 'deleteResult': resultFile}));

            //  elimino valore variabile locale
            localStorage.setItem('resultSelected','');
        }
    }
}

function executeStartCalculate() {
    var scripts = document.getElementById('scripts');
    var scriptSelected = '';
    for(var i = 0; i < scripts.childElementCount; i++){
        if(scripts.children[i].children[0].getAttribute('aria-expanded') === 'true')
            scriptSelected = scripts.children[i].children[0].innerHTML;
    }
    localStorage.setItem('scriptSelected', scriptSelected);

    //  leggo il contenuto della variabile salvata in locale contenente il nome del file selezionato
    var csv = localStorage.getItem('csvSelected');
    //  controllo che sia stato selezionato un file
    if (csv === '' || csv == null) {
        showMessage("File selection", 'No file selected!!!', "error");
    }
    else {
        location.replace("/usercalculate");
    }
}


function requestScript(scriptName) {
    showMessage("Request script", "Request script " + scriptName, "info");

    var xhr = new XMLHttpRequest();
        xhr.open('POST', '/userpage');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {

                if(IsJson(xhr.responseText)) {
                    var resp = JSON.parse(xhr.responseText);

                    localStorage.setItem('data', JSON.stringify(resp));

                    var description = document.getElementById('scriptDescription');
                    description.innerHTML = resp['data']['instruction'];

                    var parameters = document.getElementById('scriptParameters');
                    parameters.innerHTML = resp['data']['help'];
                }
                else{
                    location.replace(xhr.responseURL);
                }
            }
            else
                showMessage("Request script", "Error during request " + scriptName + ' script!!!', "error");
        };
        xhr.send(JSON.stringify({"command": "requestScript",
                                 "script": scriptName}));
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