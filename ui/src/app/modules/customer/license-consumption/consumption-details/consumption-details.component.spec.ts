import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConsumptionDetailsComponent } from './consumption-details.component';
import { TestBedConfigBuilder } from '../../../../../test/mock/TestBedConfigHelper.mock';

let consumptionDetailsComponent: ConsumptionDetailsComponent;
let fixture: ComponentFixture<ConsumptionDetailsComponent>;

const data: any = {
  consumptionDate: "2023-02-05",
  usageDays: ["Sun", "Mon"],
  comment: "Comment For consumption",
  consumption: "2023-02-05 - Week 6",
  id: "1010faa5-d350-4aad-b828-d1e93144b1bd",
  tokensConsumed: 0,
  projectName: "Project 1",
  projectId: "be612704-c26e-48ea-ab9b-19312f03d644",
  device: {
    supportType: false,
    product: "2900 A",
    vendor: "Edgemarc",
    granularity: "week",
    id: "cf28fdb3-9113-448c-924e-bd2ddd4d07f1",
    type: "SBC",
    version: "16.1.0"
  },
  usageType: "Configuration",
  deviceInfo: "SBC: Edgemarc - 2900 A 16.1.0",
  callingPlatformInfo: "",
  callingPlatform: null
}


const beforeEachFunction = () => {
  const configBuilder = new TestBedConfigBuilder().useDefaultConfig(ConsumptionDetailsComponent);
  configBuilder.addProvider({ provide: MAT_DIALOG_DATA, useValue: data });
  TestBed.configureTestingModule(configBuilder.getConfig());
  fixture = TestBed.createComponent(ConsumptionDetailsComponent);
  consumptionDetailsComponent = fixture.componentInstance;
}

describe('UI verification tests', () => {
  beforeEach(beforeEachFunction);
  it('should display essential UI and components', () => {
    fixture.detectChanges();

    const h1: HTMLElement = fixture.nativeElement.querySelector('#dialog-title');
    const closeButton: HTMLElement = fixture.nativeElement.querySelector('#close-button');
    const consumptionSection: HTMLElement = fixture.nativeElement.querySelector('#consumption-data');
    const deviceSection: HTMLElement = fixture.nativeElement.querySelector('#device-data');
    const usageInfoCards: HTMLElement[] = fixture.nativeElement.querySelectorAll('.usage-info');

    expect(h1.textContent).toBe('Consumption Details');
    expect(closeButton.textContent).toBe('Close');
    expect(consumptionSection).toBeTruthy();
    expect(deviceSection).toBeTruthy();
    expect(usageInfoCards.length).toBe(data.usageDays.length);
  });

  it('should display UI and components for calling platform if available', () => {
    data.callingPlatform = {
      product: "(Toshiba) IPedge EP",
      vendor: "Mitel",
      id: "acd2d83f-b0c4-4a58-8854-8112170e629b",
      type: "PBX",
      version: "1.7.4.110"
    };
    fixture.detectChanges();
    const platformSection: HTMLElement = fixture.nativeElement.querySelector('#platform-data');
    expect(platformSection).toBeTruthy();

  });
});


describe('Calls and interactions', () => {
  beforeEach(beforeEachFunction);
  it('should close the dialog when calling close()', () => {
    spyOn(consumptionDetailsComponent.dialogRef, 'close');
    fixture.detectChanges();
    consumptionDetailsComponent.close();
    expect(consumptionDetailsComponent.dialogRef.close).toHaveBeenCalled();
  });
});