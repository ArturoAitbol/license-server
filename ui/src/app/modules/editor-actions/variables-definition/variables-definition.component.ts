import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { VariablesDefinitionService } from 'src/app/services/variables-definition.service';
import { PhoneOptionsService } from 'src/app/services/phone-options.service';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-variables-definition',
  templateUrl: './variables-definition.component.html',
  styleUrls: ['./variables-definition.component.css']
})
export class VariablesDefinitionComponent implements OnInit, OnDestroy {


  /*
   resource: {
     varname,
     resources,
     vendors,
     models,
     submodels,
     licensedVendors
   }
  */


  subscription: Subscription;
  varName: string;
  resources: any;
  vendors: any;
  models: any;
  submodels: any;
  licensedVendores: any;

  selectedResourceIndex: number = 0;
  selectedVendorIndex: number = 0;
  selectedModelIndex: number = 0;
  selectedSubModelIndex: number = 0;

  selectedResource: any;
  selectedVendor: any;
  selectedModel: any;
  selectedSubModel: any;
  selectedDut: boolean = false;
  newList: any = [];

  public title: string = '';

  newResource = {}
  resourceList: any = [{}];
  resourceBK: any = [];
  resourceCount: number = 0;

  _disableInsertButton: boolean;
  continueOnFailure: boolean = false;


  constructor(private aeService: AutomationEditorService,
    private vdService: VariablesDefinitionService,
    private phoneOptionsService: PhoneOptionsService) {
  }

