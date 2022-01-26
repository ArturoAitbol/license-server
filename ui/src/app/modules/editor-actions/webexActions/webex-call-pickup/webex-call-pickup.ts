import { ConversationName } from "src/app/helpers/conversation-name";
import { Action } from 'src/app/model/action';

export class WebexCallPickup {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        query += (data.conversationName) ? data.conversationName : ConversationName.DEFAULT;
        query += '.' + data.phone + '.callPickup(';
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}