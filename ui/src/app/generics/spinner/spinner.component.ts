import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: 'spinner-div',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})

export class SpinnerComponent implements OnInit {
  @Input() visible: boolean;

  ngOnInit() {
    if (!this.visible) {
      this.visible = true;
    }
  }
}