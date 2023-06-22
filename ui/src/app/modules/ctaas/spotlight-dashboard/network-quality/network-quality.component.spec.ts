import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, FormsModule, FormControlDirective } from '@angular/forms';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TestBedConfigBuilder } from 'src/test/mock/TestBedConfigHelper.mock';

import { NetworkQualityComponent } from "./network-quality.component";
import { SpotlightChartsService } from "src/app/services/spotlight-charts.service";
import { SpotlightChartsServiceMock } from "src/test/mock/services/spotlight-charts-service.mock";
import moment from 'moment';



let networkQualityComponentTestInstance: NetworkQualityComponent;
let fixture: ComponentFixture<NetworkQualityComponent>;
const spotlightChartsServiceMock = new SpotlightChartsServiceMock;

const beforeEachFunction = waitForAsync(
  () => {
      const configBuilder = new TestBedConfigBuilder().useDefaultConfig(NetworkQualityComponent);
      configBuilder.addImport(NgApexchartsModule);
      configBuilder.addProvider({ provide: SpotlightChartsService, useValue: spotlightChartsServiceMock });
      TestBed.configureTestingModule(configBuilder.getConfig()).compileComponents().then(() => {
          fixture = TestBed.createComponent(NetworkQualityComponent);
          networkQualityComponentTestInstance = fixture.componentInstance;
          networkQualityComponentTestInstance.startDate = moment('06-21-2023');
          networkQualityComponentTestInstance.endDate = moment('06-21-2023');
          networkQualityComponentTestInstance.users = ['John Doe', 'Jane Doe', 'Joe Smith'];
          networkQualityComponentTestInstance.regions = [];
          networkQualityComponentTestInstance.selectedUsers = [];
          networkQualityComponentTestInstance.ngOnInit();
      });
  }
);


