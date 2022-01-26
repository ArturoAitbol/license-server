import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-video-quality-stats',
  templateUrl: './video-quality-stats.component.html',
  styleUrls: ['./video-quality-stats.component.css']
})
export class VideoQualityStatsComponent implements OnInit, OnDestroy {
  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = '';
  actionToEdit: any = {};
  continueOnFailure: boolean = false;

  constructor(private aeService: AutomationEditorService) {
  }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      // tslint:disable-next-line: triple-equals
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
    // Only Webex variables are applicable
    // tslint:disable-next-line: max-line-length
    this.resources = this.aeService.getFilteredResources(['Phone']).filter((e: any) => e.vendor === 'Cisco' && e.model === Constants.Webex);
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    const item = { action: 'video_quality_stats', phone: this.selectedPhone, continueonfailure: this.continueOnFailure };
    let query = this.selectedPhone + '.videoQualityStats(';
    query += `"${this.continueOnFailure}")`;
    this.action = { action: item, query: query };
  }
  onSelectDevice(value: any) {
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
