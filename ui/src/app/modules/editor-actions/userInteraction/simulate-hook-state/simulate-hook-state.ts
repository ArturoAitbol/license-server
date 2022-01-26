export class SimulateHookState {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented + data.phone + '.simulatehookstate("' + data.hookType + '"';
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
