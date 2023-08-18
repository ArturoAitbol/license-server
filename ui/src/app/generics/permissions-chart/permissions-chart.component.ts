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
    this.tableHeader = ['Role ', 'Admin', 'Stakeholder'];

    this.tableData = {
      row: [
        {
          action: 'Onboarding Wizard',
          admin: true,
          stakeholder: false,
        },
        {
          action: 'View UCaaS Users and their roles (Admin or Stakeholder)',
          admin: true,
          stakeholder: true,
        },
        {
          action: 'Add/Delete/Modify UCaaS Users (Managing users)',
          admin: true,
          stakeholder: false,
        },
        {
          action: 'Change Roles of UCaaS Users',
          admin: true,
          stakeholder: false,
        },
        {
          action: 'Contact Support',
          admin: true,
          stakeholder: true,
        },
        {
          action: 'View Map (Visualization with regions and stats)',
          admin: true,
          stakeholder: true,
        },
        {
          action: 'View Dashboard (Visualizations and notes)',
          admin: true,
          stakeholder: true,
        },
        {
          action: 'Add notes in the dashboard',
          admin: true,
          stakeholder: false,
        },
        {
          action: 'View and download detailed test reports',
          admin: true,
          stakeholder: true,
        },
        {
          action: 'View/Filter DIDs',
          admin: true,
          stakeholder: true,
        },
        {
          action: 'View/Filter Regions',
          admin: true,
          stakeholder: true,
        },
      ]
    };
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }
}
