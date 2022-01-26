import { Action } from 'src/app/model/action';

export class ValidateMediaStats {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        let query = '';
        query += `${data.phone}.validateMediaStats(ResultKey =="${data.resultIn}",MediaType == "${data.calltype}",MediaParam == "${data.tagParam}",Operator == "${data.operator}",MediaValue == "${data.value}","${data.continueonfailure}")`;
        
        return $commented + query;
    }
}
