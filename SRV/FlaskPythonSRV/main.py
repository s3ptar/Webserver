"""#####################################################################
#! @ file:                   pihole_exporter.py
#  @ projekt:                pihole_exporter
#  @ created on:             2025 11 16
#  @ author:                 R. Gräber
#  @ version:                0
#  @ history:                -
#  @ brief
#####################################################################"""

"""#####################################################################
# Informations
#####################################################################"""


"""#####################################################################
# Includes
#####################################################################"""
import json
from flask import Flask, render_template, send_from_directory
import logging
from logging.handlers import RotatingFileHandler
import sys
from pathlib import Path

"""#####################################################################
# Declarations
#####################################################################"""

"""#####################################################################
# Constant
#####################################################################"""

"""#####################################################################
# Global Variable
#####################################################################"""

"""#####################################################################
# local Variable
#####################################################################"""
logger = logging.getLogger(__name__)
app = Flask(__name__)
default_config = {}
"""#####################################################################
# Constant
#####################################################################"""



"""#####################################################################
# Local Funtions
#####################################################################"""



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/css/<path:path>')
def send_css(path):
    return send_from_directory('static/css', path)

@app.route('/static/html/<path:path>')
def send_html(path):
    return send_from_directory('static/html', path)

@app.route('/static/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)

"""#####################################################################
#! @fn           init_app()
#  @ brief       init logging and load config files
#  @ param       none
#  @ exception   none
#  @ return      none
#####################################################################"""
def init_app():
    # Load configuration
    # global variable
    global default_config
    global logger
    with open('config/default_config.json') as default_config_file:
        default_config = json.load(default_config_file)

    # check if override config exists and load it, then update default config with override values
    if Path('config/override_config.json'):
        try:
            with open('config/override_config.json') as override_config_file:
                override_config = json.load(override_config_file)
                default_config.update(override_config)
        except FileNotFoundError:
            pass  # If override file doesn't exist, use default_config only
        except json.JSONDecodeError:
            pass  # If override file doesn't exist, use default_config only
        # Verhindert doppelte Handler, falls setup_logger mehrfach aufgerufen wird
    if logger.hasHandlers():
        logger.handlers.clear()
    # Format für Log-Ausgaben
    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    # --- Konsole ---
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)  # Nur INFO und höher in der Konsole
    console_handler.setFormatter(formatter)

    # --- Datei mit Rotation ---
    file_handler = RotatingFileHandler(
        default_config["logging_params"]["log_name_and_path"], maxBytes=5*1024*1024, backupCount=3, encoding="utf-8"
    )

    file_handler.setLevel(logging.DEBUG)  # Alles in die Datei
    file_handler.setFormatter(formatter)

    # Handler hinzufügen
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger


"""#####################################################################
#! @fn          int main(){
#  @ brief       start up function
#  @ param       none
#  @ exception   none
#  @ return      none
#####################################################################"""
if __name__ == '__main__':
    log = init_app()
    log.info("Starting $__name__")