@CTaaSFeature @spotlightDailyDashboardTest
Feature: spotlightDashboard
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @validateDailyReport
  Scenario: Go to the Spotlight Dashboard to validate the daily report
    Given I go to the spotlight dashboard of subaccount "Spotlight Demo-1" of customer "Spotlight Demo-1"
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
      |	 Timelapse      |	POLQA   |	Jitter    |	Packet Loss  |	Round Trip Time   |
      |	 00:00-01:00 	|	null    |	null   	  |	null	     |	null	          |
      |	 01:00-02:00 	|	2.43    |	8.93	  |	0.00	     |	134.00	          |
      |	 02:00-03:00 	|	2.27    |	10.25	  |	0.00	     |	199.00	          |
      |	 03:00-04:00 	|	null    |	null   	  |	null	     |	null	          |
      |	 04:00-05:00 	|	2.03	|	2.97	  |	0.00	     |	1.00	          |
      |	 05:00-06:00 	|	null   	|	null   	  |	null	     |	null	          |
      |	 06:00-07:00 	|	2.13	|	13.63	  |	0.00 	     |	216.00            |
      |	 07:00-08:00 	|	1.20    |	12.87	  |	13.24	     |	231.00            |
      |	 08:00-09:00 	|	2.01	|	14.38	  |	5.89	     |  239.00            |
      |	 09:00-10:00 	|	1.15	|	12.36	  |	13.15	     |  229.00            |
      |	 10:00-11:00 	|	2.18	|	13.34	  |	0.99	     |  203.00            |
      |	 11:00-12:00 	|	1.64	|	13.02	  |	22.07	     |	228.00            |
      |	 12:00-13:00 	|	2.26	|	17.79	  |	0.00	     |	135.00            |
      |	 13:00-14:00 	|	2.02	|	12.56	  |	0.00	     |	221.00            |
      |	 14:00-15:00 	|	1.83	|	12.08	  |	0.94	     |	214.00            |
      |	 15:00-16:00 	|	2.12	|	16.80	  |	8.79	     |	222.00            |
      |	 16:00-17:00 	|	2.14	|	16.39	  |	0.00	     |	210.00            |
      |	 17:00-18:00 	|	1.60   	|	18.14	  |	13.64	     |	258.00            |
      |	 18:00-19:00 	|	1.52	|	14.30	  |	2.28	     |	212.00            |
      |	 19:00-20:00 	|	1.49	|	10.84	  |	0.00	     |	3.00              |
      |	 20:00-21:00 	|	1.63	|	17.88	  |	0.00	     |	206.00            |
      |	 21:00-22:00 	|	2.21	|	18.25	  |	0.00	     |	211.00            |
      |	 22:00-23:00 	|	1.98	|	17.45	  |	0.00	     |	225.00            |
      |	 23:00-00:00 	|	2.56	|	11.87	  |	0.00	     |	211.00            |
    And I should see the Networks Trends Graphs with the following data
      |	 Timelapse      |	Packet Loss |	Jitter  |	Sent Bitrate  |	Round Trip Time	|
      |	 00:00-01:00 	|	0%	        |	11.98	|	36	          |	201	            |
      |	 01:00-02:00 	|	0%	        |	12.41	|	36	          |	199	            |
      |	 02:00-03:00 	|	0%	        |	32.72	|	36	          |	200	            |
      |	 03:00-04:00 	|	0%	        |	7.53	|	36	          |	134	            |
      |	 04:00-05:00 	|	0.33%	    |	11.48	|	38.98	      |	222	            |
      |	 05:00-06:00 	|	0%	        |	35.53	|	37.6	      |	144	            |
      |	 06:00-07:00 	|	0%	        |	13.63	|	36.37	      |	216	            |
      |	 07:00-08:00 	|	13.24%	    |	12.87	|	36.33	      |	231	            |
      |	 08:00-09:00 	|	5.89%	    |	14.38	|	36.79	      |	239	            |
      |	 09:00-10:00 	|	13.15%	    |	12.36	|	37.27	      |	229	            |
      |	 10:00-11:00 	|	0.99%	    |	13.34	|	37.21	      |	203	            |
      |	 11:00-12:00 	|	22.07%	    |	13.02	|	37.22      	  |	228	            |
      |	 12:00-13:00 	|	0%	        |	17.79	|	37.36	      |	135	            |
      |	 13:00-14:00 	|	0%	        |	12.56	|	36.22	      |	221	            |
      |	 14:00-15:00 	|	0.94%	    |	12.08	|	37.72	      |	214	            |
      |	 15:00-16:00 	|	8.79%	    |	16.8	|	36	          |	222	            |
      |	 16:00-17:00 	|	0%	        |	16.39	|	36.1	      |	210	            |
      |	 17:00-18:00 	|	13.64%	    |	18.14	|	37.33	      |	258	            |
      |	 18:00-19:00 	|	2.28%	    |	14.3	|	36.98	      |	212	            |
      |	 19:00-20:00 	|	0%	        |	10.84	|	40	          |	3	            |
      |	 20:00-21:00 	|	0%	        |	17.88	|	36.91	      |	206	            |
      |	 21:00-22:00 	|	0%	        |	18.25	|	36.32	      |	211	            |
      |	 22:00-23:00 	|	0%	        |	17.45	|	36.13	      |	225	            |
      |	 23:00-00:00 	|	0%	        |	11.87	|	36	          |	211	            |


  @validateNetworkQualityReport
  Scenario: Go to the Native Dashboard to validate the daily Network Quality Charts with Average values
    Given I go to the spotlight dashboard of subaccount "Spotlight Demo-1" of customer "Spotlight Demo-1"
    When I see the dashboard tab is fully loaded in the "Daily" report page
    And I change the selected value to "Average" in the Network Quality Section
    And I should see the Network Quality Summary with the following data
      | callsWithNetworkStats   | 210     |
      | jitterThreshold         | 2       |
      | packetLossThreshold     | 4       |
      | roundTripTimeThreshold  | 0       |
      | packetLoss              | 0.05    |
      | jitter                  | 7.17    |
      | roundTripTime           | 111.23  |
      | polqa                   | 3.84    |
      | sentBitrate             | 36.79   |
    And I should see the POLQA charts with the following data
      |	Timelapse	    |	POLQA  	|	Jitter 	|	Packet Loss	|	Round Trip Time	|
      |	 00:00-01:00 	|	null	|	null	|	null	    |	null	        |
      |	 01:00-02:00 	|	3.73	|	5.53	|	0.00	    |	120.78	        |
      |	 02:00-03:00 	|	3.75	|	8.26	|	0.00	    |	108.16	        |
      |	 03:00-04:00 	|	null	|	null	|	null	    |	null	        |
      |	 04:00-05:00 	|	4.24	|	1.92	|	0.00	    |	1.00	        |
      |	 05:00-06:00 	|	null	|	null	|	null	    |	null	        |
      |	 06:00-07:00 	|	3.77	|	5.87	|	0.00	    |	116.33	        |
      |	 07:00-08:00 	|	3.78	|	5.66	|	0.11	    |	139.25	        |
      |	 08:00-09:00 	|	3.81	|	6.90	|	0.06	    |	114.46	        |
      |	 09:00-10:00 	|	3.81	|	6.44	|	0.05	    |	113.89	        |
      |	 10:00-11:00 	|	3.91	|	6.11	|	0.01	    |	92.14	        |
      |	 11:00-12:00 	|	3.91	|	6.46	|	0.28	    |	107.76	        |
      |	 12:00-13:00 	|	4.03	|	5.28	|	0.00	    |	65.94	        |
      |	 13:00-14:00 	|	3.80	|	6.40	|	0.00	    |	110.81	        |
      |	 14:00-15:00 	|	3.82	|	6.48	|	0.01	    |	101.70	        |
      |	 15:00-16:00 	|	3.79	|	7.90    |	0.08	    |	125.21	        |
      |	 16:00-17:00 	|	3.80	|	8.94	|	0.00	    |	120.51	        |
      |	 17:00-18:00 	|	3.78	|	8.50    |	0.17	    |	122.77	        |
      |	 18:00-19:00 	|	3.89	|	8.18	|	0.01	    |	97.88	        |
      |	 19:00-20:00 	|	4.48	|	3.38	|	0.00	    |	1.56	        |
      |	 20:00-21:00 	|	3.80	|	9.29	|	0.00	    |	111.02	        |
      |	 21:00-22:00 	|	3.80	|	9.27	|	0.00	    |	111.79	        |
      |	 22:00-23:00 	|	3.80	|	7.86	|	0.00	    |	132.67	        |
      |	 23:00-00:00 	|	3.83	|	7.38	|	0.00	    |	132.08	        |
    And I should see the Networks Trends Graphs with the following data
      |	 Timelapse      |	Packet Loss  	|	Jitter 	|	Sent Bitrate  |	Round Trip Time	|
      |	 00:00-01:00 	|	0%	            |	9.11	|	36	          |	118.44	        |
      |	 01:00-02:00 	|	0%	            |	6.04	|	36	          |	117.16	        |
      |	 02:00-03:00 	|	0%	            |	8.82	|	36	          |	108.39	        |
      |	 03:00-04:00 	|	0%	            |	6.58	|	36	          |	91.33	        |
      |	 04:00-05:00 	|	0.01%	        |	3.47	|	38.98	      |	44.98	        |
      |	 05:00-06:00 	|	0%	            |	10.4	|	37.6	      |	84.56	        |
      |	 06:00-07:00 	|	0%	            |	5.87	|	36.37	      |	116.33	        |
      |	 07:00-08:00 	|	0.11%	        |	5.66	|	36.33	      |	139.25	        |
      |	 08:00-09:00 	|	0.06%	        |	6.9	    |	36.79	      |	114.46	        |
      |	 09:00-10:00 	|	0.05%	        |	6.44	|	37.27	      |	113.89	        |
      |	 10:00-11:00 	|	0.01%	        |	6.11	|	37.21	      |	92.14	        |
      |	 11:00-12:00 	|	0.28%	        |	6.46	|	37.22	      |	107.76	        |
      |	 12:00-13:00 	|	0%	            |	5.28	|	37.36	      |	65.94	        |
      |	 13:00-14:00 	|	0%	            |	6.4	    |	36.22	      |	110.81	        |
      |	 14:00-15:00 	|	0.01%	        |	6.48	|	37.72	      |	101.7	        |
      |	 15:00-16:00 	|	0.08%	        |	7.9	    |	36	          |	125.21	        |
      |	 16:00-17:00 	|	0%	            |	8.94	|	36.1	      |	120.51	        |
      |	 17:00-18:00 	|	0.17%	        |	8.5	    |	37.33	      |	122.77	        |
      |	 18:00-19:00 	|	0.01%	        |	8.18	|	36.98	      |	97.88	        |
      |	 19:00-20:00 	|	0%	            |	3.38	|	40	          |	1.56	        |
      |	 20:00-21:00 	|	0%	            |	9.29	|	36.91	      |	111.02	        |
      |	 21:00-22:00 	|	0%	            |	9.27	|	36.32	      |	111.79	        |
      |	 22:00-23:00 	|	0%	            |	7.86	|	36.13	      |	132.67	        |
      |	 23:00-00:00 	|	0%	            |	7.38	|	36	          |	132.08	        |