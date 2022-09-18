import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private _changeServiceNameEvent$ = new BehaviorSubject<{ hideToolbar: boolean, tabName: string, transparentToolbar: boolean }>({ hideToolbar: false, tabName: 'tekToken Usage', transparentToolbar: false });
  constructor() { }

  public onChangeService(value: { hideToolbar: boolean, tabName: string, transparentToolbar: boolean }): void {
    this._changeServiceNameEvent$.next(value);
  }

  public getOnChangeServiceEvent(): Observable<{ hideToolbar: boolean, tabName: string, transparentToolbar: boolean }> {
    return this._changeServiceNameEvent$.asObservable();
  }
}
