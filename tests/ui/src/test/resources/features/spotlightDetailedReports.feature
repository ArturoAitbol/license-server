@CTaaSFeature @spotlightDetailedReportsTest @spotLightDashboard
Feature: spotlightDashboard
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page
    And I close all tabs but the current one

  @validateCallingReliability
  Scenario: Go to the Calling Reliability detailed report
    Given I go to the spotlight dashboard of subaccount "DashboardFunctionalTest" of customer "DashboardFunctionalTest"
    When I see the dashboard tab is fully loaded in the "Daily" report page
    Then I click on "Calling Reliability Detailed Report" button
    And I should see the "Calling Reliability + Voice Quality (POLQA)" subtitle
    And I should see the summary table with the following data
        | Test Cases Executed           | 191                           |
        | Passed                        | 190                           |
        | Failed                        | 1                             |
        | Start Time                    | 06/24/2023 06:14:17           |
        | End Time                      | 06/24/2023 23:30:15           |
    And I should see the Endpoint Resources table with the following regions
        | Las Vegas, Nevada, United States, 88901           |
        | Franklin, Tennessee, United States, 37065         |
        | San Antonio, Texas, United States, 78202          |
        | San Antonio, Texas, United States, 78202          |
        | Pittsburgh, Pennsylvania, United States, 15203    |
        | Rockport, Texas, United States, 78381             |
        | Tampa, Florida, United States, 33601              |
        | Chicago, Illinois, United States, 60601           |
        | Rockport, TX, United States, 78381                |
        | Woodville, Texas, United States, 75979            |
        | Woodville, Texas, United States, 75979            |
        | Chicago, Illinois, United States, 60601           |
        | Tampa, Florida, United States, 33601              |

    And I should see the Details table with the following columns
        | Test Case |
        | Start Date |
        | From       |
        | From POLQA |
        | To         |
        | To POLQA   |
        | Status     |
        | Call Type  |

    And I should see the Details table with the following data
        | Test Case     | Many-Many-POLQA-A to B   |
        | Start Date    | 06/24/2023 23:22:04      |
        | From          | 2142428803               |
        | From POLQA    | Min: N/A, Avg: N/A       |
        | To            | 9725980054               |
        | To POLQA      | Min: N/A, Avg: N/A       |
        | Status        | FAILED                   |
        | Call Type     | On-Net                   |
#    Then I click on "Many-Many-POLQA-A to B drop-button" button
#    And I should see the detailed row table with the following data
#        | Start Date                | 06/24/2023 23:22:04   |
#        | End Date                  | 06/24/2023 23:27:56   |
#        | Status                    | FAILED                |
#        | Call Type                 | On-Net                |
#        | Error Category            | Routing               |
#        | Reason                    | Routing: Unavailable, The person you're trying to reach isn't available. Try again later.|
#        | From Jitter (ms)          | N/A                   |
#        | To Jitter (ms)            | N/A                   |
#        | From Round trip time (ms) | N/A                   |
#        | To Round trip time (ms)   | N/A                   |
#        | From Packet Loss (%)      | N/A                   |
#        | To Packet Loss (%)        | N/A                   |
#        | From Bitrate (kbps)       | N/A                   |
#        | To Bitrate (kbps)         | N/A                   |
#    And I should see the following data in the DID section
#    | From      | 2142428803           |
#    | To        | 9725980054           |

  @validateFunctionality
  Scenario: Go to the Feature Funcionality detailed report
    Given I go to the spotlight dashboard of subaccount "DashboardFunctionalTest" of customer "DashboardFunctionalTest"
    When I see the dashboard tab is fully loaded in the "Daily" report page
    Then I click on "Feature Functionality Detailed Report" button
    And I should see the "Feature Functionality" subtitle
    And I should see the summary table with the following data
        | Test Cases Executed           | 24                            |
        | Passed                        | 24                            |
        | Failed                        | 0                             |
        | Start Time                    | 06/24/2023 00:39:51           |
        | End Time                      | 06/24/2023 06:04:44           |
    And I should see the Endpoint Resources table with the following regions
        | Chicago, Illinois, United States, 60601       |
        | Woodville, Texas, United States, 75979        |
        | San Antonio, Texas, United States, 78202      |
        | Tampa, Florida, United States, 33601          |

    And I should see the Details table with the following columns
        | Test Case     |
        | Start Date    |
        | From          |
        | From POLQA    |
        | To            |
        | To POLQA      |
        | Status        |
        | Call Type     |

    And I should see the Details table with the following data
        | Test Case     | 2_Func_tekV-Basic-MSTeams-001    |
        | Start Date    | 06/24/2023 00:39:51              |
        | From          | 9725980066                       |
        | From POLQA    | Min: N/A, Avg: N/A               |
        | To            | 2142428818                       |
        | To POLQA      | Min: N/A, Avg: N/A               |
        | Status        | PASSED                           |
        | Call Type     | On-Net                           |
