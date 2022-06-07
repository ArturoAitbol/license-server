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
                if (err.status === 401) {
                    location.reload();
                }
                if (err.status === 400) {
                    // location.reload(true);
                }
                if (err.status === 500) {
                    // this.toastr.error("Internal Server Error: " + err.error.exception, "Error");
                    // location.reload(true);
                }
                const error = err.error || err.statusText;
                this.snackBarService.openSnackBar(error.error, 'Error performing action!');
                return throwError(error);
            }))
    }
}