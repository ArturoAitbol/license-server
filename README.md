README file for license-server project.

For the azure functions, get into azure-functions directory and run accordingly:
# installing
mvn install
# testing
mvn test
# building
mvn clean package
# code coverage generation, more information in https://github.com/ryanluker/vscode-coverage-gutters/tree/master/example/java
mvn jacoco:report
cp mv target/site/jacoco/jacoco.xml cov.xml

For the UI read the README.md inside ui directory

For the UI e2e functional tests:
# go to the tests/ui and run the following command:
# environment can be one of the following values: local, integration, production
# local can be added copying tests/ui/src/main/resources/sample.local.properties to a file called local.properties placed in the same location
gradle uiTests -Denv=[environment]
# example: gradle uiTests -Denv=local
# if you want to run specific tests, you can run by tags running the following command
gradle uiTests -Denv=[environment] -D"cucumber.filter.tags=[tag]"
# example: gradle uiTests -Denv=local -D"cucumber.filter.tags=@projectsTest"
