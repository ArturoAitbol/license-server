export class HotelingguestCheckin {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        // tslint:disable-next-line:max-line-length
        let query = $commented + data.phone + '.line' + data.line + '.hotelingguestcheckin("' + data.userId + '","' + data.hotelingPassword + '"';
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
