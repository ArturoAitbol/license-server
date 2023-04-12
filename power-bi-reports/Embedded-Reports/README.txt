Embedded Dashboard Report Version - V39
Release Date - 12-04-2023
Fixes - 

Dashboard			Changes				Status	Remarks
Daily				No Changes to POLQA Detail	Done	 
Weekly			Change to no of calls		Done	 
Weekly			Add # calls to tt			Done	 
Weekly			Provide max for y axis		Done	 
Sharepoint list	22 - Execution TP: MAX(ED,Today())	Done	Implement in textbox
Sharepoint list	25 - Daily and weekly, CNQ		Done	Move graph header to top and filter and graph below

Changes need to do be done before publishing to Power BI Service Workspace:

  1. Should prefix SubaccountName to report file name
       Example:If the SubaccountName is BT,
              	   BT-Daily.pbix,  BT-Weekly.pbix
				   
  2. Change Datasource as per your TAP Database Source for 3 tables to each file
      