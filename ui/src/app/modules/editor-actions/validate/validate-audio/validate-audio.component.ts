import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-validate-audio',
  templateUrl: './validate-audio.component.html',
  styleUrls: ['./validate-audio.component.css']
})
export class ValidateAudioComponent implements OnInit {

  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = ""
  public title: string = "";
  actionToEdit: any = {};
  continueOnFailure: boolean = false;
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    // this.resources = this.aeService.getFilteredResources(["Phone", "Server", "Router"]);
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor === 'Polycom');
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
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
    let item = { action: "check_audio", phone: this.selectedPhone , continueonfailure: this.continueOnFailure};
    let query = this.selectedPhone + ".checkaudio(";
    if( this.continueOnFailure !=null){
      query += `"${this.continueOnFailure}"`;
    }
    query += `)`;
    this.action = { action: item, query: query };
  }

  onSelectPhone(value: any) {

  }


  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }


}
