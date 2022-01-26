import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-validate-expression',
  templateUrl: './validate-expression.component.html',
  styleUrls: ['./validate-expression.component.css']
})
export class ValidateExpressionComponent implements OnInit {
  action: any;
  subscription: Subscription;
  resources: any;
  expression: string = "";
  variables: any = ["NumberPacketsLost", "NumberPacketsOOSequence",
    "NumberPacketsDropped", "JitterBufferResyncs",
    "JitterBufferUnderruns", "JitterBufferOverruns",
    "JitterBufferForcedReductions", "JitterBufferForcedIncreases",
    "JitterBufferAvgMin", "JitterBufferAvgMax",
    "ExpectedPacketsReceived", "ActualPacketsReceived",
    "ExpectedPacketsTransmitted", "ActualPacketsTransmitted",
    "PercentPacketsLost", "AnomalyTestDuration",
    "NumberAnomalies", "AnomaliesPerMinute"];
  operators: any = ["==", "<=", ">=", "<", ">", "!="];
  operator: string = "";
  value: string="";
  continueOnFailure: boolean = false;
  public title: string = "";
  actionToEdit: any = {};
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      let stringExpression = this.actionToEdit.expression;

      if (stringExpression.includes('==')) {
        var arrayExpression = stringExpression.split("==");
        this.expression = arrayExpression[0];
        this.operator = '==';
        this.value = arrayExpression[1];
      } else if (stringExpression.includes('<=')) {
        var arrayExpression = stringExpression.split("<=");
        this.expression = arrayExpression[0];
        this.operator = '<=';
        this.value = arrayExpression[1];
      } else if (stringExpression.includes('>=')) {
        var arrayExpression = stringExpression.split(">=");
        this.expression = arrayExpression[0];
        this.operator = '>=';
        this.value = arrayExpression[1];
      } else if (stringExpression.includes('<')) {
        var arrayExpression = stringExpression.split("<");
        this.expression = arrayExpression[0];
        this.operator = '<';
        this.value = arrayExpression[1];
      } else if (stringExpression.includes('>')) {
        var arrayExpression = stringExpression.split(">");
        this.expression = arrayExpression[0];
        this.operator = '>';
        this.value = arrayExpression[1];
      } else if (stringExpression.includes('!=')) {
        var arrayExpression = stringExpression.split("!=");
        this.expression = arrayExpression[0];
        this.operator = '!=';
        this.value = arrayExpression[1];
      }else if (stringExpression.includes('-contains-')) {
        var arrayExpression = stringExpression.split("-contains-");
        this.expression = arrayExpression[0];
        this.operator = '-contains-';
        this.value = arrayExpression[1];
      }else if (stringExpression.includes('-startsWith-')) {
        var arrayExpression = stringExpression.split("-startsWith-");
        this.expression = arrayExpression[0];
        this.operator = '-startsWith-';
        this.value = arrayExpression[1];
      }else if (stringExpression.includes('-endsWith-')) {
        var arrayExpression = stringExpression.split("-endsWith-");
        this.expression = arrayExpression[0];
        this.operator = '-endsWith-';
        this.value = arrayExpression[1];
      }

      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
    }
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  createAction() {
    let item = { action: "validateexpression", expression: this.expression + this.operator + this.value, continueonfailure: this.continueOnFailure };
    let query = "validateExpression(\"" + this.expression + this.operator + this.value + "\",\"" + this.continueOnFailure + "\")";
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

}
