export class GetMwiStatus {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        return `${$commented}${data.phone}.getMwiStatus(${data.resultIn})`;
    }
}
