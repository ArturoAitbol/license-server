export class RebootDevice {
    public static generateQuery(data: any): string {
        const $commented = (data.comment) ? '//' : '';
        if (data.action == 'reboot_device') {
            let actionType = '.rebootDevice(';
            if (data.continueonfailure && data.continueonfailure != null) {
                actionType += `"${data.continueonfailure}"`
            }
            actionType += ')';
            return $commented + data.phone + actionType;
        } else if (data.action == 'restart_device') {
            let actionType = '.restartDevice(';
            if (data.continueonfailure && data.continueonfailure != null) {
                actionType += `"${data.continueonfailure}"`
            }
            actionType += ')';

            return $commented + data.phone + actionType;
        } else if (data.action == 'reset_device') {
            let actionType = '.resetDevice(';
            if (data.continueonfailure && data.continueonfailure != null) {
                actionType += `"${data.continueonfailure}"`
            }
            actionType += ')';

            return $commented + data.phone + actionType;
        }

    }
}
