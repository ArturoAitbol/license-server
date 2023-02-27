import { FeatureToggleCardComponent } from "./feature-toggle-card/feature-toggle-card.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DialogServiceMock } from "../../../test/mock/services/dialog-service.mock";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SharedModule } from "../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { SnackBarService } from "../../services/snack-bar.service";
import { SnackBarServiceMock } from "../../../test/mock/services/snack-bar-service.mock";
import { HttpClient } from "@angular/common/http";
import { FeatureToggleMgmtService } from "../../services/feature-toggle-mgmt.service";
import { FeatureToggleMgmtServiceMock } from "../../../test/mock/services/feature-toggle-mgmt-service.mock";
import { MatDialog } from "@angular/material/dialog";
import { MatDialogMock } from "../../../test/mock/components/mat-dialog.mock";
import { FeatureTogglesComponent } from "./feature-toggles.component";
import { AddFeatureToggleModalComponent } from "./add-feature-toggle-modal/add-feature-toggle-modal.component";

let testInstance: FeatureTogglesComponent;
let fixture: ComponentFixture<FeatureTogglesComponent>;

const RouterMock = {
  navigate: (commands: string[]) => { return }
};

const MatDialogRefMock = {
  close: ()=> {}
};
const dialogMock = new DialogServiceMock();
const beforeEachFunction = async () => {
  TestBed.configureTestingModule({
    declarations: [ FeatureTogglesComponent, FeatureToggleCardComponent ],
    imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule ],
    providers: [
      {
        provide: Router,
        useValue: RouterMock
      },
      {
        provide: SnackBarService,
        useValue: SnackBarServiceMock
      },
      {
        provide: HttpClient,
        useValue: HttpClient
      },
      {
        provide: FeatureToggleMgmtService,
        useValue: FeatureToggleMgmtServiceMock
      },
      {
        provide: MatDialog,
        useValue: MatDialogMock
      },
    ]
  }).compileComponents().then(() => {
    fixture = TestBed.createComponent(FeatureTogglesComponent);
    testInstance = fixture.componentInstance;
  });
};

describe('Feature Toggles Component - UI verification tests', () => {
  beforeEach(beforeEachFunction);
  it('should display form labels text correctly', () =>{
    fixture.detectChanges();
    const pageTitle = fixture.nativeElement.querySelector('#page-title');
    const addFtBtn = fixture.nativeElement.querySelector('#add-ft-btn');
    expect(pageTitle.textContent).toBe('Feature Toggles');
    expect(addFtBtn.textContent).toBe('Add Feature Toggle ');
  });

  it('should load the feature toggles data', () =>{
    spyOn(FeatureToggleMgmtServiceMock, "getFeatureToggles").and.callThrough();
    fixture.detectChanges();
    expect(FeatureToggleMgmtServiceMock.getFeatureToggles).toHaveBeenCalledTimes(1);

  });
});

describe('Feature Toggles Component - Add feature toggle functionality', () => {
  beforeEach(beforeEachFunction);
  it('should open the add feature toggle modal when button is clicked', () =>{
    spyOn(MatDialogMock, "open").and.callThrough();
    spyOn(FeatureToggleMgmtServiceMock, "getFeatureToggles").and.callThrough();
    fixture.detectChanges();
    const addFtBtn = fixture.nativeElement.querySelector('#add-ft-btn');
    addFtBtn.click();
    expect(MatDialogMock.open).toHaveBeenCalledWith(AddFeatureToggleModalComponent, { width: '400px', disableClose: true });
    expect(FeatureToggleMgmtServiceMock.getFeatureToggles).toHaveBeenCalledTimes(2);
  });
});
