import { ConversationName } from 'src/app/helpers/conversation-name';

export class HoldAndAnswer {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = '';
        query += (data.conversationName) ? data.conversationName : ConversationName.DEFAULT;
        query += '.' + data.phone + '.holdAndAnswer(';
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `"${data.continueonfailure}"`;
        }
        query += ')';
        return $commented + query;
    }
}
