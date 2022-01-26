import { Action } from 'src/app/model/action';

export class GetKey {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        let query = `${data.phone}.findKey(label=="${data.calltype}",displayName=="${data.configurationValue}",variableName=="${data.value}"`;
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += `)`;
        return $commented + query
    }
}
