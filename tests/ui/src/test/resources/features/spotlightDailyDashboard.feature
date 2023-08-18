@CTaaSFeature @spotlightDailyDashboardTest
Feature: spotlightDashboard
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @validateDailyReport
  Scenario: Go to the Spotlight Dashboard to validate the daily report
    Given I go to the spotlight dashboard of subaccount "DashboardFunctionalTest" of customer "DashboardFunctionalTest"
    When I see the dashboard tab is fully loaded in the "Daily" report page
    Then I should see the "daily-calling-reliability" chart with the following data
      | dataLabel           | Oops! There were some failures  |
      | percentageValue     | 99.48%                          |
      | numberOfCalls       | 191                             |
      | p2p                 | 15                              |
      | onNet               | 108                             |
      | offNet              | 68                              |
    And I should see the "daily-feature-functionality" chart with the following data
      | dataLabel           | Great! You had no failures  |
      | percentageValue     | 100%                        |
      | numberOfCalls       | 24                          |
      | p2p                 | 3                           |
      | onNet               | 21                          |
      | offNet              | 0                           |
    And I should see the Failed Calls chart with the following data
      | percentageValue     | 0.47% |
      | totalCalls          | 215   |
      | failedCalls         | 1     |
    And I should see the Voice Quality chart with the following data
      | numberOfCallStreams    | 390    |
      | numberOfCalls          | 195    |
      | excellent              | 7.95%  |
      | good                   | 92.05% |
      | fair                   | 0.00%  |
      | poor                   | 0.00%  |
    And I should see the Network Quality Summary with the following data
      | callsWithNetworkStats   | 210    |
      | jitterThreshold         | 2      |
      | packetLossThreshold     | 4      |
      | roundTripTimeThreshold  | 0      |
      | packetLoss              | 22.07  |
      | jitter                  | 35.53  |
      | roundTripTime           | 258    |
      | polqa                   | 1.15   |
      | sentBitrate             | 36.79  |
    And I should see the POLQA charts with the following data
      |	   Timelapse      	|   Min. POLQA  |	Avg. POLQA  |	Max. Jitter |	Avg. Jitter |   Max. Packet Loss  |	  Avg. Packet Loss  |	Max. Round Trip Time  |	Avg. Round Trip Time  |
      |	   00:00-01:00   	|	null    	|	null       	|	null        |	null     	|	null        	  |	  null             	|	null             	  |	null             	  |
      |	   01:00-02:00   	|	2.43	    |	3.73	    |	8.93	    |	5.53	    |	0%	              |	  0%                |	134	                  |	120.78	              |
      |	   02:00-03:00   	|	2.27	    |	3.75	    |	10.25	    |	8.26	    |	0%	              |	  0%                |	199	                  |	108.16	              |
      |	   03:00-04:00   	|	null    	|	null       	|	null      	|	null     	|	null        	  |	  null             	|	null             	  |	null                  |
      |	   04:00-05:00   	|	2.03	    |	4.24	    |	2.97	    |	1.92	    |	0%	              |	  0%                |	1	                  |	1	                  |
      |	   05:00-06:00   	|	null       	|	null       	|	null      	|	null     	|	null        	  |	  null             	|	null             	  |	null                  |
      |	   06:00-07:00   	|	2.13	    |	3.77	    |	13.63	    |	5.87	    |	0%	              |	  0%                |	216	                  |	116.33	              |
      |	   07:00-08:00   	|	1.20        |	3.78	    |	12.87	    |	5.66	    |	13.24%	          |	  0.11%	            |	231	                  |	139.25	              |
      |	   08:00-09:00   	|	2.01	    |	3.81	    |	14.38	    |	6.9	        |	5.89%	          |	  0.06%	            |	239	                  |	114.46	              |
      |	   09:00-10:00   	|	1.15	    |	3.81	    |	12.36	    |	6.44	    |	13.15%	          |	  0.05%	            |	229	                  |	113.89	              |
      |	   10:00-11:00   	|	2.18	    |	3.91	    |	13.34	    |	6.11	    |	0.99%	          |	  0.01%	            |	203	                  |	92.14	              |
      |	   11:00-12:00   	|	1.64	    |	3.91	    |	13.02	    |	6.46	    |	22.07%	          |	  0.28%	            |	228	                  |	107.76	              |
      |	   12:00-13:00   	|	2.26	    |	4.03	    |	17.79	    |	5.28	    |	0%	              |	  0%                |	135	                  |	65.94	              |
      |	   13:00-14:00   	|	2.02	    |	3.80        |	12.56	    |	6.4	        |	0%	              |	  0%                |	221	                  |	110.81	              |
      |	   14:00-15:00   	|	1.83	    |	3.82	    |	12.08	    |	6.48	    |	0.94%	          |	  0.01%	            |	214	                  |	101.7	              |
      |	   15:00-16:00   	|	2.12	    |	3.79	    |	16.8	    |	7.9	        |	8.79%	          |	  0.08%	            |	222	                  |	125.21	              |
      |	   16:00-17:00   	|	2.14	    |	3.80        |	16.39	    |	8.94	    |	0%	              |	  0%                |	210	                  |	120.51	              |
      |	   17:00-18:00   	|	1.60        |	3.78	    |	18.14	    |	8.5	        |	13.64%	          |	  0.17%	            |	258	                  |	122.77	              |
      |	   18:00-19:00   	|	1.52	    |	3.89	    |	14.3	    |	8.18	    |	2.28%	          |	  0.01%	            |	212	                  |	97.88	              |
      |	   19:00-20:00   	|	1.49	    |	4.48	    |	10.84	    |	3.38	    |	0%	              |	  0%                |	3	                  |	1.56  	              |
      |	   20:00-21:00   	|	1.63	    |	3.80        |	17.88	    |	9.29	    |	0%	              |	  0%                |	206	                  |	111.02	              |
      |	   21:00-22:00   	|	2.21	    |	3.80        |	18.25	    |	9.27	    |	0%	              |	  0%                |	211	                  |	111.79	              |
      |	   22:00-23:00   	|	1.98	    |	3.80        |	17.45	    |	7.86	    |	0%	              |	  0%                |	225	                  |	132.67	              |
      |	   23:00-00:00   	|	2.56	    |	3.83	    |	11.87	    |	7.38	    |	0%	              |	  0%                |	211	                  |	132.08	              |
    And I should see the Networks Trends Graphs with the following data
      |	    Timelapse      	|	Max. Packet Loss  |	Avg. Packet Loss  |	Max. Jitter |	Avg. Jitter |	Max. Round Trip Time  |	Avg. Round Trip Time  |	Sent Bitrate  |
      |	   00:00-01:00   	|	0%	              |	0%	              |	11.98	    |	9.11	    |	201	                  |	118.44	              |	36	          |
      |	   01:00-02:00   	|	0%	              |	0%	              |	12.41	    |	6.04	    |	199	                  |	117.16	              |	36	          |
      |	   02:00-03:00   	|	0%	              |	0%	              |	32.72	    |	8.82	    |	200	                  |	108.39	              |	36	          |
      |	   03:00-04:00   	|	0%	              |	0%	              |	7.53	    |	6.58	    |	134	                  |	91.33	              |	36	          |
      |	   04:00-05:00   	|	0.33%	          |	0.01%	          |	11.48	    |	3.47	    |	222	                  |	44.98	              |	38.98	      |
      |	   05:00-06:00   	|	0%	              |	0%	              |	35.53	    |	10.4	    |	144	                  |	84.56	              |	37.6	      |
      |	   06:00-07:00   	|	0%	              |	0%	              |	13.63	    |	5.87	    |	216	                  |	116.33	              |	36.37	      |
      |	   07:00-08:00   	|	13.24%	          |	0.11%	          |	12.87	    |	5.66	    |	231	                  |	139.25	              |	36.33	      |
      |	   08:00-09:00   	|	5.89%	          |	0.06%	          |	14.38	    |	6.9	        |	239	                  |	114.46	              |	36.79	      |
      |	   09:00-10:00   	|	13.15%	          |	0.05%	          |	12.36	    |	6.44	    |	229	                  |	113.89	              |	37.27	      |
      |	   10:00-11:00   	|	0.99%	          |	0.01%	          |	13.34	    |	6.11	    |	203	                  |	92.14	              |	37.21	      |
      |	   11:00-12:00   	|	22.07%	          |	0.28%	          |	13.02	    |	6.46	    |	228	                  |	107.76	              |	37.22	      |
      |	   12:00-13:00   	|	0%	              |	0%	              |	17.79	    |	5.28	    |	135	                  |	65.94	              |	37.36	      |
      |	   13:00-14:00   	|	0%	              |	0%	              |	12.56	    |	6.4	        |	221	                  |	110.81	              |	36.22	      |
      |	   14:00-15:00   	|	0.94%	          |	0.01%	          |	12.08	    |	6.48	    |	214	                  |	101.7	              |	37.72	      |
      |	   15:00-16:00   	|	8.79%	          |	0.08%	          |	16.8	    |	7.9	        |	222	                  |	125.21	              |	36	          |
      |	   16:00-17:00   	|	0%	              |	0%	              |	16.39	    |	8.94	    |	210	                  |	120.51	              |	36.1	      |
      |	   17:00-18:00   	|	13.64%	          |	0.17%	          |	18.14	    |	8.5	        |	258	                  |	122.77	              |	37.33	      |
      |	   18:00-19:00   	|	2.28%	          |	0.01%	          |	14.3	    |	8.18	    |	212	                  |	97.88	              |	36.98	      |
      |	   19:00-20:00   	|	0%	              |	0%	              |	10.84	    |	3.38	    |	3	                  |	1.56	              |	40	          |
      |	   20:00-21:00   	|	0%	              |	0%	              |	17.88	    |	9.29	    |	206	                  |	111.02	              |	36.91	      |
      |	   21:00-22:00   	|	0%	              |	0%	              |	18.25	    |	9.27	    |	211	                  |	111.79	              |	36.32	      |
      |	   22:00-23:00   	|	0%	              |	0%	              |	17.45	    |	7.86	    |	225	                  |	132.67	              |	36.13	      |
      |	   23:00-00:00   	|	0%	              |	0%	              |	11.87	    |	7.38	    |	211	                  |	132.08	              |	36	          |