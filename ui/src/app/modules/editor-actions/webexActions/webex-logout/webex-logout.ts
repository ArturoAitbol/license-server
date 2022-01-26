export class WebexLogout {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        query += data.phone + '.logout(';
        // return $commented + data.phone + '.logout(';
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}