export class ValidatePlayAudio {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query =$commented;

        query +=`${data.phone}.playAudio(url='${data.value}'`;
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += ')';
        return query;
    }
}
