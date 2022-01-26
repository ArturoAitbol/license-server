import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminPanelComponent} from './admin-panel.component';
import {DatabaseComponent} from './tabs/database/database.component';
import {LicenseComponent} from './tabs/license/license.component';
import {SmtpComponent} from './tabs/smtp/smtp.component';
import {SnmpComponent} from './tabs/snmp/snmp.component';
import {LinksComponent} from './tabs/links/links.component';
import {UsersComponent} from './tabs/users/users.component';
import {NewUserComponent} from './tabs/users/new-user/new-user.component';
import {AdminDashboardComponent} from './tabs/admin-dashboard/admin-dashboard.component';
import {EditUserComponent} from './tabs/users/edit-user/edit-user.component';
import {SettingsComponent} from './tabs/settings/settings.component';
import {ProvisioningComponent} from './tabs/provisioning/provisioning.component';
import {NewProvisioningComponent} from './tabs/provisioning/new-provisioning/new-provisioning.component';
import {EditProvisioningComponent} from './tabs/provisioning/edit-provisioning/edit-provisioning.component';
import {SharedModule} from '../shared/shared.module';
import {AdminPanelRoutingModule} from './admin-panel-routing.module';
import {UserProfileComponent} from './tabs/user-profile/user-profile.component';
import {NewRoleComponent} from './tabs/user-profile/new-role/new-role.component';
import {EditRoleComponent} from './tabs/user-profile/edit-role/edit-role.component';
import {ViewUsersComponent} from './tabs/user-profile/view-users/view-users.component';
import {RelayComponent} from './tabs/relay/relay.component';
import {EditRelayComponent} from './tabs/relay/edit-relay/edit-relay.component';
import { LogsComponent } from './tabs/logs/logs.component';
import { DeviceLicenseInfoComponent } from './tabs/license/device-license-info/device-license-info.component';
import { UploadFileComponent } from './upload-file/upload-file.component';

@NgModule({
    declarations: [
        AdminPanelComponent,
        DatabaseComponent,
        LicenseComponent,
        SmtpComponent,
        SnmpComponent,
        LinksComponent,
        UsersComponent,
        NewUserComponent,
        AdminDashboardComponent,
        EditUserComponent,
        SettingsComponent,
        ProvisioningComponent,
        NewProvisioningComponent,
        EditProvisioningComponent,
        UserProfileComponent,
        NewRoleComponent,
        EditRoleComponent,
        ViewUsersComponent,
        LogsComponent,
        RelayComponent,
        EditRelayComponent,
        DeviceLicenseInfoComponent,
        UploadFileComponent,
    ],
    imports: [
        CommonModule,
        AdminPanelRoutingModule,
        SharedModule
    ],
    entryComponents: [
        NewUserComponent,
        EditUserComponent,
        NewProvisioningComponent,
        EditProvisioningComponent,
        NewRoleComponent,
        EditRoleComponent,
        ViewUsersComponent,
        EditRelayComponent
    ]
})
export class AdminPanelModule {
}
