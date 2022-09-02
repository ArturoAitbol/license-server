import os
import sys
import logging
from subprocess import Popen, PIPE, STDOUT


# Init Logger
logging.basicConfig(format='%(asctime)s,%(msecs)d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s',
    datefmt='%Y-%m-%d:%H:%M:%S', level=logging.DEBUG)

root_directory = os.path.dirname(os.path.realpath(__file__))

def print_output(process):
    for line in iter(process.stdout.readline, b''):
        print(line)
    process.stdout.close()
    process.wait()       

def run_api_unit_tests():
    logging.info("Starting to run api tests")
    try:
        os.chdir('./azure-functions/')
        cmd = "mvn clean package -Dmaven.test.skip -Dexec.skip -q"
        process = Popen(cmd, stdout=PIPE, stderr=STDOUT, shell=True, bufsize=0)
        print_output(process)
        if process.returncode != 0:
            logging.error("Error on app package: " + str(process.stdout))
            raise Exception("API Unit test returned an error")
        else:            
            cmd = "mvn test"
            process = Popen(cmd, stdout=PIPE, stderr=STDOUT, shell=True, bufsize=0)
            print_output(process)
            if process.returncode != 0:
                logging.error("Error running API unit tests: " + str(process.stdout))
                raise Exception("API Unit test returned an error")
        os.chdir(root_directory)
        logging.info("API Test Completed Succesfully")
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
            logging.error("Error on Dependency installation: " + str(process.stdout))
            raise Exception("API Unit test returned an error")
        else:
            cmd = "npm run test -- --no-watch --no-progress"
            process = Popen(cmd, stdout=PIPE, stderr=STDOUT, shell=True, bufsize=0)
            print_output(process)
            if process.returncode != 0:
                logging.error("Error running UI unit tests: " + str(process.stdout))
                raise Exception("API Unit test returned an error")
        os.chdir(root_directory)
        logging.info("API Test Completed Succesfully")
    except Exception as e:
        return_error(e)

def run_ui_functional_tests():
    logging.info("Starting to run UI Functional tests")
    try:
        os.chdir('./tests/ui')
        cmd = "gradle uiTests -Denv=local"
        process = Popen(cmd, stdout=PIPE, stderr=STDOUT, shell=True, bufsize=0)
        print_output(process)
        if process.returncode != 0:
            logging.error("Error on Dependency installation: " + str(process.stdout))
            raise Exception("API Unit test returned an error")
        os.chdir(root_directory)
        logging.info("API Test Completed Succesfully")
    except Exception as e:
        return_error(e)

def is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def return_error(e):
    logging.error('Error running Auto Test: '+str(e) + ' Please check log file')
    sys.exit(1)

if __name__=="__main__":
    try:
        logging.info("Start Auto-Test script")
        # run_api_unit_tests()        
        # run_ui_unit_tests()
        # print(is_port_in_use(4200))
        run_ui_functional_tests()
    except Exception as e:
        logging.error('Error running Auto Test: '+str(e) + ' Please check log file')
        sys.exit(1)