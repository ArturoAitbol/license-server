import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { of } from "rxjs";
import { DataTableComponent } from "src/app/generics/data-table/data-table.component";
import { DialogService } from "src/app/services/dialog.service";
import { CustomerServiceMock } from "src/test/mock/services/customer-service.mock";
import { DevicesServiceMock } from "src/test/mock/services/devices-service.mock";
import { DialogServiceMock } from "src/test/mock/services/dialog-service.mock";
import { ProjectServiceMock } from "src/test/mock/services/project-service.mock";
import { SnackBarServiceMock } from "src/test/mock/services/snack-bar-service.mock";
import { UsageDetailServiceMock } from "src/test/mock/services/usage-detail-service.mock";
import { ProjectsComponent } from "../../projects/projects.component";
import { ModifyLicenseConsumptionDetailsComponent } from "./modify-license-consumption-details.component";
import moment from "moment";
import { By } from "@angular/platform-browser";
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';

let modifyLicenseConsumptionDetailTestInstance: ModifyLicenseConsumptionDetailsComponent;
let fixture: ComponentFixture<ModifyLicenseConsumptionDetailsComponent>;
const dialogService = new DialogServiceMock();

const currentLicense = {
    usageDays: [0],
    consumption: "2022-08-07 - Week 32",
    device: {
        id: "eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f",
        product: "SIP Trunk Testing Engagement",
        version: "1.0",
        vendor: "Opentext",
        granularity: "static",
    },
    callingPlatform: {
        id: "eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f",
        product: "SIP Trunk Testing Engagement",
        version: "1.0",
        vendor: "Opentext",
        granularity: "static",
    },
    id: "1397ed28-543d-477c-871e-06f450831465",
    tokensConsumed: 15,
    projectName: "test",
    projectId: "459cf3ca-7365-47a1-8d9b-1abee381545c",
    usageType: "Configuration",
    consumptionDate: "2022-08-07",
    consDate: new Date(),
    endLicensePeriod: "2021-12-30",
};

const beforeEachFunction = () => {
    const configBuilder = new TestBedConfigBuilder().useDefaultConfig(ModifyLicenseConsumptionDetailsComponent);
    configBuilder.addProvider({ provide: DialogService, useValue: dialogService });
    configBuilder.addProvider({ provide: MatDialogRef, useValue: dialogService });
    configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: currentLicense });
    configBuilder.addDeclaration(ProjectsComponent);
    configBuilder.addDeclaration(DataTableComponent);
    TestBed.configureTestingModule(configBuilder.getConfig());
    fixture = TestBed.createComponent(ModifyLicenseConsumptionDetailsComponent);
    modifyLicenseConsumptionDetailTestInstance = fixture.componentInstance;
    spyOn(DevicesServiceMock, 'getDevicesList').and.callThrough();
    spyOn(DevicesServiceMock, 'getDeviceById').and.callThrough();
    spyOn(DevicesServiceMock, 'getAllDeviceVendors').and.callThrough();
    spyOn(ProjectServiceMock, 'getProjectDetailsByLicense').and.callThrough();
    spyOn(CustomerServiceMock, 'getSelectedCustomer').and.callThrough();
    spyOn(UsageDetailServiceMock, 'getUsageDetailsByConsumptionId').and.callThrough();

};

describe('UI verification autocomplete', () => {
    beforeEach(beforeEachFunction);
    it('should display correctly the object selected in the mat-autocompletes', async () => {
        fixture.detectChanges();
        const modifyLicenseConsumptionForm = modifyLicenseConsumptionDetailTestInstance.updateForm;
        const projectInput = fixture.nativeElement.querySelector('#project-auto-complete');
        const vendorInput = fixture.nativeElement.querySelector('#vendor-auto-complete');
        const deviceInput = fixture.nativeElement.querySelector('#device-auto-complete');

        projectInput.dispatchEvent(new Event('focus'));
        projectInput.dispatchEvent(new Event('input'));
        vendorInput.dispatchEvent(new Event('focus'));
        vendorInput.dispatchEvent(new Event('input'));
        deviceInput.dispatchEvent(new Event('focus'));
        deviceInput.dispatchEvent(new Event('input'));
        modifyLicenseConsumptionForm.get('project').setValue({projectName: 'Project-Test1'});
        modifyLicenseConsumptionForm.get('vendor').setValue('Test');
        modifyLicenseConsumptionForm.get('device').setValue({product: 'Test'});

        fixture.detectChanges();

        await fixture.whenStable();

        expect(projectInput.value).toBe('Project-Test1');
        expect(vendorInput.value).toBe('Test');
        expect(deviceInput.value).toBe('Test');
    });

    it('should display essential UI and components', () => {
        fixture.detectChanges();
        const h1 = fixture.nativeElement.querySelector('#main-title');
        const cancelButton = fixture.nativeElement.querySelector('#cancel-button');
        const submitButton = fixture.nativeElement.querySelector('#submit-button');

        expect(h1.textContent).toBe('Edit tekToken Consumption');
        expect(cancelButton.textContent).toBe('Cancel');
        expect(submitButton.disabled).toBeTrue();
        expect(submitButton.textContent).toBe('Submit');
    });
});

