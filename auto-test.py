import os
import sys
import time
import logging
from subprocess import Popen, PIPE, STDOUT


# Init Logger
logging.basicConfig(format='%(asctime)s,%(msecs)d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s',
                    datefmt='%Y-%m-%d:%H:%M:%S', level=logging.DEBUG, handlers=[logging.FileHandler("auto-test.log"), logging.StreamHandler()])

root_directory = os.path.dirname(os.path.realpath(__file__))


def print_output(process):
    for line in iter(process.stdout.readline, b''):
        logging.info(line)
    process.stdout.close()
    process.wait()


def run_api_unit_tests():
    logging.info("Starting to run api tests")
    try:
        os.chdir('./azure-functions/')
        cmd = "mvn test"
        process = Popen(cmd, stdout=PIPE, stderr=STDOUT,
                        shell=True, bufsize=0)
        print_output(process)
        if process.returncode != 0:
            logging.error("Error running API unit tests: " +
                            str(process.stdout))
            raise Exception("API Unit test returned an error")
        os.chdir(root_directory)
        logging.info("API Test Completed Succesfully")
        time.sleep(5)
    except Exception as e:
        return_error(e)


def run_ui_unit_tests():
    logging.info("Starting to run UI unit tests")
    try:
        os.chdir('./ui')
        cmd = "npm install"
        process = Popen(cmd, stdout=PIPE, stderr=STDOUT, shell=True, bufsize=0)
        print_output(process)
        if process.returncode != 0:
            logging.error("Error on Dependency installation: " +
                          str(process.stdout))
            raise Exception("UI Unit test returned an error")
        else:
            cmd = "npm run test -- --no-watch --no-progress"
            process = Popen(cmd, stdout=PIPE, stderr=STDOUT,
                            shell=True, bufsize=0)
            print_output(process)
            if process.returncode != 0:
                logging.error("Error running UI unit tests: " +
                              str(process.stdout))
                raise Exception("UI Unit test returned an error")
        os.chdir(root_directory)
        logging.info("UI Unit test Completed Succesfully")
        time.sleep(5)
    except Exception as e:
        return_error(e)


def run_ui_functional_tests():
    logging.info("Starting to run UI Functional tests")
    try:
        os.chdir('./tests/ui')
        cmd = 'gradle uiTests -Denv=local -D"cucumber.filter.tags=not @feature-toggle"'
        process = Popen(cmd, stdout=PIPE, stderr=STDOUT, shell=True, bufsize=0)
        print_output(process)
        if process.returncode != 0:
            logging.error("Error on UI Functional Test execution: " +
                          str(process.stdout))
            raise Exception("UI Functional test returned an error")
        os.chdir(root_directory)
        logging.info("UI Functional Test Completed Succesfully")
        time.sleep(5)
    except Exception as e:
        return_error(e)


def is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


def return_error(e):
    logging.error('Error running Auto Test: ' +
                  str(e) + ' Please check log file')
    sys.exit(1)

def clean_log():
    open('./auto-test.log', 'w').close()

def fix_log():
    file = open('./auto-test.log','r')
    to_remove = ["b'","\\n'"]
    new_data = []
    for line in file:
        for word in to_remove:
            if word in line:
                line = line.replace(word,'')
        new_data.append(line)
    file.close()
    file = open('./auto-test.log','w')
    for line in new_data:
        file.write(line)
    file.close()

def verify_requirements():
    logging.info("Check requirements")
    count = 0
    try:
        message = "Following requirements are not met: \n"
        if (not is_port_in_use(4200)):
            message += "- Angular app doesn't seems to be started, please start the application manually\n"
            count += 1
        if (not is_port_in_use(7071)):
            message += "- Local Azure functions doesn't seems to be running, please start them manually"
            count += 1
        if (count > 0):
            return_error(message)
    except Exception as e:
        return_error(e)


def display_requirements():
    val = input("""=================================================
        Welcome to TekVizion 360 Dev Auto Test Script!
        Before proceed, please check you met following requirements:
        \t - You have set your configuration correctly in tests/ui/src/main/resources/local.properties (use headless_chrome as browser)
        \t - You have set your configuration correctly in azure-functions/src/test/resources/config.properties
        \t - You have set your configuration correctly in azure-functions/local.settings.json (please use port 7071)
        \t - You packaged and launched azure functions in local environment (mvn azure-functions:package && mvn azure-functions:run)
        \t - You are running License server locally in default port 4200 (npm install && ng serve)\n
        Please note that if any of these requirements are not in place, Auto Test script could fail.\n
        Do you want to proceed? (Y/n)""")
    if(val.lower() == 'n'):
        logging.info("Thanks for running Auto Test")
        sys.exit(1)
    logging.info("Auto Test will start soon, please stay tuned, at some point we'll prompt for a db user :)")   
    time.sleep(5)
    return



if __name__ == "__main__":
    try:
        clean_log()
        logging.info("Start Auto-Test script")
        display_requirements()
        verify_requirements()
        run_api_unit_tests()
        run_ui_unit_tests()
        run_ui_functional_tests()
        logging.info("All tests executed succesfully!")
        logging.info("Thanks for using Auto Test!")
        fix_log()
        time.sleep(2)
    except Exception as e:
        logging.error('Error running Auto Test: ' +
                      str(e) + ' Please check log file')
        sys.exit(1)
