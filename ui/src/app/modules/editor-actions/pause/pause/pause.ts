export class Pause {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let forceAction = (data.forceAction) ? " Force Action" : "";
        if(data.continueonfailure && data.continueonfailure !=null){
            return $commented + 'pause("' + data.value +'"'+ ',' +'"'+ data.continueonfailure + '")' + forceAction ;
        }
        return $commented + 'pause("' + data.value + '")' + forceAction ;
      
    }
}
