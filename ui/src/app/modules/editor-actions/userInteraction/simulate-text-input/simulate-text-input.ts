export class SimulateTextInput {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        // tslint:disable-next-line:max-line-length
        return $commented + data.phone + '.simulateTextInput(value=\'' + data.value + '\'' + ',replaceText=\'' + data.replaceText + '\'' + ')';
    }
}
