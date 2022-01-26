import { Action } from 'src/app/model/action';

export class ValidatePresence {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        let query = '';
        query =`${data.phone}.validatePresence(validate=="${data.value}"`
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += ')'
        return $commented + query;
    }
}
