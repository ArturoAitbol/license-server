import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'na'
})
export class NAPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        let response: string = "N/A";
        if (value !== undefined && value !== null)
            response = value;
        return response;
    }
}