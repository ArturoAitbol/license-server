import {ConversationName} from 'src/app/helpers/conversation-name';

export class EndCall {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        let forceAction = (data.forceAction) ? " Force Action" : "";
        query += (data.conversationName) ? data.conversationName : ConversationName.DEFAULT;
        query += '.' + data.phone + '.disconnect(';
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `"${data.continueonfailure}"`;
        }
        query += `)`;
        return query + forceAction;
    }
}
