import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProvisioningService } from 'src/app/services/provisioning.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { VariablesDefinitionService } from 'src/app/services/variables-definition.service';
import { CallServer } from '../../../../../model/call-server';
import { PhoneOptionsService } from 'src/app/services/phone-options.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'new-provisioning',
    templateUrl: './new-provisioning.component.html',
    styleUrls: ['./new-provisioning.component.css']
})
export class NewProvisioningComponent implements OnInit, OnDestroy {
    instance: any = new CallServer();
    subscription: Subscription;
    vendors: any = [];
    models: any = [];
    protocolList: any = [];
    relaysList: any = [];
    @ViewChild('instanceForm', { static: true }) instanceForm: NgForm;

    constructor(private provisioningService: ProvisioningService,
        private toastr: ToastrService,
        private phoneOptionService: PhoneOptionsService,
        private vdService: VariablesDefinitionService) {
    }

    ngOnInit() {
        this.protocolList = ['TLS', 'TCP'];
        this.relaysList = this.phoneOptionService.fetchRelayList;
        this.getAvailableVendors();
    }

    /**
     * get the licensed vendors
     */
    getAvailableVendors(): void {
        this.vdService.getCallServerVendors().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to acquire vendors: ' + response.response.nessage, 'Error');
            } else {
                this.vendors = response.response.vendors;
            }
        });
    }

    /**
     * on select vendor
     */
    onSelectVendor(vendor: string): void {
        this.models = [];
        this.vdService.getModelsByVendor(vendor).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to acquire vendor models: ' + response.response.nessage, 'Error');
            } else {
                this.models = response.response.models;
            }
        });
    }

    /**
     * close the modal
     */
    closeModal(): void {
        this.provisioningService.closeModal.emit();
    }

    /**
     * create the call server
     */
    createInstance(): void {
        this.instance.oprDto = (this.instance.onPOINTOprId !== '' && this.instance.onPOINTOprId !== null) ?
            this.relaysList.filter(e => e.id === this.instance.onPOINTOprId)[0] : null;
        this.subscription = this.provisioningService.createInstance(this.instance).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error trying to create instance: ' + response.response.message, 'Error');
            } else {
                this.toastr.success('Instance created successfully', 'Success');
                this.provisioningService.createdInstance.emit();
            }
        });
    }

    /**
     * on change relay
     */
    onChangeRelay(item: any): void {
        if (!item) {
            this.instance.onPOINTOprId = null;
        }
        this.instanceForm.control.markAsDirty();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
