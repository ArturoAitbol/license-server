import { Injectable } from "@angular/core";
import { Observable, Subject, NEVER } from "rxjs";
import { AlertBannerComponent } from "../generics/alert-banner/alert-banner.component";

@Injectable({
    providedIn: "root",
})
export class BannerService {
    private outlet?: AlertBannerComponent;
    private active?: Observable<number>;
    private pending: {message: string, actions: string[], ret: Subject<number>}[] = [];

    // Use the supplied BannerOutlet to display messages
    public init(val: AlertBannerComponent) {
        this.outlet = val;
    }

    // Display a message with at least one action. Returned observable will
    // emit the index of the selected action once the user clicks a button.
    public open(message: string, actions: string[]): Observable<number> {
        if (!this.outlet) {
            console.log("Tried to open banner but no outlet was defined.", message, actions);
            return NEVER;
        }

        if (!this.active) {
            return this.doOpen(message, actions);
        } else {
            const ret: Subject<number> = new Subject();
            this.pending.push({message, actions, ret});
            return ret.asObservable();
        }
    }

    private doOpen(message: string, actions: string[]): Observable<number> {
        // Open the outlet and save the observable
        this.active = this.outlet?.open(message, actions);

        // When the user selects an action, the banner will close
        this.active.subscribe(next => {
            // That means we stop watching the old banner, and...
            this.active = undefined;

            // If there was another queued, we show it
            const args = this.pending.shift();
            if (args) {
                setTimeout(() => this.doOpen(args.message, args.actions).subscribe(args.ret), 500);
            }
        });
        return this.active;
    }
}
