export class Dtmf {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        if(data.continueonfailure && data.continueonfailure !=null){
            return $commented + data.phone + '.line' + data.line + '.playDTMF("' + data.value + '"' + `,"${data.continueonfailure}")`;
        }
        return $commented + data.phone + '.line' + data.line + '.playDTMF("' + data.value + '")';
       
    }
}
