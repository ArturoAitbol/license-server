import { Observable } from 'rxjs';

const TEST_DASHBOARD_1 = {
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:55 BOT",
    reportType:"Daily-FeatureFunctionality",
    timestampId:"221208090108"
};
const TEST_DASHBOARD_2 = {   
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:54 BOT",
    reportType:"Daily-CallingReliability",
    timestampId:"221208090125"
};
const TEST_DASHBOARD_3 = {   
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:55 BOT",
    reportType:"Daily-PESQ",
    timestampId:"221208090142"
};
const TEST_DASHBOARD_4 = {   
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:57 BOT",
    reportType:"Weekly-FeatureFunctionality",
    timestampId:"221208090132"
};
const TEST_DASHBOARD_5 = {   
    imageBase64:"data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
    lastUpdatedTS:"Thu, 08 Dec 2022 11:04:57 BOT",
    reportType:"Weekly-PESQ",
    timestampId:"221208090150"
};

const CTAAS_DASHBOARD_LIST =[
        TEST_DASHBOARD_1,
        TEST_DASHBOARD_2,
        TEST_DASHBOARD_3,
        TEST_DASHBOARD_4,
        TEST_DASHBOARD_5]

const ERROR_MSG = 'Expected setupDetails response error';

export const CtaasDashboardServiceMock = {
    dashboardList: CTAAS_DASHBOARD_LIST,
    getCtaasDashboardDetails: (subaccountId: string, reportType: string, timestamp?: string) => {
        return new Observable( (observer) => {
            observer.next(
                {
                    response: CTAAS_DASHBOARD_LIST.filter((e) => e.reportType === reportType)[0]
                }
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
};
