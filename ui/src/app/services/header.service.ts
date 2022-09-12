import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private _changeServiceNameEvent$ = new Subject<{ hideToolbar: boolean, tabName: string, transparentToolbar: boolean }>();
  constructor() { }

  public onChangeService(value: { hideToolbar: boolean, tabName: string, transparentToolbar: boolean }): void {
    this._changeServiceNameEvent$.next(value);
  }

  public getOnChangeServiceEvent(): Observable<{ hideToolbar: boolean, tabName: string, transparentToolbar: boolean }> {
    return this._changeServiceNameEvent$.asObservable();
  }
}
