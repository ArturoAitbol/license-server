import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'none'
})
export class NonePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let response: any = "none";
    if (value !== undefined && value !== null)
      response = value;
    return response;
  }
}