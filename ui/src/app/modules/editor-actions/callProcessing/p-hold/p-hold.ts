export class PHold {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        if(data.continueonfailure && data.continueonfailure !=null){
            return $commented + data.phone + '.line' + data.line + '.phold('+ data.continueonfailure + ')';
        }
        return $commented + data.phone + '.line' + data.line + '.phold(';
    }
}
