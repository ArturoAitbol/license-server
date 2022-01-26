export class HotelingguestCheckout {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        // tslint:disable-next-line:max-line-length
        // return $commented + data.phone + '.line' + data.line + '.hotelingguestcheckout("' + data.userId + '","' + data.hotelingPassword + '")';
        let query = $commented + data.phone + '.line' + data.line + '.hotelingguestcheckout(';
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
