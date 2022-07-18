export const environment = {
    production: true,
    apiEndpoint: 'https://tekvizion-portal.azurewebsites.net/api',
    // Azure Active Directory Application details
    CLIENT_ID: 'e643fc9d-b127-4883-8b80-2927df90e275',
    TENANT_ID: 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
    // BASE URL
    REDIRECT_URL_AFTER_LOGIN: window.location.origin + '/license-server/index.html'
};
