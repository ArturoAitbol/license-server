import { MSTeamsUser } from './ms-team-user';

export class UserList {
    id: string;
    name: string;
    description: string;
    usersCount: number;
    lastUpdatedDate: Date;
    creationDate: Date;
    users: MSTeamsUser[] = [];
}