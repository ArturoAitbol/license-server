import { ConversationName } from '../../../../helpers/conversation-name';

export class AnswerCall {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented + ((data.conversationName) ? data.conversationName : ConversationName.DEFAULT);
        if (data.resourceGroup) {
            query += `.${data.resourceGroup}(${data.phone}).answer(`;
        } else {
            query += '.' + data.phone + '.answer(';
        }
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `"${data.continueonfailure}"`;
        }
        query += `)`;
        return query;
    }
}
