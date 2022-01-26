import { Action } from 'src/app/model/action';

export class ValidateMic {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        let query = '';
        if (data.conversationName !== '') {
            query += data.conversationName + '.';
        }
        query += `${data.phone}.validateMic(micState=='${data.callstate}'`;
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return $commented + query;
    }
}