  ngOnInit() {
    this._disableInsertButton = false;
    this.vdService.getAvailableVendors();
    this.resources = this.vdService.getAvailableResources();
    // get the licensed vendor list
    this.licensedVendores = this.phoneOptionsService.getLicensedVendores();

    this.resourceList[this.resourceCount].selectedResourceIndex = 1;
    this.onSelectResource(this.resourceList[this.resourceCount].selectedResourceIndex, this.resourceCount);
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  insertResource() {
    let addingResources: any = [];
    this.resourceList.forEach((resource: any) => {
      let response = { source: this.phoneBuilder(resource), query: this.queryBuilder(resource) };
      addingResources.push(response);
    });
    // console.log('res ', addingResources);
    this.aeService.addedResource.emit(addingResources);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  queryBuilder(resource: any): string {
    let queryAction: string = '';
    queryAction += 'Declare ' + resource.varName + ' as ';
    if (resource.selectedDut) {
      queryAction += 'DUT.';
    }
    if (resource.selectedResourceIndex != 0 && resource.selectedResourceIndex != null) {
      queryAction += resource.selectedResource.type;
      if (resource.selectedVendorIndex != 0 && resource.selectedVendorIndex != null) {
        // tslint:disable-next-line: max-line-length
        queryAction += (resource.selectedVendor.name.toString().toLowerCase() === 'polycom') ? '.' + 'Poly' : '.' + resource.selectedVendor.name;
        if (resource.selectedModelIndex != 0 && resource.selectedModelIndex != null) {
          const model = resource.selectedModel.name;
          queryAction += '.' + model;
          if (resource.selectedSubModelIndex != 0 && resource.selectedSubModelIndex != null) {
            queryAction += '.' + resource.selectedSubModel.name;
          }
        }
      }
    }
    return queryAction;
    // +` ( "${this.continueOnFailure}" )`
  }

  phoneBuilder(resource: any) {
    let phoneObject: any = {};
    phoneObject.name = resource.varName;
    if (resource.selectedResourceIndex != 0 && resource.selectedResourceIndex != null) {
      phoneObject.type = resource.selectedResource.type;
    } else {
      phoneObject.type = '';
    }
    if (resource.selectedVendorIndex != 0 && resource.selectedVendorIndex != null) {
      phoneObject.vendor = resource.selectedVendor.name;
    } else {
      phoneObject.vendor = '';
    }
    if (resource.selectedModelIndex != 0 && resource.selectedModelIndex != null) {
      phoneObject.model = resource.selectedModel.name;
    } else {
      phoneObject.model = '';
    }
    if (resource.selectedSubModelIndex != 0 && resource.selectedSubModelIndex != null) {
      phoneObject.submodel = resource.selectedSubModel.name;
    } else {
      phoneObject.submodel = '';
    }
    phoneObject.dut = resource.selectedDut;
    return phoneObject;
  }

  attributeParser(id: number) {
    if (this.resourceList[id].selectedResourceIndex != 0 && this.resourceList[id].selectedResourceIndex != null) {
      this.resourceList[id].selectedResource = this.resources[this.resourceList[id].selectedResourceIndex - 1];
      if (this.resourceList[id].selectedVendorIndex != 0 && this.resourceList[id].selectedVendorIndex != null) {
        // tslint:disable-next-line: max-line-length
        this.resourceList[id].selectedVendor = this.resourceList[id].selectedResource.vendors[this.resourceList[id].selectedVendorIndex - 1];
        if (this.resourceList[id].selectedModelIndex != 0 && this.resourceList[id].selectedModelIndex != null) {
          this.resourceList[id].selectedModel = this.resourceList[id].selectedVendor.models[this.resourceList[id].selectedModelIndex - 1];
          if (this.resourceList[id].selectedSubModelIndex != 0 && this.resourceList[id].selectedSubModelIndex != null) {
            // tslint:disable-next-line: max-line-length
            this.resourceList[id].selectedSubModel = this.resourceList[id].selectedModel.submodels[this.resourceList[id].selectedSubModelIndex - 1];
          }
        }
      }
    }
  }

  onSelectResource(resource_id: number, id: number) {
    this.newList = [];
    this.resourceList[id].selectedResourceIndex = resource_id;
    this.resourceList[id].selectedVendorIndex = 0;
    this.resourceList[id].selectedModelIndex = 0;
    this.resourceList[id].selectedSubModelIndex = 0;
    if (resource_id != 0) {
      this.resourceList[id].vendors = this.resources[resource_id - 1].vendors;
      //  if the resource is Phone
      if (resource_id == 1) {
        for (let i = 0; i < this.licensedVendores.length; i++) {
          // console.log(`licensedVendores name at  ${i}`, this.licensedVendores[i]);
          for (let k = 0; k < this.resourceList[id].vendors.length; k++) {
            // console.log(`Vendores name at  ${k}`, this.vendors[k]);
            if (this.licensedVendores[i] === this.resourceList[id].vendors[k].name) {
              this.resourceList[id].vendors.disabled = false;
              this.newList.push(this.resourceList[id].vendors[k]);
              break;
            }
          }
        }
        this.resourceList[id].vendors = this.newList;
      }
      if (resource_id == 2) {
        const broadworksIndex = this.resourceList[id].vendors.findIndex(e => e.name == "BROADWORKS");
        this.newList.push(this.resourceList[id].vendors[broadworksIndex]);
        this.resourceList[id].vendors = this.newList;
      }
      this.models = null;
      this.submodels = null;
    } else {
      this.resourceList[id].vendors = null;
      this.models = null;
      this.submodels = null;
    }
    this.attributeParser(id);
  }

  // onSelectResource(resource_id: number) {
  //   this.selectedResourceIndex = resource_id;
  //   this.selectedVendorIndex = 0;
  //   this.selectedModelIndex = 0;
  //   this.selectedSubModelIndex = 0;
  //   this.licensedVendores = this.phoneOptionsService.getLicensedVendores();
  //   this.newList = [];
  //   if (resource_id != 0) {
  //     if (resource_id == 1) {
  //       this.vendors = this.resources[resource_id - 1].vendors;
  //       for (var i = 0; i < this.vendors.length; i++) {
  //         var ismatch = false;
  //         for (var j = 0; j < this.licensedVendores.length; j++) {
  //           if (this.vendors[i].name == this.licensedVendores[j]) {
  //             ismatch = true;
  //             this.vendors[i].disabled = false;
  //             this.newList.push(this.vendors[i]);
  //             break;
  //           }
  //         }
  //         if (!ismatch) {
  //           this.vendors[i].disabled = true;
  //           this.newList.push(this.vendors[i]);
  //         }
  //       }
  //       this.models = null;
  //       this.submodels = null;
  //     } else {
  //       this.vendors = this.resources[resource_id - 1].vendors;
  //       if (typeof this.vendors != 'undefined') {

  //         for (var i = 0; i < this.vendors.length; i++) {
  //           this.newList.push(this.vendors[i]);
  //         }
  //       }
  //       this.models = null;
  //       this.submodels = null;
  //     }
  //   }
  //   else {
  //     this.vendors = null;
  //     this.models = null;
  //     this.submodels = null;
  //   }
  //   this.attributeParser();
  //   this.selectedVendorIndex = null;
  // }

  onSelectVendor(vendor_id: number, id: number) {
    this.resourceList[id].selectedVendorIndex = vendor_id;
    this.resourceList[id].selectedModelIndex = 0;
    this.resourceList[id].selectedSubModelIndex = 0;
    if (vendor_id != 0) {
      this.resourceList[id].models = this.resourceList[id].selectedResource.vendors[vendor_id - 1].models;
      this.resourceList[id].submodels = null;
    } else {
      this.resourceList[id].models = null;
      this.resourceList[id].submodels = null;
    }
    this.attributeParser(id);
    if (vendor_id == 1) {
      this.resourceList[id].selectedModelIndex = 1;
      this.onSelectModel(this.resourceList[id].selectedModelIndex, id);
    }
  }

  onSelectModel(model_id: number, id: number) {
    // console.debug(model_id);
    // console.debug(id);
    this.resourceList[id].selectedModelIndex = model_id;
    this.resourceList[id].selectedSubModelIndex = 0;
    if (model_id != 0) {
      this.resourceList[id].submodels = this.resourceList[id].selectedVendor.models[model_id - 1].submodels;
    } else {
      this.resourceList[id].submodels = null;
    }
    this.attributeParser(id);
  }

  onSelectSubModel(submodel_id: number, id: number) {
    this.resourceList[id].selectedSubModelIndex = submodel_id;
    this.attributeParser(id);
  }

  deleteLine(index) {
    this.resourceCount--;
    this.resourceList.splice(index, 1);
    this.resourceBK = JSON.parse(JSON.stringify(this.resourceList));
    this._disableInsertButton = this.resourceList.some(e => e['markDirty'] == true);
  }

  addLine() {
    this.resourceBK = JSON.parse(JSON.stringify(this.resourceList));
    this.resourceCount++;
    this.resourceList = JSON.parse(JSON.stringify(this.resourceBK));
    this.resourceList.push(this.newResource);
    this.newResource = {};
    this.resourceBK = JSON.parse(JSON.stringify(this.resourceList));
    this.resourceList[this.resourceCount].selectedResourceIndex = 1;
    this.onSelectResource(this.resourceList[this.resourceCount].selectedResourceIndex, this.resourceCount);
  }

  /**
   * on change declare variable
   */
  onChangeInput(i: number): void {
    const enteredValue = this.resourceList[i]['varName'];
    let check = -1;
    for (let index = 0; index < this.resourceList.length; index++) {
      if (this.resourceList[index].varName == enteredValue) {
        if (check != -1) {
          this.resourceList[index]['markDirty'] = true;
        } else {
          this.resourceList[index]['markDirty'] = false;
        }
        check++;
      }
    }
    // check for any markDirty key
    this._disableInsertButton = this.resourceList.some(e => e['markDirty'] == true);
  }
  /**
   * enable DUT checkbox based on condition
   * @param index: number 
   */
  enableDUTCheckbox(index: number): boolean {
    return this.resourceList[index].selectedResourceIndex != 0 &&
      this.resourceList[index].selectedResourceIndex != 4 &&
      this.resourceList[index].selectedResourceIndex != 2 &&
      (this.resourceList[index].selectedResourceIndex == 1 && this.resourceList[index].selectedVendorIndex != 5);
  }
}
