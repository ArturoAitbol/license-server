import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'poly'
})
export class PolyPipe implements PipeTransform {

    // transform(value: any, ...args: any[]): any {
    //   return null;
    // }
    transform(value: string, args?: any): any {
        let response = value;
        if (value !== undefined && value !== null && value.toLowerCase() === 'polycom') {
            response = 'Poly';
        }
        return response;
    }
}
