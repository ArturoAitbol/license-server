import { ConversationName } from 'src/app/helpers/conversation-name';

export class ValidateStates {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let conversationId = '';
        if (data.conversationName && !data.line) {
            conversationId = (data.conversationName ? data.conversationName : ConversationName.DEFAULT) + '.';
        } else if (!data.conversationName && data.line) {
            conversationId = '';
        }
        let query = $commented + conversationId;
        let content = '';
        if (data.linestate != '') {
            content += 'linestate=="' + data.linestate + '"';
        }
        if (data.callstate != '') {
            content += ' && callstate=="' + data.callstate + '"';
        }
        if (data.calltype != '') {
            content += ' && calltype=="' + data.calltype + '"';
        }
        let lines = '';
        if (data.line != null && data.line != '') {
            lines = '.line' + data.line;
        }
        if (data.continueonfailure && data.continueonfailure != null) {
            content += `,"${data.continueonfailure}"`;
        }
        const resource = (data.phone) ? data.phone : data.resourceGroup;
        query += resource + lines + '.validate(' + content + '';
        query += ')';
        return query;
    }
}
