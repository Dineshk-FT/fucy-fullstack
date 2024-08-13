from flask import Flask
from flask_pymongo import PyMongo
import logging
from logging.handlers import RotatingFileHandler
import os

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    mongo.init_app(app)

    # Ensure the log directory exists
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Set up logging to file
    log_file = os.path.join(log_dir, 'info.log')
    handler = RotatingFileHandler(log_file, maxBytes=10000, backupCount=3)
    handler.setLevel(logging.INFO)
    handler.setFormatter(logging.Formatter(
        "[%(asctime)s] {%(pathname)s:%(funcName)s %(lineno)d} %(levelname)s - %(message)s"
    ))

    # Set up error logging to file
    error_file = os.path.join(log_dir, 'error.log')
    error_handler = RotatingFileHandler(error_file, maxBytes=10000, backupCount=3)
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))

    # Add handlers to the app's logger
    app.logger.addHandler(handler)
    app.logger.addHandler(error_handler)

    # Set the logging level for the app's logger
    app.logger.setLevel(logging.INFO)

    # Log unhandled exceptions
    @app.errorhandler(Exception)
    def log_exception(e):
        app.logger.error('Unhandled Exception: %s', e, exc_info=True)
        return "Internal Server Error", 500

    with app.app_context():
        from . import routes

    return app
