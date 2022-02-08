import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../model/user';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  redirectUrl: string;
  apiURL: string = environment.apiEndpoint;
  closeSession: EventEmitter<any>;
  loggedIn: EventEmitter<any>;

  constructor(private http: HttpClient, private router: Router) {
    this.loggedIn = new EventEmitter<any>();
    this.closeSession = new EventEmitter<any>();
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public setCurrentUserValue(user: any) {
    this.currentUserSubject.next(user);
  }

  login(username: string, password: string) {
    // return this.http.post<any>(this.apiURL + "/login", { username, password })
    //   .pipe(map(data => {
    //     if (data.success && data.response.accessToken) {
    //       var user = data.response;
    //       user.user = username;
    //       localStorage.setItem('currentUser', JSON.stringify(user));
    //       this.currentUserSubject.next(user);
    //     }
    //     return data;
    //   }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

}