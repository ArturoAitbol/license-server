import { Component } from '@angular/core';
import { GROW_DOWN_ANIMATION } from "./animations";
import { Observable, Subject } from "rxjs";
import { BannerService } from "../../services/alert-banner.service";

@Component({
  selector: "app-alert-banner-outlet",
  templateUrl: "./alert-banner.component.html",
  styleUrls: [ "./alert-banner.component.css" ],
  animations: [ GROW_DOWN_ANIMATION ],
})
export class AlertBannerComponent {
  // Text message to display
  message?: string;

  // List of button labels to show
  actions?: string[];

  // Emits one value when the user picks an action
  private clicks?: Subject<number>;
  // True if the panel is opened
  public get opened(): boolean { return !!this.clicks; }

  constructor(bannerService: BannerService) {
    bannerService.init(this);
  }

  // Open this banner with a message and at least one action
  open(message: string, actions: string[]): Observable<number> {
    if (this.clicks) {
      console.error("Tried to open banner when outlet was already opened.");
    }

    if (actions.length === 0) {
      console.error("Tried to open banner without any action buttons.");
    }

    this.message = message;
    this.actions = actions;
    this.clicks = new Subject();
    return this.clicks.asObservable();
  }

  actionClicked(idx: number): void {
    if (!this.clicks) {
      console.error("Developer Error: banner action clicked but observable available!");
      return;
    }

    // Click subject can only ever emit one value
    this.clicks.next(idx);
    this.clicks.complete();
    this.clicks.unsubscribe();
    this.clicks = undefined;
  }
}
