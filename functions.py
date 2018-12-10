from flask import session, jsonify, send_file
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from flask_pymongo import PyMongo
import io
import os
import csv
import json
import zipfile
import subprocess
from os import listdir
from os.path import isfile, join
from config import ALLOWED_EXTENSIONS, SERVER_CACHE, PATH_R_SCRIPT
from views import app


################ MongoDB ###################
mongo = PyMongo(app)
############################################

################ Mail ######################
mail = Mail(app)
############################################



#######################################################################################################################
##################################################   FUNCTIONS   ######################################################
#######################################################################################################################


#######################################################################################################################
#   Allowed file (now only csv extension)
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
#######################################################################################################################


#######################################################################################################################
#   Save file inside mongodb
def save_file(json, filename, user):
    mongo.db.files.save(dict(content=json, file=filename, user=user))
#######################################################################################################################


#######################################################################################################################
# Function to parse csv to dictionary
def csv_to_dict(file):
    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    reader = csv.reader(stream)
    x = []
    for row in reader:
        x.append(row)
    return json.dumps(x)
#######################################################################################################################


#######################################################################################################################
#   After new registration send welcome email
def sendRegistrationMail(email, name):
    msg = Message('Welcome ' + name, sender='angelo937@hotmail.it', recipients=[email])
    msg.body = "Hello " + name + " you are now registered on Insubria webapp"
    mail.send(msg)
#######################################################################################################################


#######################################################################################################################
#   Save csv selected from user fror start R script
def save_csv_cache(filename, csvFile):
    csv_rows = json.loads(csvFile)
    with open(SERVER_CACHE + session.get('email') + '/cache/' + filename, 'w') as cache_csv:
        writer = csv.writer(cache_csv)
        for row in csv_rows:
            writer.writerow(row)
#######################################################################################################################


