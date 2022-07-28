
export const MsalServiceMock = {
    instance: {
        getActiveAccount: () => {
            return {
                'homeAccountId': '4bd8345a-b441-4791-91ff-af23e4b02e02.e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
                'environment': 'login.windows.net',
                'tenantId': 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
                'username': 'lvelarde@tekvizionlabs.com',
                'localAccountId': '4bd8345a-b441-4791-91ff-af23e4b02e02',
                'name': 'Leonardo Velarde',
                idTokenClaims: {
                    'aud': 'e643fc9d-b127-4883-8b80-2927df90e275',
                    'iss': 'https://login.microsoftonline.com/e3a46007-31cb-4529-b8cc-1e59b97ebdbd/v2.0',
                    'iat': 1657823518,
                    'nbf': 1657823518,
                    'exp': 1657827418,
                    'name': 'Leonardo Velarde',
                    'nonce': '41279ac2-8254-4f82-a11b-38fd27248c57',
                    'oid': '4bd8345a-b441-4791-91ff-af23e4b02e02',
                    'preferred_username': 'lvelarde@tekvizionlabs.com',
                    'rh': '0.ARMAB2Ck48sxKUW4zB5ZuX69vZ38Q-YnsYNIi4ApJ9-Q4nUTAEs.',
                    roles: [
                        'tekvizion.FullAdmin'
                    ],
                    'sub': 'q_oqvIR8gLozdXv-rtEYPNfPc0y4AfLlR_LiKUxZSy0',
                    'tid': 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
                    'uti': 'GwgRbk67AECociiD7H0SAA',
                    'ver': '2.0'
                }
            };
        }
    }
};
