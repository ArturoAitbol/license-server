export class Constants {
    public static readonly CURRENT_USER: string = 'currentUser';
    public static readonly SELECTED_CUSTOMER: string = 'selectedCustomer';
    public static readonly SELECTED_SUBACCOUNT: string = 'selectedSubAccount';
    public static readonly PROJECT: string = 'project';
    public static readonly SUBACCOUNT_USER_PROFILE: string = 'subAccountUserProfile';
    public static readonly CURRENT_ENABLED_SERVICES: string = 'currentEnabledServices';
    public static readonly TOOLBAR_DETAILS: string = 'toolbarDetails';

    // Session Storage Keys
    public static readonly ACCESS_TOKEN: string = 'access_token';

    // Logout time after inactivity in ms (1Hr x 60 min x 60 seg x 1000 ms
    public static readonly LOGOUT_TIME_MS = 1 * 60 * 60 * 1000;

    // Tool bar constants
    public static readonly TEK_TOKEN_TOOL_BAR: string = 'tekVizion 360 Portal';
    public static readonly CTAAS_TOOL_BAR: string = 'SpotLight';

    //Phone number Validation
    public static readonly PHONE_NUMBER_PATTERN = '^[+]*[0-9]*$';

}

