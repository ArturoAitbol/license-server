import {ConversationName} from 'src/app/helpers/conversation-name';

export class ConferenceRemoveParticipant {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        query += (data.conversationName) ? data.conversationName : ConversationName.DEFAULT;
        query += `.${data.phone}.conferenceRemoveParticipant(`;
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `"${data.continueonfailure}"`;
        }
        query += `)`;
        return query;
    }
}
