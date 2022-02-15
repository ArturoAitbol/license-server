import { AuthConfig } from 'angular-oauth2-oidc';
import { Constants } from '../helpers/constants';

export const authConfig: AuthConfig = {
    issuer: `https://login.microsoftonline.com/${Constants.TENANT_ID}/v2.0`,
    redirectUri: window.location.origin + '/license-server/dashboard',
    clientId: Constants.CLIENT_ID,
    responseType: 'code',
    strictDiscoveryDocumentValidation: false,
    scope: `openid api://${Constants.CLIENT_ID}/app`,
}