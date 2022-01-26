export class ExecuteCommand {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let forceAction = (data.forceAction) ? " Force Action" : "";
        if(data.continueonfailure && data.continueonfailure !=null){
            return $commented + 'executeCommand("' + data.command + '","' + data.resultIn + '","' +`${data.continueonfailure}`+ '")' + forceAction ;
        }
        return $commented + 'executeCommand("' + data.command + '","' + data.resultIn + '")' + forceAction;
    }
}
