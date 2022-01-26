export class VideoQualityStats {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented + data.phone + '.videoQualityStats(';
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `"${data.continueonfailure}"`;
        }
        query += ')';
        return query;

    }
}
