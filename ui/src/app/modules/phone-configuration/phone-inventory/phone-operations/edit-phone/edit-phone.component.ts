import { Component, OnInit, ViewChild } from '@angular/core';
import { PhoneService } from 'src/app/services/phone.service';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { PhoneOptionsService } from 'src/app/services/phone-options.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap';
import { Phone } from 'src/app/model/phone';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-edit-phone',
    templateUrl: './edit-phone.component.html',
    styleUrls: ['./edit-phone.component.css']
})

export class EditPhoneComponent implements OnInit {

    phone: Phone;
    subscription: Subscription;
    linesList: any = [];
    lineCount: number = 0;
    newLine: any = {};
    vendors: any;
    licensedVendores: any;
    models: any;
    submodels: any;
    selectedVendorId: number = 0;
    selectedModelId: number = 0;
    selectedSubModelId: number = 0;
    selectedVendor: any;
    selectedModel: any;
    selectedSubModel: any;
    modalRef: BsModalRef;
    newList: any = [];
    linesBk: any = [];
    relaysList: any = [];
    @ViewChild('phoneForm', { static: true }) editPhoneForm: NgForm;
    isMPPRequired: boolean = false;
    freezeMAC:boolean;
    model: any;
    constructor(private phoneService: PhoneService,
        private phoneConfigurationService: PhoneConfigurationService,
        private phoneOptionService: PhoneOptionsService,
        private toastr: ToastrService) {
    }

