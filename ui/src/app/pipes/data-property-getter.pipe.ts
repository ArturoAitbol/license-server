import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataPropertyGetter'
})
export class DataPropertyGetterPipe implements PipeTransform {

  transform(value: unknown, key: string, ...args: unknown[]): unknown {
    return value[key];
  }

}
