import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FilterService {

    setFilterValue: EventEmitter<any>;
    constructor() {
        this.setFilterValue = new EventEmitter<any>();
    }

}
