export class KeyRelease {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        return $commented + data.phone + '.keyrelease("' + data.value + '")';
    }
}
