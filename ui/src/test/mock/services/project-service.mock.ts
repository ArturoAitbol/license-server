import {Observable} from 'rxjs';

const PROJECT_LIST = {
    projects: [
        {
            id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
            name: 'Project-Test1',
            code: 'test-code',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-07-26 05:00:00',
            closeDate: '2022-08-29 05:00:00',
            status: 'Open'
        },
        {
            id: '6eb1f15b-168d-4ef0-adb1-fec73b65af25',
            name: 'Project-Test2',
            code: 'test-code2',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-07-25 05:00:00',
            closeDate: '2022-08-30 05:00:00',
            status: 'Open'
        },
        {
            id: '9fd20dca-33f0-4bd2-b484-d81dd6423626',
            name: 'Project-Test3',
            code: 'test-code3',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-07-25 05:00:00',
            closeDate: '2022-08-30 05:00:00',
            status: 'Open'
        }
    ]
};

export const ProjectServiceMock = {
    customerListValue: PROJECT_LIST,
    getProjectDetailsBySubAccount: () => {
        return new Observable((observer) => {
            observer.next(
                PROJECT_LIST
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    setSelectedSubAccount: (value: string) => {
        // TODO
    }
};
