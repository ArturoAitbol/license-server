import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'inProgress'
})
export class InProgressPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (value && value.toString().toLowerCase() == 'inprogress') {
            return 'In Progress';
        } return value;
    }
}
