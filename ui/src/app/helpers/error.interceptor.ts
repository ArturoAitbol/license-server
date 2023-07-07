import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SnackBarService } from '../services/snack-bar.service';
import { AutoLogoutService } from "../services/auto-logout.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private snackBarService: SnackBarService,
        private autoLogoutService: AutoLogoutService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap(event => this.autoLogoutService.restartTimer()),
            catchError(err => {
                let error;
                if (!err)
                    error = { error: "Unexpected Error" };
                else
                    error = err.error ? err.error : err.statusText;
                this.snackBarService.openSnackBar(error.error, 'Error performing action!');
                if (err.status === 401)
                    this.autoLogoutService.logout();
                return throwError(error);
            }))
    }
}