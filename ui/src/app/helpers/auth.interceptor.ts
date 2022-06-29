import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MsalService } from "@azure/msal-angular";
import { from, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

    constructor(private msalService: MsalService){}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.msalService.instance.acquireTokenSilent({scopes:['User.Read']})).pipe(
            switchMap(  resp =>{
                req = req.clone({
                    setHeaders: {"Authorization":resp.tokenType + " " + resp.idToken}
                })  
                return next.handle(req);
            })
        );
    }

}