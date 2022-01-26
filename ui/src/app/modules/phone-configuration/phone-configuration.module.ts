import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneConfigurationComponent } from './phone-configuration.component';
import { PhoneInventoryComponent } from './phone-inventory/phone-inventory.component';
import { PhoneListComponent } from './phone-list/phone-list.component';
import { SharedModule } from '../shared/shared.module';
import { PhoneConfigurationRoutingModule } from '../phone-configuration/phone-configuration-routing.module';
import { ListDetailsComponent } from './phone-list/list-operations/list-details/list-details.component';
import { AddPhoneComponent } from './phone-inventory/phone-operations/add-phone/add-phone.component';
import { PhoneDetailsComponent } from './phone-inventory/phone-operations/phone-details/phone-details.component';
import { PhoneTimelineComponent } from './phone-inventory/phone-operations/phone-timeline/phone-timeline.component';
import { TimeLineEventComponent } from './phone-inventory/phone-operations/phone-timeline/time-line-event/time-line-event.component';
import { PhoneConfComponent } from './phone-inventory/phone-operations/phone-details/phone-conf/phone-conf.component';
import { CovalentCommonModule } from '@covalent/core/common';
import { CovalentCodeEditorModule } from '@covalent/code-editor';
import { EditListComponent } from './phone-list/list-operations/edit-list/edit-list.component';
import { ColorTwitterModule } from 'ngx-color/twitter';
import { EditPhoneComponent } from './phone-inventory/phone-operations/edit-phone/edit-phone.component';
import { PhoneStatusPipe } from '../../pipes/phone-status.pipe';
import { ImportPhonesComponent } from './phone-inventory/import-phones/import-phones.component';
import { TroubleshootingComponent } from './phone-inventory/phone-operations/troubleshooting/troubleshooting.component';
import { VdmComponent } from './phone-inventory/phone-operations/vdm/vdm.component';
import { VdmTemplateComponent } from './phone-inventory/phone-operations/vdm-template/vdm-template.component';
import { UserInventoryComponent } from './user-inventory/user-inventory.component';
import { CreateUserComponent } from './user-inventory/user-operations/create-user/create-user.component';
import { EditUserComponent } from './user-inventory/user-operations/edit-user/edit-user.component';
import { UserListComponent } from './user-list/user-list.component';

@NgModule({
    declarations: [
        PhoneConfigurationComponent,
        PhoneInventoryComponent,
        AddPhoneComponent,
        PhoneDetailsComponent,
        PhoneConfComponent,
        PhoneTimelineComponent,
        TimeLineEventComponent,
        PhoneListComponent,
        ListDetailsComponent,
        EditListComponent,
        EditPhoneComponent,
        PhoneStatusPipe,
        ImportPhonesComponent,
        TroubleshootingComponent,
        VdmComponent,
        VdmTemplateComponent,
        UserInventoryComponent,
        CreateUserComponent,
        EditUserComponent,
        UserListComponent
    ],
    imports: [
        CommonModule,
        PhoneConfigurationRoutingModule,
        SharedModule,
        CovalentCommonModule,
        CovalentCodeEditorModule,
        ColorTwitterModule
    ],
    entryComponents: [
        AddPhoneComponent,
        PhoneDetailsComponent,
        PhoneTimelineComponent,
        ListDetailsComponent,
        EditListComponent,
        PhoneConfComponent,
        EditPhoneComponent,
        ImportPhonesComponent,
        TroubleshootingComponent,
        VdmComponent,
        CreateUserComponent,
        EditUserComponent
    ],
    exports: [PhoneStatusPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PhoneConfigurationModule {
}
