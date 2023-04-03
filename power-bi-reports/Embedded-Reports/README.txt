Embedded Dashboard Report Version - V37
Release Date - 31-03-2023
Fixes - 
•	Packet Loss visual not loading.
•	"POLQA" Filter is to be applied only on Selected Metric vs VQT.


Changes need to do be done before publishing to Power BI Service Workspace:

  1. Should prefix SubaccountName to report file name
       Example:If the SubaccountName is BT,
              	   BT-Daily.pbix,  BT-Weekly.pbix
				   
  2. Change Datasource as per your TAP Database Source for 3 tables to each file
      