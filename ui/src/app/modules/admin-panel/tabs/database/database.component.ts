import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'db-tab',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent implements OnInit {
  dbs: any;
  modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-lg', ignoreBackdropClick: true };
  modalRef: BsModalRef;
  totalPortions: number;
  dbColumns: any;
  subscription: Subscription;
  @ViewChild('dbsGrid', { static: true }) dbsGrid: DataTableComponent;
  constructor(private modalService: BsModalService,
    private toastr: ToastrService) { }

  loadDbs() {
    // this.dbService.getAll().subscribe((response:any)=>{
    //   if(!response.success)
    //   this.toastr.error("Error trying to load databases"+ response.response.message, "Error");
    //   else
    //   this.dbs = response.response.databases;
    // });
  }

  ngOnInit() {
    this.initGridProperties();
    //this.loadDbs();
    this.getWidthPortions();
  }

  getColumnWidth(column: any) {
    return (column.width * 100 / this.totalPortions) + "%";
  }

  getWidthPortions() {
    this.totalPortions = 0;
    this.dbColumns.forEach((column: any) => {
      if (!column.hidden)
        this.totalPortions += column.width;
    });
  }

  createDatabase() {
    let object: any;
    // object = NewDbComponent;
    this.modalRef = this.modalService.show(object, this.modalConfig)
  }

  initGridProperties() {
    this.dbColumns = [
      { field: 'server', header: 'Server', width: 12, suppressHide: true },
      { field: 'hostname', header: 'Hostname', width: 12, suppressHide: true },
      { field: 'ip', header: 'IP Address', width: 12, suppressHide: true },
      { field: 'directory', header: 'Directory', width: 12, suppressHide: true },
      { field: 'username', header: 'Username', width: 12, suppressHide: true },
      { field: 'password', header: 'Password', width: 12, suppressHide: true },
      { field: 'connectivity', header: 'Connectivity', width: 10, suppressHide: true },
      { field: '_', header: '', width: 18, suppressHide: true }
    ];
  }
}
