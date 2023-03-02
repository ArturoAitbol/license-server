export class Constants {
    // Local Storage Keys
    public static readonly CURRENT_USER: string = 'currentUser';
    public static readonly SELECTED_CUSTOMER: string = 'selectedCustomer';
    public static readonly SELECTED_SUBACCOUNT: string = 'selectedSubaccount';
    public static readonly PROJECT: string = 'project';
    public static readonly SUBACCOUNT_USER_PROFILE: string = 'subAccountUserProfile';
    public static readonly CURRENT_ENABLED_SERVICES: string = 'currentEnabledServices';
    public static readonly TOOLBAR_DETAILS: string = 'toolbarDetails';
    public static readonly CURRENT_REPORTS: string = 'currentReports';

    // Session Storage Keys
    public static readonly ACCESS_TOKEN: string = 'access_token';

    // Logout time after inactivity in ms (12Hr x 60 min x 60 seg x 1000 ms)
    public static readonly LOGOUT_TIME_MS = 12 * 60 * 60 * 1000;

    // Tool bar constants
    public static readonly TEK_TOKEN_TOOL_BAR: string = 'tekVizion 360 Portal';
    public static readonly CTAAS_TOOL_BAR: string = 'Spotlight';

    //Phone number Validation
    public static readonly PHONE_NUMBER_PATTERN = '^[+]*[0-9]*$';

    // User roles
    public static readonly SUBACCOUNT_ADMIN = 'customer.SubaccountAdmin';
    public static readonly SUBACCOUNT_STAKEHOLDER = 'customer.SubaccountStakeholder';
    public static readonly DEVICES_ADMIN = 'tekvizion.DevicesAdmin';

    // Types contants
    public static readonly SANDBOX_DEVICE_TYPE = 'Sandbox';
    public static readonly CERT_DEVICE_TYPE = 'CERT';
    public static readonly OTHER_DEVICE_TYPE = 'OTHER';

    // Timer constants
    public static readonly DASHBOARD_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes * 60 seconds * 1000 milliseconds
    public static readonly DASHBOARD_NOTE_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes * 60 seconds * 1000 milliseconds
    
}