#    Then I click on "2_Func_tekV-Basic-MSTeams-001 drop-button" button
#    And I should see the detailed row table with the following data
#        | Start Date                | 06/24/2023 00:39:51   |
#        | End Date                  | 06/24/2023 00:45:30   |
#        | Status                    | PASSED                |
#        | Call Type                 | On-Net                |
#        | Error Category            | N/A                   |
#        | Reason                    | N/A                   |
#        | From Jitter (ms)          | Max: 8.93, Avg: 8.82  |
#        | To Jitter (ms)            | Max: 8.8, Avg: 8.57   |
#        | From Round trip time (ms) | Max: 49, Avg: 48.33   |
#        | To Round trip time (ms)   | Max: 135, Avg: 134.33 |
#        | From Packet Loss (%)      | Max: 0, Avg: 0        |
#        | To Packet Loss (%)        | Max: 0, Avg: 0        |
#        | From Bitrate (kbps)       | Avg: 36               |
#        | To Bitrate (kbps)         | Avg: 36               |
#    And I should see the following data in the DID section
#        | From      | 9725980066           |
#        | To        | 2142428818           |
#    And I click on "drop-from" button
#    And I should see the DID "from" table with the following data
#        | Sent packets	            | 3417 packets  |
#        | Received codec            | SILKWide      |
#        | Sent bitrate	            | 36 Kbps       |
#        | Received packet loss      | 0.00%         |
#        | Received Jitter	        | 8.93 ms       |
#        | Sent codec	            | SILKWide      |
#        | Round trip time	        | 49.00 ms      |
#        | Received packets	        | 3323 packets  |
#        | POLQA	                    | N/A           |
#    And I click on "drop-to" button
#    And I should see the DID "to" table with the following data
#        | Sent packets	            | 2285 packets  |
#        | Received codec            | SILKWide      |
#        | Sent bitrate	            | 36 Kbps       |
#        | Received packet loss      | 0.00%         |
#        | Received Jitter	        | 8.59 ms       |
#        | Sent codec	            | SILKWide      |
#        | Round trip time	        | 134.00 ms     |
#        | Received packets	        | 1465 packets  |
#        | POLQA	                    | N/A           |

  @validateVoiceQuality
  Scenario: Go to the Voice Quality detailed report
    Given I go to the spotlight dashboard of subaccount "DashboardFunctionalTest" of customer "DashboardFunctionalTest"
    When I see the dashboard tab is fully loaded in the "Daily" report page
    Then I click on "Voice Quality Detailed Report" button
    And I should see the "Feature Functionality + Calling Reliability + Voice Quality (POLQA)" subtitle
    And I should see the summary table with the following data
        | Test Cases Executed           | 195                           |
        | Passed                        | 195                           |
        | Failed                        | 0                             |
        | Start Time                    | 06/24/2023 01:01:03           |
        | End Time                      | 06/24/2023 23:30:15           |
    And I should see the Endpoint Resources table with the following regions
        | Las Vegas, Nevada, United States, 88901           |
        | Franklin, Tennessee, United States, 37065         |
        | San Antonio, Texas, United States, 78202          |
        | San Antonio, Texas, United States, 78202          |
        | Pittsburgh, Pennsylvania, United States, 15203    |
        | Rockport, Texas, United States, 78381             |
        | Tampa, Florida, United States, 33601              |
        | Tampa, Florida, United States, 33601              |
        | Chicago, Illinois, United States, 60601           |
        | Rockport, TX, United States, 78381                |
        | Woodville, Texas, United States, 75979            |
        | Woodville, Texas, United States, 75979            |
        | Chicago, Illinois, United States, 60601           |

    And I should see the Details table with the following columns
        | Test Case     |
        | Start Date    |
        | From          |
        | From POLQA    |
        | To            |
        | To POLQA      |
        | Status        |
        | Call Type     |

    And I should see the Details table with the following data
        | Test Case   | LTS-POLQA-1           |
        | Start Date  | 06/24/2023 01:01:03   |
        | From        | 2142428818            |
        | From POLQA  | Min: 2.54, Avg: 3.67  |
        | To          | 9725980066            |
        | To POLQA    | Min: 2.46, Avg: 3.79  |
        | Status      | PASSED                |
        | Call Type   | On-Net                |
