export class Idle {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        if (data.line != 'all') {
            return $commented + data.phone + '.line' + data.line + '.idle()';
        } else {
            return $commented + data.phone + '.' + data.line + '.idle()';
        }
    }
}
