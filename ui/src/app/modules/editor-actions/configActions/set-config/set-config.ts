export class SetConfig {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let forceAction = (data.forceAction) ? " Force Action" : "";
        return $commented + data.phone + '.setConfig("' + data.configurationParameter + '","' + data.configurationValue + '","' + data.continueonfailure + '")' + forceAction;
    }
}
