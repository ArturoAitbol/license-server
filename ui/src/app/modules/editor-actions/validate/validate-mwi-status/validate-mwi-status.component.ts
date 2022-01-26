import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from '../../../../model/phone';


@Component({
    selector: 'app-validate-mwi-status',
    templateUrl: './validate-mwi-status.component.html',
    styleUrls: ['./validate-mwi-status.component.css']
})
export class ValidateMwiStatusComponent implements OnInit, OnDestroy {

    action: any;
    subscription: Subscription;
    resources: any = [];
    lines: any = ['Line1', 'Line2', 'Line3', 'Line4', 'Line5', 'Line6', 'Line7', 'Line8', 'Line9', 'Line10'];
    selectedPhone: any = '';
    selectedPhoneObj: any = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
    selectedLine: any = 'Line1';

    mwiStatus = 'Off';

    public title = '';
    actionToEdit: any = {};
    continueOnFailure: boolean = false;
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.resources = this.aeService.getFilteredResources(['Phone'])
            .filter((e: Phone) => e.vendor.toLowerCase() === 'polycom' || e.vendor.toLowerCase() === 'yealink');
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
            this.selectedPhone = this.actionToEdit.phone;
            this.selectedLine = 'Line' + this.actionToEdit.line;
            this.mwiStatus = this.actionToEdit.mwiStatus;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
            this.resources.some(resource => {
                if (this.selectedPhone == resource.name) {
                    this.selectedPhoneObj = resource;
                    return true;
                }
            });
        }
        this.subscription = this.aeService.generateAction.subscribe((res: any) => {
            this.insertAction();
        });
    }

    cancel() {
        this.aeService.cancelAction.emit();
    }

    insertAction() {
        this.createAction();
        this.aeService.insertAction.emit(this.action);
    }


    createAction() {
        const item = {
            action: 'validate_mwi_status',
            phone: this.selectedPhone,
            line: this.selectedLine.toString().toLowerCase().replace('line', ''),
            mwistatus: this.mwiStatus,
            continueonfailure: this.continueOnFailure
        };
        // tslint:disable-next-line: max-line-length
        let query = this.selectedPhone + '.' + this.selectedLine.toLowerCase() + '.validatemwistatus(mwistatus=\'' + this.mwiStatus +'\'';

        if( this.continueOnFailure !=null){
            query += `,"${this.continueOnFailure}"`;
        }
        query += ')';
        this.action = { action: item, query: query };
    }

    /**
     * on select resource
     * @param value:string
     */
    onSelectPhone(value: string) {
        // tslint:disable-next-line: triple-equals
        if (value == undefined || value == '') {
            this.selectedPhoneObj = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
        } else if (value) {
            this.selectedPhoneObj = this.resources.filter(e => e.name === value)[0];
        }
    }

    onSelectLine(value: any) {
    }


    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}

