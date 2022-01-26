import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'rolePipe'
})
export class RolePipe implements PipeTransform {
    transform(items: any, args?: any): any {
        if (items.includes('ROLE_ADMIN')) {
            return 'ADMIN';
        }
        if (items.includes('ROLE_USER')) {
            return 'USER';
        }
    }
}
