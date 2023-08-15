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

    // relevant URLs
    public static readonly CUSTOMERS_DASHBOARD_VIEW_PATH: string = '/customers-dashboard';
    public static readonly STAKEHOLDERS_VIEW_PATH: string = '/spotlight/stakeholders';
    public static readonly SPOTLIGHT_DASHBOARD_PATH: string = '/spotlight/spotlight-dashboard';

    // Session Storage Keys
    public static readonly ACCESS_TOKEN: string = 'access_token';

    // Tool bar constants
    public static readonly TEK_TOKEN_TOOL_BAR: string = 'TekVizion 360 Portal';
    public static readonly CTAAS_TOOL_BAR: string = 'UCaaS Continuous Testing';


    // User roles
    public static readonly SUBACCOUNT_ADMIN = 'customer.SubaccountAdmin';
    public static readonly SUBACCOUNT_STAKEHOLDER = 'customer.SubaccountStakeholder';
    public static readonly DEVICES_ADMIN = 'tekvizion.DevicesAdmin';

    //LIMITS
    public static readonly STAKEHOLDERS_LIMIT_PER_SUBACCOUNT = 11;
    public static readonly STAKEHOLDERS_LIMIT_MULTITENANT_SUBACCOUNT = 50;

    // Alert messages
    public static readonly MAINTENANCE_MODE_ALERT = "The UCaaS Continuous Testing Service is currently experiencing limited functionality due to ongoing maintenance. " +
    "Please note that during this maintenance period, the dashboard, map, adding new notes and detailed test reports are not available.";
    
    // Info messages
    public static readonly UTC_DATE_INFO = "All the following results are displayed in UTC Time Zone";

    // Types contants
    public static readonly SANDBOX_DEVICE_TYPE = 'Sandbox';
    public static readonly CERT_DEVICE_TYPE = 'CERT';
    public static readonly OTHER_DEVICE_TYPE = 'OTHER';

    // Timer constants
    public static readonly LOGOUT_TIME_MS = 12 * 60 * 60 * 1000; // Logout time after inactivity in ms (12Hr x 60 min x 60 sec x 1000 ms)
    public static readonly TOGGLES_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes * 60 seconds * 1000 milliseconds
    public static readonly LEGACY_DASHBOARD_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes * 60 seconds * 1000 milliseconds
    public static readonly DASHBOARD_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes * 60 seconds * 1000 milliseconds
    public static readonly DASHBOARD_NOTE_REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes * 60 seconds * 1000 milliseconds
    public static readonly REQUEST_CALLBACK_TIME_BETWEEN_REQUESTS_MS = 30 * 60 * 1000; // 30 minutes * 60 seconds * 1000 milliseconds
    public static readonly LOGIN_TIMEOUT = 5 * 60 * 1000; // 5 minutes * 60 seconds * 1000 milliseconds

    public static readonly DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

}

