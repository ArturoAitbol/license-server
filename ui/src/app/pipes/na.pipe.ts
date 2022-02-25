import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'na'
})
export class NaPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return (value === null || value === undefined) ? 'N/A' : value;
  }

}
