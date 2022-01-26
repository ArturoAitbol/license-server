import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trace'
})
export class TracePipe implements PipeTransform {

  transform(value: any, args?: any[]): any {
    let response: string = value;
    if (value.includes("_") && !value.toLowerCase().includes("failed"))
      response = "In Progress";
    return response;
  }

}
