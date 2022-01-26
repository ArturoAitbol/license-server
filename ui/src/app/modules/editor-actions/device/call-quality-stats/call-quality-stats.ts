export class CallQualityStats {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        const resultKey = (data.resultIn) ? data.resultIn : '';
        let query = `${$commented}${data.phone}.callQualityStats(resultKey="${resultKey}"`;
        if (data.continueonfailure != null) {
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
