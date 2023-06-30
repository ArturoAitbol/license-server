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
                let errorText;
                if (!err)
                    errorText = "Unexpected Error"
                else {
                    const error = err.error ? err.error : err.statusText;
                    errorText = error.error
                }
                this.snackBarService.openSnackBar(errorText, 'Error performing action!');
                if (err.status === 401)
                    this.autoLogoutService.logout();
                return throwError(err);
            }))
    }
}