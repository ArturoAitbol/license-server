import { Component, OnInit, ViewChild } from '@angular/core';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { PhoneService } from 'src/app/services/phone.service';
import { ToastrService } from 'ngx-toastr';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { SpinnerComponent } from 'src/app/generics/spinner/spinner.component';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-phone-timeline',
    templateUrl: './phone-timeline.component.html',
    styleUrls: ['./phone-timeline.component.css']
})
export class PhoneTimelineComponent implements OnInit {
    private colorSubject: BehaviorSubject<any> = new BehaviorSubject('');
    @ViewChild('spinner', { static: true }) spinner: SpinnerComponent;
    eventLegends: any;
    originalEvents: any;
    eventTypes: any;
    selectedEvent: any = 'all';
    phone: any;
    events: any = [];
    startDate: any;
    endDate: any;
    rangePickerValue: Date[];
    minDate = new Date();
    maxDate = new Date();
    showSpinner: boolean;
    detailed = false;
    imgSrc = 'assets/images/loading.gif';
    defaultColor = '#00000';
    defaultColors: any = {
        'reboot': '#fb7125',
        'connection_to_onpoint': '#0E8B18',
        'firmware_upgrade': '#7694B7',
        'configuration_change': '#F2D810'
    };
    defaultColorsBK: any = {
        'reboot': '#fb7125',
        'connection_to_onpoint': '#0E8B18',
        'firmware_upgrade': '#56B6CA',
        'configuration_change': '#F2D810'
    };
    isPopupOpen: boolean;
    selectedType: string;
    pickupColors: string[] = ['#fb7125', '#0E8B18', '#7694B7', '#F2D810', '#D0021B', '#F8E71C', '#8B572A', '#7ED321', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#4A4A4A', '#9B9B9B'];
    constructor(private phoneConfigurationService: PhoneConfigurationService,
        private phoneService: PhoneService,
        private toastr: ToastrService,
        private excelExportService: ExcelExportService) {
        this.isPopupOpen = false;
        this.selectedType = '';
    }

    hideModal() {
        this.phoneConfigurationService.phoneOperationsHide.emit();
    }

    /**
     * to select the color
     * @param event: any
     */
    changeColor(event: any): void {
        const selectedColor = event.color.hex;
        this.defaultColor = selectedColor;
        this.defaultColors[this.selectedType.toLowerCase()] = selectedColor;
        this.phoneConfigurationService.onChangeEventColor.emit({ defaultColors: this.defaultColors });
        this.getColor(this.selectedType);
    }

    saveDefaultColorsToLocal(): void {
        this.setColorsDataInLocalStorage(this.defaultColors);
        if (this.isPopupOpen) {
            this.isPopupOpen = false;
        }
    }

    getColorsDataInLocalStorage(): any {
        return localStorage.getItem('timeLineColors');
    }

    setColorsDataInLocalStorage(obj: any): void {
        localStorage.setItem('timeLineColors', JSON.stringify(obj));
    }

    /**
     * close the color pop-up
     */
    closeColorPopup(): void {
        if (this.getColorsDataInLocalStorage()) {
            this.resetColors();
            this.phoneConfigurationService.onChangeEventColor.emit({ defaultColors: this.defaultColorsBK });
        }
        if (this.isPopupOpen) {
            this.isPopupOpen = false;
        }
    }

    resetColors(): void {
        this.defaultColorsBK = this.defaultColors = JSON.parse(this.getColorsDataInLocalStorage());
    }


    /**
     * open the color pop-up
     */
    openColorPopup(type: string): void {
        this.selectedType = type;
        if (this.isPopupOpen) {
            this.isPopupOpen = false;
        }
        if (!this.isPopupOpen) {
            this.isPopupOpen = true;
        }
    }

    loadTypes() {
        this.phoneService.getEventTypes().subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Can\'t load event types: ' + response.response.message, 'Error');
            } else {
                this.eventTypes = response.response.eventTypes;
            }
        });
    }

    loadEvents(initDate: any, endDate: any) {
        this.showSpinner = true;
        this.phoneService.getEventsByDate(this.phone.id, initDate, endDate).subscribe((response: any) => {
            if (!response.success) {
                this.toastr.error('Can\'t load events: ' + response.response.message, 'Error');
            } else {
                this.events = response.response.phoneEvents;
                // this.events.reverse();
                this.events.forEach(event => {
                    delete event.phoneDto;
                });
                this.originalEvents = JSON.parse(JSON.stringify(this.events));
                this.mapLegends();
                this.showSpinner = false;
            }
        });
    }

    getDateRange(phone: any) {
        this.phoneService.getDateRange(phone).subscribe((response: any) => {
            const initDate = new Date(response.response.firstDate);
            this.minDate = new Date(initDate.setDate(initDate.getDate() - 1));
            const endDate = new Date(response.response.lastDate);
            const dayBefore = endDate.setDate(endDate.getDate() - 1);
            this.maxDate = new Date(endDate.setDate(endDate.getDate() + 2));
            this.loadEvents(dayBefore, response.response.lastDate);
        });
    }

    ngOnInit() {
        if (localStorage.getItem('timeLineColors')) {
            this.resetColors();
        }
        this.phone = this.phoneConfigurationService.getPhone();
        this.getDateRange(this.phone);
        if (this.phone.subModel != null) {
            this.imgSrc = 'assets/images/phones/' + this.phone.subModel + '.png';
        } else {
            this.imgSrc = 'assets/images/phones/generic.png';
        }
        this.loadTypes();
    }

    getColor(event: string) {
        switch (event.toLowerCase()) {
            case 'reboot':
                return this.defaultColors[event.toLowerCase()];
            case 'connection_to_onpoint':
                return this.defaultColors[event.toLowerCase()];
            case 'firmware_upgrade':
                return this.defaultColors[event.toLowerCase()];
            case 'configuration_change':
                return this.defaultColors[event.toLowerCase()];
        }
    }

    filterEvents() {
        this.showSpinner = true;
        this.events = this.originalEvents;
        if (this.selectedEvent !== 'all') {
            this.events = this.events.filter((event: any) => {
                return event.type === this.selectedEvent;
            });
        }
        // if (this.startDate !== undefined && this.endDate !== undefined) {
        //     this.events = this.events.filter((event: any) => {
        //         if (event.date >= this.startDate && event.date <= this.endDate) {
        //             return event;
        //         }
        //     });
        // }
        this.showSpinner = false;
        this.mapLegends();
    }

    selectedDates(changedDate: any) {
        if (changedDate) {
            this.startDate = changedDate[0].setHours(0, 0, 0, 0);
            this.endDate = changedDate[1].setHours(0, 0, 0, 0);
            this.loadEvents(this.startDate, this.endDate);
            this.filterEvents();
        }
    }

    clearDates() {
        this.rangePickerValue = null;
        this.startDate = undefined;
        this.endDate = undefined;
        this.filterEvents();
    }

    mapLegends() {
        this.eventLegends = this.events.map((object: any) => {
            return object.type;
        });
        this.eventLegends = this.eventLegends.filter((event: any, index) => {
            // tslint:disable-next-line:triple-equals
            return this.eventLegends.indexOf(event) == index;
        });
    }

    downloadEvents() {
        const downloadableEvents: any = JSON.parse(JSON.stringify(this.originalEvents));
        downloadableEvents.forEach((event: any) => {
            delete event.id;
            delete event.macAddress;
            delete event.updateStatus;
            event.date = new Date(event.date);
        });
        this.excelExportService.exportAsExcelFile(downloadableEvents, this.phone.name);
    }
}
