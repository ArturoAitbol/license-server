export class GetConfig {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        // tslint:disable-next-line:max-line-length
        return $commented + data.phone + '.getConfig("' + data.configurationParameter + '","' + data.maxWait + '","' + data.continueonfailure + '","' + data.resultIn + '")';
    }
}
