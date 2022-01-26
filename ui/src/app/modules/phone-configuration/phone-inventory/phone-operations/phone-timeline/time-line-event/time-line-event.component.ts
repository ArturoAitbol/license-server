import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { PhoneConfigurationService } from '../../../../../../services/phone-configuration.service';

@Component({
    selector: 'timeline-event',
    templateUrl: './time-line-event.component.html',
    styleUrls: ['./time-line-event.component.css']
})

export class TimeLineEventComponent implements OnInit, AfterViewInit {
    @Input('event') event: any;
    @Input('index') index: any;
    @Input('detailed') detailed: boolean;
    @Input('lastIndex') lastIndex: number;
    @Input('colorsData') colorsData: any;
    defaultColors: any = {
        'reboot': '#fb7125',
        'connection_to_onpoint': '#0E8B18',
        'firmware_upgrade': '#7694B7',
        'configuration_change': '#F2D810'
    };
    activeClass = 'inactive';
    position: string;
    isOpen: boolean = false;
    bgColor: string = '';

    constructor(private phoneConfigurationService: PhoneConfigurationService) {
    }

    ngOnInit() {
        this.defaultColors = this.colorsData;
        if (this.index % 2 == 0) {
            this.position = 'rotatedUp';
        } else {
            this.position = 'rotatedDown';
        }
        if (this.lastIndex - 1 == this.index) {
            this.isOpen = true;
            this.activeClass = 'active';
            this.bgColor = this.getColor();
        }

        this.phoneConfigurationService.onChangeEventColor.subscribe((response: any) => {
            if (this.lastIndex - 1 == this.index) {
                this.isOpen = false;
                this.activeClass = 'inactive';
                this.bgColor = this.getColor();
            }
            this.defaultColors = response.defaultColors;
            if (this.lastIndex - 1 == this.index) {
                this.isOpen = true;
                this.activeClass = 'active';
                this.bgColor = this.getColor();
            }
        });
        if (this.event.type.toLowerCase() == 'firmware_upgrade') {
            this.event.details = this.event.details.replace(new RegExp(',', 'g'), '\n');
        }

        if (this.event.type.toLowerCase() == 'configuration_change') {
            this.event.details = 'Configuration Change';
        }
    }

    ngAfterViewInit() {
        if (this.lastIndex - 1 == this.index) {
            let elmnt = document.getElementById('event-' + this.index);
            elmnt.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
    }

    getColor() {
        switch (this.event.type.toLowerCase()) {
            case 'reboot':
                return this.defaultColors['reboot'];
            case 'connection_to_onpoint':
                return this.defaultColors['connection_to_onpoint'];
            case 'firmware_upgrade':
                return this.defaultColors['firmware_upgrade'];
            case 'configuration_change':
                return this.defaultColors['configuration_change'];
        }
    }

    changeStyle(event: any) {
        this.activeClass = event.type == 'mouseover' ? 'active' : 'inactive';
        if (this.activeClass == 'active') {
            this.bgColor = this.getColor();
        } else {
            this.bgColor = 'none';
        }
    }
}
