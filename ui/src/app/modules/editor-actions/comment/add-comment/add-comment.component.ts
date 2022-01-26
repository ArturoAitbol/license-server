import { Component, OnInit } from '@angular/core';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.css']
})
export class AddCommentComponent implements OnInit {
  action: any;
  actions: any = [];
  commentMessage: string;
  subscription: Subscription;
  actionToEdit: any = {};

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.commentMessage = '';
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.commentMessage = this.actionToEdit.value;
    }

    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  insertAction() {
    this.createAction();
    // if (!this.isMorethan250Characters)
    //   this.aeService.insertAction.emit(this.actions[0]);
    // else {
    //   this.aeService.insertMultipleActions.emit(this.actions);
    // }
    this.aeService.insertAction.emit(this.action);
  }


  cancel() {
    this.aeService.cancelAction.emit();
  }

  createAction() {
    const commentedString = this.commentMessage.replace(/\n|\r/g, " ");
    // this.isMorethan250Characters = commentedString.length > 250;
    // const result = [];
    // const max = Math.round(commentedString.length / 180);
    // for (let index = 0; index < max; index++) {
    //   const startValue = index * 180;
    //   const endValue = 180 * (index + 1);
    //   if (index < max - 1)
    //     result.push(commentedString.substring(startValue, endValue));
    //   else {
    //     result.push(commentedString.substring(startValue));
    //   }
    // }
    // console.log('rsult ', result);
    // if (result.length > 0) {
    //   result.forEach((text: string) => {
    let item = { action: 'comment', value: commentedString };
    const query = '// ' + commentedString;
    this.action = { action: item, query: query };
    //   });
    // }
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}
