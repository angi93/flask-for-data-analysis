import os

DEBUG = False
MONGO_DBNAME = 'dbwebapp'
MONGO_URI = 'mongodb://{user}:{password}@ds239117.mlab.com:3911'
SECRET_KEY = os.urandom(24)
SERVER_CACHE = '/home/user/PycharmProjects/website/cache/'
PATH_R_SCRIPT = '/home/user/PycharmProjects/website/rscripts/'
ALLOWED_EXTENSIONS = {'csv'}
MAX_CONTENT_LENGTH = 1 * 1024 * 1024 # 1 Mbyte


##################################################
#   Flask-Mail is configured as per following settings
MAIL_SERVER ='smtp-mail.outlook.com'
MAIL_PORT = 587
MAIL_USERNAME = 'your email'
MAIL_PASSWORD = 'password'
MAIL_USE_TLS = True
MAIL_USE_SSL = False

