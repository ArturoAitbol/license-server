Embedded Dashboard Report Version - V47
Release Date - 16-05-2023 (DD-MM-YYYY)

v47 Daily and Weekly Dashboards
 What’s new:
	Clear separation between the two sections (‘Calls above threshold’ and ‘Metric vs POLQA’) for Customer Network Quality Report Page.
	.Execution Type and Call Type added to ‘Failed Call Detailed page’ and ‘POLQA detailed Page’ respectively.
Changes:
	All the parameters (Jitter, Round Trip Time etc) are taken as an average at call Level.
	For CNQ the values for Jitter, Round trip Time, Packet loss rate, POLQA replaced with max Jitter, Max Round Trip Time, Max Packet loss rate, and Least POLQA.
	For NQT Jitter, Round Trip Time, Received Packet loss Rate, Sent Bitrate replaced with Max Jitter, Max Round Trip Time, Max Received packet loss rate, Average Sent Bitrate.  
Bug Fixes:
	All Column header names for Execution Summary are consistent for CNQ and NQT.



Changes need to do be done before publishing to Power BI Service Workspace:

  1. Should prefix SubaccountName to report file name
       Example:If the SubaccountName is BT,
              	   BT-Daily.pbix,  BT-Weekly.pbix
				   
  2. Change Datasource as per your TAP Database Source for 3 tables to each file
      