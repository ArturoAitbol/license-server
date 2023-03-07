import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FeatureToggle } from "../../../model/feature-toggle.model";
import { FeatureToggleService } from "../../../services/feature-toggle.service";
import { SnackBarService } from "../../../services/snack-bar.service";
import { MatDialog } from "@angular/material/dialog";
import { AddFeatureToggleExceptionModalComponent } from "../add-feature-toggle-exception-modal/add-feature-toggle-exception-modal.component";
import { FeatureToggleMgmtService } from "../../../services/feature-toggle-mgmt.service";

@Component({
  selector: 'app-feature-toggle-card',
  templateUrl: './feature-toggle-card.component.html',
  styleUrls: ['./feature-toggle-card.component.css']
})
export class FeatureToggleCardComponent {

  @Input()
  featureToggle: FeatureToggle;

  @Output()
  addFeatureToggleException: EventEmitter<any> = new EventEmitter();
  @Output()
  reloadFeatureToggles: EventEmitter<any> = new EventEmitter();
  constructor(private featureToggleService: FeatureToggleMgmtService,
              private snackBarService: SnackBarService,
              public dialog: MatDialog) { }


  getFtDotClass() {
    const anyExceptionDisabled = this.featureToggle?.exceptions?.some(exception => !exception.status);
    const anyExceptionEnabled = this.featureToggle?.exceptions?.some(exception => exception.status);
    if (this.featureToggle.status) {
      if(anyExceptionDisabled)  return { 'ft-semi-enabled': true };
      else  return { 'ft-enabled': true };
    } else {
      if (anyExceptionEnabled) return { 'ft-semi-enabled': true };
      else return {}
    }
  }

  toggleFeature(event) {
    const updatedFeatureToggle = { ...this.featureToggle };
    updatedFeatureToggle.status = event.checked;
    this.featureToggleService.modifyFeatureToggle(updatedFeatureToggle).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar('Feature toggle updated');
        this.featureToggle.status = event.checked;
      } else
        this.snackBarService.openSnackBar(res.error, 'Error while updating feature toggle!');
    }, error => {
      console.error("Error while updating feature toggle ", error);
      this.snackBarService.openSnackBar('Error while updating feature toggle!');
    });
  }

  deleteFeatureToggle() {
    this.featureToggleService.deleteFeatureToggle(this.featureToggle.id).subscribe((res: any) => {
      if (!res?.error) {
        this.reloadFeatureToggles.emit();
        this.snackBarService.openSnackBar('Feature toggle deleted');
      } else
        this.snackBarService.openSnackBar(res.error, 'Error while deleting feature toggle!');
    }, error => {
      console.error("Error while deleting feature toggle ", error);
      this.snackBarService.openSnackBar('Error while deleting feature toggle!');
    });
  }

  addException() {
    this.dialog.open(AddFeatureToggleExceptionModalComponent, {
      width: '400px',
      disableClose: true,
      autoFocus: false,
      data: { featureToggle: this.featureToggle }
    }).afterClosed().subscribe(() => {
      this.reloadFeatureToggles.emit();
    });
  }

  toggleException(event, index: number) {
    const exception = { featureToggleId: this.featureToggle.id, subaccountId: this.featureToggle.exceptions[index].subaccountId, status: event.checked };
    this.featureToggleService.updateException(exception).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar('Feature toggle exception updated');
        this.featureToggle.exceptions[index].status = event.checked;
      } else
        this.snackBarService.openSnackBar(res.error, 'Error while updating feature toggle exception!');
    }, error => {
      console.error("Error while updating feature toggle exception ", error);
      this.snackBarService.openSnackBar('Error while updating feature toggle exception!');
    });
  }

  deleteException(exception, index: number) {
    this.featureToggleService.deleteException(this.featureToggle.id, exception.subaccountId).subscribe((res: any) => {
      if (!res?.error) {
        this.snackBarService.openSnackBar('Feature toggle exception deleted');
        this.featureToggle.exceptions.splice(index, 1)
      } else
        this.snackBarService.openSnackBar(res.error, 'Error while deleting feature toggle exception!');
    }, error => {
      console.error("Error while deleting feature toggle exception ", error);
      this.snackBarService.openSnackBar('Error while deleting feature toggle exception!');
    });
  }



}
