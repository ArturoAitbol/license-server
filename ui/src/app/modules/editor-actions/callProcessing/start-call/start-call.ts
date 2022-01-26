import { ConversationName } from '../../../../helpers/conversation-name';

export class StartCall {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        let fromLine = '';
        let toLine = '';
        let to = '';
        if (data.fromLine) {
            fromLine = '.line' + data.fromLine;
        }
        query += (data.conversationName) ? data.conversationName : ConversationName.DEFAULT;
        const callType = (data.operator == 'video') ? '.videoCall(' : '.call(';
        if (data.value) {
            to = data.value;
            toLine = '';
        } else {
            to = data.to;
            toLine = '.line' + data.toLine;
        }
        if (data.toLine) {
            query += ' = ' + data.from + fromLine + callType + to + toLine + ',' + data.callVia ;
        } else {
            query += ' = ' + data.from + fromLine + callType + to + ',' + data.callVia ;
        }
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += `)`;
        if (data.dialingType) {
            query += `.dialingType("${data.dialingType}")`;
        }
        if (data.prefix != null) {
            query += `.prefix("${data.prefix}")`;
        }

        if (data.tailing != null) {
            query += `.tailing("${data.tailing}")`;
        }

        let forceAction = (data.forceAction) ? " Force Action" : "";
        query += forceAction;
        return query;
    }
}
