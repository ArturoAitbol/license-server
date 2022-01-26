export class ExportConfig {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = '';
        if (data.url) {
            query = $commented + data.phone + '.exportConfig(configType=\'' + data.configType + '\'' + ',url=\'' + data.url + '\'' ;
        } else if (!data.url) {
            query = $commented + data.phone + '.exportConfig(configType=\'' + data.configType + '\'';
        }
        if(data.continueonfailure && data.continueonfailure !=null){
            query += `,"${data.continueonfailure}"`;
        }
        query += `)`;
        return  query ;
    }
}
