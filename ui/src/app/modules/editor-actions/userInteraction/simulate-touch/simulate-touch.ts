export class SimulateTouch {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        // tslint:disable-next-line: max-line-length
        let query = $commented + data.phone + '.simulatetouch(type=\'' + data.touchType + '\',coordinates=\'' + data.xCoordinat + ',' + data.yCoordinat;
        if (data.continueonfailure && data.continueonfailure != null) {
            query += `',"${data.continueonfailure}"`;
        }
        query += ')';
        if (data.duration) {
            query += '.duration(' + data.duration + ')';
        }
        if (data.easing) {
            query += '.easing(' + data.easing + ')';
        }
        return query;
    }
}
