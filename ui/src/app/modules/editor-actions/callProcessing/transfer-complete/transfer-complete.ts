import {ConversationName} from 'src/app/helpers/conversation-name';

export class TransferComplete {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        const intermediateConversation = (data.intermediateConvName) ? data.intermediateConvName : ConversationName.INTERMEDIATE;
        query += (data.conversationName) ? data.conversationName : ConversationName.DEFAULT;
        // if (data.line != 'all') {
        //     query += '.' + data.phone + '.transferComplete()';
        // } else {
        query += '.' + data.phone + '.transferComplete(' + intermediateConversation ;
        // }
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += `)`;
        return query;
    }
}
