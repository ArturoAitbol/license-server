import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomerOnboardService {

  private onboardingSetupStatus = 'pending';
  constructor(private httpClient: HttpClient) { }

  public updateCustomerOnboardingStatus() {
    this.onboardingSetupStatus = 'done';
  }
  /**
   * fetch the customer onboarding details by subaccountId
   * @param subaccountId: string 
   * @returns: Observable<any>
   */
  public fetchCustomerOnboardingDetails(subaccountId: string) {
    return this.onboardingSetupStatus;
  }
}
