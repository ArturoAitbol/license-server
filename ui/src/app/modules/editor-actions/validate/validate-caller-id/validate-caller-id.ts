import { ConversationName } from 'src/app/helpers/conversation-name';

export class ValidateCallerId {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        const convId = (data.conversationName) ? data.conversationName : ConversationName.DEFAULT;
        let query = '';
        query = $commented + convId + '.' + data.phone + '.validateCallerId(type=\'' + data.value + '\',operator=\'' + data.operator + '\'';
        if (data.value.includes('Caller Name')) {
            query += ',callerName=\'' + data.callerName + '\'';
        }
        if (data.value.includes('Caller Number')) {
            query += ',callerNumber=\'' + data.callerNumber + '\'';
        }
        if(data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
