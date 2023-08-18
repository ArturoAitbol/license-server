import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {StakeHolderService} from './stake-holder.service';
import { SubAccountService } from './sub-account.service';
import {environment} from '../../environments/environment';
import {IStakeholder} from "../model/stakeholder.model";
import {SubAccount} from "../model/subaccount.model";
import {StakeHolderServiceMock} from '../../test/mock/services/ctaas-stakeholder-service.mock';
import { Constants } from '../helpers/constants';

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let stakeHolderService: StakeHolderService;
let subAccountService: SubAccountService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');
const subaccount: SubAccount = {
    name: 'Default',
    customerId: 'b566c90f-3671-47e3-b01e-c44684e28f99',
    id: '89ef7e6a-367f-48c8-b69e-c52bf16a4e05',
    subaccountAdminEmails: ['adminEmail@unit-test.com']
};
describe('Stakeholder service http requests test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        subAccountService = new SubAccountService(httpClientSpy);
        subAccountService.setSelectedSubAccount(subaccount);
        stakeHolderService = new StakeHolderService(httpClientSpy, subAccountService);
    });

    it('should make the proper calls on getStakeholderList()', (done: DoneFn) => {
        let params = new HttpParams();
        let subaccountId = '89ef7e6a-367f-48c8-b69e-c52bf16a4e05'
        httpClientSpy.get.and.returnValue(StakeHolderServiceMock.getStakeholderList());
        params = params.set('subaccountId', subaccountId );
        stakeHolderService.getStakeholderList(subaccountId).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccountStakeHolders', { headers, params });
    });

    it('should make the proper http calls on updateStakeholderDetails()', (done: DoneFn) => {
        const updatedStakeHolder: IStakeholder = {
            name: 'testName1',
            jobTitle: 'testJob1',
            companyName: 'testName1',
            phoneNumber: '1111111111',
            notifications: 'TYPE:Detailed,DAILY_REPORTS,WEEKLY_REPORTS,MONTHLY_REPORTS',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            parsedRole: 'Stakeholder',
            type: 'Detailed',
            role: Constants.SUBACCOUNT_STAKEHOLDER,
            subaccountAdminEmail: "test@mail.com"
        };
        httpClientSpy.put.and.returnValue(StakeHolderServiceMock.updateStakeholderDetails());
        stakeHolderService.updateStakeholderDetails(updatedStakeHolder).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccountStakeHolders/' + updatedStakeHolder.subaccountAdminEmail, updatedStakeHolder);
    });

    it('should make the proper http calls on deleteStakeholder()', (done: DoneFn) => {
        const deleteStakeholder: IStakeholder = {
            name: 'testName1',
            jobTitle: 'testJob1',
            companyName: 'testName1',
            phoneNumber: '1111111111',
            notifications: 'TYPE:Detailed,DAILY_REPORTS,WEEKLY_REPORTS,MONTHLY_REPORTS',
            subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
            parsedRole: 'Stakeholder',
            type: 'Detailed',
            role: Constants.SUBACCOUNT_STAKEHOLDER,
            subaccountAdminEmail: "test@mail.com"
        };
        httpClientSpy.delete.and.returnValue(StakeHolderServiceMock.deleteStakeholder());
        stakeHolderService.deleteStakeholder(deleteStakeholder.subaccountAdminEmail).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.delete).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccountStakeHolders/' + deleteStakeholder.subaccountAdminEmail);
    });

    it('should make the proper calls on createStakeholder()', (done: DoneFn) => {
        const stakeholderToCreate: IStakeholder = {
          name: 'testName1',
          jobTitle: 'testJob1',
          companyName: 'testName1',
          phoneNumber: '1111111111',
          notifications: 'TYPE:Detailed,DAILY_REPORTS,WEEKLY_REPORTS,MONTHLY_REPORTS',
          subaccountId: 'f6c0e45e-cfdc-4c1a-820e-bef6a856aaea',
          parsedRole: 'Stakeholder',
          type: 'Detailed',
          role: Constants.SUBACCOUNT_STAKEHOLDER,
          subaccountAdminEmail: "test@mail.com"
        };
        httpClientSpy.post.and.returnValue(StakeHolderServiceMock.createStakeholder());
        stakeHolderService.createStakeholder(stakeholderToCreate).subscribe({
            next: () => { done(); },
            error: done.fail
        });
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/subaccountStakeHolders', stakeholderToCreate);
    });
});
