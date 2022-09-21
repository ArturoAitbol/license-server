import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notifications: any = [];
  private _notification$ = new BehaviorSubject<any>(null);
  constructor() { }

  public sendNotification(notifications: any) {
    this._notification$.next(notifications);
  }

  public getNotificationsDetails(): Observable<any> {
    return this._notification$.asObservable();
  }

}