#######################################################################################################################
#   Start execution of R script
def executeRscript(jsonData):
    # run by subprocess
    # Define command and arguments
    command = '/usr/lib/R/bin/Rscript'
    path2script = PATH_R_SCRIPT + jsonData['script'] + '/' + jsonData['script'] + '.R'

    # add to received json the directory name that correspond to user mail
    jsonData['directory'] = session.get('email')
    cmd = [command, path2script, json.dumps(jsonData).replace(" ", "")]

    # check_output will run the command and store to result
    s = subprocess.Popen(cmd, shell=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = s.communicate()
    errcode = s.returncode
    s.wait()
    return errcode
#######################################################################################################################


#######################################################################################################################
#   Delete user account from the database
def removeUserAccount():
    sessionEmail = session.get('email')
    #   remove all files associated to user
    mongo.db.files.delete_many({'user': sessionEmail})
    #   finally remove user from database
    mongo.db.user.delete_one({'email': sessionEmail})
    #   remove user directory used as cache memory
    removeUserDirectory(sessionEmail)
#######################################################################################################################


#######################################################################################################################
#   Request changed password from user
def changePasswordAccount(oldPassword, newPassword):
    # find user in database
    users = mongo.db.user
    user = users.find_one({'email': session.get('email')})

    #   if user exist
    if user is not None:
        #   first check if the old password is correct
        if check_password_hash(user['password'], oldPassword):
            #   than change the old password with the new one
            mongo.db.user.update({'email': session.get('email')}, {'$set': {'password': generate_password_hash(newPassword, method='sha256')}})
            return True
        return False
    return False
#######################################################################################################################


#######################################################################################################################
#   Function that return the list of filename inside `path` directory
def resultfiles(path):
    onlyfiles = [f for f in listdir(path) if isfile(join(path, f))]
    return onlyfiles
#######################################################################################################################


#######################################################################################################################
#   This function is called when user logout
#   Remove all files inside cache directory and results directory
def clearCache():
    sessionEmail = session.get('email')

    #   Remove all files inside cache directory
    if os.listdir(SERVER_CACHE + sessionEmail + '/cache/'):
        for file in os.listdir(SERVER_CACHE + sessionEmail + '/cache/'):
            file_path = os.path.join(SERVER_CACHE + sessionEmail + '/cache/', file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(e)

    #   Remove all files inside results directory
    if os.listdir(SERVER_CACHE + sessionEmail + '/results/'):
        for file in os.listdir(SERVER_CACHE + sessionEmail + '/results/'):
            file_path = os.path.join(SERVER_CACHE + sessionEmail + '/results/', file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(e)
#######################################################################################################################


########################################################################################################################
#   This function is called when user request to delete your account from the system
def removeUserDirectory(sessionEmail):
    for root, dirs, files in os.walk(SERVER_CACHE + sessionEmail, topdown=False):
        for name in files:
            os.remove(os.path.join(root, name))
        for name in dirs:
            os.rmdir(os.path.join(root, name))
    os.rmdir(os.path.join(SERVER_CACHE, sessionEmail))

    #   Delete session variables
    session.pop('logged_in')
    session.pop('id')
    session.pop('name')
    session.pop('surname')
    session.pop('email')
#######################################################################################################################


#######################################################################################################################
#   This function is called with new account registration
#   It is created a new directory named by the `directory` parameter
#   In this case the name of the directory correspond to the user email
def createFolder(directory):
    try:
        if not os.path.exists(directory):
            os.makedirs(directory)
    except OSError:
        print('Error: Creating directory. ' + directory)
#######################################################################################################################


#######################################################################################################################
#  Read the file 'scripts.json' of the selected file and return it
def requestScriptInfo(scriptDirectory):
    with open(PATH_R_SCRIPT + scriptDirectory + '/script_info.json') as data_file:
        data = data_file.read()
    data = json.dumps(json.loads(data))
    return '{"data": ' + data + '}'
#######################################################################################################################


#######################################################################################################################
#   Read the file 'parameters.json' of the selected file and return it
def requestScriptParameters(scriptDirectory):
    with open(PATH_R_SCRIPT + scriptDirectory + '/parameters.json') as data_file:
        data = data_file.read()
    data = json.dumps(json.loads(data))
    return '{"data": ' + data + '}'
#######################################################################################################################


#######################################################################################################################
#   Read the 'scripts.json' and return list of the available scripts
def listAvailableScript():
    scriptlist = []
    for name in os.listdir(PATH_R_SCRIPT):
        if os.path.isdir(PATH_R_SCRIPT + '/' + name):
            scriptlist.append(name)

    return scriptlist
#######################################################################################################################


#######################################################################################################################
#   Check if user is registered and return a response
#   This function is called in login request
def isRegistered(data):
    email = data['data']['email']
    password = data['data']['password']

    users = mongo.db.user
    user = users.find_one({'email': email})

    if user is not None:
        if check_password_hash(user['password'], password):
            session['logged_in'] = True
            session['id'] = str(user['_id'])
            session['name'] = str(user['name'])
            session['surname'] = str(user['surname'])
            session['email'] = str(user['email'])
            return jsonify({'result': 'Login success'})
        else:
            return jsonify({'result': 'Wrong password'})
    else:
        return jsonify({'result': 'You are not registered!!!'})
#######################################################################################################################


#######################################################################################################################
#   Request new user registration and return a response
#   This function is called in registration request
def newRegistration(data):
    name = data['data']['name']
    surname = data['data']['surname']
    email = data['data']['email']
    password = data['data']['password']

    #   Check if user is already registered
    if mongo.db.user.find_one({"email": email}) is None:
        hashed_password = generate_password_hash(password, method='sha256')
        mongo.db.user.insert(
            {"name": name,
             "surname": surname,
             "email": email,
             "password": hashed_password})
        createFolder(SERVER_CACHE + email)
        createFolder(SERVER_CACHE + email + '/cache')
        createFolder(SERVER_CACHE + email + '/results')
        #   invio mail di avvenuta registrazione
        #   sendRegistrationMail(email, name)
        return jsonify({'result': 'Registration success'})
    else:
        return jsonify({'result': 'You are already registered!!!'})
#######################################################################################################################


#######################################################################################################################
#   Function called when user make some request from user page
#   This return a response respect the user request
def userPageResponse(data):
    #   Delete the cache file requested from user
    if data['command'] == 'deleteCsv':
        files = mongo.db.files
        files.delete_one({'user': session.get('email'), 'file': data['delete']})
        return jsonify({'result': 'File succesfully delete!!!'})

    #   Delete the result file requested from user
    if data['command'] == 'deleteCsvResult':
        os.remove(SERVER_CACHE + session.get('email') + '/results/' + data['deleteResult'])
        return jsonify({'result': 'File succesfully delete!!!'})

    #   Return to user the requested file from cache directory
    if data['command'] == 'requestFile':
        files = mongo.db.files
        #   Find file in database
        cursor = files.find_one({'user': session.get('email'), 'file': data['file']})
        #   Save file in cache memory to execute in the future some calculus
        save_csv_cache(data['file'], cursor['content'])
        return jsonify(cursor['content'])

    #   Return to user the requested file from result directory
    if data['command'] == 'requestResultFile':
        #   leggo e invio il file result richiesto dall'utente
        with open(SERVER_CACHE + session.get('email') + '/results/' + data['resultFile'], 'r') as csvfile:
            readCSV = csv.reader(csvfile, delimiter=',')
            csvList = []
            for row in readCSV:
                csvList.append(row)
        return jsonify(csvList)

    #   Return to user the information regardin the R script selected
    if data['command'] == 'requestScript':
        return requestScriptInfo(data['script'])
#######################################################################################################################


#######################################################################################################################
#   Function called when user want to download a pdf file from result files
def sendPdf(filename):
    with open(SERVER_CACHE + session.get('email') + '/results/' + filename, 'rb') as bites:
        return send_file(
            io.BytesIO(bites.read()),
            attachment_filename=filename,
            mimetype='application/pdf')
#######################################################################################################################


#######################################################################################################################
#   Function called when user want to download an image from result files
def sendImage(filename):
    with open(SERVER_CACHE + session.get('email') + '/results/' + filename, 'rb') as bites:
        return send_file(
            io.BytesIO(bites.read()),
            attachment_filename=filename,
            mimetype='image/jpg')
#######################################################################################################################


#######################################################################################################################
#   Function called when user want to delete your account from the webapp
#   or when user want chenge your password
def deleteUser(data):
    if data['command'] == 'removeAccount':
        removeUserAccount()
        return jsonify({'result': 'Account succesfully removed!!!'})

    if data['command'] == 'changePassword':
        if changePasswordAccount(data['oldPassword'], data['newPassword']):
            return jsonify({'result': 'Password succesfully changed!!!'})
        else:
            return jsonify({'result': 'Error when system try to change your password'})
#######################################################################################################################


#######################################################################################################################
#   Function called when user want to download all result files
#   it is created one zip file
def createZipFile():
    #   Create a new zip file
    with zipfile.ZipFile(SERVER_CACHE + session.get('email') + '/myzipfile.zip',
                         'w', zipfile.ZIP_DEFLATED) as zf:
        abs_src = os.path.abspath(SERVER_CACHE + session.get('email') + '/results')

        #   Attach to zip all existing file in result directory
        for dirname, subdirs, files in os.walk(SERVER_CACHE + session.get('email') + '/results'):
            for filename in files:
                absname = os.path.abspath(os.path.join(dirname, filename))
                arcname = absname[len(abs_src) + 1:]
                zf.write(absname, arcname)
        zf.close()
#######################################################################################################################


#######################################################################################################################
#   Function called whe user want to start a new calculation
#   Return parameters of requested script or the results of calculate execution
def userCalculateParameters(data):
    if data['command'] == 'requestScriptParameters':
        return requestScriptParameters(data['script'])

    if data['command'] == 'startCalculate':
        result = executeRscript(data)
        return jsonify({'status': 'Execution finished', 'result': result})
#######################################################################################################################