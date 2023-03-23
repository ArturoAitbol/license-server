import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { UserProfileServiceMock } from "src/test/mock/services/user-profile.mock";
import { IUserProfile } from "../model/user-profile.model";
import { UserProfileService } from "./user-profile.service";

let httpClientSpy: jasmine.SpyObj<HttpClient>;
let userProfileService: UserProfileService;
const headers = new HttpHeaders();
headers.append('Content-Type', 'application/json');

describe('User profile http request test', () => {
    beforeEach(async () => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put']);
        userProfileService = new UserProfileService(httpClientSpy);
    });

    it('should make the proper http calls on getUserProfileDetails', (done: DoneFn) => {
        const params = new HttpParams();
        httpClientSpy.get.and.returnValue(UserProfileServiceMock.getUserProfileDetails());

        userProfileService.getUserProfileDetails().subscribe({
            next: () => {done();},
            error: done.fail
        });
        expect(httpClientSpy.get).toHaveBeenCalledWith(environment.apiEndpoint + '/authUserProfile', { headers })
    });

    it('should make the proper http calls on updateUserProfile', (done: DoneFn) => {
        const updateUserProfile: IUserProfile = {
            name: 'test name',
            email: 'testEmail@tekvizion.com',
            companyName: 'test company',
            jobTitle: 'test job',
            phoneNumber: '+88888888888',
            subaccountId: 'fae9fa51-845a-439b-a3df-9863fa55e451',
            type: 'Reseller',
            notifications: []
        }
        httpClientSpy.put.and.returnValue(UserProfileServiceMock.updateUserProfile(updateUserProfile));
        userProfileService.updateUserProfile(updateUserProfile).subscribe({
            next: () => {done();},
            error: done.fail
        });
        expect(httpClientSpy.put).toHaveBeenCalledWith(environment.apiEndpoint + '/authUserProfile', updateUserProfile);
    });

    it('should make the proper http calls on createUserProfile', (done: DoneFn) => {
        const createUserProfile: IUserProfile = {
            name: 'test name',
            email: 'testEmail@tekvizion.com',
            companyName: 'test company',
            jobTitle: 'test job',
            phoneNumber: '+88888888888',
            subaccountId: 'fae9fa51-845a-439b-a3df-9863fa55e451',
            type: 'Reseller',
            notifications: []
        }
        httpClientSpy.post.and.returnValue(UserProfileServiceMock.createUserProfile(createUserProfile));
        userProfileService.createUserProfile(createUserProfile).subscribe({
            next: () => {done();},
            error: done.fail
        });
        
        expect(httpClientSpy.post).toHaveBeenCalledWith(environment.apiEndpoint + '/authUserProfile', createUserProfile)
    });
});
