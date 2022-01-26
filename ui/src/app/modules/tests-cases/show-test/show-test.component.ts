import { Component, OnInit } from '@angular/core';
import { TestCaseService } from 'src/app/services/test-case.service';

@Component({
  selector: 'app-show-test',
  templateUrl: './show-test.component.html',
  styleUrls: ['./show-test.component.css']
})
export class ShowTestComponent implements OnInit {
  testCase: any;
  constructor(private testCaseService: TestCaseService) { }
  ngOnInit() {
    this.testCase = this.testCaseService.getTestCase();
    this.testCase.resources = JSON.parse(this.testCase.script).inventory.length;
    this.testCase.actionsCount = JSON.parse(this.testCase.script).actionList.length;
  }

  closeModal() {
    this.testCaseService.closeModal.emit();
  }
}