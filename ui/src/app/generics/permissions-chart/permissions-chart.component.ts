import { Component, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-permissions-chart',
  templateUrl: './permissions-chart.component.html',
  styleUrls: ['./permissions-chart.component.css']
})
export class PermissionsChartComponent implements OnInit {

  constructor(public dialogService: DialogService, public dialogRef: MatDialogRef<PermissionsChartComponent> ) { }

  tableData: any;
  tableHeader: any;
  ngOnInit(): void {
    this.tableHeader = ['Role ', 'Administrator', 'Stakeholder'];

    this.tableData = {
      row: [
        {
          action: 'Onboarding Wizard',
          administrator: true,
          stakeholder: false,
        },
        {
          action: 'View SpotLight Users and their roles (Admin or Stakeholder)',
          administrator: true,
          stakeholder: true,
        },
        {
          action: 'View/Add/Delete/Modify SpotLight Users (Managing users)',
          administrator: true,
          stakeholder: false,
        },
        {
          action: 'Change Roles of SpotLight Users',
          administrator: true,
          stakeholder: false,
        },
        {
          action: 'Contact Support',
          administrator: true,
          stakeholder: true,
        },
        {
          action: 'View Map (Visualization with regions and stats)',
          administrator: true,
          stakeholder: true,
        },
        {
          action: 'View Dashboard (Visualizations and notes)',
          administrator: true,
          stakeholder: true,
        },
        {
          action: 'Add notes in the dashboard',
          administrator: true,
          stakeholder: false,
        },
        {
          action: 'View and download detailed test reports',
          administrator: true,
          stakeholder: true,
        },
        {
          action: 'View/Filter DIDs',
          administrator: true,
          stakeholder: true,
        },
        {
          action: 'View/Filter Regions',
          administrator: true,
          stakeholder: true,
        },
      ]
    };
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }
}
