import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Phone } from 'src/app/model/phone';
import { PhoneService } from 'src/app/services/phone.service';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { Subscription } from 'rxjs';
import { PhoneOptionsService } from 'src/app/services/phone-options.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal/public_api';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'add-phone',
    templateUrl: './add-phone.component.html',
    styleUrls: ['./add-phone.component.css']
})

export class AddPhoneComponent implements OnInit, OnDestroy {
    phone: Phone = new Phone();
    subscription: Subscription;
    linesList: any = [];
    lineCount: number = 0;
    newLine: any = {};
    vendors: any;
    licensedVendores: any;
    models: any;
    submodels: any;
    selectedVendorId: number = 0;
    // selectedModelId: number = 0;
    selectedSubModelId: number = 0;
    selectedVendor: any;
    selectedModel: any;
    model:any;
    selectedSubModel: any;
    modalRef: BsModalRef;
    newList: any = [];
    linesBk: any = [];
    relaysList: any = [];
    freezeMAC:boolean;
    @ViewChild('phoneForm', { static: true }) addPhoneForm: NgForm;
    isDisabled = false;
    constructor(private phoneService: PhoneService,
        private phoneConfigurationService: PhoneConfigurationService,
        private phoneOptionService: PhoneOptionsService,
        private toastr: ToastrService) {
    }

    /**
     * check for licensed vendors
     */
    getLicensedVendores() {
        this.licensedVendores = this.phoneOptionService.getLicensedVendores();
        for (let i = 0; i < this.vendors.length; i++) {
            let ismatch = false;
            for (let j = 0; j < this.licensedVendores.length; j++) {
                if (this.vendors[i].name == this.licensedVendores[j]) {
                    ismatch = true;
                    this.vendors[i].disabled = false;
                    this.newList.push(this.vendors[i]);
                    break;
                }
            }
            if (!ismatch) {
                this.vendors[i].disabled = true;
                this.newList.push(this.vendors[i]);
            }
        }
    }

    ngOnInit() {
        this.phone.remoteCaptureUsername = 'Polycom';
        this.phone.remoteCapturePort = '2002';
        this.phone.remoteCaptureInterface = 'eth0';
        this.phone.remoteCapturePassword = null;
        this.vendors = this.phoneOptionService.getAvailableOptions().vendors.filter((e: any) => e.name != 'Cisco');
        this.relaysList = this.phoneOptionService.fetchRelayList;
        this.getLicensedVendores();
    }

