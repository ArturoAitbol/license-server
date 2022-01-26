import { Component, OnInit } from '@angular/core';
import { ProjectViewService } from 'src/app/services/project-view.service';
import { SchedulerService } from 'src/app/services/scheduler.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Component({
    selector: 'app-scheduler',
    templateUrl: './scheduler.component.html',
    styleUrls: ['./scheduler.component.css']
})
export class SchedulerComponent implements OnInit {

    projectSchedule: any = {};
    status: boolean = false;
    project: any;
    startDate: Date;
    today: Date = new Date();
    time: Date;
    serverDateTime: Date;
    recurrences: any = ['Minutes', 'Hours', 'Daily', 'Weekly', 'Monthly'];
    recurrencePattern: string = '';
    recurEvery: number;
    dayInterval: number;
    selectedWeekly: string = 'singleDaily';
    days: any = [false, false, false, false, false, false, false];  // SelectedDays
    endDate: any;
    endOccurance: number;
    endOption: string = 'occurrences';
    runType = 'once';
    runsQty: string;
    timezone: string;
    selectedDays: any = [];
    minEnd: Date;
    enableRecurrence = false;
    serverDateTimeBk: string;

    constructor(private projectService: ProjectViewService,
        private schedulerService: SchedulerService,
        private toastr: ToastrService) {
    }

    getSchedule() {
        this.schedulerService.getScheduleInfo(this.project.id).subscribe((response: any) => {
            if (!response.success) {
                this.time = new Date();
                this.serverDateTime = this.serverDateTimeBk = response.response.currentDate;
            } else {
                this.serverDateTime = this.serverDateTimeBk = response.response.currentDate;
                this.parseExisting(response.response.projectScheduler);
            }
        });
    }

    /**
     * on change Recurrence Option
     */
    onChangeEnableRecurrenceOption(): void {
        if (!this.enableRecurrence) {
            this.recurrencePattern = '';
            this.endOccurance = null;
            this.endOption = 'occurrences';
        }
    }

    /**
     * clear the run quantity
     */
    clearQty(): void {
        this.runsQty = '';
    }


    parseExisting(incomingScheduler: any) {
        this.enableRecurrence = incomingScheduler.recurPatternEnable;
        this.projectSchedule.id = incomingScheduler.id;
        if (incomingScheduler.recursiveValue === '0') {
            this.runType = 'once';
        } else if (incomingScheduler.recursiveValue !== '0') {
            this.runType = 'times';
            this.runsQty = incomingScheduler.recursiveValue;
        }
        if (incomingScheduler.status == 'disable') {
            this.status = false;
        } else {
            this.status = true;
        }
        this.startDate = new Date(incomingScheduler.startDate);
        this.minEnd = new Date(this.startDate);

        let splitTime = incomingScheduler.time.split(':');
        let hour = splitTime[0];
        let min = splitTime[1];
        let sec = splitTime[2].split(' ')[0];
        let meridian = splitTime[2].split(' ')[1];
        if (meridian == 'PM') {
            hour = +hour + 12;
        }
        this.time = new Date();
        this.time.setHours(hour);
        this.time.setMinutes(min);
        this.time.setSeconds(sec);

        this.recurrencePattern = incomingScheduler.recurrencePattern;
        if (this.recurrencePattern == 'Minutes' || this.recurrencePattern == 'Hours') {
            this.recurEvery = incomingScheduler.recurEvery;
        }

        if (this.recurrencePattern == 'Daily') {
            if (incomingScheduler.weekDay) {
                this.selectedWeekly = 'singleDaily';
                this.projectSchedule.weekDay = true;
                delete this.projectSchedule.recurEvery;
            } else {
                this.selectedWeekly = 'recursiveDaily';
                this.projectSchedule.weekDay = false;
                this.recurEvery = incomingScheduler.recurEvery;
            }
        }

        if (this.recurrencePattern == 'Weekly') {
            this.recurEvery = incomingScheduler.recurEvery;
            this.selectedDays = incomingScheduler.selectedDays;
            this.selectedDays.forEach((day: any) => {
                this.checkDay(day);
            });
        }
        if (this.recurrencePattern == 'Monthly') {
            this.recurEvery = incomingScheduler.recurEvery;
            this.dayInterval = incomingScheduler.dayInterval;
            this.projectSchedule.dayInterval = incomingScheduler.dayInterval;
        }

        if (!incomingScheduler.endDate && incomingScheduler.endOccurance == 0) {
            this.endOption = 'noEndDate';
        } else if (incomingScheduler.endOccurance > 0) {
            this.endOccurance = incomingScheduler.endOccurance;
            this.endOption = 'occurrences';
        } else {
            this.endDate = new Date(incomingScheduler.endDate);
            this.endOption = 'endDate';
        }
        if (!incomingScheduler.recurPatternEnable) {
            this.onChangeEnableRecurrenceOption();
            this.recurrencePattern = '';
        }
    }

