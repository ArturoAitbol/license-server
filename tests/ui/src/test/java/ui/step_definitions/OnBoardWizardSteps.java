package ui.step_definitions;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import ui.pages.spotlight.OnBoardWizard;

import java.util.Map;

public class OnBoardWizardSteps {
    OnBoardWizard onBoardWizard;
    String jobTitle, company, phoneNumber, type, dailyReports, weeklyReports, monthlyReports;
    String actualMessage;

    public OnBoardWizardSteps(OnBoardWizard onBoardWizard){
        this.onBoardWizard = onBoardWizard;
    }

    @And("I fill the on board wizard with the following data")
    public void iFillTheOnBoardWizardWithTheFollowingData(DataTable dataTable) {
        Map<String, String> onBoard = dataTable.asMap(String.class, String.class);
        this.jobTitle = onBoard.get("jobTitle");
        this.company = onBoard.get("company");
        this.phoneNumber = onBoard.get("phoneNumber");
        this.type = onBoard.get("type");
        this.dailyReports = onBoard.getOrDefault("dailyReports", "");
        this.weeklyReports = onBoard.getOrDefault("weeklyReports", "");
        this.monthlyReports = onBoard.getOrDefault("monthlyReports", "");
        this.onBoardWizard.acceptForm(jobTitle, company, phoneNumber, type, dailyReports, weeklyReports, monthlyReports);
        this.actualMessage = this.onBoardWizard.getMessage();
    }
}
