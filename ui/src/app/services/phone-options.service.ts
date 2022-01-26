import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhoneOptionsService {
  licensedVendores: any;
  private relay: any = [{}];

  constructor() { }

  getAvailableOptions() {
    return {
      vendors:
        [
          {
            id: 1, name: 'Cisco', disabled: true, models: [
              {
                id: 1, vendor_id: 1, name: 'MPP'
                // , submodels: [
                //   { id: 1, model_id: 1, name: "6800" },
                //   { id: 2, model_id: 1, name: "7800" },
                //   { id: 3, model_id: 1, name: "8800" }
                // ]
              },
              {
                id: 2, name: 'WEBEX-TEAMS', disabled: true
              }
            ]
          },
          {
            id: 2, name: 'Polycom', disabled: true
          },
          // { id: 3, name: "IPC", disabled: true },
          { id: 4, name: 'Grandstream', disabled: true },
          { id: 5, name: 'Yealink', disabled: true },
          {
            id: 6, name: 'Microsoft', disabled: true, models: [
              {
                id: 1, vendor_id: 6, name: 'MS-TEAMS'
              }
            ]
          }
        ]
    }
  }

  setLicenseVendoresOptions(licenseVendores: any) {
    this.licensedVendores = licenseVendores;
  }

  getLicensedVendores() {
    return this.licensedVendores;
  }

  set setRelayList(list: [{}]) {
    this.relay = list;
  }

  get fetchRelayList(): [{}] {
    return this.relay;
  }
}

