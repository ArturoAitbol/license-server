import { Component } from '@angular/core';
import { GROW_DOWN_ANIMATION } from "./animations";
import { Observable, Subscription } from "rxjs";
import { BannerService } from "../../services/banner.service";
import { Constants } from 'src/app/helpers/constants';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: "app-banner-outlet",
  templateUrl: "./banner.component.html",
  styleUrls: ["./banner.component.css"],
  animations: [GROW_DOWN_ANIMATION],
})
export class BannerComponent {
  // Text title to display
  title?: string;
  // Text message to display
  message?: string;
  // List of button labels to show
  onComponentDestructionSubscription: Subscription;
  opened = false;
  type: string;
  displayClose = false;
  hideForever = false;

  constructor(bannerService: BannerService,
    private msalService: MsalService) {
    bannerService.init(this);
  }

  // Open this banner with a message and at least one action
  open(title: string, message: string, onComponentDestruction: Observable<void>, type: string, displayClose?: boolean) {
    if (this.opened) {
      console.error("Tried to open banner when outlet was already opened.");
    }
    this.displayClose = displayClose ? displayClose : false;
    this.title = title;
    this.message = message;
    this.opened = true;
    this.type = type;
    this.onComponentDestructionSubscription = onComponentDestruction.subscribe(() => this.close());
  }

  close() {
    this.opened = false;
    this.onComponentDestructionSubscription.unsubscribe();
  }

  regularClose() {
    if (this.hideForever)
      localStorage.setItem("hiddenBanner", "true");
    else
      localStorage.setItem("closedBanner", "true");
    this.close();
  }
}
