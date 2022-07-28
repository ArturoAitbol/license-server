import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MsalService } from "@azure/msal-angular";
import { Observable } from "rxjs";
import { DataTableComponent } from "src/app/generics/data-table/data-table.component";
import { CustomerService } from "src/app/services/customer.service";
import { DialogService } from "src/app/services/dialog.service";
import { SharedModule } from "../../shared/shared.module";
import { AddProjectComponent } from "./add-project/add-project.component";
import { ModifyProjectComponent } from "./modify-project/modify-project.component";
import { ProjectsComponent } from "./projects.component";

let projectsComponentTestInstance: ProjectsComponent;

let fixture: ComponentFixture<ProjectsComponent>;

let projectServiceMock = {
    getProjectList: () => {
        return new Observable((observer) => {
            observer.next(
                {
                    'projects':[
                        {
                            id: '88888888-8888-8888-8888-888888888888',
                            name: 'Project-Test1',
                            number: 'test-code',
                            subaccountId: '99999999-9999-9999-9999-999999999999',
                            openDate: '2022-07-26 05:00:00',
                            closeDate: '2022-08-29 05:00:00',
                            status: 'Open'
                        },
                        {
                            id: '22222222-2222-2222-2222-22222222222',
                            name: 'Project-Test2',
                            number: 'test-code2',
                            subaccountId: '99999999-9999-9999-9999-999999999999',
                            openDate: '2022-07-25 05:00:00',
                            closeDate: '2022-08-30 05:00:00',
                            status: 'Open'
                        }
                    ]
                }
            );
            return {
                unsubscribe() {
                    console.log('unsubscribed from projectService Observable')
                }
            };
        });
    }
};

let customerServiceMock = {
    getSelectedCustomer: () => {
        return new Observable( (observer) => {
            observer.next(
            {
                    "customer": [
                        {
                            id: '11111111-1111-1111-1111-11111111111',
                            name: 'TestCustomerP',
                            status: 'Active',
                            customerType: 'MSP',
                            subaccountId: '99999999-9999-9999-9999-999999999999',
                            subaccountName: 'testSubP',
                            testCustomer: true
                        }
                    ]
                }
            );
            return {
                unsubscribe() {
                    console.log('unsubscribed from getCustomerList Observable');
                }
            };
        });
    }
};

beforeEach(() => {
    TestBed.configureTestingModule({
        declarations: [ ProjectsComponent, DataTableComponent, ModifyProjectComponent, AddProjectComponent ],
        imports: [BrowserAnimationsModule, MatDialogModule, MatSnackBarModule, SharedModule],
        providers:[
            {
                provide: Router,
                useValue: {}
            },
            {
                provide: MatDialogRef,
                useValue: {}
            },
            {
                provide: ProjectsComponent,
                useValue: projectServiceMock
            },
            {
                provide: DialogService,
                useValue: () => {
                    console.log('DialogService Mock')
                    return{};
                }
            },
            {
                provide: CustomerService,
                useValue: customerServiceMock
            },
            {
                provide: MsalService,
                useValue: {
                    instance: {
                        getActiveAccount: () =>{
                            return {
                                'homeAccountId': '4bd8345a-b441-4791-91ff-af23e4b02e02.e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
                                'environment': 'login.windows.net',
                                'tenantId': 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
                                'username': 'lvelarde@tekvizionlabs.com',
                                'localAccountId': '4bd8345a-b441-4791-91ff-af23e4b02e02',
                                'name': 'Leonardo Velarde',
                                idTokenClaims: {
                                    'aud': 'e643fc9d-b127-4883-8b80-2927df90e275',
                                    'iss': 'https://login.microsoftonline.com/e3a46007-31cb-4529-b8cc-1e59b97ebdbd/v2.0',
                                    'iat': 1657823518,
                                    'nbf': 1657823518,
                                    'exp': 1657827418,
                                    'name': 'Leonardo Velarde',
                                    'nonce': '41279ac2-8254-4f82-a11b-38fd27248c57',
                                    'oid': '4bd8345a-b441-4791-91ff-af23e4b02e02',
                                    'preferred_username': 'lvelarde@tekvizionlabs.com',
                                    'rh': '0.ARMAB2Ck48sxKUW4zB5ZuX69vZ38Q-YnsYNIi4ApJ9-Q4nUTAEs.',
                                    roles: [
                                        'tekvizion.FullAdmin'
                                    ],
                                    'sub': 'q_oqvIR8gLozdXv-rtEYPNfPc0y4AfLlR_LiKUxZSy0',
                                    'tid': 'e3a46007-31cb-4529-b8cc-1e59b97ebdbd',
                                    'uti': 'GwgRbk67AECociiD7H0SAA',
                                    'ver': '2.0'
                                }
                            };
                        }
                    }
                }
            },
            {
                provide: HttpClient,
                useValue: HttpClient
            }
        ]
    });
    fixture = TestBed.createComponent(ProjectsComponent);
    projectsComponentTestInstance = fixture.componentInstance;
    projectsComponentTestInstance.ngOnInit();
    spyOn(console, 'log').and.callThrough;
    spyOn(projectServiceMock, 'getProjectList').and.callThrough;
    spyOn(customerServiceMock, 'getSelectedCustomer').and.callThrough;
});

describe('UI verrification test', () => {
    it('should display essential UI and components', () =>{
        fixture.detectChanges();
        let h2 = fixture.nativeElement.querySelector('#page-title');
        let addProjectButton = fixture.nativeElement.querySelector('#add-new-project-button');
        expect(h2.textContent).toBe('Project Summary');
        expect(addProjectButton.textContent).toBe('Add New Projects')
    });

    it('should load correct data columns for the table', () =>{
        let projectCodeColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[0];
        let projectNameColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[1];
        let projectStatusColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[2];
        let projectStartDateColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[3];
        let projectCloseDateColumn = fixture.nativeElement.querySelectorAll('.mat-sort-header-content')[4];
        expect(projectCodeColumn.innerText).toBe('Project Code');
        expect(projectNameColumn.innerText).toBe('Project Name');
        expect(projectStatusColumn.innerText).toBe('Status');
        expect(projectStartDateColumn.innerText).toBe('Start Date');
        expect(projectCloseDateColumn.innerText).toBe('Close Date');
    });
});

describe('Data collection and parsin tests', () => {
    it('should make a call to get project list after initializing', () => {
        fixture.detectChanges();
        expect(projectServiceMock.getProjectList).toHaveBeenCalled();
        expect(customerServiceMock.getSelectedCustomer).toHaveBeenCalled();
    });
});

describe('Navigation', () => {
    it('should make a call to get project list after initializing', () => {
        fixture.detectChanges();
        expect(projectServiceMock.getProjectList).toHaveBeenCalled();
        expect(customerServiceMock.getSelectedCustomer).toHaveBeenCalled();
    });
});