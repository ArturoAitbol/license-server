export const environment = {
    production: true,
    apiEndpoint: 'https://tekvizion360-portal-fa.azurewebsites.net/v1.0',
    // Azure Active Directory Application details
    AUTHORITY: 'https://login.microsoftonline.com/f3b3f347-d7e6-47ca-80e9-ae1890cbb23a',
    TENANT_ID: 'f3b3f347-d7e6-47ca-80e9-ae1890cbb23a',
    UI_CLIENT_ID: 'e08ef887-d639-4c76-82ab-8bb719bc2313',
    API_CLIENT_ID: 'f66c0c68-6bfe-412d-96a1-d9a730c1a600',
    API_SCOPE: 'tekvizion.access',
    INSTRUMENTATION_CONN_STRING: 'InstrumentationKey=f7b20352-0555-4fe7-a991-c2f6fc587a94;IngestionEndpoint=https://southcentralus-3.in.applicationinsights.azure.com/;LiveEndpoint=https://southcentralus.livediagnostics.monitor.azure.com/',
    // BASE URL
    REDIRECT_URL_AFTER_LOGIN: window.location.origin + '/index.html'
};
