export class ConfigReset {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        query += `${data.phone}.configReset(${data.value}`;
        if (data.resetType) {
            query += `${data.phone}.configReset(${data.value},${data.resetType}`;
        } else if (!data.resetType) {
            query += `${data.phone}.configReset(${data.value}`;
        }
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += `)`;
        return query ;
    }
}
