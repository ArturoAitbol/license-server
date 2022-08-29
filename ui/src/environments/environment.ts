// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: false,
//   apiEndpoint: 'http://localhost:7071/v1.0',
//   // Azure Active Directory Application details
//   AUTHORITY: 'https://login.microsoftonline.com/e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
//   TENANT_ID: 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
//   UI_CLIENT_ID: 'e643fc9d-b127-4883-8b80-2927df90e275',
//   API_CLIENT_ID: 'abb49487-0434-4a82-85fa-b9be4443d158',
//   API_SCOPE: 'tekvizion.access',
//   INSTRUMENTATION_CONN_STRING: 'InstrumentationKey=d93dae32-180f-40b2-a8b1-1d4ae7fdddcb;IngestionEndpoint=https://southcentralus-0.in.applicationinsights.azure.com/;LiveEndpoint=https://southcentralus.livediagnostics.monitor.azure.com/',
//   // BASE URL
//   REDIRECT_URL_AFTER_LOGIN: window.location.origin + '/dashboard'
// };

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
  REDIRECT_URL_AFTER_LOGIN: window.location.origin + '/dashboard'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
// old API url https://tekvizion360apis.azure-api.net/license-server