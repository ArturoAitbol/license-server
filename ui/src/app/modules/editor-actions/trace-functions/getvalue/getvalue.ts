export class GetValue {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let query = $commented;
        const packetType = ( data.expression !='0'?  data.expression:'All');
        const sequenceType = (data.command != '0') ? data.command : 'All';
        let parentHeaderVariable = '';
        let serchOrderVariable='';
        if(data.parentHeader != null){
            parentHeaderVariable = `${data.parentHeader}`
        }
        if(data.searchOrder != null){
            serchOrderVariable = ` ${data.searchOrder}`
        }
        serchOrderVariable = data.searchOrder ? `', '${data.searchOrder}`: '';
        parentHeaderVariable = data.parentHeader ? `${data.parentHeader}", "`: '';
           query += data.resultIn + '=' + data.inTrace + '.packet_Number(' + "'"+ packetType  + serchOrderVariable + "'" + ').get_header_value("' + parentHeaderVariable + data.value + '","' + sequenceType + '"';
        if (data.continueonfailure != null) {
            query += `,"${data.continueonfailure}"`;
        }
        query += `)`;
        return query;
    }
}
