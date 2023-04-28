package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import org.aeonbits.owner.ConfigFactory;
import ui.pages.spotlight.OnBoardWizard;
import ui.utils.Environment;

import java.util.Map;

public class OnBoardWizardSteps {
    OnBoardWizard onBoardWizard;
    String name, jobTitle, email, company, phoneNumber, countryPhoneNumber, type, dailyReports, weeklyReports, monthlyReports;
    Environment environment = ConfigFactory.create(Environment.class);

    public OnBoardWizardSteps(OnBoardWizard onBoardWizard){
        this.onBoardWizard = onBoardWizard;
    }

    @And("I fill the on board wizard with the following data")
    public void iFillTheOnBoardWizardWithTheFollowingData(DataTable dataTable) {
        Map<String, String> onBoard = dataTable.asMap(String.class, String.class);
        this.name = onBoard.get("name");
        this.jobTitle = onBoard.get("jobTitle");
//        this.email = onBoard.get("email");
        this.email = environment.subaccountAdminUser();
        this.company = onBoard.get("company");
        this.countryPhoneNumber = onBoard.get("countryPhoneNumber");
        this.phoneNumber = onBoard.get("phoneNumber");
        this.onBoardWizard.acceptForm(name, jobTitle, email, company, countryPhoneNumber, phoneNumber);
//        this.actualMessage = this.onBoardWizard.getMessage();
    }
}