describe('Data collection and parsing test', () => {
    beforeEach(beforeEachFunction);
    it('should make a call to get license consumption details list after initializing', () => {
        fixture.detectChanges();

        expect(DevicesServiceMock.getAllDeviceVendors).toHaveBeenCalled();
        expect(ProjectServiceMock.getProjectDetailsByLicense).toHaveBeenCalled();
        expect(UsageDetailServiceMock.getUsageDetailsByConsumptionId).toHaveBeenCalled();

        modifyLicenseConsumptionDetailTestInstance.updateForm.get('project').setValue({name: "Project-Test1"});
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('vendor').setValue("testB");
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('device').setValue({product: "testC"});
        
    });
});

describe('modify license consumption details interactions', () => {
    beforeEach(beforeEachFunction);
    it('should call submit', () => {
        fixture.detectChanges();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'setChecked').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'submit').and.callThrough();

        modifyLicenseConsumptionDetailTestInstance.setChecked(true, 0);
        expect(modifyLicenseConsumptionDetailTestInstance.setChecked).toHaveBeenCalledWith(true, 0);
        
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('project').setValue({name: "Project-Test1"});
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('vendor').setValue("testB");
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('device').setValue({product: "testC"});
        modifyLicenseConsumptionDetailTestInstance.submit();
        expect(modifyLicenseConsumptionDetailTestInstance.submit).toHaveBeenCalled();
    });
});

describe('modify functions interactions', () => {
    beforeEach(beforeEachFunction);
    it('should call modifys functions', () => {
        fixture.detectChanges();
        
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'onChangeVendor').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'disableSumbitBtn').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'getErrorMessage').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'onCancel').and.callThrough();
    
        modifyLicenseConsumptionDetailTestInstance.onChangeVendor("Opentext");
        modifyLicenseConsumptionDetailTestInstance.disableSumbitBtn();
        modifyLicenseConsumptionDetailTestInstance.getErrorMessage();
        modifyLicenseConsumptionDetailTestInstance.onCancel();

        expect(modifyLicenseConsumptionDetailTestInstance.disableSumbitBtn).toHaveBeenCalled();
        expect(modifyLicenseConsumptionDetailTestInstance.onChangeVendor).toHaveBeenCalledWith("Opentext");
        expect(modifyLicenseConsumptionDetailTestInstance.getErrorMessage).toHaveBeenCalled();
        
    });

    it('should call onChangeVendor and change the value of vendor', () => {
        fixture.detectChanges();
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'onChangeVendor').and.callThrough();

        modifyLicenseConsumptionDetailTestInstance.onChangeVendor("Test");
        fixture.detectChanges();
        expect(modifyLicenseConsumptionDetailTestInstance.onChangeVendor).toHaveBeenCalledWith("Test");
    })

    it('should call the deleteUsageDetails', () => {
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'submit').and.callThrough();
        fixture.detectChanges();
        modifyLicenseConsumptionDetailTestInstance.setChecked(false, 4);

        modifyLicenseConsumptionDetailTestInstance.submit();

        expect(modifyLicenseConsumptionDetailTestInstance.submit).toHaveBeenCalled();
    });

    it('should return error message to the user', () => {
        spyOn(UsageDetailServiceMock, 'createUsageDetails').and.returnValue(of({error: "Some error"}));
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'submit').and.callThrough();
        spyOn(SnackBarServiceMock, 'openSnackBar').and.callThrough();
        fixture.detectChanges();

        modifyLicenseConsumptionDetailTestInstance.setChecked(false, 4);
        modifyLicenseConsumptionDetailTestInstance.setChecked(true, 2);
        modifyLicenseConsumptionDetailTestInstance.submit();

        expect(modifyLicenseConsumptionDetailTestInstance.submit).toHaveBeenCalled();
        expect(SnackBarServiceMock.openSnackBar).toHaveBeenCalledOnceWith("Some error", 'Error editing tekToken consumption!');
    });

    it('should call deltedDays when submit es called', () => {
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'submit').and.callThrough();
        fixture.detectChanges()
        
        modifyLicenseConsumptionDetailTestInstance.setChecked(false, 4);
        modifyLicenseConsumptionDetailTestInstance.setChecked(true, 1);
        modifyLicenseConsumptionDetailTestInstance.submit();

        expect(modifyLicenseConsumptionDetailTestInstance.submit).toHaveBeenCalled();
    });
});

