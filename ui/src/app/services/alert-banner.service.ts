import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AlertBannerComponent } from "../generics/alert-banner/alert-banner.component";

@Injectable({
    providedIn: "root",
})
export class BannerService {
    private outlet?: AlertBannerComponent;
    private active?: boolean;

    // Use the supplied BannerOutlet to display messages
    public init(val: AlertBannerComponent) {
        this.outlet = val;
    }

    // Display a message with at least one action. Returned observable will
    // emit the index of the selected action once the user clicks a button.
    public open(title: string, message: string, onComponentDestruction: Observable<void>): void{
        if (!this.outlet) {
            console.log("Tried to open banner but no outlet was defined. ", title, message);
            return;
        }
        if (!this.active) {
           this.doOpen(title, message, onComponentDestruction);
            return
        } else {
            this.close();
            setTimeout(() => this.doOpen(title, message, onComponentDestruction), 500);
        }
    }

    private doOpen(title: string, message: string, onComponentDestruction: Observable<void>) {
        // Open the outlet and save the observable
        this.outlet?.open(title, message, onComponentDestruction);
        this.active = true;
    }

    private close() {
        this.outlet.close();
    }
}
