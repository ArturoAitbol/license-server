import { Action } from 'src/app/model/action';

export class Uixml {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        let query = `${$commented}${data.phone}.uiXml(resultKey="${data.resultIn}"`;
        if (data.continueonfailure != null) {
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
