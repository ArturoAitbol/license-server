import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';

@Component({
  selector: 'app-simulate-touch',
  templateUrl: './simulate-touch.component.html',
  styleUrls: ['./simulate-touch.component.css']
})
export class SimulateTouchComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  public title: string = '';
  actionToEdit: any = {};
  selectedType: any = '';
  duration: string;
  easing: number;
  xCoordinates: string;
  yCoordinates: string;
  actionTypeList: string[];
  private polyActionTypeList: string[] = ['Tap', 'Press', 'Release'];
  private yealinkActionTypeList: string[] = ['Click', 'Down', 'Up'];
  selectedResourceType: string = 'polycom';
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    // tslint:disable-next-line: triple-equals
    this.resources = this.aeService.getFilteredResources(['Phone']).filter(e => e.vendor == 'Polycom' || e.vendor === 'Yealink');
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    this.actionTypeList = this.polyActionTypeList;
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      const vendor: string = this.resources.filter((e: Phone) => e.name === this.selectedPhone)[0]['vendor'];
      this.selectedResourceType = vendor.toLowerCase();
      if (vendor.toLowerCase() === 'yealink') {
        this.actionTypeList = this.yealinkActionTypeList;
      } else if (vendor.toLowerCase() === 'polycom') {
        this.actionTypeList = this.polyActionTypeList;
      }
      this.selectedType = this.actionToEdit.touchType;
      this.xCoordinates = this.actionToEdit.xCoordinat;
      this.yCoordinates = this.actionToEdit.yCoordinat;
      this.duration = this.actionToEdit.duration;
      this.easing = (this.actionToEdit.easing) ? Number(this.actionToEdit.easing) : null;
      // tslint:disable-next-line: triple-equals
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
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

  /**
     * on change resoure
     */
  onChangeResource(): void {
    const vendor: string = this.resources.filter((e: Phone) => e.name === this.selectedPhone)[0]['vendor'];
    this.selectedResourceType = vendor.toLowerCase();
    if (vendor.toLowerCase() === 'yealink') {
      this.actionTypeList = this.yealinkActionTypeList;
      this.selectedType = 'Click';
    } else if (vendor.toLowerCase() === 'polycom') {
      this.actionTypeList = this.polyActionTypeList;
      this.selectedType = '';
    }
  }

  createAction() {
    const item = {
      action: 'simulate_touch',
      phone: this.selectedPhone,
      touchType: this.selectedType,
      xCoordinat: this.xCoordinates,
      yCoordinat: this.yCoordinates,
      duration: (this.duration && this.selectedResourceType === 'polycom') ? this.duration : null,
      easing: (this.easing && this.selectedResourceType === 'polycom') ? String(this.easing) : null,
      continueonfailure: this.continueOnFailure
    };
    // tslint:disable-next-line: max-line-length
    let query = this.selectedPhone + '.simulatetouch(type=\'' + this.selectedType + '\',coordinates=\'' + this.xCoordinates + ',' + this.yCoordinates ;
    query += `',"${this.continueOnFailure}")`;
    if (this.duration) {
      query += '.duration(' + this.duration + ')';
    }
    if (this.easing) {
      query += '.easing(' + this.easing + ')';
    }
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


}
