export class ValidateExpression {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        return $commented + 'validateExpression("' + data.expression + '","' + data.continueonfailure + '")';
    }
}
