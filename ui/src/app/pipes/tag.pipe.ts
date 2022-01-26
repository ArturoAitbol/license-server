import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tagPipe'
})
export class TagPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let response: string = value.trim();
    if (!(response.length === 0) && value.indexOf('#') < 0) {
      response = '#' + response;
    }
    return response;
  }
}
