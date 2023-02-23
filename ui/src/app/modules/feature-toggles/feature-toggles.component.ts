import { Component, OnInit } from '@angular/core';
import { FeatureToggle } from "../../model/feature-toggle.model";
import { FeatureToggleService } from "../../services/feature-toggle.service";
import { MatDialog } from "@angular/material/dialog";
import { AddFeatureToggleModalComponent } from "./add-feature-toggle-modal/add-feature-toggle-modal.component";
import { FeatureToggleMgmtService } from "../../services/feature-toggle-mgmt.service";

@Component({
  selector: 'app-feature-toggles',
  templateUrl: './feature-toggles.component.html',
  styleUrls: ['./feature-toggles.component.css']
})
export class FeatureTogglesComponent implements OnInit {

  featureToggles: FeatureToggle[];
  isDataLoading = true;
  constructor(private featureToggleService: FeatureToggleMgmtService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.fetchFeatureToggles()
  }

  addFeatureToggle() {
    this.dialog.open(AddFeatureToggleModalComponent, {
      width: '400px',
      disableClose: true
    }).afterClosed().subscribe(() => {
      this.reloadFeatureToggles();
    });
  }

  reloadFeatureToggles() {
    this.fetchFeatureToggles();
  }

  private fetchFeatureToggles() {
    this.featureToggleService.getFeatureToggles().subscribe((res: { featureToggles: FeatureToggle[] }) => {
      this.featureToggles = res.featureToggles;
      this.isDataLoading = false;
    })
  }

}
