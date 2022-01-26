export class ValidateWebexLogin {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';       
        // return $commented + data.phone + '.validateLogin("' + data.callstate + '"';
        let query = '';
        query += data.phone + '.validateLogin("' + data.callstate + '"';
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return $commented + query;
    }
}