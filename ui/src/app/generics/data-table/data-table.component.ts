import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, OnChanges } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Utility } from 'src/app/helpers/utils';
import { TableColumn } from 'src/app/model/table-column.model';
import { SelectionModel } from "@angular/cdk/collections";

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  data: any = [];
  public tableDataSource = new MatTableDataSource([]);
  public displayedColumns: string[];
  public selection = new SelectionModel(true, []);
  public selectable = false;

  @ViewChild(MatPaginator, { static: false }) matPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  @Input() isRequestCompleted = false;
  @Input() isLoadingResults = true;
  @Input() isPageable = false;
  @Input() isSortable = false;
  @Input() isFilterable = false;
  @Input() tableColumns: TableColumn[];
  @Input() rowActionIcon: string;
  @Input() paginationSizes: number[] = [5, 10, 15];
  @Input() defaultPageSize = this.paginationSizes[1];
  @Input() actionMenuList: string[];
  @Input() serverSidePagination = false;
  @Input() length = 0;
  @Input() selectionById = false;
  @Output() sort: EventEmitter<Sort> = new EventEmitter();
  @Output() rowAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() clickableRow: EventEmitter<any> = new EventEmitter<any>();
  @Output() pageChanged = new EventEmitter<{ pageIndex: number, pageSize: number }>();
  
  // this property needs to have a setter, to dynamically get changes from parent component
  @Input() set tableData(data: any[]) {
    this.setTableDataSource(data);
  }

  @Input() set isSelectable(isSelectable: boolean) {
    this.selectable = isSelectable;
    if (this.displayedColumns) {
      if (isSelectable) {
        this.displayedColumns = ['select', ...this.displayedColumns];
      } else {
        this.displayedColumns.splice(0, 1);
      }
    }
  }
  
  ngOnInit(): void {
    // this.nestedKey = 'endpoint-resources'
    const columnNames = this.tableColumns.map((tableColumn: TableColumn) => tableColumn.name);
    this.displayedColumns = columnNames;
    if (this.selectable) this.displayedColumns = ['select', ...this.displayedColumns];
    if (this.rowActionIcon) this.displayedColumns = [...this.displayedColumns, this.rowActionIcon];

    //  Override the isSelected function of the SelectionModel
    if (this.selectionById)
      this.selection.isSelected = this.isSelected.bind(this);
  }

  ngOnChanges(): void {
    this.ngOnInit();
  }

  // we need this, in order to make pagination work with *ngIf
  ngAfterViewInit(): void {
    if (!this.serverSidePagination) {
      this.tableDataSource.paginator = this.matPaginator;
    }
  }

  /**
   * set table data source
   * @param data: any
   */
  setTableDataSource(data: any) {
    this.data = data;
    this.tableDataSource = new MatTableDataSource<any>(data);
    this.tableDataSource.sort = this.matSort;
    if (!this.serverSidePagination) {
      this.tableDataSource.paginator = this.matPaginator;
    }
  }

  toggleRow(element) {
    element.expandedElement = !element.expandedElement
  }
  /**
   * apply filter to the table
   * @param event: Event
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }
  /**
   * sort table data
   * @param sortParameters: Sort
   */
  sortTable(sortParameters: Sort) {
    // defining name of data property, to sort by, instead of column name
    sortParameters.active = this.tableColumns.find(column => column.name === sortParameters.active).dataKey;
    this.sort.emit(sortParameters);
  }
  /**
   * emit row action event
   * @param selectedRow: any
   * @param selectedOption: string
   * @param selectedIndex: string
   */
  emitRowAction(selectedRow: any, selectedOption: string, selectedIndex: string) {
    this.rowAction.emit({ selectedRow, selectedOption, selectedIndex });
  }
  /**
   * emit clickable row event
   * @param selectedRow: any
   * @param selectedIndex: string
   * @param isClickableRow: boolean
   * @param columnName: string
   */
  onClickableRow(selectedRow: any, selectedIndex: string, isClickableRow: boolean, columnName: string) {
    if (isClickableRow) {
      this.clickableRow.emit({ selectedRow, selectedIndex, columnName });
    }
  }
  /**
   * get color code based on the value
   * @param value: string
   * @param tableColumn: TableColumn
   * @returns: string
   */
  getColor(value: string, tableColumn: TableColumn): string | undefined {
    if (tableColumn.canHighlighted)
      return Utility.getColorCode(value[tableColumn.dataKey]);
  }

  /**
   * emit pageChanged event
   * @param event: PageEvent
   */
  onPageChange(event: PageEvent) {
    if (this.isPageable && this.serverSidePagination)
      this.pageChanged.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize })
  }

  /**
   * Return the current page index of the paginator
   */
  getPageIndex() {
    return this.matPaginator.pageIndex;
  }

  /**
   * Set the page index of the paginator
   * @param pageIndex
   */
  setPageIndex(pageIndex: number) {
    this.matPaginator.pageIndex = pageIndex;
  }

  isSelected(row: any): boolean {
    const found = this.selection.selected.find(el => el['id'] === row['id']);
    return !!found
  }

  ngOnDestroy(): void {
    this.tableDataSource.paginator = null;
    this.tableDataSource.sort = null;
    this.data = [];
  }
}
