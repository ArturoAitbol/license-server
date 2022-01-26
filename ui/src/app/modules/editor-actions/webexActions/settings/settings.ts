import { Action } from 'src/app/model/action';

export class WebexSettings {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        let query = '';
        let forceAction = (data.forceAction) ? " Force Action" : "";
        if (data.value === 'Simultaneous Ring') {
            if (data.calltype != null)
            query = `${data.phone}.settings(config=="${data.value}",state=="${data.resetType}",number=="${data.calltype}", Answer-confirmation==" ${data.resultIn}"`;

                // query = `${data.phone}.settings(config=="${data.value}",state=="${data.resetType}",number=="${data.calltype}")`;
                 else
                query = `${data.phone}.settings(config=="${data.value}",state=="${data.resetType}"`;
        } else {
            query = `${data.phone}.settings(config=="${data.value}",state=="${data.resetType}"`;
        }
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return $commented + query+forceAction;
    }
}
