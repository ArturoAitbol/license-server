import { Action } from 'src/app/model/action';

export class ValidateBlf {
    public static generateQuery(data: Action): string {
        let content = '';
        const $commented = (data.comment) ? '//' : '';
        // tslint:disable-next-line: max-line-length
       const findByType = (!data.userId) ? `line=="${data.expression}"` : `displayName=="${data.userId}"`;
        if (data.ledstatus != '') {
            content += 'color="' + data.ledstatus + '"';
        }
        if (data.value) {
            const _values = data.value.toString().split(',');
            content += ', mode="' + _values[0] + '"' + ', flash="' + _values[1] + '"';
        }
        // tslint:disable-next-line: max-line-length
        return $commented + data.phone +`.validateBlf(${findByType},${content},${data.continueonfailure})`;

    }
}
