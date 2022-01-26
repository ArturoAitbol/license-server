export class CallPark {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        return $commented + data.phone + '.line' + data.line + '.callpark("' + data.parkCode + '")';
    }
}
