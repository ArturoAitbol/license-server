import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BannerComponent } from "../generics/banner/banner.component";

@Injectable({
    providedIn: "root",
})
export class BannerService {
    private outlet?: BannerComponent;
    private active?: boolean;

    // Use the supplied BannerOutlet to display messages
    public init(val: BannerComponent) {
        this.outlet = val;
    }

    // Display a message with at least one action. Returned observable will
    // emit the index of the selected action once the user clicks a button.
    public open(title: string, message: string, onComponentDestruction: Observable<void>, type: string, displayClose?: boolean): void {
        if (!this.outlet) {
            console.error("Tried to open banner but no outlet was defined. ", title, message);
            return;
        }
        const showClose = displayClose ? displayClose : false;
        if (!this.active) {
            this.doOpen(title, message, onComponentDestruction, type, showClose);
            return
        } else {
            this.close();
            setTimeout(() => this.doOpen(title, message, onComponentDestruction, type, showClose), 500);
        }
    }

    private doOpen(title: string, message: string, onComponentDestruction: Observable<void>, type: string, displayClose?: boolean) {
        // Open the outlet and save the observable
        this.outlet?.open(title, message, onComponentDestruction, type, displayClose);
        this.active = true;
    }

    private close() {
        this.outlet.close();
    }
}
