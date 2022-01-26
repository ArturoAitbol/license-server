export class WebexLogin {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        if (data.username != '') {
            query += `${data.phone}.login(email="${data.value}", username="${data.userId}"`;
        } else {
            query += `${data.phone}.login(email="${data.value}"`;
        }
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
