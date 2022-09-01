
export const MsalServiceMock = {
    instance: {
        getActiveAccount: () => {
            return {
                'homeAccountId': '12341234-1234-1234-1234-123412341234.12341234-1234-1234-1234-123412341234',
                'environment': 'login.windows.net',
                'tenantId': '12341234-1234-1234-1234-123412341234',
                'username': 'username@test.com',
                'localAccountId': '12341234-1234-1234-1234-123412341234',
                'name': 'name',
                idTokenClaims: {
                    'aud': '12341234-1234-1234-1234-123412341234',
                    'iss': 'https://login.microsoftonline.com/12341234-1234-1234-1234-123412341234/v2.0',
                    'iat': 1234567890,
                    'nbf': 1234567891,
                    'exp': 1234567892,
                    'name': 'Leonardo Velarde',
                    'nonce': '12341234-1234-1234-1234-123412341234',
                    'oid': '12341234-1234-1234-1234-123412341234',
                    'preferred_username': 'preferred_username',
                    'rh': '',
                    roles: [
                        'tekvizion.FullAdmin'
                    ],
                    'sub': 'sub',
                    'tid': '12341234-1234-1234-1234-123412341234',
                    'uti': 'uti',
                    'ver': 'ver'
                }
            };
        }
    }
};
