export class SyncDevice {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = '';
        switch (data.syncType) {
            case 'phone':
                query = `${$commented}${data.phone}.sync(`;
                if (data.continueonfailure && data.continueonfailure != null) {
                    query += `"${data.continueonfailure}"`;
                }
                query += ')';
                return query;
            case 'callServer':
                query = `${$commented}${data.phone}.sync("CallServer",${data.server}`;
                if (data.continueonfailure && data.continueonfailure != null) {
                    query += `,"${data.continueonfailure}"`
                }
                query += ')';
                return query;
            case 'both':
                query = `${$commented}${data.phone}.sync("Phone&CallServer",${data.server}`;
                if (data.continueonfailure && data.continueonfailure != null) {
                    query += `"${data.continueonfailure}"`
                }
                query += ')';
                return query;
        }
    }
}
