import {Observable, throwError} from 'rxjs';

const PROJECT_LIST = {
    projects: [
        {
            id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
            name: 'Project-Test1',
            number: 'test-code',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-01-26 05:00:00',
            closeDate: '2022-05-29 05:00:00',
            status: 'Open'
        },
        {
            id: '6eb1f15b-168d-4ef0-adb1-fec73b65af25',
            name: 'Project-Test2',
            number: 'test-code2',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-01-25 05:00:00',
            closeDate: '2022-03-30 05:00:00',
            status: 'Open'
        },
        {
            id: '234d6482-4004-44ca-a846-f9ec9a7ae1dd',
            name: 'Project-Test3',
            number: 'test-code3',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-01-25 05:00:00',
            closeDate: '2022-03-30 05:00:00',
            status: 'Open'
        },
        {
            id: '2bdaf2af-838f-4053-b3fa-ef22aaa11b0d',
            name: 'Project-Test4',
            number: 'test-code4',
            subaccountId: '9599c5bd-f702-4965-b655-29b0fed00e23',
            openDate: '2022-01-25 05:00:00',
            closeDate: '2022-03-30 05:00:00',
            status: 'Open'
        }
    ]
};

export const ProjectServiceMock = {
    projectsListValue: PROJECT_LIST,
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
    },
    closeProject: () => {
        return new Observable((observer) => {
            observer.next(
                { 
                    body:[
                        {
                            id:'459cf3ca-7365-47a1-8d9b-1abee381545c',
                            status:'Open',
                            closeDate:'2022-05-29 05:00:00'
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
    deleteProject: () => {
        return new Observable((observer) => {
            observer.next(
                { 
                    body:[
                        {
                            id:'459cf3ca-7365-47a1-8d9b-1abee381545c',
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
    updateProject: (project: any) => {
        return new Observable((observer) => {
            observer.next(
                {
                  
                }
            );
            observer.complete();
            return {
                unsubscribe() {}
            };
        });
    },
    getSelectedSubAccount: () => {
        return new Observable((observer) => {
            observer.next(
                { 
                    body:[
                        {
                           projectName: "tttt6",
                           projectNumber: "666t",
                           status: "Open",
                           subaccountId: "eea5f3b8-37eb-41fe-adad-5f94da124a5a"
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
    createProject: () => {
        return new Observable((observer) => {
            observer.next(
                { 
                    body:[
                        {
                 
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
};
