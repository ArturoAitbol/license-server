export class DialDigit {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        if(data.continueonfailure && data.continueonfailure !=null){
            return $commented + data.phone + '.line' + data.line + '.dial("' + data.value + '"'+ `,"${data.continueonfailure}")`;
        }
        return $commented + data.phone + '.line' + data.line + '.dial("' + data.value + '")';
    }
}
