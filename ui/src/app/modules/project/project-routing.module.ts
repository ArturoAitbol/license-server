import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProjectComponent } from './project.component';
import { ProjectRunComponent } from './project-run/project-run.component';

const routes: Routes = [
    {
        path: '',
        component: ProjectComponent,
    },
    {
        path: 'history/:id',
        component: ProjectRunComponent,
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule { }