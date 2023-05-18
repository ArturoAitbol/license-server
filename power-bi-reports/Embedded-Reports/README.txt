Embedded Dashboard Report Version - V45
Release Date - 02-05-2023 (DD-MM-YYYY)

v45 Daily and Weekly Dashboards
 What’s new:
	In the detailed view, Failed Calls will have failure reasons and interrupted calls will have interrupted reasons.
	In the region filter, only regions with the appropriate failing error type will be displayed.
	The region filter will be populated from the transaction table.
	If no further issues, the Region Master table will be removed.
Changes:
	Removed Interrupted from the status column.
Bug Fixes:
	Weekly Icons are not overlapping any text.
	No header icons are displayed for any visual.
	All Calls below/above Threshold metrics now report the count of unique call IDs.


Changes need to do be done before publishing to Power BI Service Workspace:

  1. Should prefix SubaccountName to report file name
       Example:If the SubaccountName is BT,
              	   BT-Daily.pbix,  BT-Weekly.pbix
				   
  2. Change Datasource as per your TAP Database Source for 3 tables to each file
      