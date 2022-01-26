import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PhoneOptionsService } from 'src/app/services/phone-options.service';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { ToastrService } from 'ngx-toastr';
import { ImportExportService } from 'src/app/services/import-export.service';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-import-phones',
  templateUrl: './import-phones.component.html',
  styleUrls: ['./import-phones.component.css']
})
export class ImportPhonesComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  vendors: any;
  licensedVendores: any;
  selectedVendor: string = '';
  newList: any = [];
  templateType: string = '';
  loadedFile: boolean = false;
  uploadedFile: boolean = false;
  validatedFile: boolean = false;
  currentFile: File = null;
  phoneDtoWrapper: any;
  disabledImportButton: boolean = false;
  inProgressToastId:any;
  constructor(private phoneOptionService: PhoneOptionsService,
    private phoneConfigurationService: PhoneConfigurationService,
    private toastr: ToastrService,
    private importExportService: ImportExportService) { }

  ngOnInit() {
    this.vendors = this.phoneOptionService.getAvailableOptions().vendors;
    this.getLicensedVendores();
  }

  hideModal() {
    this.phoneConfigurationService.hideModal.emit();
  }

  getLicensedVendores() {
    this.licensedVendores = this.phoneOptionService.getLicensedVendores();
    for (let i = 0; i < this.vendors.length; i++) {
      let ismatch = false;
      for (let j = 0; j < this.licensedVendores.length; j++) {
        if (this.vendors[i].name == this.licensedVendores[j]) {
          ismatch = true;
          this.vendors[i].disabled = false;
          this.newList.push(this.vendors[i]);
          break;
        }
      }
      if (!ismatch) {
        this.vendors[i].disabled = true;
        this.newList.push(this.vendors[i]);
      }
    }
  }

  processFile(files: any) {
    this.currentFile = files.item(0);
    this.loadedFile = true;
  }

  deleteFile() {
    this.fileInput.nativeElement.value = '';
    this.currentFile = null;
    this.loadedFile = false;
    this.uploadedFile = false;
    this.validatedFile = false;
  }

  validateFile() {
    this.importExportService.validateFile(this.currentFile, this.selectedVendor).subscribe((response: any) => {
      if (!response.response.phoneDtoWrapper.success) {
        this.toastr.error('Invalid File: ' + response.response.phoneDtoWrapper.uploadMessage);
      } else {
        this.toastr.success('File is valid, proceed to import', 'Success');
        this.phoneDtoWrapper = response.response.phoneDtoWrapper;
        this.validatedFile = true;
      }
    });
  }

  import() {
    this.importExportService.import(this.phoneDtoWrapper).subscribe((response: any) => {
      if (!response.success) {
        this.toastr.error('Error importing phones: ' + response.response.message);
      } else {
        this.toastr.success('Phones imported successfully', 'Success');
        this.phoneConfigurationService.phoneCreated.emit();
      }
    });
  }

  downloadTemplate() {
    this.inProgressToastId = this.toastr.info( "Import Phone(s) is in progress ...",'Info', { disableTimeOut: true }).toastId;
    this.disabledImportButton = true;
    this.importExportService.getTemplate(this.selectedVendor.toLowerCase()).subscribe((response: any) => {
      let type = { type: 'application/octet-stream' };
      this.downloadFile(response, this.selectedVendor + '.xlsx', type);
      this.disabledImportButton = false;
    },()=>{  this.disabledImportButton = false;
            this.toastr.remove(this.inProgressToastId);
    });
  }

  private downloadFile(data: any, filename: string, type: any) {
    const blob = new Blob([data], type);
    const url = window.URL.createObjectURL(blob);
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    window.URL.revokeObjectURL(url);
    this.toastr.remove(this.inProgressToastId);
  }

  onSelectVendor(vendor: string) {
    this.selectedVendor = vendor;
    this.templateType = vendor;
  }
}
