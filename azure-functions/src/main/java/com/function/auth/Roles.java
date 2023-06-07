package com.function.auth;

import java.util.Arrays;
import java.util.List;

public abstract class Roles {
    public static final String FULL_ADMIN = "tekvizion.FullAdmin";
    public static final String SALES_ADMIN = "tekvizion.SalesAdmin";
    public static final String CONFIG_TESTER = "tekvizion.ConfigTester";
    public static final String DEVICES_ADMIN = "tekvizion.DevicesAdmin";
    public static final String AUTOMATION_PLATFORM = "tekvizion.AutomationPlatform";
    public static final String CRM = "tekvizion.CRM";
    public static final String DISTRIBUTOR_FULL_ADMIN = "distributor.FullAdmin";
    public static final String CUSTOMER_FULL_ADMIN = "customer.FullAdmin";
    public static final String SUBACCOUNT_ADMIN = "customer.SubaccountAdmin";
    public static final String SUBACCOUNT_STAKEHOLDER = "customer.SubaccountStakeholder";
    public static final String IGES_ADMIN = "tekvizion.IGESAdmin";

    public static List<String> getAllRoles(){
        return Arrays.asList(FULL_ADMIN,
                SALES_ADMIN,
                CONFIG_TESTER,
                DEVICES_ADMIN,
                AUTOMATION_PLATFORM,
                CRM,
                DISTRIBUTOR_FULL_ADMIN,
                CUSTOMER_FULL_ADMIN,
                SUBACCOUNT_ADMIN,
                SUBACCOUNT_STAKEHOLDER,
                IGES_ADMIN);
    }

    public static List<String> getCustomerRoles(){
        /*The order of this list is important*/
        return Arrays.asList(
                DISTRIBUTOR_FULL_ADMIN,
                CUSTOMER_FULL_ADMIN,
                SUBACCOUNT_ADMIN,
                SUBACCOUNT_STAKEHOLDER);
    }
}
