import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phoneStatus'
})
export class PhoneStatusPipe implements PipeTransform {

    transform(value: string, ...args: any[]): any {
        if (value) {
            switch (value.toUpperCase().trim()) {
                case 'COMPLETED':
                case 'SUCCESS':
                    return 'Success';
                case 'REBOOTING':
                    return 'Rebooting';
                case 'INPROGRESS':
                    return 'In Progress';
                case 'INITIATED':
                    return 'Initiated';
                case 'FAILED':
                    return 'Failed';
                default: return '';
            }
        } else {
            return '';
        }
    }

}