    /**
     * load phone details
     */
    loadPhone(phoneId: any) {
        this.phoneService.getPhoneById(phoneId).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to load phone details:' + response.response.message);
                this.hideModal();
            } else {
                this.phone = response.response.phone;
                if (this.phone.callServerUnManged) {
                    this.vendors = this.phoneOptionService.getAvailableOptions().vendors;
                    this.newList = [];
                    this.getLicensedVendores();
                }
                this.phone.onPOINTOprId = (this.phone.oprDto) ? this.phone.oprDto.id : null;
                this.linesList = this.phone.linesList;
                this.linesBk = JSON.parse(JSON.stringify(this.linesList));
                this.lineCount = this.linesList.length;
                this.loadInitialPhoneData();
            }
        });
    }


    ngOnInit() {
        this.vendors = this.phoneOptionService.getAvailableOptions().vendors
        this.relaysList = this.phoneOptionService.fetchRelayList;
        this.getLicensedVendores();
        this.phone = this.phoneConfigurationService.getPhone();
        this.loadPhone(this.phoneConfigurationService.getPhone().id);
    }

    /**
     * check for licensed vendors
     */
    getLicensedVendores() {
        this.licensedVendores = this.phoneOptionService.getLicensedVendores();
        for (let i = 0; i < this.vendors.length; i++) {
            let ismatch = false;
            for (let j = 0; j < this.licensedVendores.length; j++) {
                // tslint:disable-next-line: triple-equals
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

    /**
     * load vendor details
     */
    loadInitialPhoneData() {
        // tslint:disable-next-line: triple-equals
        this.selectedVendorId = this.vendors.find(vendor => vendor.name == this.phone.vendor).id;
        this.onSelectVendor(this.selectedVendorId);
    }

    /**
     * on change vendor
     * @param vendorId: any
     */
    onSelectVendor(vendorId: any) {
        // if Vendor is not Poly, then set Remote PCAP username,password & port as null
        if (vendorId != 2) {
            this.phone.remoteCaptureUsername =
                this.phone.remoteCapturePassword =
                this.phone.remoteCapturePort =
                this.phone.remoteCaptureInterface = null;
        } else if (vendorId == 2) {   // if Vendor is Poly, then set default values for Remote PCAP Username, Port & Interface
            this.phone.remoteCaptureUsername = (this.phone.remoteCaptureUsername) ? this.phone.remoteCaptureUsername : 'Polycom';
            this.phone.remoteCapturePort = (this.phone.remoteCapturePort) ? this.phone.remoteCapturePort : '2002';
            this.phone.remoteCaptureInterface = (this.phone.remoteCaptureInterface) ? this.phone.remoteCaptureInterface : 'eth0';
            this.phone.remoteCapturePassword = (this.phone.remoteCapturePassword) ? this.phone.remoteCapturePassword : null;
        }
        this.selectedVendorId = vendorId;
        this.selectedModelId = 0;
        this.model = 0;
        this.selectedSubModelId = 0;
        // tslint:disable-next-line: triple-equals
        if (vendorId != 0) {
            // tslint:disable-next-line: triple-equals
            this.models = (this.vendors.filter(e => e.id == vendorId)[0])['models'];
            if (this.phone.model) {
                const model = this.models.filter(e => e.name == this.phone.model)[0]['id']
                this.selectedModelId = model ? model : 0;
            }
            this.submodels = null;
        } else {
            this.selectedVendorId = 0;
            this.models = null;
            this.submodels = null;
        }
        this.attributeParser();
    }

    /**
     * on change model
     * @param model_id: any
     */
    onSelectModel(model_id: any) {
        this.selectedModelId = model_id;
        this.selectedSubModelId = 0;
        if (model_id == 1) {
            this.isMPPRequired = true;
        } else {
            this.isMPPRequired = false;
        }
        // tslint:disable-next-line: triple-equals
        if (model_id != 0) {
            // tslint:disable-next-line: triple-equals
            this.submodels = this.selectedVendor.models.filter(model => model.id == model_id)[0]['submodels'];
        } else {
            this.submodels = null;
        }
        this.attributeParser();
    }

    /**
     * on change sub model
     * @param submodel_id: number
     */
    onSelectSubModel(submodel_id: number) {
        this.selectedSubModelId = submodel_id;
        this.attributeParser();
    }

    /**
     * hide modal
     */
    hideModal() {
        this.phoneConfigurationService.phoneOperationsHide.emit();
    }

    attributeParser() {
        // tslint:disable-next-line: triple-equals
        if (this.selectedVendorId != 0) {
            // fetch the particular vendor based upon the selected vendor id
            // tslint:disable-next-line: triple-equals
            this.selectedVendor = this.vendors.filter(e => e.id == this.selectedVendorId)[0];
            // tslint:disable-next-line: triple-equals
            if (this.selectedModelId != 0) {
                // fetch the particular model with respective selected model id
                // tslint:disable-next-line: triple-equals
                this.selectedModel = this.selectedVendor.models.filter(model => model.id == this.selectedModelId)[0];
                // tslint:disable-next-line: triple-equals
                if (this.selectedSubModelId != 0) {
                    // fetch the particular sub-model with respective selected sub-model id
                    // tslint:disable-next-line: triple-equals
                    this.selectedSubModel = this.selectedModel.submodels.filter(sub => sub.id == this.selectedSubModelId)[0];
                }
            }
        }
    }

    /**
     * add line
     */
    addLine() {
        this.lineCount++;
        this.linesList = JSON.parse(JSON.stringify(this.linesBk));
        this.linesList.push(this.newLine);
        this.newLine = {};
        this.linesBk = JSON.parse(JSON.stringify(this.linesList));
    }

    /**
     * on update phone
     */
    updatePhone() {
        this.phone.linesList = this.linesList;
        this.phone.oprDto = (this.phone.onPOINTOprId !== '' && this.phone.onPOINTOprId !== null) ?
            this.relaysList.filter(e => e.id === this.phone.onPOINTOprId)[0] : null;
        if (this.selectedVendor) {
            this.phone.vendor = this.selectedVendor.name;
        }
        // if(this.model){
        //     this.phone.model = this.submodels.name;
        // }
        if (this.selectedModel) {
            this.phone.model = this.selectedModel.name;
        }
        if (this.selectedSubModel) {
            this.phone.subModel = this.selectedSubModel.name;
        }
        this.phoneService.updatePhone(this.phone).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to update phone: ' + response.response.message, 'Error');
            } else {
                this.toastr.success('Phone updated successfully', 'Success');
                this.phoneConfigurationService.phoneCreated.emit();
            }
        });
    }

    /**
     * on delete line
     */
    deleteLine(index) {
        this.lineCount--;
        this.linesList.splice(index, 1);
        this.linesBk = JSON.parse(JSON.stringify(this.linesList));
        this.editPhoneForm.control.markAsDirty();
    }

    /**
     * on change relay
     */
    onChangeRelay(item: any): void {
        if (!item) {
            this.phone.onPOINTOprId = null;
        }
        this.editPhoneForm.control.markAsDirty();
    }

    /**
     * validate form based on lines & model
     */
    canUpdateForm(): boolean {
        if (this.selectedModelId != 2 && this.linesList.lenght != 0) { return false; }
        else if (this.linesList.lenght == 0) { return true; }
        return false;
    }
}
