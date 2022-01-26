export class StartTrace {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        if(data.continueonfailure && data.continueonfailure !=null){
            return $commented + data.phone + '.startTrace('+`"${data.continueonfailure}")`;
        }
        return $commented + data.phone + '.startTrace()';
    }
}
