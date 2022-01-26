import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Utility } from 'src/app/helpers/Utility';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-validate-blf',
  templateUrl: './validate-blf.component.html',
  styleUrls: ['./validate-blf.component.css']
})
export class ValidateBlfComponent implements OnInit, OnDestroy {
  action: any;
    subscription: Subscription;
    resources: any = [];
    selectedPhone: any = '';
    selectedPhoneObj: any = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
    selectedLine: any = 'Line1';
    ledStatus = 'none';
    selectedResourceLine: string;
    // tslint:disable-next-line:max-line-length
    modes: any = ['Idle', 'Ringing', 'CallOut', 'Talking', 'Park'];
    // tslint:disable-next-line:max-line-length
    flash: any = ['Slower', 'Faster', 'Lighting'];
    selectedMode1: string;
    selectedFlashType: string;
    selectedFindBy: string;
    selectedState: string;
    public title = '';
    actionToEdit: any = {};
    expression='';
    userId = '';
    continueOnFailure = false;
    selectedValidateBlfType: string;
    validateBlfType: string[] = ['BLF - Presence', 'BLF - State'];
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.selectedFlashType = this.selectedMode1 = '';
        this.selectedState = 'none';
        this.selectedFindBy = 'Line Key';
        this.selectedValidateBlfType = '';
        this.resources = this.aeService.getFilteredResources(['Phone'])
            .filter((e: Phone) => e.vendor.toLowerCase() === 'yealink');
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        if (this.actionToEdit) {
          this.selectedResourceLine = (this.actionToEdit.expression) ? this.actionToEdit.expression : this.actionToEdit.userId;
            if (this.actionToEdit.value) {
                const _values = this.actionToEdit.value.toString().split(',');
                this.selectedMode1 = _values[0];
                this.selectedFlashType = _values[1];
                if (this.actionToEdit.expression) {
                  this.selectedFindBy = 'Line Key';
                } else {
                  this.selectedFindBy = 'Display Name';
                }
            }
            this.selectedPhone = this.actionToEdit.phone;
           
            this.ledStatus = this.actionToEdit.ledstatus;
            this.selectedValidateBlfType=this.actionToEdit.calltype;
            this.resources.some(resource => {
                // tslint:disable-next-line:triple-equals
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
        let query = '';
        const item = {
          
            action: 'validate_blf',
            phone: this.selectedPhone,
            expression: null,
            userId: null,
            ledstatus: this.ledStatus,
            continueonfailure: this.continueOnFailure,
            calltype:this.selectedValidateBlfType,
            value: (this.selectedPhoneObj.vendor.toLowerCase() === 'yealink') ? this.selectedMode1 + ',' + this.selectedFlashType : null
        };
        item.expression = (this.selectedFindBy === 'Line Key') ? this.selectedResourceLine : null;
        item.userId = (this.selectedFindBy === 'Display Name') ? this.selectedResourceLine : this.userId;
        const findByType = (this.selectedFindBy === 'Line Key') ? `line=="${this.selectedResourceLine}"` : `displayName=="${this.selectedResourceLine}"`;
        item.continueonfailure = this.continueOnFailure;   
        item.calltype=this.selectedValidateBlfType;
        // tslint:disable-next-line:max-line-length
            query = this.selectedPhone + '.' + `.validateBlf( ${findByType} ,color="${this.ledStatus}", mode="${this.selectedMode1}, flash="${this.selectedFlashType}","${this.continueOnFailure}")`;
        
        this.action = { action: item, query: query };
    }

    /**
     * on select resource
     * @param value:string
     */
    onSelectPhone(value: string) {
        // tslint:disable-next-line:triple-equals
        if (value == undefined || value == '') {
            this.selectedPhoneObj = { dut: false, id: null, model: '', name: '', submodel: '', testCaseDto: null, type: '', vendor: '' };
        } else if (value) {
            this.selectedPhoneObj = this.resources.filter(e => e.name === value)[0];
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onChangeFindBy(): void {
      
        this.selectedResourceLine = '';
       
      }
    
      onSelectBlf() : void{
      
      

    }

}
