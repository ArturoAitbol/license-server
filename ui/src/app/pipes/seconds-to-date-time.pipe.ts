import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToDateTime'
})
export class SecondsToDateTimePipe implements PipeTransform {

  transform(seconds: number, ...args: unknown[]): Date {
    var newDate = new Date(0,0,0,0,0,0,0);
        newDate.setSeconds(seconds);
        return newDate;
  }
}
