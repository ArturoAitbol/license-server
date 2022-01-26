import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';

@Component({
  selector: 'app-compare-variables',
  templateUrl: './compare-variables.component.html',
  styleUrls: ['./compare-variables.component.css']
})
export class CompareVariablesComponent implements OnInit {
  action: any;
  subscription: Subscription;
  resources: any;
  expression: string = "";
  operators: any = ["==", "!=",">",">=","<","<="];
  operator: string = "";
  continueOnFailure: boolean = false;
  public title: string = "";
  actionToEdit: any = {};
  variableType: string = '';
  selectedvariable:string = "";
  variableKeyList: string[];
  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
  this.variableKeyList = this.aeService.getCompareVariableKeys();
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      let stringExpression = this.actionToEdit.expression;

      if (stringExpression.includes('==')) {
        var arrayExpression = stringExpression.split("==");
        this.expression = arrayExpression[0];
        this.operator = '==';
        this.selectedvariable = arrayExpression[1];
      } else if (stringExpression.includes('!=')) {
        var arrayExpression = stringExpression.split("!=");
        this.expression = arrayExpression[0];
        this.operator = '!=';
        this.selectedvariable = arrayExpression[1];
      } else if (stringExpression.includes('>=')) {
        var arrayExpression = stringExpression.split(">=");
        this.expression = arrayExpression[0];
        this.operator = '>=';
        this.selectedvariable = arrayExpression[1];
      } else if (stringExpression.includes('<')) {
        var arrayExpression = stringExpression.split("<");
        this.expression = arrayExpression[0];
        this.operator = '<';
        this.selectedvariable = arrayExpression[1];
      } else if (stringExpression.includes('>')) {
        var arrayExpression = stringExpression.split(">");
        this.expression = arrayExpression[0];
        this.operator = '>';
        this.selectedvariable = arrayExpression[1];
      } else if (stringExpression.includes('!=')) {
        var arrayExpression = stringExpression.split("!=");
        this.expression = arrayExpression[0];
        this.operator = '!=';
        this.selectedvariable = arrayExpression[1];
      }else if (stringExpression.includes('-contains-')) {
        var arrayExpression = stringExpression.split("-contains-");
        this.expression = arrayExpression[0];
        this.operator = '-contains-';
        this.selectedvariable = arrayExpression[1];
      }else if (stringExpression.includes('-startsWith-')) {
        var arrayExpression = stringExpression.split("-startsWith-");
        this.expression = arrayExpression[0];
        this.operator = '-startsWith-';
        this.selectedvariable = arrayExpression[1];
      }else if (stringExpression.includes('-endsWith-')) {
        var arrayExpression = stringExpression.split("-endsWith-");
        this.expression = arrayExpression[0];
        this.operator = '-endsWith-';
        this.selectedvariable = arrayExpression[1];
      }
      // let selectedvariableExpression = this.actionToEdit.value;

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
    let item = { action: "compare_variables", expression: this.expression + this.operator + this.selectedvariable, continueonfailure: this.continueOnFailure };
    let query = "CompareVariables(\"" + this.expression + this.operator +this.selectedvariable+ "\",\"" + this.continueOnFailure + "\")";
    this.action = { action: item, query: query };
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

}
