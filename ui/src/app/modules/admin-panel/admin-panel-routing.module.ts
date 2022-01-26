import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminPanelComponent } from './admin-panel.component';

const routes: Routes = [
    {
        path: '',
        component: AdminPanelComponent
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminPanelRoutingModule { }