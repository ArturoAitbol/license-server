import { Action } from 'src/app/model/action';
export class ValidateUiXml {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        let content = '';
        let query = '';
        if (data.dialingType) {
            query = `${$commented}${data.phone}.validateUi(validate=="${data.calltype}",type=="${data.dialingType}"`;
            if (data.configurationParameter && data.configurationParameter !== '') {
                query += `,huntGroup=="${data.configurationParameter}"`;
            }
            if (data.callerName && data.callerName !== '') {
                query += `,name=="${data.callerName}"`;
            }
            if (data.callerNumber && data.callerNumber !== '') {
                query += `,number=="${data.callerNumber}"`;
            }
            query += `)`;

        } else {
            query = `${$commented}${data.phone}`;
            if (data.resultIn)
                query += `.${data.resultIn}`;
            query += `.validateUi(validate=="${data.calltype}"`;
            switch (data.calltype) {
                case 'BLF - Call Park':
                case 'BLF - Presence': {
                    // tslint:disable-next-line: max-line-length
                    const findByType = (data.line) ? `line=="${data.line}"` : `displayName=="${data.value}"`;
                    // tslint:disable-next-line: max-line-length
                    // query += `,${findByType},"${data.continueonfailure}")`;
                    if (data.calltype === 'BLF - Presence') {
                        query += `,${findByType},"${data.continueonfailure}","${data.filter}")`;
                    } else {
                        query += `,${findByType},"${data.continueonfailure}")`;
                    }
                    break;
                }
                case 'Speed Dial': {
                    const findByType = (data.line) ? `line=="${data.line}"` : `displayName=="${data.value}"`;
                    if (data.calltype === 'Speed Dial') {
                        query += `,${findByType},"${data.continueonfailure}","${data.filter}")`;
                    } else {
                        query += `,${findByType},"${data.continueonfailure}")`;
                    } break;
                }
                case 'BLF - State': {
                    // tslint:disable-next-line: max-line-length
                    if (data.command) {
                        const _values = data.command.toString().split(',');
                        content += ', mode="' + _values[0] + '"' + ', flash="' + _values[1] + '"';
                    }
                    const findByType = (data.line) ? `line=="${data.line}"` : `displayName=="${data.value}"`;
                    query += `,${findByType},state=="${data.callstate}","color="${data.ledstatus}"${content},"${data.continueonfailure}")`;
                    break;
                }
                case 'Caller ID': {
                    if (data.callerName && data.callerName !== '') {
                        query += `,name=="${data.callerName}"`;
                    }
                    if (data.callerNumber && data.callerNumber !== '') {
                        query += `,number=="${data.callerNumber}"`;
                    }
                    query += `,"${data.continueonfailure}")`;
                    break;
                }
                case 'Message Waiting': query += `,"${data.continueonfailure}")`;
                    break;
                case 'Soft Key':
                    query += `,softkey=="${data.value}"`;
                    if (data.prefix && data.prefix !== '') {
                        query += `,position=="${data.prefix}"`;
                    }
                    query += `,"${data.continueonfailure}","${data.filter}")`;
                    break;
                case 'ACD Agent State': {
                    // tslint:disable-next-line: max-line-length
                    query += `,state=="${data.value}","${data.continueonfailure}")`;
                    break;
                }
                default:
                    if (data.calltype === 'Line Label') {
                        query += `,value=="${data.value}","${data.continueonfailure}","${data.filter}")`;
                    } else if (data.calltype === 'Missed Call') {
                        if (data.value != '') {
                            query += `,value=="${data.value}"`;
                        }
                        if (data.filter == 'true') {
                            query += `,"${data.continueonfailure}","${data.filter}")`;
                        } else {
                            query += `,"${data.continueonfailure}","${data.filter}")`;
                        }
                    } else {
                        query += `,"${data.continueonfailure}")`;
                    }
                    break;
            }
        }
        return query;
    }
}
