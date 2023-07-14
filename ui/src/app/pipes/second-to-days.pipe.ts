import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondToDays'
})
export class SecondToDaysPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): number {
    if (value) 
      return (value / 86400) - (value / 86400) % 1;
    return 0;
  }
}
