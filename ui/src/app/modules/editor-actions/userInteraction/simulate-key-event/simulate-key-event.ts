import { Action } from 'src/app/model/action';

export class SimulateKeyEvent {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        if (data.configurationValue) {
            if (data.calltype) {
                 query = `${data.phone}.simulateKeyEvent(type=="${data.eventType}",label=="${data.calltype}",displayName=="${data.configurationValue}"`
            }
             query = data.phone + '.simulateKeyEvent(type==\'' + data.eventType + '\'' + ',keyLabel==\'' + data.configurationValue + '\'' ;
        } else {
            query = data.phone + '.simulateKeyEvent(type==\'' + data.eventType + '\'' + ',keyName==\'' + data.value + '\'' ;
        }
        if(data.continueonfailure && data.continueonfailure !=null){
             query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return $commented + query;
    }
}