#    Then I click on "LTS-POLQA-1 drop-button" button
#    And I should see the detailed row table with the following data
#        | Start Date                | 06/24/2023 01:01:03     |
#        | End Date                  | 06/24/2023 01:11:15     |
#        | Status                    | PASSED                  |
#        | Call Type                 | On-Net                  |
#        | Error Category            | N/A                     |
#        | Reason                    | N/A                     |
#        | From Jitter (ms)          | Max: 7.09, Avg: 6.65    |
#        | To Jitter (ms)            | Max: 8.93, Avg: 7.53    |
#        | From Round trip time (ms) | Max: 117, Avg: 116.13   |
#        | To Round trip time (ms)   | Max: 116, Avg: 116      |
#        | From Packet Loss (%)      | Max: 0, Avg: 0          |
#        | To Packet Loss (%)        | Max: 0, Avg: 0          |
#        | From Bitrate (kbps)       | Avg: 36                 |
#        | To Bitrate (kbps)         | Avg: 36                 |
#    And I should see the following data in the DID section
#        | From      | 2142428818           |
#        | To        | 9725980066           |
#    And I click on "drop-from" button
#    And I should see the DID "from" table with the following data
#        | Sent packets	            | 2306 packets  |
#        | Received codec            | SILKWide      |
#        | Sent bitrate	            | 36 Kbps       |
#        | Received packet loss      | 0.00%         |
#        | Received Jitter	        | 6.31 ms       |
#        | Sent codec	            | SILKWide      |
#        | Round trip time	        | 117.00 ms     |
#        | Received packets	        | 629 packets   |
#        | POLQA	                    | N/A           |
#    And I click on "drop-to" button
#    And I should see the DID "to" table with the following data
#        | Sent packets	            | 2326 packets  |
#        | Received codec            | SILKWide      |
#        | Sent bitrate	            | 36 Kbps       |
#        | Received packet loss      | --            |
#        | Received Jitter	        | --            |
#        | Sent codec	            | SILKWide      |
#        | Round trip time	        | 116.00 ms     |
#        | Received packets	        | 8 packets     |
#        | POLQA	                    | N/A           |

  @validateTotalFailedCalls
  Scenario: Go to Total Failed Calls detailed report
    Given I go to the spotlight dashboard of subaccount "DashboardFunctionalTest" of customer "DashboardFunctionalTest"
    When I see the dashboard tab is fully loaded in the "Daily" report page
    Then I click on "Failed Calls Detailed Report" button
    And I should see the "Feature Functionality + Calling Reliability + Voice Quality (POLQA)" subtitle
    And I should see the summary table with the following data
        | Test Cases Executed           | 215                         |
        | Passed                        | 214                         |
        | Failed                        | 1                           |
        | Start Time                    | 06/24/2023 00:39:51         |
        | End Time                      | 06/24/2023 23:30:15         |
    And I should see the Endpoint Resources table with the following regions
        | Las Vegas, Nevada, United States, 88901           |
        | Franklin, Tennessee, United States, 37065         |
        | San Antonio, Texas, United States, 78202          |
        | San Antonio, Texas, United States, 78202          |
        | Pittsburgh, Pennsylvania, United States, 15203    |
        | Rockport, Texas, United States, 78381             |
        | Tampa, Florida, United States, 33601              |
        | Tampa, Florida, United States, 33601              |
        | Chicago, Illinois, United States, 60601           |
        | Rockport, TX, United States, 78381                |
        | Woodville, Texas, United States, 75979            |
        | Woodville, Texas, United States, 75979            |
        | Chicago, Illinois, United States, 60601           |
   And I should see the Details table with the following columns
        | Test Case |
        | Start Date |
        | From       |
        | From POLQA |
        | To         |
        | To POLQA   |
        | Status     |
        | Call Type  |

    And I should see the Details table with the following data
        | Test Case  | Many-Many-POLQA-A to B   |
        | Start Date | 06/24/2023 23:22:04      |
        | From       | 2142428803               |
        | From POLQA | Min: N/A, Avg: N/A       |
        | To         | 9725980054               |
        | To POLQA   | Min: N/A, Avg: N/A       |
        | Status     | FAILED                   |
        | Call Type  | On-Net                   |
