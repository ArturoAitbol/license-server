import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
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
            return throwError(error);
        }))
    }
}