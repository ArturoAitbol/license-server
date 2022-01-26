export class SilentBarge {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        return $commented + data.phone + '.line' + data.line + '.silentBarge()';
    }
}
