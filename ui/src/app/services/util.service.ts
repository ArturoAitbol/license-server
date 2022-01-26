import { Injectable, EventEmitter } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UtilService {
  changedBarState: EventEmitter<any>;
  constructor() {
    this.changedBarState = new EventEmitter<any>();
  }

}
