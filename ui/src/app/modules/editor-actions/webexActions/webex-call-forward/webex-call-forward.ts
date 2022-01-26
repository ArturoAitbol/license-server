    export class WebexCallForward {
        public static generateQuery(data: any): string {
            const $commented = (data.comment) ? '//' : '';
            let query = '';
            let forceAction = (data.forceAction) ? " Force Action" : "";

            if (data.resetType == 'Enable') {
                query = `${$commented}${data.phone}.callForward(diversionReason="${data.value}",setNumber="${data.calltype}",state="${data.resetType}"`;
            }
            query = `${$commented}${data.phone}.callForward(diversionReason="${data.value}",state="${data.resetType}"` ;
            if(data.continueonfailure && data.continueonfailure !=null){
                query += `,"${data.continueonfailure}"`;
            }
            query += ')';
            return query + forceAction;
        }
    }
