export class SystemLogLevel {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented + data.phone + '.systemloglevel("' + data.value + '"';
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
