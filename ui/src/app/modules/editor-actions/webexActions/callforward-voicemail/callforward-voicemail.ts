export class WebexVoiceMail {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        return `${$commented}${data.phone}.voiceMail().${data.continueonfailure}`;
    }
}