#    Then I click on "Many-Many-POLQA-A to B drop-button" button
#    And I should see the detailed row table with the following data
#        | Start Date                | 06/24/2023 23:22:04   |
#        | End Date                  | 06/24/2023 23:27:56   |
#        | Status                    | FAILED                |
#        | Call Type                 | On-Net                |
#        | Error Category            | Routing               |
#        | Reason                    | Routing: Unavailable, The person you're trying to reach isn't available. Try again later.|
#        | From Jitter (ms)          | N/A                   |
#        | To Jitter (ms)            | N/A                   |
#        | From Round trip time (ms) | N/A                   |
#        | To Round trip time (ms)   | N/A                   |
#        | From Packet Loss (%)      | N/A                   |
#        | To Packet Loss (%)        | N/A                   |
#        | From Bitrate (kbps)       | N/A                   |
#        | To Bitrate (kbps)         | N/A                   |

  @validateFailedCalls
  Scenario: Go to the Failed Calls detailed report
    Given I go to the spotlight dashboard of subaccount "DashboardFunctionalTest" of customer "DashboardFunctionalTest"
    When I see the dashboard tab is fully loaded in the "Daily" report page
    Then I click on "Failed Calls" button
    And I should see the "Feature Functionality + Calling Reliability + Voice Quality (POLQA)" subtitle
    And I should see the summary table with the following data
        | Test Cases Executed           | 1                         |
        | Passed                        | 0                         |
        | Failed                        | 1                         |
        | Start Time                    | 06/24/2023 23:22:04       |
        | End Time                      | 06/24/2023 23:27:56       |
    And I should see the Endpoint Resources table with the following regions
        | Chicago, Illinois, United States, 60601           |
        | San Antonio, Texas, United States, 78202          |
    And I should see the Details table with the following columns
        | Test Case  |
        | Start Date |
        | From       |
        | From POLQA |
        | To         |
        | To POLQA   |
        | Status     |
        | Call Type  |

    And I should see the Details table with the following data
        | Test Case  | Many-Many-POLQA-A to B   |
        | Start Date | 06/24/2023 23:22:04      |
        | From       | 2142428803               |
        | From POLQA | Min: N/A, Avg: N/A       |
        | To         | 9725980054               |
        | To POLQA   | Min: N/A, Avg:N/A        |
        | Status     | FAILED                   |
        | Call Type  | On-Net                   |
#    Then I click on "Many-Many-POLQA-A to B drop-button" button
#    And I should see the detailed row table with the following data
#        | Start Date                | 06/24/2023 23:22:04   |
#        | End Date                  | 06/24/2023 23:27:56   |
#        | Status                    | FAILED                |
#        | Call Type                 | On-Net                |
#        | Error Category            | Routing               |
#        | Reason                    | Routing: Unavailable, The person you're trying to reach isn't available. Try again later.|
#        | From Jitter (ms)          | N/A                   |
#        | To Jitter (ms)            | N/A                   |
#        | From Round trip time (ms) | N/A                   |
#        | To Round trip time (ms)   | N/A                   |
#        | From Packet Loss (%)      | N/A                   |
#        | To Packet Loss (%)        | N/A                   |
#        | From Bitrate (kbps)       | N/A                   |
#        | To Bitrate (kbps)         | N/A                   |