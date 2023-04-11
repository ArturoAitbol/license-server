import moment from "moment";
import { Observable } from "rxjs";
import { ITestReports } from "src/app/model/test-reports.model";

const MOCK_TEST_REPORT_A: ITestReports = {
    reportType: "Daily-FeatureFunctionality",
    endTime: "230110034409",
    startTime: "230109113617"
};
const MOCK_TEST_REPORT_B: ITestReports = {
    reportType: "Daily-FeatureFunctionality",
    endTime: "230110034409",
    startTime: "230109113617"
};
const MOCK_TEST_REPORT_C: ITestReports = {
    reportType: "Daily-CallingReliability",
    endTime: "230110034409",
    startTime: "230109113617"
};
const MOCK_TEST_REPORT_D: ITestReports = {
    reportType: "Daily-FeatureFunctionality",
    endTime: "230110034409",
    startTime: "230109113617"
};
const MOCK_TEST_REPORT_E: ITestReports = {
    reportType: "Daily-CallingReliability",
    endTime: "230110034409",
    startTime: "230109113617"
};

const MOCK_TEST_REPORT_F: ITestReports = {
    reportType: "testName",
    endTime: "230110034409",
    startTime: "230109113617"
};

const TEST_REPORTS_LIST = {
    reports: [
        MOCK_TEST_REPORT_B,
        MOCK_TEST_REPORT_D,
        MOCK_TEST_REPORT_A,
        MOCK_TEST_REPORT_E,
        MOCK_TEST_REPORT_C,
        MOCK_TEST_REPORT_F
    ]
};

const TEST_REPORTS_LIST_ASC = {
    reports: [
        
        MOCK_TEST_REPORT_E,
        MOCK_TEST_REPORT_C,
        MOCK_TEST_REPORT_B,
        MOCK_TEST_REPORT_D,
        MOCK_TEST_REPORT_A,
        MOCK_TEST_REPORT_F
    ]
};

const TEST_REPORTS_LIST_DESC = {
    reports: [
        MOCK_TEST_REPORT_F,
        MOCK_TEST_REPORT_B,
        MOCK_TEST_REPORT_D,
        MOCK_TEST_REPORT_A,
        MOCK_TEST_REPORT_E,
        MOCK_TEST_REPORT_C
    ]
};

