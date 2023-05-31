package com.function.auth;

import static com.function.auth.Roles.*;

public class ExpectedPermissions {

    private final Boolean fullAdmin;
    private final Boolean salesAdmin;
    private final Boolean configTester;
    private final Boolean devicesAdmin;
    private final Boolean automationPlatform;
    private final Boolean crm;
    private final Boolean distributorFullAdmin;
    private final Boolean customerFullAdmin;
    private final Boolean subaccountAdmin;
    private final Boolean subaccountStakeholder;
    private final Boolean igesAdmin;

    ExpectedPermissions(Boolean fullAdmin,
                        Boolean salesAdmin,
                        Boolean configTester,
                        Boolean devicesAdmin,
                        Boolean automationPlatform,
                        Boolean crm,
                        Boolean distributorFullAdmin,
                        Boolean customerFullAdmin,
                        Boolean subaccountAdmin,
                        Boolean subaccountStakeholder,
                        Boolean igesAdmin){
        this.fullAdmin = fullAdmin;
        this.salesAdmin = salesAdmin;
        this.configTester = configTester;
        this.devicesAdmin = devicesAdmin;
        this.automationPlatform = automationPlatform;
        this.crm = crm;
        this.distributorFullAdmin = distributorFullAdmin;
        this.customerFullAdmin = customerFullAdmin;
        this.subaccountAdmin = subaccountAdmin;
        this.subaccountStakeholder = subaccountStakeholder;
        this.igesAdmin = igesAdmin;
    }

    public Boolean getExpectation(String role){
        switch(role){
            case FULL_ADMIN:
                return fullAdmin;
            case Roles.SALES_ADMIN:
                return salesAdmin;
            case CONFIG_TESTER:
                return configTester;
            case DEVICES_ADMIN:
                return devicesAdmin;
            case AUTOMATION_PLATFORM:
                return automationPlatform;
            case CRM:
                return crm;
            case DISTRIBUTOR_FULL_ADMIN:
                return distributorFullAdmin;
            case CUSTOMER_FULL_ADMIN:
                return customerFullAdmin;
            case SUBACCOUNT_ADMIN:
                return subaccountAdmin;
            case SUBACCOUNT_STAKEHOLDER:
                return subaccountStakeholder;
            case IGES_ADMIN:
                return igesAdmin;
        }
        return null;
    }
}
