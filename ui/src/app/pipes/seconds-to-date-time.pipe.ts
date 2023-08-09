import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToTime'
})
export class SecondsToDateTimePipe implements PipeTransform {

  transform(totalSeconds: number, ...args: unknown[]): String {
    const totalMinutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return hours.toString().padStart(2, '0')+':'+minutes.toString().padStart(2, '0')+':'+seconds.toString().padStart(2, '0');
  }
}
