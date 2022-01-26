export class MsTeamsCallEscalation {
    public static generateQuery(data: any): string {
        // CONSTANTS
        const ADD_PARTICIPANTS: string = 'Add Participants(s)';
        const REMOVE_PARTICIPANTS: string = 'Remove Participants(s)';

        const $commented = (data.comment) ? '//' : '';
        let participants: any;
        // check point for participants
        if (data.parameters) {
            participants = [...data.parameters.map((e: any) => e.value)];
        }
        let participantsResponse: string = '';
        if (data.value === ADD_PARTICIPANTS) {
            participantsResponse = '[' + participants + ']';
        } else if (data.value === REMOVE_PARTICIPANTS) {
            participantsResponse = participants;
        }
        const query = `${data.conversationName}.callEscallation("${data.phone}", ${data.value}-${participantsResponse}, "${data.continueonfailure}")`;
        return $commented + query;
    }
}