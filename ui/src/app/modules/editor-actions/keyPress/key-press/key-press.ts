export class KeyPress {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        if(data.continueonfailure && data.continueonfailure !=null){
            return $commented + data.phone + '.keypress("' + data.value + '"'+ `,"${data.continueonfailure}")`;
        }
        return $commented + data.phone + '.keypress("' + data.value + '")';
    }
}
