import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { UploadFileServiceService } from 'src/app/services/upload-file-service.service';
import { DataTableService } from 'src/app/services/data-table.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit {
  uploadFileColumns: any = [];
  uploadServerColumns: any = [];
  @ViewChild('uploadFileGrid', { static: true }) uploadFileGrid: DataTableComponent;
  @ViewChild('uploadCallServerFileGrid', { static: true }) uploadCallServerFileGrid: DataTableComponent;
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;

  @Input() searchQuery: string;
  selectedFile: any;
  selectedServerApiFile: any = '';
  uploadFiles: any[] = [];
  totalPortions: number;
  totalCallServerAPIPortions: number;
  currentFile: File = null;
  uploadFile: any;
  uploadedFilesData: any = { name: '' };
  private currentPop: any;
  filterCount: number = -1;
  _isGenericFile: boolean;
  uncheckableButton: string;
  currentCallServerApiFile: File = null;
  uploadedServerApiData: any = { name: '' };
  uploadedApiFile: any[] = [];
  vendor: string;
  isGenericRequestCompleted: boolean;
  isCallServiceRequestCompleted: boolean;
  scrollEventSubscription: Subscription;
  constructor(
    private uploadFileServiceService: UploadFileServiceService,
    private dataTableService: DataTableService,
    private toastService: ToastrService
  ) {
    this.isGenericRequestCompleted = false;
    this.isCallServiceRequestCompleted = false;
  }

  ngOnInit() {
    this.vendor = "";
    this.uploadFile = "";
    this.uncheckableButton = 'GenericFile';
    this._isGenericFile = (this.uncheckableButton === 'GenericFile');
    this.changeHidden('genericFile');
    this.initGridProperties();
    this.getWidthPortions();
    this.fetchUploadedFilesDetails();
    this.uploadedApiFile;
    //listen for data table scroll event
    this.scrollEventSubscription = this.dataTableService.scrollEvent.subscribe(() => {
      if (this.currentPop) {
        this.currentPop.hide();
      }
    });
  }


  changeHidden(type: string): void {
    this.uncheckableButton = (type === 'genericFile') ? 'GenericFile' : 'CallServerApi';
    this._isGenericFile = (this.uncheckableButton === 'GenericFile');
    this.selectedServerApiFile = '';
    if (this._isGenericFile) {
      // this.uploadFileData();
      this.fetchUploadedFilesDetails();
    }
    else if (!this._isGenericFile) {
      this.searchQuery = '';
      this.fetchUploadedApiDetails();
    }
  }
  canOpenFileDialog(files: any) {
    this.selectedServerApiFile = files.item(0);
    this.uploadCallServerApiFile();
  }
  clearFile() {
    // this.fileInput.nativeElement.value = '';
    this.selectedServerApiFile = '';
  }

  uploadCallServerApiFile() {
    // currentCallServerFile
    this.uploadFileServiceService.uploadCallServerFile(this.selectedServerApiFile, this.vendor).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error uploading File: ' + response.response.message);
      } else {
        // this.uploadedServerApiData = {name:''};
        this.toastService.success('File uploaded successfully', 'Success');
        // this.clearFile();
        this.fetchUploadedApiDetails();
      }
      this.selectedServerApiFile = '';
    });
    this.resetParameters()
  }
  fetchUploadedApiDetails(): void {
    this.isCallServiceRequestCompleted = false;
    this.uploadFileServiceService.getserverApiFileList().subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error : ' + response.response.message, 'Error');
        this.isCallServiceRequestCompleted = true;
      } else {
        this.isCallServiceRequestCompleted = true;
        // check whether the response has that key or not
        if (response.response.docList) {
          this.uploadedApiFile = response.response.docList;
        } else {
          this.uploadedApiFile = [];
        }
      }
    }, () => {
      this.isCallServiceRequestCompleted = true;
    });
  }
  deleteUploadedApiFile(file: any) {
    this.uploadFileServiceService.deleteserverApiFileList(file.id).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error(response.response.message, 'Error');
      } else {

        this.toastService.success(file.fileName + ' deleted successfully', 'Success');
        this.fetchUploadedApiDetails();
      }
    });

  }
  processFileUpload(files: any) {
    this.currentFile = files.item(0);
    this.uploadFileData();
  }
  listAll() {

  }
  uploadFileData(): void {
    this.uploadFileServiceService.uploadFile(this.currentFile).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error : ' + response.response.message, 'Error');
      } else {
        this.uploadedFilesData = { name: '' };
        this.toastService.success('File added successfully', 'Success');
        this.fetchUploadedFilesDetails();
      }
      this.currentFile = null;
    });
    this.resetParameters()
  }
  fetchUploadedFilesDetails(): void {
    this.isGenericRequestCompleted = false;
    this.uploadFileServiceService.getFileDetailsList().subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error('Error : ' + response.response.message, 'Error');
        this.isGenericRequestCompleted = true;
      } else {
        this.isGenericRequestCompleted = true;
        // check whether the response has that key or not
        if (response.response.files) {
          this.uploadFiles = response.response.files;
        } else {
          this.uploadFiles = [];
        }
      }
    }, () => {
      this.isGenericRequestCompleted = true;
    });
  }
  getPlacement(item: any) {
    if (this.filterCount !== -1 && this.uploadFiles.indexOf(item) >= this.filterCount) {
      return 'top';
    }
    if (this.uploadFiles.indexOf(item) >= (this.uploadFiles.length - 2)) {
      return 'top';
    }
    return 'bottom';
  }
  closeOldPop(popover: any) {
    if (this.currentPop && this.currentPop !== popover) {
      this.currentPop.hide()
    }
    this.currentPop = popover;
  }
  deleteFile(file: any) {
    this.uploadFileServiceService.deleteFile(file.name).subscribe((response: any) => {
      if (!response.success) {
        this.toastService.error(response.response.message, 'Error');
      } else {

        this.toastService.success(file.name + ' deleted successfully', 'Success');
        this.fetchUploadedFilesDetails();
      }
    });

  }
  getColumnWidth(column: any) {
    return (column.width * 100 / this.totalPortions) + '%';
  }
  getColumnWidthForCallServer(column: any) {
    return (column.width * 100 / this.totalCallServerAPIPortions) + '%';
  }

  getWidthPortions() {
    this.totalPortions = 0;
    this.totalCallServerAPIPortions = 0;
    this.uploadFileColumns.forEach((column: any) => {
      if (!column.hidden) {
        this.totalPortions += column.width;
      }
    });
    this.uploadServerColumns.forEach((column: any) => {
      if (!column.hidden) {
        this.totalCallServerAPIPortions += column.width;
      }
    });

  }

  initGridProperties() {
    this.uploadFileColumns = [
      { field: 'name', header: 'File Name', width: 5, suppressHide: false },
      // { field: 'type', header: 'File Type', width: 25, suppressHide: false },
      { field: '_', header: '', width: 10, suppressHide: false, suppressSort: true }
    ];
    this.uploadServerColumns = [
      { field: 'vendor', header: 'Vendor', width: 5, suppressHide: false },
      { field: 'name', header: 'Call Server ApiFile Name', width: 15, suppressHide: false },
      { field: '_', header: '', width: 5, suppressHide: false, suppressSort: true }
    ];
  }
  resetParameters() {
    this.selectedFile = '';
    this.selectedServerApiFile = '';
    this.vendor = '';
  }
  clearLogo() {

  }
  onResetLogo() {

  }
  onResetFile() {

  }
  ngOnDestroy(): void {
    if (this.scrollEventSubscription) {
      this.scrollEventSubscription.unsubscribe();
    }
  }

}
