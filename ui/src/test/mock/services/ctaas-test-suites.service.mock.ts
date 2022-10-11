import { Observable } from "rxjs";

const CTAAS_TEST_SUITES = {
    ctaasTestSuites:[
        {
            deviceType: "MS Teams",
            subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            totalExecutions: "0",
            name: "testSuiteV",
            id: "5e3a1f0e-eacd-4f0f-8631-62f60f33bac8",
            frequency: "Daily"
        },
        {
            deviceType: "MS Teams",
            subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
            totalExecutions: "0",
            name: "testSuiteV2",
            id: "ca637f77-03eb-4fd1-a473-7bcaaa54302f",
            frequency: "Monthly"
        }
    ]  
}

export const TestSuitesMock = {
    getTestSuitesBySubAccount: () => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(CTAAS_TEST_SUITES))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    deleteTestSuite: () => {
        return new Observable((observer) => {
            observer.next(
                { 
                    body:[
                        {
                            id: "5e3a1f0e-eacd-4f0f-8631-62f60f33bac8",
                        }
                    ]
                }
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    updateTestSuite: (testSuite: any) => {
        return new Observable((observer) => {
            observer.next({
                body:[
                    {
                        deviceType: "MS Teams",
                        subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
                        totalExecutions: "2",
                        name: "testSuiteV2",
                        id: "ca637f77-03eb-4fd1-a473-7bcaaa54302f",
                        nextExecution: "2022-10-12 00:00:00",
                        frequency: "Weekly"
                    }
                ]
            });
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    createTestSuite: () => {
        return new Observable((observer) => {
            observer.next(
                { 
                    body:[
                        {
                            deviceType: "MS Teams",
                            subaccountId: "fbb2d912-b202-432d-8c07-dce0dad51f7f",
                            totalExecutions: "2",
                            name: "testSuiteV2",
                            id: "ca637f77-03eb-4fd1-a473-7bcaaa54302f",
                            nextExecution: "2022-10-12 00:00:00",
                            frequency: "Weekly"
                        }
                    ]
                }
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
}