export const environment = {
    production: true,
    apiEndpoint: 'https://tekvlicenseserverpocfunction.azurewebsites.net/api',
    // Azure Active Directory Application details
    TENANT_ID: 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
    UI_CLIENT_ID: 'e643fc9d-b127-4883-8b80-2927df90e275',
    API_CLIENT_ID: 'abb49487-0434-4a82-85fa-b9be4443d158',
    API_SCOPE: 'tekvizion.access',
    // BASE URL
    REDIRECT_URL_AFTER_LOGIN: window.location.origin + '/license-server/index.html'
};