const TEST_LIST = {
    reports: [
        {
            reportType: "Daily-FeatureFunctionality",
            endTime: "230110034409",
            startTime: "230109113617"
        }
    ]
}
const START_DATE_A = {
    title: 'CR'+ moment.utc().subtract(0 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(0 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(0 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_B = {
    title: 'CR'+ moment.utc().subtract(1 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(1 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(1 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_C = {
    title: 'CR'+ moment.utc().subtract(2 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(2 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(2 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_D = {
    title: 'CR'+ moment.utc().subtract(3 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(3 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(3 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}

const START_DATE_E = {
    title: 'CR'+ moment.utc().subtract(4 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(4 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(4 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_F = {
    title: 'CR'+ moment.utc().subtract(5 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(5 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(5 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_G = {
    title: 'CR'+ moment.utc().subtract(6 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(6 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(6 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_H = {
    title: 'CR'+ moment.utc().subtract(7 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(7 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(7 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_I = {
    title: 'CR'+ moment.utc().subtract(8 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(8 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(8 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_J = {
    title: 'CR'+ moment.utc().subtract(9 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(9 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(9 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_K = {
    title: 'CR'+ moment.utc().subtract(10 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(10 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(10 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_L = {
    title: 'CR'+ moment.utc().subtract(11 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(11 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(11 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_M = {
    title: 'CR'+ moment.utc().subtract(12 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(12 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(12 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_N = {
    title: 'CR'+ moment.utc().subtract(13 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(13 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(13 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}
const START_DATE_O = {
    title: 'CR'+ moment.utc().subtract(14 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(14 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(14 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-CallingReliability'
}

const START_DATE_AA = {
    title: 'FF'+ moment.utc().subtract(0 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(0 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(0 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_BB = {
    title: 'FF'+ moment.utc().subtract(1 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(1 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(1 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_CC = {
    title: 'FF'+ moment.utc().subtract(2 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(2 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(2 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_DD = {
    title: 'FF'+ moment.utc().subtract(3 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(3 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(3 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}

const START_DATE_EE = {
    title: 'FF'+ moment.utc().subtract(4 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(4 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(4 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_FF = {
    title: 'FF'+ moment.utc().subtract(5 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(5 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(5 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_GG = {
    title: 'FF'+ moment.utc().subtract(6 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(6 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(6 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_HH = {
    title: 'FF'+ moment.utc().subtract(7 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(7 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(7 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_II = {
    title: 'FF'+ moment.utc().subtract(8 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(8 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(8 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_JJ = {
    title: 'FF'+ moment.utc().subtract(9 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(9 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(9 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_KK = {
    title: 'FF'+ moment.utc().subtract(10 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(10 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(10 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_LL = {
    title: 'FF'+ moment.utc().subtract(11 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(11 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(11 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_MM = {
    title: 'FF'+ moment.utc().subtract(12 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(12 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(12 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_NN = {
    title: 'FF'+ moment.utc().subtract(13 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(13 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(13 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const START_DATE_OO = {
    title: 'FF'+ moment.utc().subtract(14 + 1,'days').format("_MM_DD"),
    startDate:moment.utc().subtract(14 + 1,'days').format("MM-DD-YYYY 00:00:00 UTC"), 
    endDate:moment.utc().subtract(14 + 1,'days').format("MM-DD-YYYY 23:59:59 UTC"),
    report: 'Daily-FeatureFunctionality'
}
const DATE_LIST = [
    START_DATE_B,
    START_DATE_C,
    START_DATE_A,
    START_DATE_D,
    START_DATE_O,
    START_DATE_G,
    START_DATE_H,
    START_DATE_F,
    START_DATE_I,
    START_DATE_J,
    START_DATE_K,
    START_DATE_L,
    START_DATE_N,
    START_DATE_M,
    START_DATE_E,
    START_DATE_BB,
    START_DATE_CC,
    START_DATE_AA,
    START_DATE_DD,
    START_DATE_OO,
    START_DATE_GG,
    START_DATE_HH,
    START_DATE_FF,
    START_DATE_II,
    START_DATE_JJ,
    START_DATE_KK,
    START_DATE_LL,
    START_DATE_NN,
    START_DATE_MM,
    START_DATE_EE

]
const ASC_SORTED_DATE_LIST = [
    START_DATE_O,
    START_DATE_N,
    START_DATE_M,
    START_DATE_L,
    START_DATE_K,
    START_DATE_J,
    START_DATE_I,
    START_DATE_H,
    START_DATE_G,
    START_DATE_F,
    START_DATE_E,
    START_DATE_D,
    START_DATE_C,
    START_DATE_B,
    START_DATE_A
]

const DESC_SORTED_DATE_LIST = [
    START_DATE_A,
    START_DATE_B,
    START_DATE_C,
    START_DATE_D,
    START_DATE_E,
    START_DATE_F,
    START_DATE_G,
    START_DATE_H,
    START_DATE_I,
    START_DATE_J,
    START_DATE_K,
    START_DATE_L,
    START_DATE_M,
    START_DATE_N,
    START_DATE_O
]
const UNSORTED_CALLING_LIST = [
    START_DATE_B,
    START_DATE_C,
    START_DATE_A,
    START_DATE_D,
    START_DATE_O,
    START_DATE_G,
    START_DATE_H,
    START_DATE_F,
    START_DATE_I,
    START_DATE_J,
    START_DATE_K,
    START_DATE_L,
    START_DATE_N,
    START_DATE_M,
    START_DATE_E,
]

export const TestReportsServiceMock = {
    testReportsValue: TEST_REPORTS_LIST,
    testReportsSortedAsc: TEST_REPORTS_LIST_ASC,
    testReportsSortedDesc: TEST_REPORTS_LIST_DESC,
    mockTestReportA: MOCK_TEST_REPORT_A,
    testListOfReports: TEST_LIST,
    unsortedDateList: DATE_LIST,
    callingList: UNSORTED_CALLING_LIST,
    ascSortedDateList: ASC_SORTED_DATE_LIST,
    descSortedDateList: DESC_SORTED_DATE_LIST,
    getTestReportsList: () => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(TEST_REPORTS_LIST))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
}