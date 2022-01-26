import { ConversationName } from "src/app/helpers/conversation-name";

export class AddParticipantToConversation {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented + ((data.conversationName) ? data.conversationName : ConversationName.DEFAULT);
        let participant = (data.phone) ? data.phone : data.resourceGroup;
        if (data.value == "true")
            query += '.' +participant + '.addResourceToConversation(';
        else
            query += '.' +participant + '.line' + data.line + '.addResourceToConversation(';
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}