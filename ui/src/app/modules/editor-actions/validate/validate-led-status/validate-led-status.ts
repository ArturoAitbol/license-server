export class ValidateLedStatus {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let content = '';

        // tslint:disable-next-line:triple-equals
        if (data.ledstatus != '') {
            content += 'color="' + data.ledstatus + '"';
        }
        if (data.callstate) {
            content += ',state="' + data.callstate + '"';
        }
        if (data.value) {
            const _values = data.value.toString().split(',');
            content += ', mode="' + _values[0] + '"' + ', flash="' + _values[1] + '"';
        }
        if(data.continueonfailure && data.continueonfailure !=null){
            content += `,"${data.continueonfailure}"`;
        }
        return $commented + data.phone + '.line' + data.line + '.validateledstatus(' + content + ')';
    }
}
