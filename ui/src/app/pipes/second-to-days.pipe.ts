import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondToDays'
})
export class SecondToDaysPipe implements PipeTransform {

  transform(seconds: number, ...args: unknown[]): number {
    if (seconds) 
      return (seconds / 86400) - (seconds / 86400) % 1;
    return 0;
  }
}
