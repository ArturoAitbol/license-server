export class Constants {
    public static readonly CURRENT_USER: string = 'currentUser';
    public static readonly SELECTED_CUSTOMER: string = 'selectedCustomer';
    public static readonly SELECTED_SUBACCOUNT: string = 'selectedSubAccount';
    public static readonly PROJECT: string = 'project';

    // Session Storage Keys
    public static readonly ACCESS_TOKEN: string = 'access_token';
    
    // Logout time after inactivity in ms (1Hr x 60 min x 60 seg x 1000 ms
    public static readonly LOGOUT_TIME_MS = 1 * 60 * 60 * 1000;
}