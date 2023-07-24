import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spiner',
  templateUrl: './loading-spiner.component.html',
  styleUrls: ['./loading-spiner.component.css']
})
export class LoadingSpinerComponent implements OnInit {

  @Input() visible: boolean;
  @Input() message: string;

  constructor() {
    this.visible = false;
    this.message = 'Loading...';
  }

  ngOnInit(): void { }

}
