import {Observable} from 'rxjs';

const PROJECT_LIST = {
    projects: [
        {
            id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
            projectName: 'Project-Test1',
            projectNumber: 'test-code',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'a3475bf9-41d5-432a-ae2d-ccf7681385cf',
            openDate: '2022-01-26 05:00:00',
            closeDate: '2022-05-29 05:00:00',
            status: 'Open',
            licenseDescription:'DescriptionP'
        },
        {
            id: '6eb1f15b-168d-4ef0-adb1-fec73b65af25',
            projectName: 'Project-Test2',
            projectNumber: 'test-code2',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'a3475bf9-41d5-432a-ae2d-ccf7681385cf',
            openDate: '2022-01-25 05:00:00',
            closeDate: '2022-03-30 05:00:00',
            status: 'Open',
            licenseDescription:'DescriptionP'
        },
        {
            id: '234d6482-4004-44ca-a846-f9ec9a7ae1dd',
            projectName: 'Project-Test3',
            projectNumber: 'test-code3',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'a3475bf9-41d5-432a-ae2d-ccf7681385cf',
            openDate: '2022-01-25 05:00:00',
            closeDate: '2022-03-30 05:00:00',
            status: 'Open',
            licenseDescription:'DescriptionP'
        },
        {
            id: '2bdaf2af-838f-4053-b3fa-ef22aaa11b0d',
            projectName: 'Project-Test4',
            projectNumber: 'test-code4',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'a3475bf9-41d5-432a-ae2d-ccf7681385cf',
            openDate: '2022-01-25 05:00:00',
            closeDate: '2022-03-30 05:00:00',
            status: 'Open',
            licenseDescription:'DescriptionP'
        },
        {
            id: '2bdaf2af-838f-4053-b3fa-ef22aaa11b0d',
            projectName: 'Project-Test4',
            projectNumber: 'test-code4',
            subaccountId: 'fbb2d912-b202-432d-8c07-dce0dad51f7f',
            licenseId: 'a3475bf9-41d5-432a-ae2d-ccf7681385cf',
            openDate: '2022-01-25 05:00:00',
            closeDate: '2022-03-30 05:00:00',
            status: 'Open',
            licenseDescription:'DescriptionP'
        },
        {
            id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
            projectName: 'Project-Test1',
            projectNumber: 'test-code',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'a3475bf9-41d5-432a-ae2d-ccf7681385cf',
            openDate: '2022-01-26 05:00:00',
            closeDate: '2022-05-29 05:00:00',
            status: 'Open',
            licenseDescription:'DescriptionO'
        },
        {
            id: '6eb1f15b-168d-4ef0-adb1-fec73b65af25',
            projectName: 'Project-Test2',
            projectNumber: 'test-code2',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            licenseId: 'a3475bf9-41d5-432a-ae2d-ccf7681385cf',
            openDate: '2022-01-25 05:00:00',
            closeDate: '2022-03-30 05:00:00',
            status: 'Open',
            licenseDescription:'DescriptionO'
        },
    ]
};

const CLOSED_PROJECT = {
    body:[
        {
            id:'459cf3ca-7365-47a1-8d9b-1abee381545c',
            status:'Closed',
            closeDate:'2022-05-29 05:00:00'
        }
    ]
}

const SELECTED_SUBACCOUNT = {
    body:[
        {
           projectName: "tttt6",
           projectNumber: "666t",
           status: "Open",
           subaccountId: "eea5f3b8-37eb-41fe-adad-5f94da124a5a"
        }
    ]
}

export const ProjectServiceMock = {
    projectsListValue: PROJECT_LIST,
    getProjectDetailsBySubAccount: (id?:string) => {
        return new Observable((observer) => {
            let projectList;
            projectList = { projects: PROJECT_LIST.projects.filter((project: any) => (project.subaccountId === id))}
            observer.next(
                JSON.parse(JSON.stringify(projectList))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    getProjectDetailsByLicense: (subaccountId?: string, licenseId?: string) => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(PROJECT_LIST))
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
                JSON.parse(JSON.stringify(CLOSED_PROJECT))
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
                JSON.parse(JSON.stringify(SELECTED_SUBACCOUNT))
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
    },
    getProjectList: () => {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(JSON.stringify(PROJECT_LIST))
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
};
