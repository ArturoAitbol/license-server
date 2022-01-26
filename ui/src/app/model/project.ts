import { TestPlan } from './test-plan';

export class Project {
    id: string;
    name: string;
    createdBy: string;
    testPlan: TestPlan;
    projectPhonePools: any = [];
    projectCallServers: any = [];
    projectDeviceUserLists: any = [];
    testPlanDto: any;
    disable: boolean;
    scheduled: boolean;
    lastRunDateString: string;
    status: string;
    totalPhoneList: number;
    totalUserList: number;
}
