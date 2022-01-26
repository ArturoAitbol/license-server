import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AutomationEditorService} from '../../../../services/automation-editor.service';
import {Phone} from '../../../../model/phone';

@Component({
    selector: 'app-validate-play-audio',
    templateUrl: './validate-play-audio.component.html',
    styleUrls: ['./validate-play-audio.component.css']
})
export class ValidatePlayAudioComponent implements OnInit, OnDestroy {

    action: any;
    subscription: Subscription;
    resources: any;
    selectedPhone: any = '';
    url: any = '';
    actionToEdit: any = {};
    continueOnFailure: boolean = false;
    constructor(private aeService: AutomationEditorService) {
    }

    ngOnInit() {
        this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
        this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: Phone) => e.vendor.toLowerCase() === 'yealink');
        if (this.actionToEdit) {
            this.selectedPhone = this.actionToEdit.phone;
            this.url = this.actionToEdit.value;
            this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
        }
        this.subscription = this.aeService.generateAction.subscribe(() => {
            this.insertAction();
        });
    }

    insertAction() {
        this.createAction();
        this.aeService.insertAction.emit(this.action);
    }

    cancel() {
        this.aeService.cancelAction.emit();
    }

    createAction() {
        const item = {action: 'play_audio', phone: this.selectedPhone, value: this.url, continueonfailure: this.continueOnFailure};
        let query = `${this.selectedPhone}.playAudio(url='${this.url}'`;
        if( this.continueOnFailure !=null){
            query += `,"${this.continueOnFailure}"`;
        }
        query += ')';
        this.action = {action: item, query: query};
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }


}
