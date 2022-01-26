import { Pipe, PipeTransform } from '@angular/core';
import { FilterService } from '../services/filter.service';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    constructor(private test: FilterService) {
    }

    transform(items: any, filter: any): any {
        items.forEach((element: any) => {
            element.filtered = false;
            // check if whether element object has vendor key or not
            if (element.hasOwnProperty('vendor')) {
                // set polycom as poly while filtering the data
                if (element.vendor != null && element.vendor.toString().toLowerCase() == 'polycom') {
                element.vendor = 'Poly';
                }
            }
        });
        let result: any;
        if (filter && Array.isArray(items)) {
            const filterKeys = Object.keys(filter);
            result = items.filter(item => {
                return filterKeys.some((keyName) => {
                    return new RegExp(filter[keyName], 'gi').test(item[keyName]) || filter[keyName] === '';
                });
            });
            result.forEach(element => {
                element.filtered = true;
            });
            this.test.setFilterValue.emit({ count: result.length, data: result });
            return result;
        } else {
            result = items;
            result.forEach(element => {
                element.filtered = true;
            });
            this.test.setFilterValue.emit({ count: result.length });
            return result;
        }
    }
}
