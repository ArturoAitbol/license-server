export const environment = {
    production: true,
    apiEndpoint: 'https://tekvizion-portal.azurewebsites.net/v1.0',
    // Azure Active Directory Application details
    TENANT_ID: 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
    UI_CLIENT_ID: '9de85cf9-daa1-434c-b8e2-d319713f24b7',
    API_CLIENT_ID: '40991586-725f-445e-a488-943cef282ee3',
    API_SCOPE: 'tekvizion.access',
    INSTRUMENTATION_CONN_STRING: 'InstrumentationKey=17452e6b-fb62-49a0-920f-5c1cfb799707;IngestionEndpoint=https://southcentralus-3.in.applicationinsights.azure.com/;LiveEndpoint=https://southcentralus.livediagnostics.monitor.azure.com/',
    // BASE URL
    REDIRECT_URL_AFTER_LOGIN: window.location.origin + '/index.html'
};
