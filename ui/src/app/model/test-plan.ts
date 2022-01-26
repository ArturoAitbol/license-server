export class TestPlan {
    id: string;
    name: string;
    description: string;
    lastModified: string;
    ownerName: string;
    testsList: any = [];
    testCaseCount: any;
    requiredPools: any = [];
    lastModifiedDate: number;
}
