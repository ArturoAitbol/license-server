import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TableFilterDirective } from 'src/app/directives/table-filter.directive';
import { TableRowDirective } from 'src/app/directives/table-row.directive';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Router } from '@angular/router';
import { DataTableService } from 'src/app/services/data-table.service';
import { Constants } from 'src/app/model/constant';

@Component({
    selector: 'data-table',
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent implements OnInit, OnDestroy, AfterContentInit {
    subscription: Subscription;

    @ViewChild('tableHeader', { static: true }) tableHeader: any;
    @ViewChild('tableBody', { static: true }) tableBody: ElementRef;
    @ViewChild('toolPanelModal', { static: true }) toolPanelModal: any;
    @ViewChild('dragi', { static: false }) dragi: ElementRef;
    @ContentChild(TableFilterDirective, { static: true }) filter: TableFilterDirective;
    @ContentChild(TableRowDirective, { static: true }) row: TableRowDirective;
    @Input() data: any = [];
    @Input() columnDefs: any;
    @Input() colsTag: any;
    @Input() filterAndSort: boolean;
    @Input() filters: any;
    @Input() selectedHeight: string;
    @Input() dataFrom: string;
    @Input() virtualScroll: boolean = false;
    @Input() dataflow: boolean;

    // @Output() receivedData: any = new EventEmitter();
    @Output() rowSelected: any = new EventEmitter();

    sortField: string;
    sortType: string;
    totalPortions: number;
    tableWidth: number;
    filterTemplate: TemplateRef<any>;
    rowTemplate: TemplateRef<any>;
    clickedRowId: number;
    maxHeight: string = '70vh';
    alterHeight: string = '68vh';
    viewFilters: boolean = false;
    modalRef: BsModalRef;
    measurement: string;
    rowQty: number = 100;
    modalConfig: any = { backdrop: true, class: 'modal-dialog-centered modal-md', ignoreBackdropClick: true };
    // dragPosition = { x: 0, y: 0 };
    // lastPosition: any = 0;
    offset: any = 0;

    constructor(private modalService: BsModalService,
        private router: Router,
        private dataTableService: DataTableService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.sortField = '';
        this.sortType = '';
        this.getSavedColsConf();
        this.getWidthPortions();
        this.alterTableHeight();
        this.dataTableService.updateWidth.emit();
        this.dataTableService.updateTableHeight.subscribe((response: string) => {
            this.selectedHeight = response;
            this.alterTableHeight();
            this.cd.detectChanges();
        });

    }
    alterTableHeight(): void {
        if (this.selectedHeight) {
            this.measurement = this.selectedHeight.slice(-2);
            var value = this.selectedHeight.replace(this.measurement, '');
            var alter = +value - 2;
            this.maxHeight = this.selectedHeight;
            this.alterHeight = alter + this.measurement;
        }
    }
    ngAfterContentInit() {
        if (this.filter) {
            this.filterTemplate = this.filter.filterTemplate;
        }
        if (this.row) {
            this.rowTemplate = this.row.rowTemplate;
        }
    }

    update() {
        this.cd.detectChanges();
        this.dataTableService.refresh.emit();
    }

    public getWidthPortions() {
        this.setTableWidth(this.visibleCols().length);
        this.totalPortions = 0;
        this.columnDefs.forEach((column: any) => {
            if (!column.hidden) {
                this.totalPortions += column.width;
            }
        });
    }

    setTableWidth(visibleColumns) {
        if (visibleColumns > 9) {
            this.tableWidth = 100 + ((visibleColumns - 9) * 15);
        } else {
            this.tableWidth = 100;
        }
    }

    setScrollStyle() {
        if (this.rowQty > 99) {
            return { 'height': this.alterHeight, 'max-height': this.alterHeight, 'background': '#f1f0f0' };
        } else {
            return { 'height': (this.rowQty * 61) + 'px', 'max-height': this.alterHeight, 'background': '#f1f0f0' };
        }
    }

    clickedRow(item: any, rowId: number) {
        this.clickedRowId = rowId;
        this.rowSelected.emit(item);
    }

    isHidden(key: string) {
        for (let i = 0; i < this.columnDefs.length; i++) {
            if (this.columnDefs[i].field == key) {
                return this.columnDefs[i].hidden;
            }
        }
    }

    obtainData() {
        return this.data;
    }

    adjustHeader() {
        return this.tableHeader.nativeElement.offsetHeight;
    }

    adjustFilter() {
        return this.tableBody.nativeElement.offsetHeight;
    }

    visibleCols(): any[] {
        return this.columnDefs.filter((column: any) => !column.hidden);
    }

    getColumnWidth(column: any) {
        return (column.width * 100 / this.totalPortions) + '%';
    }

    disableHide(column: any): boolean {
        if (column.suppressHide) {
            return true;
        }
        if (this.visibleCols().length > 1 || column.hidden) {
            return false;
        }
        return true;
    }

    changeHidden(column: any, index: number) {
        column.hidden = !column.hidden;
        localStorage.setItem(this.colsTag, JSON.stringify(this.columnDefs));
        this.getWidthPortions();
        this.dataTableService.updateWidth.emit();
    }

    getSavedColsConf() {
        // get the local storage value
        const isPhoneInventoryColDeleted = localStorage.getItem(Constants.DELETE_PHONE_COL_TAG);
        // check if isPhoneInventoryColDeleted is null and colsTag is phone inventory
        if (this.colsTag === Constants.PHONE_INVENTORY_COL_TAG && !isPhoneInventoryColDeleted) {
            // set true flag
            localStorage.setItem(Constants.DELETE_PHONE_COL_TAG, JSON.stringify(true));
            // delete phone inventory key from the local storage
            localStorage.removeItem(Constants.PHONE_INVENTORY_COL_TAG);
        }
        let colsConfig: any = localStorage.getItem(this.colsTag);
        if (!colsConfig) {
            localStorage.setItem(this.colsTag, JSON.stringify(this.columnDefs));
        } else {
            colsConfig = JSON.parse(localStorage.getItem(this.colsTag));
            for (let i = 0; i < colsConfig.length; i++) {
                this.columnDefs[i].hidden = colsConfig[i].hidden;
            }
        }
    }

    public openToolPanelModal() {
        this.modalRef = this.modalService.show(this.toolPanelModal, this.modalConfig);
    }

    public showFilters() {
        this.viewFilters = !this.viewFilters;
        this.update();
    }

    public hideModal() {
        if (this.modalRef) {
            this.modalRef.hide();
        }
    }

    storeClicked(item: any, index: any) {
        if (item.field != this.sortField) {
            this.sortType = '';
        }
        localStorage.setItem('sortCol', JSON.stringify({ sortType: this.sortType, elementId: 'inventoryCol-' + index }));
    }

    sortBy(column: any) {
        if (this.data.length > 1) {
            if (column.suppressSort) {
                return;
            }
            if (this.sortField == column.field) {
                if (this.sortType != 'desc') {
                    this.sortField = '';
                    return;
                }
                this.sortType = 'asc';
            } else {
                this.sortType = 'desc';
                this.sortField = column.field;
            }
            this.sortData();
        }
    }

    sortData() {
        this.data = this.data.sort((a: any, b: any) => {
            // set null values as empty
            if (a[this.sortField] == null) {
                a[this.sortField] = '';
            }
            // set null values as empty
            if (b[this.sortField] == null) {
                b[this.sortField] = '';
            }

            if (a[this.sortField] == b[this.sortField]) {
                return 0;
            }
            if (a[this.sortField] < b[this.sortField]) {
                return this.sortType == 'asc' ? -1 : 1;
            }
            if (a[this.sortField] > b[this.sortField]) {
                return this.sortType == 'asc' ? 1 : -1;
            }
        });
        this.data = [...this.data];
    }

    isSortingField(column: any, type: string) {
        if (column.suppressSort) {
            return false;
        }
        return (column.field == this.sortField && type == this.sortType);
    }

    sortClass(item: any) {
        if (this.colsTag === 'upload-file' && this.router.url === '/adminPanel' && (item.field === 'vendor' || item.header === 'File Name')) {
            return (item.field == this.sortField) ? 'sort-' + this.sortType + ' ' + 'alignLeft' : 'alignLeft';
            // return 'alignLeft'; 
        }
        if (this.data.length > 1) {
            if ((item.header === 'Name' || item.header === 'Test Plan') && this.router.url === '/projects') {
                return (item.field == this.sortField) ? 'sort-' + this.sortType + ' ' + 'phoneNameField' : 'phoneNameField';
            }

            if (item.header === 'Description' && this.router.url === '/phoneConfiguration') {
                return (item.field == this.sortField) ? 'sort-' + this.sortType + ' ' + 'alignLeft' : 'alignLeft';
            }

            if ((item.header === 'Name' || item.header === 'User Name') && (this.router.url === '/phoneConfiguration' || this.router.url === '/testCases' || this.router.url === '/projects')) {
                return (item.field == this.sortField) ? 'sort-' + this.sortType + ' ' + 'alignLeft' : 'alignLeft';
            }
            // to make the align left
            if ((item.field === 'vendor' || item.field === 'server') && (this.router.url !== '/phoneConfiguration' &&
                this.router.url !== '/adminPanel' && this.router.url !== '/projects' && this.router.url !== '/testCases')) {
                return (item.field == this.sortField) ? 'sort-' + this.sortType + ' ' + 'alignLeft' : 'alignLeft';
            }
            if (item.field == this.sortField) {
                return 'sort-' + this.sortType;
            } else {
                return '';
            }
        } else {
            if ((item.header === 'User Name' || item.header === 'Name' || item.header === 'Description') && (this.router.url === '/phoneConfiguration' || this.router.url === '/projects')) {
                return 'alignLeft';
            }
            return '';
        }
    }
    /**
     * enable data loading message only for selected tables
     */
    enableDataLoadingMessage(): boolean {
        switch (this.colsTag) {
            case Constants.DASHBOARD_COL_TAG:
            case Constants.PROJECT_RUN_HISTORY_COL_TAG:
            case Constants.CALL_SERVER_COL_TAG:
            case Constants.RELAY_COL_TAG:
            case Constants.USERS_COL_TAG:
            case Constants.ROLE_MANAGEMENT_COL_TAG:
            case Constants.UPLOAD_FILE_COL_TAG:
            case Constants.PROJECT_RESOURCES_LIST_COL_TAG:
            case Constants.PROJECT_ASSOCIATED_RESOURCES_LIST_COL_TAG:
            case Constants.PHONE_POOL_LIST_COL_TAG:
                return true;
            default:
                return false;
        }
    }
    // dragColumn(event: CdkDragEnd, item: any) {
    //     let widthToAdd = 0;
    //     this.offset = { ...(<any>event.source._dragRef)._passiveTransform };

    //     if (this.lastPosition > this.offset.x)
    //         widthToAdd = ((-this.lastPosition) - (-this.offset.x)) / 30;
    //     else
    //         widthToAdd = -((-this.offset.x) - (-this.lastPosition)) / 30;

    //     item.width = item.width + widthToAdd;
    //     this.lastPosition = this.offset.x;

    //     this.dragPosition = { x: 0, y: 0 };
    // }
    /**
     * on scroll table
     */
    onScroll(): void {
        this.dataTableService.scrollEvent.emit();
    }

    ngOnDestroy() {
    }
}
