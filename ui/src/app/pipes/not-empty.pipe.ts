import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notEmpty'
})
export class NotEmptyPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let response: any = 0;
    if (value != undefined)
      response = value;
    return response;
  }
}