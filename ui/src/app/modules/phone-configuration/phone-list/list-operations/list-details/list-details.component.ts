import { Component, OnDestroy, OnInit } from '@angular/core';
import { PhoneListService } from 'src/app/services/phone-list.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-list-details',
    templateUrl: './list-details.component.html',
    styleUrls: ['./list-details.component.css']
})
export class ListDetailsComponent implements OnInit, OnDestroy {
    list: any = { phones: [] };
    phones: any;
    subscription: Subscription;
    private totalPortions: number;
    phoneColumns: any = [];
    isRequestCompleted: boolean;

    constructor(private phoneListService: PhoneListService, private toastr: ToastrService) {
        this.isRequestCompleted = false;
    }

    ngOnInit() {
        this.isRequestCompleted = false;
        this.subscription = this.phoneListService.getPhoneListById(this.phoneListService.getList().id).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Error acquiring list: ' + response.message, 'Error');
                this.isRequestCompleted = true;

            } else {
                this.list = response.response.phonePool;
                this.isRequestCompleted = true;
            }
        }, () => {
        this.isRequestCompleted = true;
        });
        this.initGridProperties();
        this.getWidthPortions();
    }

    getColor(state: string, vendor?: string) {
        if (state && vendor.toLowerCase() === 'cisco') {
            switch (state.toLowerCase()) {
                case 'available':
                    return '#0E8B18';
                case 'offline':
                    return '#CB3333';
            }
        }
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    getWidthPortions() {
        this.totalPortions = 0;
        this.phoneColumns.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    initGridProperties() {
        this.phoneColumns = [
            { field: 'name', header: 'Name', width: 15, suppressHide: true },
            { field: 'mac', header: 'MAC', width: 15, suppressHide: true },
            { field: 'ipAddress', header: 'IP Address', width: 15, suppressHide: true },
            { field: 'user', header: 'BroadSoft User(Primary)', width: 15, suppressHide: true },
            { field: 'extension', header: 'Extension', width: 10, suppressHide: true },
            { field: 'primaryDid', header: 'DID', width: 10, suppressHide: false, filter: '' },
            { field: 'vendor', header: 'Vendor', width: 10, suppressHide: true },
            { field: 'phoneState', header: 'State', width: 10, suppressHide: true },
        ];
    }

    hideModal() {
        this.phoneListService.listOperationsHide.emit();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