    /**
     * on create phone
     */
    createPhone() {
        this.isDisabled = true;
        this.phone.linesList = this.linesList;
    
        this.phone.oprDto = (this.phone.onPOINTOprId !== '' && this.phone.onPOINTOprId !== null) ?
            this.relaysList.filter(e => e.id === this.phone.onPOINTOprId)[0] : null;
        if (this.selectedVendor) {
            this.phone.vendor = this.selectedVendor.name;
        }
        this.phoneService.createPhone(this.phone).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to create a new phone: ' + response.response.message, 'Error');
                this.isDisabled = false;
            } else {
                if(response.response.subscription){
                    if(response.response.subscription!='ok'){
                        this.toastr.error(response.response.subscription);
                   }
                }
                this.phone.id = response.response.id;
                this.toastr.success('Phone created successfully', 'Success');
                this.phoneConfigurationService.phoneCreated.emit();
            }
        });
    }

    addToRecents(id: any) {
        let recentsArray: any = [];
        if (localStorage.getItem('recentsArray')) {
            recentsArray = JSON.parse(localStorage.getItem('recentsArray'));
        } else {
            recentsArray = [];
        }
        if (recentsArray.length > 4) {
            recentsArray.shift();
        }
        recentsArray.push(id);
    }

    /**
     * add line
     */
    addLine() {
        this.linesBk = JSON.parse(JSON.stringify(this.linesList));
        this.lineCount++;
        this.linesList = JSON.parse(JSON.stringify(this.linesBk));
        this.linesList.push(this.newLine);
        this.newLine = {};
        this.linesBk = JSON.parse(JSON.stringify(this.linesList));
    }

    /**
     * on delete line
     * @param index: number
     */
    deleteLine(index) {
        this.lineCount--;
        this.linesList.splice(index, 1);
        this.linesBk = JSON.parse(JSON.stringify(this.linesList));
    }


    /**
     * on selecting the vendor
     * @param vendorId selected vendor id
     */
    onSelectVendor(vendorId: any) {
        // if Vendor is not Poly, then set Remote PCAP Username, Password, Port & Interfaceas null
        if (vendorId != 2) {
            this.phone.remoteCaptureUsername =
                this.phone.remoteCapturePassword =
                this.phone.remoteCapturePort =
                this.phone.remoteCaptureInterface = null;
        } else if (vendorId == 2) {         // if Vendor is Poly, then set default values for Remote PCAP Username, Port & Interface
            this.phone.remoteCaptureUsername = 'Polycom';
            this.phone.remoteCapturePort = '2002';
            this.phone.remoteCaptureInterface = 'eth0';
            this.phone.remoteCapturePassword = null;
        }
        this.selectedVendorId = vendorId;
        // this.selectedModelId = 0;
        this.selectedSubModelId = 0;
        if (vendorId != 0) {
            this.models = (this.vendors.filter(e => e.id == vendorId)[0])['models'];
            this.submodels = null;
        } else {
            this.models = null;
            this.submodels = null;
        }
        this.attributeParser();
    }

    /**
     * on selecting the model
     * @param model_id selected model id
     */
    isPolyRequired : boolean= false;
    onSelectModel(model_id: any) {
        // this.selectedModelId = model_id;
        this.selectedSubModelId = 0;
        if(model_id==2){
            this.isPolyRequired=true;
        }
        //  else{
        //     this.isPolyRequired=true;
        // }
        if (model_id != 0) {
            this.submodels = this.selectedVendor.models.filter(model => model.id == model_id)[0]['submodels'];
        } else {
            this.submodels = null;
        }
        this.attributeParser();
    }

    /**
     * on selecting the sub-model
     * @param submodel_id selected sub-model id
     */
    onSelectSubModel(submodel_id: number) {
        this.selectedSubModelId = submodel_id;
        this.attributeParser();
    }

    /**
     * hide modal
     */
    hideModal() {
        this.phoneConfigurationService.hideModal.emit();
    }

    attributeParser() {
        if (this.selectedVendorId != 0) {
            // fetch the particular vendor based upon the selected vendor id
            this.selectedVendor = this.vendors.filter(e => e.id == this.selectedVendorId)[0];
            if (this.model != 0) {
                // fetch the particular model with respective selected model id
                if(this.selectedVendor.models){
                   this.selectedModel = this.selectedVendor.models.filter(model => model.id == this.selectedModel)[0];
                }
                if (this.selectedSubModelId != 0) {
                    // fetch the particular sub-model with respective selected sub-model id
                    this.selectedSubModel = this.selectedModel.submodels.filter(sub => sub.id == this.selectedSubModelId)[0];
                }
            }
            // if (this.selectedModelId != 0) {
            //     // fetch the particular model with respective selected model id
            //     this.selectedModel = this.selectedVendor.models.filter(model => model.id == this.selectedModelId)[0];
            //     if (this.selectedSubModelId != 0) {
            //         // fetch the particular sub-model with respective selected sub-model id
            //         this.selectedSubModel = this.selectedModel.submodels.filter(sub => sub.id == this.selectedSubModelId)[0];
            //     }
            // }
        }
    }

    /**
     * on change relay
     */
    onChangeRelay(item: any): void {
        if (!item) {
            this.phone.onPOINTOprId = null;
        }
        this.addPhoneForm.control.markAsDirty();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
