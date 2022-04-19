import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../model/user';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Constants } from '../helpers/constants';
import { SessionStorageUtil } from '../helpers/session-storage';
import { MsalService } from '@azure/msal-angular';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  redirectUrl: string;
  apiURL: string = environment.apiEndpoint;
  closeSession: EventEmitter<any>;
  loggedIn: EventEmitter<any>;

  constructor(private http: HttpClient, private router: Router, private msalService: MsalService) {
    this.loggedIn = new EventEmitter<any>();
    this.closeSession = new EventEmitter<any>();
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(Constants.CURRENT_USER)));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    if (!this.currentUserSubject.value) {
      return this.msalService.instance.getActiveAccount();
    }
    return this.currentUserSubject.value;
  }

  public setCurrentUserValue(user: any) {
    this.currentUserSubject.next(user);
  }



}