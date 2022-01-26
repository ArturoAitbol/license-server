import { PhoneConfigurationComponent } from './phone-configuration.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { VdmComponent } from './phone-inventory/phone-operations/vdm/vdm.component';
import { VdmTemplateComponent } from './phone-inventory/phone-operations/vdm-template/vdm-template.component';

const routes: Routes = [
    {
        path: '',
        component: PhoneConfigurationComponent
    },
    {
        path: ':model/template',
        component: VdmTemplateComponent
    },
    {
        path: ':id/vdm',
        component: VdmComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PhoneConfigurationRoutingModule {
}
