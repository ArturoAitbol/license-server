import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Constants } from '../../../../helpers/constants';

@Component({
    selector: 'app-modal',
    templateUrl: 'callback-timer.component.html',
    styleUrls: ['callback-timer.component.css']
})

export class CallbackTimerComponent implements OnInit {
    interval: any;
    secondsRemaining: number;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.secondsRemaining = Math.floor((Constants.REQUEST_CALLBACK_TIME_BETWEEN_REQUESTS_MS - data)/1000);
    }

    ngOnInit() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    tick(){
        if (this.secondsRemaining > 0)
            this.secondsRemaining--;
        if (this.secondsRemaining === 0){
            clearInterval(this.interval);
        }
    }

    formatTime() {
        const minutes = Math.floor(this.secondsRemaining / 60);
        const remainingSeconds = Math.floor(this.secondsRemaining % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
}