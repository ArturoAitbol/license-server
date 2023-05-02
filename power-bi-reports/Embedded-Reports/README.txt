Embedded Dashboard Report Version - V44
Release Date - 26-04-2023

v44 Daily and Weekly Dashboards
What’s new:
	1.Tp_name for Calling Reliability changed to include STS and POLQA.
	2.Call count logic for Q4 in daily and over time for Weekly has been changed due to the above point.
Bug Fixes:
 	1.All cards will show 0 or 0% for cases of blanks.
 	2.All Tooltips will show 0 or 0% for cases of blanks
 	3.Icons have changed to match the font and background. Alignment also rectified
	4.Execution Call Summary Link text has been rectified
        5.Call counts and percentages have been checked throughout dashboards and across daily and weekly.


Changes need to do be done before publishing to Power BI Service Workspace:

  1. Should prefix SubaccountName to report file name
       Example:If the SubaccountName is BT,
              	   BT-Daily.pbix,  BT-Weekly.pbix
				   
  2. Change Datasource as per your TAP Database Source for 3 tables to each file
      