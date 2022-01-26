import { Action } from 'src/app/model/action';

export class MSTeamsLogout {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        const query = `${data.phone}.logout("${data.continueonfailure}")`;
        return $commented + query;
    }
}