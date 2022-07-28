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