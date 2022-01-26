export class MsTeamsMuteUnmute {
        public static generateQuery(data: any): string {
            const $commented = (data.comment) ? '//' : '';
            if(data.continueonfailure && data.continueonfailure !=null){
                return $commented + data.conversationName + '.' + data.phone  + '.' + 'muteParticipant("'+ data.value + '"'+ `,"${data.continueonfailure}")`;
            }
            return $commented + data.conversationName + '.' + data.phone + '.' + 'muteParticipant("'+ data.value + '"'+ ')';
            
        }
    
}