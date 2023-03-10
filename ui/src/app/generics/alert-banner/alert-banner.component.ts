import { Component } from '@angular/core';
import { GROW_DOWN_ANIMATION } from "./animations";
import { Observable, Subscription } from "rxjs";
import { BannerService } from "../../services/alert-banner.service";

@Component({
  selector: "app-alert-banner-outlet",
  templateUrl: "./alert-banner.component.html",
  styleUrls: [ "./alert-banner.component.css" ],
  animations: [ GROW_DOWN_ANIMATION ],
})
export class AlertBannerComponent {
  // Text title to display
  title?: string;

  // Text message to display
  message?: string;

  // List of button labels to show
  onComponentDestructionSubscription: Subscription;

  opened = false;

  constructor(bannerService: BannerService) {
    bannerService.init(this);
  }

  // Open this banner with a message and at least one action
  open(title: string, message: string, onComponentDestruction: Observable<void>) {
    if (this.opened) {
      console.error("Tried to open banner when outlet was already opened.");
    }

    this.title = title;
    this.message = message;
    this.opened = true;
    this.onComponentDestructionSubscription = onComponentDestruction.subscribe(() => this.opened = false);
  }

  close() {
    this.opened = false;
    this.onComponentDestructionSubscription.unsubscribe();
  }
}
