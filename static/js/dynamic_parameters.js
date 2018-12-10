window.onload = function(){
    getParameters();
};

function getParameters() {
     var xhr = new XMLHttpRequest();
         xhr.open('PUT', '/usercalculate');
         xhr.setRequestHeader('Content-Type', 'application/json');
         xhr.onload = function() {
             if (xhr.status === 200) {
                 var resp = JSON.parse(xhr.responseText);
                 localStorage.setItem('parametersScript', JSON.stringify(resp));
                 makeParametersPage(resp);
             }
         };
         xhr.send(JSON.stringify({"command": "requestScriptParameters",
                                  "script": localStorage.getItem('scriptSelected')}));
}

var groupsRadio = [];
var groupsCheckbox = [];
var jsonParameters = '';

function makeParametersPage(parametersObj) {
    var form = document.getElementById('config_form');

    //  per ogni chiave controllo il type del parametro
    for(keys in parametersObj['data']){
        if(parametersObj['data'][keys].type === "radio")
            makeRadioMenu(form, keys, parametersObj['data'][keys].parameters);
        if(parametersObj['data'][keys].type === "check")
            makeCheckboxMenu(form, keys, parametersObj['data'][keys].parameters);
    }

    // infine aggiungo il pulsante per la conferma del calcolo
    var divform = document.getElementById('divform');
    var btnStart = document.createElement('button');
    btnStart.setAttribute('onclick', 'checkParameters()');
    btnStart.setAttribute('data-toggle', 'tooltip');
    btnStart.setAttribute('title', 'Start calculation');
    btnStart.innerText = 'Start calculation';
    divform.appendChild(btnStart);
}

function makeRadioMenu(form, propertyName, list) {
    var prop = document.createElement('h4');
    prop.innerText = propertyName;
    form.appendChild(prop);

    for(var x = 0; x < list.length; x++){
        var inputElement = document.createElement('input');
        var labelElement = document.createElement('label');
        inputElement.setAttribute('type', 'radio');
        inputElement.setAttribute('name', propertyName);
        inputElement.setAttribute('data-name', list[x]);
        inputElement.setAttribute('checked', 'true');
        labelElement.innerHTML = list[x];
        labelElement.innerHTML = "&nbsp&nbsp;" + labelElement.innerHTML + "&nbsp&nbsp;";

        form.appendChild(inputElement);
        form.appendChild(labelElement);
    }
    var hrElement = document.createElement('hr');
    hrElement.setAttribute('class', 'mb-6');
    form.appendChild(hrElement);
    form.appendChild(document.createElement('br'));

    // aggiungo il gruppo in array per tenere traccia di tutti i gruppi creati
    groupsRadio.push(propertyName);
}

function makeCheckboxMenu(form, propertyName, list) {
    var prop = document.createElement('h4');
    prop.innerText = propertyName;
    form.appendChild(prop);

    for(var x = 0; x < list.length; x++){
        var inputElement = document.createElement('input');
        var labelElement = document.createElement('label');
        inputElement.setAttribute('type', 'checkbox');
        inputElement.setAttribute('value', propertyName);
        inputElement.setAttribute('name', propertyName);
        inputElement.setAttribute('data-name', list[x]);
        labelElement.innerHTML = list[x];
        labelElement.innerHTML = "&nbsp&nbsp;" + labelElement.innerHTML + "&nbsp&nbsp;";

        form.appendChild(inputElement);
        form.appendChild(labelElement);
    }
    var hrElement = document.createElement('hr');
    hrElement.setAttribute('class', 'mb-6');
    form.appendChild(hrElement);
    form.appendChild(document.createElement('br'));

    // aggiungo il gruppo in array per tenere traccia di tutti i gruppi creati
    groupsCheckbox.push(propertyName);
}

function checkParameters() {
    jsonParameters = JSON.parse(localStorage.getItem('parametersScript'));
    var form = document.getElementById('config_form');

    // rimuovo tutti i parametri di default
    for(keys in jsonParameters['data']){
        jsonParameters['data'][keys]['parameters'].length = 0;
    }

    // ricavo tutti i parametri dal gruppo radio
    for(var q = 0; q < groupsRadio.length; q++){
        for(var r = 0; r < form[groupsRadio[q]].length; r++){
            if(form[groupsRadio[q]][r].checked){
                if(isNaN(form[groupsRadio[q]][r].dataset.name)){
                    jsonParameters['data'][form[groupsRadio[q]][r].name]['parameters'].push(form[groupsRadio[q]][r].dataset.name);
                }
                else{
                    // is a number
                    jsonParameters['data'][form[groupsRadio[q]][r].name]['parameters'].push(parseFloat(form[groupsRadio[q]][r].dataset.name));
                }
            }
        }
    }

    // ricavo tutti i parametri dal gruppo checkbox
    for(q = 0; q < groupsCheckbox.length; q++){
        for(r = 0; r < form[groupsCheckbox[q]].length; r++){
            if(form[groupsCheckbox[q]][r].checked){
                if(isNaN(form[groupsCheckbox[q]][r].dataset.name)){
                    jsonParameters['data'][form[groupsCheckbox[q]][r].name]['parameters'].push(form[groupsCheckbox[q]][r].dataset.name);
                }
                else{
                    // is a number
                    jsonParameters['data'][form[groupsCheckbox[q]][r].name]['parameters'].push(parseFloat(form[groupsCheckbox[q]][r].dataset.name));
                }
            }
        }
    }

    // invio i parametri
    startCalculate();
}


function startCalculate() {
    showMessage("Start calculate", "The script is working", "info");
    var data = {'command': 'startCalculate',
                'csvName': localStorage.getItem('csvSelected'),
                'script': localStorage.getItem('scriptSelected'),
                'parameters': jsonParameters['data']};

    var xhr = new XMLHttpRequest();
        xhr.open('PUT', '/usercalculate');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                if(IsJson(xhr.responseText)){
                    var resp = JSON.parse(xhr.responseText);

                    if(resp['result'] === 0){
                        // execution finished without error
                        showMessage("Script execution", "Execution finished without error", "successRedirect");
                        localStorage.clear();
                    }
                    else{
                        showMessage("Script execution", "Execution finished with some error\nPlease check that csv file is correct", "errorRedirect");
                    }
                }
                else{
                    location.replace(xhr.responseURL);
                }
            }
        };
        xhr.send(JSON.stringify(data));
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