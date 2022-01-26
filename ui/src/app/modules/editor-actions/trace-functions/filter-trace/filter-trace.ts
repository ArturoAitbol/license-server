export class FilterTrace {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        // tslint:disable-next-line:max-line-length
        return $commented + data.outTrace + '=' + data.inTrace + '.filterTrace("' + data.filter + '","' + data.maxWait + '","' + data.resultIn + '","' + data.continueonfailure + '")';
    }
}
