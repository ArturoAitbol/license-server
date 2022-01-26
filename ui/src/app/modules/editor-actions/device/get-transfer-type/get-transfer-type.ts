export class GetTransferType {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented + data.phone + '.getTransferType("' + data.resultIn;
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `","${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
