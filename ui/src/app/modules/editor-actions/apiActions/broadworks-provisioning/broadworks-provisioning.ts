export class BroadworksProvisioning {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        let paramsAsString: string = '';
        data.parameters.forEach((parameter: any) => {
            if (parameter.parameter) {
                parameter.value = (parameter.value) ? parameter.value : '';
                if (parameter.value == '')
                    paramsAsString += `{${parameter.parameter}},`;
                else
                    paramsAsString += `{${parameter.parameter},${parameter.value}},`;
            }
        });
        let forceAction = (data.forceAction) ? " Force Action" : "";
        paramsAsString = paramsAsString.slice(0, -1);
        // tslint:disable-next-line:triple-equals
        if (data.phone != 'none') {
            // tslint:disable-next-line:max-line-length
            return `${$commented} +${data.server}.${data.action}(${data.apiName}, ${data.phone}.${data.line}, [${paramsAsString}],"${data.continueonfailure}")` + forceAction;
        } else {
            // tslint:disable-next-line:max-line-length
            return `${$commented} ${data.server}.${data.action}(${data.apiName}, ${data.phone}, [${paramsAsString}],"${data.continueonfailure}")` + forceAction;
        }
    }
}
