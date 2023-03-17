Embedded Dashboard Report Version - V31
Realse Date - 14-03-2023
Fixes - Performance tuning and Visual loading locking conflicts


Changes need to do be done before publishing to Power BI Service Workspace:

  1. Should prefix SubaccountName to report file name
       Example:If the SubaccountName is BT,
              	   BT-Daily.pbix,  BT-Weekly.pbix
				   
  2. Change Datasource as per your TAP Database Source for 3 tables to each file
      