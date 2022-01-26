export class ValidateAudio {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        // return $commented + data.phone + '.checkaudio()' + '.' + data.continueonfailure;
        query += data.phone + '.checkaudio(';
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `"${data.continueonfailure}"`;
        }
        query += `)`;
        return query ;
    }
}
