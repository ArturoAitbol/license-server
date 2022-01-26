export class MSTeamsLogin {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        const query = `${data.phone}.login(user="${data.user}","${data.continueonfailure}")`;
        return $commented + query;
    }
}