Embedded Dashboard Report Version - V41
Release Date - 17-04-2023
Fixes - 

Changes done:
Daily and Weekly
•	 All card blank should be "--"
•	 View Detail and Overall Summary - Date consistent to mm-hh-yyyy hh:nn:ss
•	 POLQA detail table to be filtered for only non-blank POLQA Values - Done.
•	 Header icons to Slicer being shown - removed everywhere
•	 Start date ascending for Overall Summary
•	 Title fix for Daily and Weekly

Changes need to do be done before publishing to Power BI Service Workspace:

  1. Should prefix SubaccountName to report file name
       Example:If the SubaccountName is BT,
              	   BT-Daily.pbix,  BT-Weekly.pbix
				   
  2. Change Datasource as per your TAP Database Source for 3 tables to each file
      