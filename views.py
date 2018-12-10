from flask import flash, redirect, render_template, request, url_for
from werkzeug.utils import secure_filename
from website import app
from datetime import timedelta
from functions import *


#######################################################################################################################
#   After 5 minutes the session will be expired
@app.before_request
def make_session_permanent():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=5)
#######################################################################################################################


#######################################################################################################################
#   Rendering home page
@app.route('/')
def home():
    return render_template('home.html')
#######################################################################################################################


#######################################################################################################################
#   Rendering term of use page
@app.route('/terms')
def termOfUse():
    return render_template('term_of_use.html')
#######################################################################################################################


#######################################################################################################################
#   Rendering login page
@app.route('/login', methods=['GET'])
def login():
    if not session.get('logged_in'):
        return render_template('login.html')
    return redirect(url_for('userpage'))
#######################################################################################################################


#######################################################################################################################
#   Make login, this is called when user press login button
#   and take the data from POST request in Json format
@app.route('/login', methods=['PUT'])
def do_login():
    if request.method == 'PUT':
        if request.is_json:
            return isRegistered(request.json)
        else:
            return redirect(url_for('login'))
    else:
        return redirect(url_for('login'))
#######################################################################################################################


#######################################################################################################################
#   Log out page, this is called when user want to exit from your
#   reserved area. Than the user is redirect to the home page
@app.route("/logout")
def logout():
    clearCache()
    session.pop('logged_in')
    session.pop('id')
    session.pop('name')
    session.pop('surname')
    session.pop('email')
    return redirect(url_for('home'))
#######################################################################################################################


#######################################################################################################################
#   Rendering registration page
@app.route('/registration', methods=['GET'])
def registration():
    if not session.get('logged_in'):
        return render_template('registration.html')
    return redirect(url_for('userpage'))
#######################################################################################################################


#######################################################################################################################
#   Manage registration page throw PUT method
@app.route('/registration', methods=['PUT'])
def do_registration():
    if request.method == 'PUT':
        if request.is_json:
            return newRegistration(request.json)
        else:
            return jsonify({'result': 'There is something wrong whit your registration!!!'})
    else:
        return jsonify({'result': 'There is something wrong whit your registration!!!'})
#######################################################################################################################


#######################################################################################################################
#   Rendering user page, this is called when user loggin is success
#   than he can see all your data on reserved area
@app.route('/userpage')
def userpage():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    else:
        resFiles = resultfiles(SERVER_CACHE + session.get('email') + '/results')
        files = mongo.db.files
        cursor = files.find({'user': session.get('email')})
        if cursor:
            filesname = []
            for c in cursor:
                filesname.append(c['file'])
            return render_template('userpage.html', fileslist=filesname, resFiles=resFiles, scriptList=listAvailableScript())
        else:
            return render_template('userpage.html')
#######################################################################################################################


#######################################################################################################################
#   Manage Post request from userpage
@app.route('/userpage', methods=['POST'])
def upload_file():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    else:
        if request.method == 'POST':
            if request.is_json:
                return userPageResponse(request.json)
            else:
                #   This part manage the loading of  a new file inside database
                #   Check if the post request has the file part
                if 'file' not in request.files:
                    flash('No file part')
                    return redirect(request.url)
                file = request.files['file']
                if file.filename == '':
                    flash('No selected file')
                    return redirect(request.url)
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    save_file(csv_to_dict(file), filename, session.get('email'))
                    return redirect(url_for('upload_file', filename=filename))
                else:
                    return redirect(request.url)
#######################################################################################################################


#######################################################################################################################
#   Send the pdf file requested from user
@app.route('/pdf/<filename>')
def pdf(filename):
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    else:
        return sendPdf(filename)
#######################################################################################################################


#######################################################################################################################
#   Send the image file requested from user
@app.route('/image/<filename>')
def image(filename):
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    else:
        return sendImage(filename)
#######################################################################################################################


#######################################################################################################################
#   Rendering user page, this is called when user loggin is success
#   than he can see all your data on reserved area
@app.route('/userdata')
def userdata():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    else:
        return render_template('userdata.html')
#######################################################################################################################


#######################################################################################################################
#   Rendering user page, this is called when user login is success
#   than he can see all your data on reserved area
@app.route('/userdata', methods=['PUT'])
def removeUser():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    else:
        if request.method == 'PUT':
            if request.is_json:
                return deleteUser(request.json)

#######################################################################################################################


#######################################################################################################################
#   Return the file to download, requested by user
@app.route("/download")
def download_csv():
    if not session.get('logged_in'):
        return redirect(url_for('home'))
    else:
        createZipFile()
        return send_file(SERVER_CACHE + session.get('email') + '/myzipfile.zip',
                         mimetype='application/zip')
#######################################################################################################################


#######################################################################################################################
#   Rendering usercalculate page
@app.route('/usercalculate', methods=['GET'])
def usercalculate():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    else:
        return render_template('usercalculate.html')
#######################################################################################################################


#######################################################################################################################
#   Rendering usercalculate page
@app.route('/usercalculate', methods=['PUT'])
def usercalculate_parameters():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    else:
        if request.method == 'PUT':
            if request.is_json:
                return userCalculateParameters(request.json)
            else:
                return redirect(request.url)
        else:
            return redirect(request.url)
#######################################################################################################################


#######################################################################################################################
#   Rendering conatct page
@app.route("/contact")
def contact():
    return render_template('contact.html')
#######################################################################################################################

#######################################################################################################################
#   Rendering page 404 error
@app.errorhandler(404)
def error404(error):
    return render_template('error.html', error=error)
#######################################################################################################################

#######################################################################################################################
#   Rendering page 413 error for file oversize
@app.errorhandler(413)
def error413(error):
    return render_template('filesize.html', error=error)
#######################################################################################################################

#######################################################################################################################
#   Rendering page 500 error for server error
@app.errorhandler(500)
def error500(error):
    return render_template('error500.html', error=error)
#######################################################################################################################
