import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableColumn } from 'src/app/model/table-column.model';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit, OnDestroy {
  data: any = [];
  public tableDataSource = new MatTableDataSource([]);
  public displayedColumns: string[];
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
  @Output() sort: EventEmitter<Sort> = new EventEmitter();
  @Output() rowAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() clickableRow: EventEmitter<any> = new EventEmitter<any>();

  // this property needs to have a setter, to dynamically get changes from parent component
  @Input() set tableData(data: any[]) {
    this.setTableDataSource(data);
  }
  constructor() {
  }

  ngOnInit(): void {
    const columnNames = this.tableColumns.map((tableColumn: TableColumn) => tableColumn.name);
    if (this.rowActionIcon) {
      this.displayedColumns = [...columnNames, this.rowActionIcon];
    } else {
      this.displayedColumns = columnNames;
    }
  }

  // we need this, in order to make pagination work with *ngIf
  ngAfterViewInit(): void {
    this.tableDataSource.paginator = this.matPaginator;
  }

  /**
   * set table data source
   * @param data: any 
   */
  setTableDataSource(data: any) {
    this.data = data;
    this.tableDataSource = new MatTableDataSource<any>(data);
    this.tableDataSource.paginator = this.matPaginator;
    this.tableDataSource.sort = this.matSort;
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
   */
  onClickableRow(selectedRow: any, selectedIndex: string, isClickableRow: boolean) {
    if (isClickableRow) {
      this.clickableRow.emit({ selectedRow, selectedIndex });
    }
  }

  ngOnDestroy(): void {
    this.tableDataSource.paginator = null;
    this.tableDataSource.sort = null;
    this.data = [];
  }
}