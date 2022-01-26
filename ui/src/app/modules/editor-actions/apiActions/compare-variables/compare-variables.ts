export class CompareVariables {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        return $commented + 'CompareVariables("' + data.expression + '","' + data.continueonfailure + '")';
    }
}
