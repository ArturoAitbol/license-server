export class SetTrasferType {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented + data.phone + '.setTransferType("' + data.value;
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `","${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