describe("NetworkQualityComponent", () => {
  beforeEach(beforeEachFunction);
  beforeEach(() => {
    fixture.detectChanges();
  });
  /*const spotlightChartsServiceSpy = jasmine.createSpyObj('SpotlightChartsService', [
    'getCustomerNetworkTrendsData',
    'getNetworkQualitySummary',
    'getCustomerNetworkQualityData'
  ]);*/

  //const fb: FormBuilder = new FormBuilder();

  /*beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientModule, FormsModule, NgApexchartsModule, MatAutocompleteModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatButtonToggleModule],
      declarations: [NetworkQualityComponent, FormControlDirective],
      providers: [
        { provide: SpotlightChartsService, useValue: spotlightChartsServiceSpy },
        { provide: FormBuilder, useValue: fb }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkQualityComponent);
    component = fixture.componentInstance;
    component.startDate = moment('2023-01-01');
    component.endDate = moment('2023-01-01');
    component.users = ['John Doe', 'Jane Doe', 'Joe Smith'];
    component.regions = [];
    component.selectedUsers = [];
    fixture.detectChanges();
  });*/

  it("should create", () => {
    expect(networkQualityComponentTestInstance).toBeTruthy();
  });

  it('should initialize the filteredUsers variable with empty options', () => {

    networkQualityComponentTestInstance.initAutocompletes();
    fixture.detectChanges();

    networkQualityComponentTestInstance.filteredUsers.subscribe((users) => {
      expect(users.length).toBe(3);
    });
  });

  it('should filter users by input string value', (done) => {
    console.log("this one");
    networkQualityComponentTestInstance.initAutocompletes();

    networkQualityComponentTestInstance.filters.get('user').setValue('joh');
    fixture.detectChanges();
    

    networkQualityComponentTestInstance.filteredUsers.subscribe((users) => {
      expect(users.length).toBe(1);
      expect(users[0]).toBe('John Doe');
      done();
    });
  });

  it('should update the selectedUsers array when a user is added', () => {

    networkQualityComponentTestInstance.selectedUsers = ['John Doe'];

    networkQualityComponentTestInstance.initAutocompletes();
    networkQualityComponentTestInstance.filters.get('user').setValue('Jane Doe');
    networkQualityComponentTestInstance.selected();
    fixture.detectChanges();

    expect(networkQualityComponentTestInstance.selectedUsers.length).toBe(2);
    expect(networkQualityComponentTestInstance.selectedUsers[1]).toBe('Jane Doe');
  });

  /*it('should remove a user from the selectedUsers array when deleted', () => {
    const spy = spyOn(component.filters.get('user'), 'valueChanges').and.returnValue(
      of('')
    );

    component.selectedUsers = ['John Doe', 'Jane Doe'];

    fixture.detectChanges();

    const userListBeforeRemoval = fixture.debugElement.queryAll(By.css('.selected-user'));
    expect(userListBeforeRemoval.length).toBe(2);

    const deleteButton = fixture.debugElement.queryAll(By.css('.delete-icon'))[0]; // Select first delete button
    deleteButton.triggerEventHandler('click', null);

    const updatedUserList = fixture.debugElement.queryAll(By.css('.selected-user'));
    expect(updatedUserList.length).toBe(1);
    expect(component.selectedUsers.length).toBe(1);
    expect(component.selectedUsers[0*/

    /*it('should initialize the filteredUsers variable with empty options', () => {

    component.initAutocompletes();

    component.filteredUsers.subscribe((users) => {
      expect(users.length).toBe(0);
    });
  });

  it('should filter users by input string value', (done) => {
    console.log("this one");
    component.initAutocompletes();

    component.filters.get('user').setValue('joh');
    component.users = ['John Doe', 'Jane Doe', 'Joe Smith'];

    component.filteredUsers.subscribe((users) => {
      //console.log(users);
      expect(users.length).toBe(1);
      expect(users[0]).toBe('John Doe');
      done();
    });
  });

  it('should update the selectedUsers array when a user is added', () => {

    // Set initial state of selectedUsers array before adding a user
    component.selectedUsers = ['John Doe'];

    component.initAutocompletes();
    component.filters.get('user').setValue('Jane Doe');
    component.selected();

    expect(component.selectedUsers.length).toBe(2);
    expect(component.selectedUsers[1]).toBe('Jane Doe');
  });*/
  /*it('should initialize the filteredUsers variable with empty options', () => {

    component.initAutocompletes();

    component.filteredUsers.subscribe((users) => {
      expect(users.length).toBe(0);
    });
  });

  it('should filter users by input string value', (done) => {
    console.log("this one");
    component.initAutocompletes();

    component.filters.get('user').setValue('joh');
    component.users = ['John Doe', 'Jane Doe', 'Joe Smith'];

    component.filteredUsers.subscribe((users) => {
      //console.log(users);
      expect(users.length).toBe(1);
      expect(users[0]).toBe('John Doe');
      done();
    });
  });

  it('should update the selectedUsers array when a user is added', () => {

    // Set initial state of selectedUsers array before adding a user
    component.selectedUsers = ['John Doe'];

    component.initAutocompletes();
    component.filters.get('user').setValue('Jane Doe');
    component.selected();

    expect(component.selectedUsers.length).toBe(2);
    expect(component.selectedUsers[1]).toBe('Jane Doe');
  });*/
  /*it('should initialize the filteredUsers variable with empty options', () => {

    component.initAutocompletes();

    component.filteredUsers.subscribe((users) => {
      expect(users.length).toBe(0);
    });
  });

  it('should filter users by input string value', (done) => {
    console.log("this one");
    component.initAutocompletes();

    component.filters.get('user').setValue('joh');
    component.users = ['John Doe', 'Jane Doe', 'Joe Smith'];

    component.filteredUsers.subscribe((users) => {
      //console.log(users);
      expect(users.length).toBe(1);
      expect(users[0]).toBe('John Doe');
      done();
    });
  });

  it('should update the selectedUsers array when a user is added', () => {

    // Set initial state of selectedUsers array before adding a user
    component.selectedUsers = ['John Doe'];

    component.initAutocompletes();
    component.filters.get('user').setValue('Jane Doe');
    component.selected();

    expect(component.selectedUsers.length).toBe(2);
    expect(component.selectedUsers[1]).toBe('Jane Doe');
  });*/
  /*it('should initialize the filteredUsers variable with empty options', () => {

    component.initAutocompletes();

    component.filteredUsers.subscribe((users) => {
      expect(users.length).toBe(0);
    });
  });

  it('should filter users by input string value', (done) => {
    console.log("this one");
    component.initAutocompletes();

    component.filters.get('user').setValue('joh');
    component.users = ['John Doe', 'Jane Doe', 'Joe Smith'];

    component.filteredUsers.subscribe((users) => {
      //console.log(users);
      expect(users.length).toBe(1);
      expect(users[0]).toBe('John Doe');
      done();
    });
  });

  it('should update the selectedUsers array when a user is added', () => {

    // Set initial state of selectedUsers array before adding a user
    component.selectedUsers = ['John Doe'];

    component.initAutocompletes();
    component.filters.get('user').setValue('Jane Doe');
    component.selected();

    expect(component.selectedUsers.length).toBe(2);
    expect(component.selectedUsers[1]).toBe('Jane Doe');
  });*/


});
