import { Pipe, PipeTransform } from '@angular/core';
import { Constants } from '../helpers/constants';

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return (value === Constants.SUBACCOUNT_STAKEHOLDER ? 'Stakeholder' : value === Constants.SUBACCOUNT_ADMIN ? 'Admin': value);
  }

}
