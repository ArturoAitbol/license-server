import { ConversationName } from 'src/app/helpers/conversation-name';

export class BlindTransfer {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let toLine = '';
        let to = '';
        let query = $commented;
        if (data.value) {
            to = data.value;
            toLine = '';
        } else {
            to = data.to;
            toLine = '.line' + data.toLine;
        }
        query += (data.conversationName) ? data.conversationName : ConversationName.DEFAULT;
        query += '.' + data.from + '.line' + data.fromLine + '.blindTransfer(' + to + toLine + ',' + data.callVia ;
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
        return query;
    }
}
