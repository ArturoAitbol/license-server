export class CallRestAPI {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let forceAction = (data.forceAction) ? " Force Action" : "";
        // tslint:disable-next-line:max-line-length
        return $commented + 'callRESTApi("' + data.url + '","' + data.httpmethod + '","' + data.messagebody + '","' + data.continueonfailure + '")' + forceAction;
    }
}
