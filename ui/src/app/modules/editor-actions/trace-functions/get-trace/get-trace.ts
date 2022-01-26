export class GetTrace {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        query +=  data.outTrace + '=' + data.phone + '.getTrace('
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `"${data.continueonfailure}"`;
        }
        query += `)`;
        return query ;
        // return $commented + data.outTrace + '=' + data.phone + '.getTrace()' + '.' + data.continueonfailure;
    }
}
