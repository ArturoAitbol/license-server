import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'table-widget',
  templateUrl: './table-widget.component.html',
  styleUrls: ['./table-widget.component.css']
})
export class TableWidgetComponent implements OnInit {

  @Input() data: any;
  @Input() columns: any;
  @Input() title: string;
  @Input() isRequestCompleted: boolean;
  totalPortions: number = 0;

  constructor() { }

  ngOnInit() {
    this.getWidthPortions();
  }

  getColumnWidth(column: any, help: string) {
    return (column.width * 100 / this.totalPortions[help]) + '%';
  }

  getWidthPortions() {
    this.totalPortions = 0;
    this.columns.forEach((column: any) => {
      if (!column.hidden) {
        this.totalPortions += column.width;
      }
    });
  }

  saveChanges() {
  }
}
