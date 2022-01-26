import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VariablesDefinitionService {
  apiURL: string = environment.apiEndpoint;
  availableVendors: any;
  servers: any;
  resources: any = [{}];

  constructor(private http: HttpClient) {
  }

  getAvailableVendors() {
    this.availableVendors = [];
    this.servers = [];
    this.getCallServerVendors().subscribe((response: any) => {
      if (!response.success)
        console.log("error");
      else {
        this.availableVendors = response.response.vendors
        this.getModelsPerVendor();
      }
    });
  }

  getModelsPerVendor() {
    this.availableVendors.forEach((vendor: string, index: number) => {
      let auxModels = [];
      this.getModelsByVendor(vendor).subscribe((response: any) => {
        if (!response.success)
          console.log("error");
        else
          response.response.models.forEach((model, modelIndex) => {
            auxModels.push({ id: modelIndex + 1, vendor_id: index + 1, name: model });
          });
      });
      this.servers.push({ id: index + 1, resource_id: 2, name: vendor, disabled: false, models: auxModels })
    });
    this.resources[1].vendors = this.servers;
  }

  getCallServerVendors() {
    let headers = this.getHeaders();
    return this.http.get<any[]>(this.apiURL + "/callServer/vendors", { headers });
  }

  getModelsByVendor(vendor: string) {
    let headers = this.getHeaders();
    return this.http.get<any[]>(this.apiURL + "/callServer/vendor/models/" + vendor, { headers });
  }

  public getHeaders() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return headers;
  }

  getAvailableResources() {
    this.resources = [
      {
        id: 1, type: "Phone", vendors: [
          {
            id: 1, resource_id: 1, name: "Cisco", disabled: true, models: [
              {
                id: 1, vendor_id: 1, name: "MPP", submodels: [
                  { id: 1, model_id: 1, name: "6800" },
                  { id: 2, model_id: 1, name: "7800" },
                  { id: 3, model_id: 1, name: "8800" }
                ]
              },
              {
                id: 2, vendor_id: 1, name: 'WEBEX-TEAMS'
              }
            ]
          },
          {
            id: 2, resource_id: 2, name: "Polycom", disabled: true
          },
          {
            id: 3, resource_id: 3, name: "Yealink", disabled: true
          },
          {
            id: 4, resource_id: 4, name: "Grandstream", disabled: true
          },
          {

            id: 5, resource_id: 5, name: 'Microsoft', disabled: true, models: [
              {
                id: 1, vendor_id: 5, name: 'MS-TEAMS'
              }
            ]
          }
        ]
      },
      {
        id: 2, type: "Server", vendors: this.servers
      },
      // {
      //   id: 3, type: "Router", vendors: [
      //     { id: 1, resource_id: 3, name: "Cisco", disabled: false }
      //   ]
      // },
      { id: 3, type: "Trace", disabled: false, },
      {
        id: 4, type: "User", disabled: false, vendors: [
          {

            id: 1, resource_id: 1, name: 'Microsoft', disabled: true, models: [
              {
                id: 1, vendor_id: 1, name: 'MS-TEAMS'
              }
            ]
          }
        ]
      },
      {
        id: 5, type: "ResourceGroup", vendors: []
      }
    ]
    return this.resources;
  }
}