describe('modify-license-consumption-details FormGroup verification', () => {
    beforeEach(beforeEachFunction);
    it('should create formGroup with necessary controls', () => {
        fixture.detectChanges();
        expect(modifyLicenseConsumptionDetailTestInstance.updateForm.get('consDate')).toBeTruthy();
        expect(modifyLicenseConsumptionDetailTestInstance.updateForm.get('project')).toBeTruthy();
        expect(modifyLicenseConsumptionDetailTestInstance.updateForm.get('vendor')).toBeTruthy();
        expect(modifyLicenseConsumptionDetailTestInstance.updateForm.get('device')).toBeTruthy();
    });

    it('should make all the controls required', () => {
        const modifyLicenseForm = modifyLicenseConsumptionDetailTestInstance.updateForm;
        modifyLicenseForm.setValue({
            consDate: '',
            project:'',
            vendor:'',
            device:''
        });
        expect(modifyLicenseForm.get('consDate').valid).toBeFalse();
        expect(modifyLicenseForm.get('project').valid).toBeFalse();
        expect(modifyLicenseForm.get('vendor').valid).toBeFalse();
        expect(modifyLicenseForm.get('device').valid).toBeFalse();
    });

    it('should not show submit button if there are missing parameters', () => {
        fixture.detectChanges();
        const modifyLicenseForm = modifyLicenseConsumptionDetailTestInstance.updateForm;
        modifyLicenseForm.setValue({
            consDate: '',
            project: '',
            vendor: '',
            device: ''
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeTrue();
    });

    it('should show submit button if the parameters are completed', () => {
        fixture.detectChanges();
        const modifyLicenseForm = modifyLicenseConsumptionDetailTestInstance.updateForm;
        modifyLicenseForm.setValue({
            consDate: moment('16-08-2022', 'DDMMYYYY'),
            project: { test:"test" },
            vendor: "test",
            device: { test:"test" }
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#submit-button').disabled).toBeFalse();
    });
});

describe('modify-license-consumption - Day toggle', () => {
    beforeEach(beforeEachFunction);
    it('should toggle days according to the days selected', () => {
        modifyLicenseConsumptionDetailTestInstance.setChecked(false, 4);

        fixture.detectChanges();

        expect(modifyLicenseConsumptionDetailTestInstance.days[0].used).toBeFalse();
        expect(modifyLicenseConsumptionDetailTestInstance.days[1].used).toBeFalse();
        expect(modifyLicenseConsumptionDetailTestInstance.days[2].used).toBeFalse();
        expect(modifyLicenseConsumptionDetailTestInstance.days[3].used).toBeFalse();
        expect(modifyLicenseConsumptionDetailTestInstance.days[4].used).toBeTrue();
        expect(modifyLicenseConsumptionDetailTestInstance.days[5].used).toBeTrue();
        expect(modifyLicenseConsumptionDetailTestInstance.days[6].used).toBeFalse();

    });

    it('toggle days of modified license', () => {
        modifyLicenseConsumptionDetailTestInstance.setChecked(true, 0);
        expect(modifyLicenseConsumptionDetailTestInstance.days[0].used).toBeTrue();
    });

    it('should not toggle the day of modified license', () => {
        modifyLicenseConsumptionDetailTestInstance.setChecked(false, 1);
        expect(modifyLicenseConsumptionDetailTestInstance.days[0].used).toBeFalse();
    })
});

describe('modify-license-consumption - on event methods', () => {
    beforeEach(beforeEachFunction);
    it('should filter projects on input change', async () => {
        fixture.detectChanges();
        const inputElement = fixture.nativeElement.querySelector('#project-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('project').setValue('Test1');
        fixture.detectChanges();
        await fixture.whenStable();
        const option = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(option.length).toBe(2);
        expect(option[0].nativeElement.textContent).toBe(' Project-Test1 ');
    });

    it('should filter vendors on input change', async () => {
        fixture.detectChanges();
        const inputElement = fixture.nativeElement.querySelector('#vendor-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('vendor').setValue('Hyl');
        fixture.detectChanges();
        await fixture.whenStable();
        const option = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(option.length).toBe(1);
        expect(option[0].nativeElement.textContent).toBe(' HylaFAX ');
    });

    it('should filter device on input change', async () => {
        fixture.detectChanges();
        modifyLicenseConsumptionDetailTestInstance.onChangeVendor('Opentext');
        const inputElement = fixture.nativeElement.querySelector('#device-auto-complete');
        inputElement.dispatchEvent(new Event('focusin'));
        modifyLicenseConsumptionDetailTestInstance.updateForm.get('device').setValue('OpenText');
        fixture.detectChanges();
        await fixture.whenStable();
        const option = fixture.debugElement.queryAll(By.css('mat-option'));
        expect(option.length).toBe(1);
        expect(option[0].nativeElement.textContent).toBe(' OpenText--Right FAX - v.20.2 (static - 0) ');
    });
});

describe('calling displays with undefined parameter', () => {
    beforeEach(beforeEachFunction);
    it('it should call the displat funcionts with null parameter', () => {
        spyOn(modifyLicenseConsumptionDetailTestInstance, 'displayFnDevice').and.callThrough();
        spyOn(modifyLicenseConsumptionDetailTestInstance,'displayFnProject').and.callThrough();
        modifyLicenseConsumptionDetailTestInstance.displayFnDevice(null)
        modifyLicenseConsumptionDetailTestInstance.displayFnProject(null);
        expect(modifyLicenseConsumptionDetailTestInstance.displayFnDevice).toHaveBeenCalledWith(null);
        expect(modifyLicenseConsumptionDetailTestInstance.displayFnProject).toHaveBeenCalledWith(null);
    });
}); 
