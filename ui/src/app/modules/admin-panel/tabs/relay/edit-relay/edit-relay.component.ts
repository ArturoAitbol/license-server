import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RelayService } from '../../../../../services/relay.service';

@Component({
    selector: 'app-edit-relay',
    templateUrl: './edit-relay.component.html',
    styleUrls: ['./edit-relay.component.css']
})
export class EditRelayComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    relay: any = { name: '', description: '', version: '', oprUuid: '' };

    constructor(private relayService: RelayService, private toastService: ToastrService) {
    }

    ngOnInit() {
        const relayId = this.relayService.getRelay()['id'];
        this.relayService.getParticularRelay(relayId).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error(response.response.message, 'Error');
            } else {
                this.relay = response.response.opr;
            }
        });
    }

    /**
     * close the modal
     */
    closeModal(): void {
        this.relayService.closeModal.emit();
    }

    /**
     * update the call server
     */
    updateRelay(): void {
        this.relayService.updateParticularRelay(this.relay).subscribe((response: any) => {
            if (!response.success) {
                this.toastService.error(response.response.message, 'Error');
            } else {
                this.toastService.success(response.response.message, 'Success');
                this.closeModal();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

