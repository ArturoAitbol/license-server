export class WebexValidatePhone {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        // return $commented + data.phone + '.validatePhone(' + 'state="' + data.value + '"' ;
        let query = '';
        query = data.phone + '.validatePhone(' + 'state="' + data.value + '"' ;
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return $commented + query;
    }
}