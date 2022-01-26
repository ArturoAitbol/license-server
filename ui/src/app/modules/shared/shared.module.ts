import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarModule } from 'ng-sidebar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ToastrModule } from 'ngx-toastr';
import { ProgressbarModule } from 'ngx-bootstrap';
import { UiSwitchModule } from 'ngx-ui-switch';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';


import { DataTableComponent } from 'src/app/generics/data-table/data-table.component';
import { ActionsModalComponent } from 'src/app/generics/actions-modal/actions-modal.component';
import { NewItemModalComponent } from 'src/app/generics/new-item-modal/new-item-modal.component';
import { ActionsFilterPipe } from 'src/app/pipes/actions-filter.pipe';
import { NotEmptyPipe } from 'src/app/pipes/not-empty.pipe';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { RolePipe } from 'src/app/pipes/role.pipe';
import { TagPipe } from 'src/app/pipes/tag.pipe';
import { NonePipe } from 'src/app/pipes/none.pipe';
import { NAPipe } from 'src/app/pipes/na.pipe';
import { InProgressPipe } from 'src/app/pipes/in-progress.pipe';
import { BlankPipe } from 'src/app/pipes/blank.pipe';
import { TracePipe } from 'src/app/pipes/trace.pipe';
import { PolyPipe } from '../../pipes/poly.pipe';


import { LoadingComponent } from 'src/app/generics/loading/loading.component';
import { SpinnerComponent } from 'src/app/generics/spinner/spinner.component';
// Directives
import { UniqueResourceDirective } from 'src/app/helpers/unique-resource.directive';
import { ForbiddenValueDirective } from 'src/app/helpers/forbidden-value.directive';
import { TableFilterDirective } from 'src/app/directives/table-filter.directive';
import { MustMatchDirective } from 'src/app/helpers/must-match.directive';
import { TableRowDirective } from 'src/app/directives/table-row.directive';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { AdminGuard } from 'src/app/guards/admin.guard';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgSelectModule } from '@ng-select/ng-select';
import { DraggableModalDirective } from 'src/app/directives/draggable-modal.directive';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';


@NgModule({
    declarations: [
        ActionsFilterPipe,
        NotEmptyPipe,
        FilterPipe,
        RolePipe,
        InProgressPipe,
        TagPipe,
        NAPipe,
        NonePipe,
        BlankPipe,
        TracePipe,
        PolyPipe,
        MustMatchDirective,
        DataTableComponent,
        ActionsModalComponent,
        NewItemModalComponent,
        LoadingComponent,
        SpinnerComponent,
        TableFilterDirective,
        TableRowDirective,
        UniqueResourceDirective,
        DraggableModalDirective,
        ForbiddenValueDirective,
    ],
    imports: [
        CommonModule,
        NgSelectModule,
        NgxChartsModule,
        FormsModule,
        ReactiveFormsModule,
        SidebarModule.forRoot(),
        ModalModule.forRoot(),
        AccordionModule.forRoot(),
        PopoverModule.forRoot(),
        TimepickerModule.forRoot(),
        ButtonsModule.forRoot(),
        BsDatepickerModule.forRoot(),
        UiSwitchModule,
        ScrollingModule,
        DragDropModule,
        ProgressbarModule.forRoot(),
        ToastrModule.forRoot({
            timeOut: 5000,
            closeButton: true,
        }),
        AutocompleteLibModule],
    providers: [
        DatePipe,
        AuthGuard,
        AdminGuard,
    ],
    exports: [
        ActionsFilterPipe,
        NotEmptyPipe,
        FilterPipe,
        RolePipe,
        TagPipe,
        NonePipe,
        InProgressPipe,
        NAPipe,
        BlankPipe,
        TracePipe,
        PolyPipe,
        FormsModule,
        ReactiveFormsModule,
        SidebarModule,
        ModalModule,
        ButtonsModule,
        AccordionModule,
        TimepickerModule,
        PopoverModule,
        BsDatepickerModule,
        ProgressbarModule,
        UiSwitchModule,
        ToastrModule,
        NgxChartsModule,
        NgSelectModule,
        MustMatchDirective,
        DragDropModule,
        ScrollingModule,
        DataTableComponent,
        ActionsModalComponent,
        NewItemModalComponent,
        LoadingComponent,
        SpinnerComponent,
        TableFilterDirective,
        DraggableModalDirective,
        TableRowDirective,
        UniqueResourceDirective,
        ForbiddenValueDirective,
        AutocompleteLibModule,
    ]
})
export class SharedModule {
}
