
export const MsalServiceMock = {
    instance: {
        getActiveAccount: () => {
            return {
                'homeAccountId': '1234-1234-1234-1234-1234.1234-1234-1234-1234-1234',
                'environment': 'login.windows.net',
                'tenantId': '1234-1234-1234-1234-1234',
                'username': 'username@test.com',
                'localAccountId': '1234-1234-1234-1234-1234',
                'name': 'name',
                idTokenClaims: {
                    'aud': '1234-1234-1234-1234-1234',
                    'iss': 'https://login.microsoftonline.com/1234-1234-1234-1234-1234/v2.0',
                    'iat': 1234567890,
                    'nbf': 1234567891,
                    'exp': 1234567892,
                    'name': 'Leonardo Velarde',
                    'nonce': '1234-1234-1234-1234-1234',
                    'oid': '1234-1234-1234-1234-1234',
                    'preferred_username': 'preferred_username',
                    'rh': '',
                    roles: [
                        'tekvizion.FullAdmin'
                    ],
                    'sub': 'sub',
                    'tid': '1234-1234-1234-1234-1234',
                    'uti': 'uti',
                    'ver': 'ver'
                }
            };
        }
    }
};
