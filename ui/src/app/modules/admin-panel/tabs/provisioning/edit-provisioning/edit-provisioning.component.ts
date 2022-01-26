import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProvisioningService } from 'src/app/services/provisioning.service';
import { ToastrService } from 'ngx-toastr';
import { CallServer } from '../../../../../model/call-server';
import { PhoneOptionsService } from 'src/app/services/phone-options.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-edit-provisioning',
    templateUrl: './edit-provisioning.component.html',
    styleUrls: ['./edit-provisioning.component.css']
})
export class EditProvisioningComponent implements OnInit, OnDestroy {
    instance: CallServer = new CallServer();
    subscription: Subscription;
    vendors: any = [];
    models: any = [];
    protocolList: any = [];
    relaysList: any = [];
    @ViewChild('instanceForm', { static: true }) instanceForm: NgForm;

    constructor(private provisioningService: ProvisioningService,
        private phoneOptionService: PhoneOptionsService,
        private toastService: ToastrService) {
    }

    ngOnInit() {
        this.relaysList = this.phoneOptionService.fetchRelayList;
        this.protocolList = ['TLS', 'TCP'];
        this.instance = this.provisioningService.getInstance();
        this.getInstanceDetails();
    }

    /**
     * get instance details
     */
    getInstanceDetails(): void {
        this.provisioningService.getInstanceId(this.instance.id).subscribe((response: any) => {
            this.instance = response.response.callServer;
            this.instance['connectionProtocol'] = (this.instance.connectionProtocol) ? this.instance.connectionProtocol : 'TCP';
            this.instance.onPOINTOprId = (this.instance.oprDto) ? this.instance.oprDto.id : null;
        });
    }

    /**
     * close the modal
     */
    closeModal(): void {
        this.provisioningService.closeModal.emit();
    }

    /**
     * update the call server
     */
    updateInstance(): void {
        this.instance.oprDto = (this.instance.onPOINTOprId !== '' && this.instance.onPOINTOprId !== null) ?
            this.relaysList.filter(e => e.id === this.instance.onPOINTOprId)[0] : null;
        this.provisioningService.updateInstance(this.instance).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error('Error trying to edit instance: ' + response.response.message, 'Error');
            } else {
                this.toastService.success('Instance updated successfully', 'Success');
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
