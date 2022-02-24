export class Constants {
    public static readonly CURRENT_USER: string = 'currentUser';
    public static readonly SELECTED_CUSTOMER: string = 'selectedCustomer';
    // Session Storage Keys
    public static readonly ACCESS_TOKEN: string = 'access_token';
    // Azure Active Directory Application details
    public static readonly CLIENT_ID: string = 'e643fc9d-b127-4883-8b80-2927df90e275';
    public static readonly TENANT_ID: string = 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd';

    public static readonly REDIRECT_URL_AFTER_LOGIN: string = window.location.origin + '/license-server/index.hmtl';
}
