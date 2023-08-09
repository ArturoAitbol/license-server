import { Component, HostListener, OnInit } from '@angular/core';
import { ConsumptionMatrixService } from "../../services/consumption-matrix.service";
import { MatTableDataSource } from "@angular/material/table";
import { forkJoin } from "rxjs";
import { SnackBarService } from "../../services/snack-bar.service";

@Component({
  selector: 'app-consumption-matrix',
  templateUrl: './consumption-matrix.component.html',
  styleUrls: ['./consumption-matrix.component.css']
})
export class ConsumptionMatrixComponent implements OnInit {

  tableMaxHeight: number;
  tableColumns: any[] = [];
  displayedColumns: any[] = [];
  isLoadingResults = true;
  isRequestCompleted = false;
  consumptionMatrix = [];
  consumptionMatrixDataSource: MatTableDataSource<any>;
  isEditing = false;

  private readonly rowOrder = ['PBX', 'UCaaS', 'Contact Center', 'CCaaS', 'CPaaS'];

  constructor(private consumptionMatrixService: ConsumptionMatrixService,
              private snackBarService: SnackBarService) {
    this.isLoadingResults = true;
    this.isRequestCompleted = false;
  }

  ngOnInit(): void {
    this.initTable();
    this.fetchData();
  }

  @HostListener('window:resize')
  sizeChange() {
    this.calculateTableHeight();
  }

  initTable(): void {
    // Set table height
    this.calculateTableHeight();
    this.tableColumns = [
      {name: 'Device/Phone/ATA', dataKey: 'Device/Phone/ATA', position: 'left'},
      {name: 'Soft Client/UC Client', dataKey: 'Soft Client/UC Client', position: 'left'},
      {name: 'SBC', dataKey: 'SBC', position: 'left'},
      {name: 'BYOC', dataKey: 'BYOC', position: 'left'},
      {name: 'Application', dataKey: 'Application', position: 'left'},
      {name: 'Headset', dataKey: 'Headset', position: 'left'},
      {name: 'Video Collab Device (ROW)', dataKey: 'Video Collab Device (ROW)', position: 'left'},
      {name: 'Video Collab Device (US)', dataKey: 'Video Collab Device (US)', position: 'left'},
    ];
    this.displayedColumns = this.tableColumns.map(tableColumn => tableColumn.name);
    this.displayedColumns.unshift("callingPlatform");
  }

  private fetchData() {
    this.isLoadingResults = true;
    this.isRequestCompleted = false;
    this.consumptionMatrix = [];
    this.consumptionMatrixService.getConsumptionMatrix().subscribe(res => {
      this.isRequestCompleted = true;
      const callingPlatformMap = new Map();
      const columns: Set<string> = new Set();
      res.consumptionMatrix.forEach(entry => {
        callingPlatformMap.set(entry.callingPlatform, {[entry.dutType]: { tokens: entry.tokens, id: entry.id, updatedBy: entry.updatedBy, modified: false},...callingPlatformMap.get(entry.callingPlatform)});
        columns.add(entry.dutType);
      });

      // get the calling platforms in order, if more calling platforms are added in the future please add them to the rowOrder object
      this.rowOrder.forEach(callingPlatform => {
        this.consumptionMatrix.push({ callingPlatform, ...callingPlatformMap.get(callingPlatform) });
      });

      //Initialize the token attribute for non-existent cells, else an error occurs when rendering
      this.consumptionMatrix.forEach(row => {
        this.displayedColumns.slice(1).forEach(column => {
          if (row[column] == null || row[column]== undefined) row[column] = { tokens: null }
        })
      });
      this.consumptionMatrixDataSource = new MatTableDataSource<any>(this.consumptionMatrix);
      this.isLoadingResults = false;
    });
  }

  updateTokenValue(tokens, element) {
    element.tokens = tokens;
    element.modified = true;
  }

  enableEditing() {
    this.isEditing = true;
  }

  saveChanges() {
    this.isEditing = false;
    const requests = [];
    this.consumptionMatrixDataSource.data.forEach(row => {
      // Slice the columns to skip the callingPlatform column
      this.displayedColumns.slice(1).forEach(column => {
        const entry = row[column];
        if (entry?.modified) {
          if (entry.tokens != '') {
            if (entry.id) {
              requests.push(this.consumptionMatrixService.updateConsumptionMatrix(entry.id, {dutType: column, callingPlatform: row.callingPlatform, tokens: entry.tokens}));
            } else {
              requests.push(this.consumptionMatrixService.createConsumptionMatrix({id: entry.id, dutType: column, callingPlatform: row.callingPlatform, tokens: entry.tokens}));
            }
          } else {
            if(entry.id) requests.push(this.consumptionMatrixService.deleteConsumptionEntry(entry.id));
          }
        }
      });
    });
    forkJoin(requests).subscribe(results => {
      if (results.some((result: any) => result?.error)) {
        this.snackBarService.openSnackBar('An error occurred while saving the matrix', '');
        this.fetchData();
      } else {
        this.snackBarService.openSnackBar('The matrix was saved correctly!', '');
        this.fetchData();
      }
    }, error => {
      this.snackBarService.openSnackBar('An error occurred while saving the matrix', '');
      this.fetchData();
    });
  }

  cancel() {
    this.isEditing = false;
    this.fetchData();
  }

  private calculateTableHeight(): void {
    this.tableMaxHeight = window.innerHeight // doc height
        - (window.outerHeight * 0.01 * 2) // - main-container margin
        - 60 // - route-content margin
        - 20 // - dashboard-content padding
        - 30 // - table padding
        - 32 // - title height
        - (window.outerHeight * 0.05 * 2); // - table-section margin
  }

}
