import {Component, Input, OnInit} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {AutomationEditorService} from 'src/app/services/automation-editor.service';

@Component({
    selector: 'actions-modal',
    templateUrl: './actions-modal.component.html',
    styleUrls: ['./actions-modal.component.css']
})
export class ActionsModalComponent implements OnInit {

    @Input() title: string = '';

    constructor(public modalRef: BsModalRef, public modalService: BsModalService, private aeService: AutomationEditorService) {
    }

    ngOnInit() {
    }

    insertAction() {
        this.aeService.generateAction.emit();
        if (this.modalRef) {
            this.modalRef.hide();
        }
    }
}
