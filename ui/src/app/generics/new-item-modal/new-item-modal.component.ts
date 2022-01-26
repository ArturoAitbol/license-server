import {Component, Input, OnInit} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {TestsViewService} from 'src/app/services/tests-view.service';
import {ProjectViewService} from 'src/app/services/project-view.service';
import {AdminPanelService} from 'src/app/services/admin-panel.service';
import {UserService} from 'src/app/services/user.service';

@Component({
    selector: 'new-item-modal',
    templateUrl: './new-item-modal.component.html',
    styleUrls: ['./new-item-modal.component.css']
})
export class NewItemModalComponent implements OnInit {

    @Input() title: string = '';
    @Input() type: string;
    @Input() modalValidator: string;

    constructor(public modalRef: BsModalRef,
                public modalService: BsModalService,
                private testsViewService: TestsViewService,
                private projectService: ProjectViewService,
                private adminPanelService: AdminPanelService,
                private userService: UserService) {
    }

    ngOnInit() {
    }

    createNew() {
        switch (this.type) {
            case 'test':
                this.testsViewService.createNewTest.emit();
                break;
            case 'project':
                this.projectService.createNewProject.emit();
                break;
            case 'user':
                this.adminPanelService.createNewUser.emit();
                break;
            case 'editPassword':
                this.userService.editPassword.emit();
                break;

            case 'edit_project':
                this.projectService.editedProject.emit();
                break;
        }
        if (this.modalRef) {
            this.modalRef.hide();
        }
    }
}
