import { Observable } from "rxjs"

const currentProject = {
    project:{
        id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
        name: 'Project-Test1',
        number: 'test-code',
        subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
        openDate: '2022-01-26 05:00:00',
        closeDate: '2022-05-29 05:00:00',
        status: 'Open'
    }
}

export const CurrentPorjectServiceMock = {
    getCurrentProject: () => {
        return {
            id: '459cf3ca-7365-47a1-8d9b-1abee381545c',
            name: 'Project-Test1',
            number: 'test-code',
            subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
            openDate: '2022-01-26 05:00:00',
            closeDate: '2022-05-29 05:00:00',
            status: 'Open'
        }
    } 
}