    ngOnInit() {
        this.project = this.projectService.getProject();
        this.getSchedule();
    }

    scheduleProject() {
        this.setScheduler();
        if (this.projectSchedule.id) {
            this.updateExistingSchedule();
        } else {
            this.createSchedule();
        }
    }

    updateExistingSchedule() {
        let quantity = '0';
        if (this.runType === 'once') {
            quantity = '0';
        } else {
            quantity = this.runsQty;
        }
        this.projectSchedule.recursiveValue = quantity;
        if (this.checkForValidTime() || !this.status) {
            this.schedulerService.updateScheduledProject(this.projectSchedule).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error trying to update schedule: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success('Project schedule updated successfully', 'Success');
                    this.projectService.createdProject.emit();
                }
            });
        } else {
            this.toastr.error('Invalid Start Time', 'Error');
        }

    }

    createSchedule() {
        let quantity = '0';
        if (this.runType === 'once') {
            quantity = '0';
        } else {
            quantity = this.runsQty;
        }
        this.projectSchedule.recursiveValue = quantity;
        if (this.checkForValidTime() || !this.status) {
            this.schedulerService.scheduleProject(this.projectSchedule).subscribe((response: any) => {
                if (!response.success) {
                    this.toastr.error('Error trying to schedule project: ' + response.response.message, 'Error');
                } else {
                    this.toastr.success('Project scheduled successfully', 'Success');
                    this.projectService.createdProject.emit();
                }
            });
        } else {
            this.toastr.error('Invalid Start Time', 'Error');
        }
    }

    getParsedHours(date: Date) {
        return ((date.getHours() + 11) % 12) + 1;
    }

    getMeridian(date: Date) {
        return date.getHours() > 12 ? 'PM' : 'AM';
    }

    /**
     * compare date and time
     * @returns boolean
     */
    checkForValidTime(): boolean {
        const USER_DATE = this.startDate;
        USER_DATE.setHours(Number(this.time.getHours()));
        USER_DATE.setMinutes(Number(this.time.getMinutes()));
        USER_DATE.setSeconds(Number(this.time.getSeconds()));
        const SERVER_DATE = new Date(this.serverDateTime);
        return moment(USER_DATE).isAfter(SERVER_DATE);
    }

    /**
     * checks the user start time with server time
     * @returns: boolean
     */
    checkValidTimeOrNot(userDate: Date, userTime: Date): boolean {
        const _parsedDate = Number(userDate.getDate());
        const _parsedMonth = Number(userDate.getMonth() + 1);
        const _parsedYear = Number(userDate.getFullYear());
        // const _parsedHour = Number(this.getParsedHours(userTime));
        const _parsedHour = Number(userTime.getHours());
        const _parsedMinute = Number(userTime.getMinutes());
        const _parsedSecond = Number(userTime.getSeconds());

        const splitServerDateTime = this.serverDateTimeBk.split(' ');

        const serverDate = splitServerDateTime[0];
        const _serverDate = Number(serverDate.split('/')[1]);
        const _serverMonth = Number(serverDate.split('/')[0]);
        const _serverYear = Number(serverDate.split('/')[2]);

        const _serverTime = splitServerDateTime[1];
        // const _serverHour = Number(((+_serverTime.split(':')[0] + 11) % 12) + 1);
        const _serverHour = Number(_serverTime.split(':')[0]);
        const _serverMinute = Number(_serverTime.split(':')[1]);
        const _serverSecond = Number(_serverTime.split(':')[2]);

        if (+_parsedDate > +_serverDate && +_parsedMonth >= +_serverMonth && +_parsedYear >= +_serverYear) {
            return true;
        } else {
            if (_parsedHour > _serverHour && (this.checkUserAndServerMerdian(_parsedHour, _serverHour))
            ) {
                return true;
            } else if (_parsedHour == _serverHour) {
                if (_parsedMinute > _serverMinute) {
                    return true;
                } else if (_parsedMinute == _serverMinute) {
                    if (_parsedSecond >= _serverSecond) {
                        return true;
                    } return false;
                } return false;
            } return false;
        }
    }

    /**
     * check user and server median status
     * @returns:boolean
     */
    checkUserAndServerMerdian(parsedHour: number, serverHour: number): boolean {
        return (parsedHour >= 12 && serverHour >= 12 || parsedHour >= 12 && serverHour <= 12) ? true : false;
    }

    setDefault() {
        this.selectedWeekly = 'singleDaily';
        this.recurEvery = null;
        this.dayInterval = null;
        this.days = [false, false, false, false, false, false, false];
        this.selectedDays = [];
        delete this.projectSchedule.weekDay;
        delete this.projectSchedule.dayInterval;
        delete this.projectSchedule.selectedDays;
    }

    resetEnd() {
        this.endOccurance = null;
        this.endDate = null;
        delete this.projectSchedule.endOccurance;
        delete this.projectSchedule.endDate;
    }

    setScheduler() {
        if (this.status) {
            this.projectSchedule.status = 'enable';
        } else {
            this.projectSchedule.status = 'disable';
        }
        if (this.startDate) {
            this.projectSchedule.startDate = this.startDate.getTime();
        }

        let parsedTime = new Date(this.time);
        // tslint:disable-next-line:max-line-length
        this.projectSchedule.time = this.getParsedHours(parsedTime) + ':' + ('0' + parsedTime.getMinutes()).slice(-2) + ':' + ('0' + parsedTime.getSeconds()).slice(-2) + ' ' + this.getMeridian(parsedTime);
        this.projectSchedule.recurrencePattern = this.recurrencePattern;

        if (!this.enableRecurrence) {
            this.projectSchedule.recurEvery = 1;
            this.projectSchedule.endOccurance = 1;
            this.projectSchedule.recurrencePattern = 'MINUTES';
            this.projectSchedule.recurPatternEnable = this.enableRecurrence;
        } else if (this.enableRecurrence) {
            if (this.recurrencePattern == 'Minutes' || this.recurrencePattern == 'Hours') {
                this.projectSchedule.recurEvery = this.recurEvery;
            }
            if (this.recurrencePattern == 'Daily') {
                if (this.selectedWeekly.toLowerCase() == 'recursivedaily') {
                    this.projectSchedule.weekDay = false;
                    this.projectSchedule.recurEvery = this.recurEvery;
                } else {
                    this.projectSchedule.weekDay = true;
                    delete this.projectSchedule.recurEvery;
                }
            }
            if (this.recurrencePattern == 'Weekly') {
                this.projectSchedule.recurEvery = this.recurEvery;
                this.projectSchedule.selectedDays = this.selectedDays;
            }
            if (this.recurrencePattern == 'Monthly') {
                this.projectSchedule.dayInterval = this.dayInterval;
                this.projectSchedule.recurEvery = this.recurEvery;
            }

            if (this.endOption == 'noEndDate') {
                delete this.projectSchedule.endOccurance;
                delete this.projectSchedule.endDate;
            } else if (this.endOption == 'occurrences') {
                this.projectSchedule.endOccurance = this.endOccurance;
            } else {
                this.projectSchedule.endDate = this.endDate.getTime();
            }
            this.projectSchedule.recurPatternEnable = this.enableRecurrence;
        }

        this.projectSchedule.projectDto = {
            id: this.project.id,
            name: this.project.name
        };
    }

    closeModal() {
        this.projectService.cancelEdit.emit();
    }

    startDateSelected() {
        this.minEnd = new Date(this.startDate);
    }

    checkSelectedDays(event: any, value: string) {
        if (event) {
            this.selectedDays.push(value);
        } else {
            this.selectedDays.splice(this.selectedDays.indexOf(value), 1);
        }
    }

    checkDay(day: any) {
        switch (day) {
            case 'SUN':
                this.days[0] = true;
                break;
            case 'MON':
                this.days[1] = true;
                break;
            case 'TUE':
                this.days[2] = true;
                break;
            case 'WED':
                this.days[3] = true;
                break;
            case 'THU':
                this.days[4] = true;
                break;
            case 'FRI':
                this.days[5] = true;
                break;
            case 'SAT':
                this.days[6] = true;
                break;
        }
    }

    ocurrencesSelected() {
        this.projectSchedule.endDate = undefined;
    }
}
