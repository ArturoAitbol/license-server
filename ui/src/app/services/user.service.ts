import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../model/user';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiURL: string = environment.apiEndpoint;
    editPassword: EventEmitter<any>;
    closeModal: EventEmitter<any>;

    constructor(private http: HttpClient) {
        this.editPassword = new EventEmitter<any>();
        this.closeModal = new EventEmitter<any>();
    }

    public getAll() {
        const headers = this.getHeaders();
        return this.http.get<User[]>(this.apiURL + '/user/listAll', { headers });
    }

    // getById(id: number) {
    //   return this.http.get(this.apiURL + "/users/${id}");
    // }

    public register(user: User) {
        return this.http.post<any>(this.apiURL + '/signup', user);
    }

    /**
     * fetch the logged in user hierarchy
     */
    public getHierarchyForNewUser() {
        const headers = this.getHeaders();
        return this.http.get<any>(this.apiURL + '/hirarchy/getByAuthUser/', { headers });
    }

    /**
     * fetch the hierarchy list by parentId
     * @param parentId: string
     */
    public getHierarchyChildByParentId(parentId: string) {
        const headers = this.getHeaders();
        return this.http.get<any>(this.apiURL + '/hirarchy/listChild/' + parentId, { headers });
    }

    /**
     * fetch the user details by userId
     * @param userId: string
     */
    public getUserByUserId(userId: string) {
        const headers = this.getHeaders();
        return this.http.get<any>(this.apiURL + '/user/get/' + userId, { headers });
    }
    public update(user: User) {
        return this.http.put(this.apiURL + '/user/update/' + user.id, user);
    }

    public resetPassword(id: any) {
        return this.http.post<any>(this.apiURL + '/user/resetPassword/' + id, id);
    }

    public changePassword(passObject: any) {
        return this.http.post<any>(this.apiURL + '/changePassword', passObject);
    }

    public deleteUser(id: number) {
        return this.http.delete(this.apiURL + '/user/delete/' + id);
    }

    /**
     * lock user based on userId
     */
    public lockUser(id: string) {
        return this.http.post(this.apiURL + '/user/lock/' + id, {});
    }

    /**
     * unlock user based on userId
     */
    public unlockUser(id: string) {
        return this.http.post(this.apiURL + '/user/unlock/' + id, {});
    }

    public checkLicenseStatus() {
        const headers = this.getHeaders();
        return this.http.get<User[]>(this.apiURL + '/user/checkLicenseStatus', { headers });
    }

    public acceptLicense() {
        const headers = this.getHeaders();
        return this.http.get<User[]>(this.apiURL + '/user/acceptLicense', { headers });
    }

    /**
     * fetch all user profile list
     */
    public getAllUserProfile() {
        const headers = this.getHeaders();
        return this.http.get<any>(this.apiURL + '/user/profile/listAll', { headers });
    }

    /**
     * fetch all users by profile Id
     * @param profileId: string
     */
    public getAllUsersByProfileId(profileId: string) {
        const headers = this.getHeaders();
        return this.http.get<any>(this.apiURL + '/user/listByProfile/' + profileId, { headers });
    }
    /**
     * create user profile
     * @param data: any
     */
    public createUserProfile(data: any) {
        return this.http.post<any>(this.apiURL + '/user/profile/create', data);
    }

    /**
     * update user profile
     * @param data: any
     */
    public updateUserProfile(data: any) {
        return this.http.put<any>(this.apiURL + '/user/profile/update/' + data.id, data);
    }

    public deleteUserProfile(data: any) {
        return this.http.delete<any>(this.apiURL + '/user/profile/delete/' + data.id, data);
    }

    /**
     * fetch particular user profile details
     * @param data: any
     */
    public getParticularUserProfile(data: any) {
        const headers = this.getHeaders();
        return this.http.get<any>(this.apiURL + '/user/profile/get/' + data.id, { headers });
    }

    public getHeaders() {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return headers;
    }
}
