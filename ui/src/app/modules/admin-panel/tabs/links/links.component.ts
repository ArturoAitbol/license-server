import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'links-tab',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {
  links: any;
  modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-lg' };
  modalRef: BsModalRef;
  totalPortions: number;
  linkColumns: any;
  subscription: Subscription;
  @ViewChild('linksGrid', { static: true }) linksGrid: DataTableComponent;
  constructor(private modalService: BsModalService,
    private toastr: ToastrService) { }

  loadLinks() {
    // this.linkService.getAll().subscribe((response:any)=>{
    //   if(!response.success)
    //   this.toastr.error("Error trying to load databases"+ response.response.message, "Error");
    //   else
    //   this.links = response.response.databases;
    // });
  }

  ngOnInit() {
    this.initGridProperties();
    //this.loadLinks();
    this.getWidthPortions();
  }

  getColumnWidth(column: any) {
    return (column.width * 100 / this.totalPortions) + "%";
  }

  getWidthPortions() {
    this.totalPortions = 0;
    this.linkColumns.forEach((column: any) => {
      if (!column.hidden)
        this.totalPortions += column.width;
    });
  }

  // createLink() {
  //   let object: any;
  // object = NewLinkComponent;
  // this.modalRef = this.modalService.show(object, this.modalConfig)
  // }

  initGridProperties() {
    this.linkColumns = [
      { field: 'name', header: 'Name', width: 12, suppressHide: true },
      { field: 'site', header: 'Site', width: 12, suppressHide: true },
      { field: 'license', header: 'License', width: 15, suppressHide: true },
      { field: 'version', header: 'Version', width: 12, suppressHide: true },
      { field: 'registered', header: 'Registered', width: 12, suppressHide: true },
      { field: 'status', header: 'Status', width: 12, suppressHide: true },
      { field: '_', header: '', width: 25, suppressHide: true }
    ];
  }
}