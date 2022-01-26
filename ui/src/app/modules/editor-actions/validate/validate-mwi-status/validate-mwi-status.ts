export class ValidateMwiStatus {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        let content = '';

        if (data.mwistatus != '') {
            content += 'mwistatus="' + data.mwistatus + '"';
        }
        // return $commented + data.phone + '.line' + data.line + '.validatemwistatus(' + content + ')';
        query += data.phone + '.line' + data.line + '.validatemwistatus(' + content ;
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += `)`;
        return query ;
    }
}
