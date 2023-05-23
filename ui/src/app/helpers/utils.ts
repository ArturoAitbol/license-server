import { ISidebar } from "../model/sidebar.model";
import { permissions } from "./role-permissions";
import { FeatureToggleService } from "../services/feature-toggle.service";
import moment, { Moment } from "moment";

export class Utility {

    /**
    * to sort the list based on last modified date
    * @param list:any[]
    * @return list: any[]
    */
    public static sortByLastModifiedDateInDescOrder(list: any[] | [any]): any[] {
        return list.sort((e1, e2) => {
            return e1.lastModifiedDate < e2.lastModifiedDate ? 1 : (e1.lastModifiedDate > e2.lastModifiedDate ? -1 : 0);
        });
    }

    /**
     * sort the list in ascending order without any key
     * @param list: any[]
     */
    public static sortListInAscendingOrderWithoutKey(list: any[]): any[] {
        list.sort((e1, e2) => e1 > e2 ? 1 : (e1 < e2 ? -1 : 0));
        return [...list];
    }

    /**
     * sort the list in ascending order based on key
     * @param list: any[]
     * @param key: string
     * @param isValueNumber: boolean
     */
    public static sortListInAscendingOrder(list: any[] | [any], key: string, isValueNumber: boolean): any[] {
        list.sort((e1, e2) => {
            if (isValueNumber) {
                return +e1[key] > +e2[key] ? 1 : (+e1[key] < +e2[key] ? -1 : 0);
            } else if (!isValueNumber) {
                return e1[key] > e2[key] ? 1 : (e1[key] < e2[key] ? -1 : 0);
            }
        });
        return [...list];
    }

    /**
     * sort the list in descending order based on key
     * @param list: any[]
     * @param key: string
     * @param isValueNumber: boolean
     */
    public static sortListInDescendingOrder(list: any[] | [any], key: string, isValueNumber: boolean): any[] {
        list.sort((e1, e2) => {
            if (isValueNumber) {
                return +e1[key] < +e2[key] ? 1 : (+e1[key] > +e2[key] ? -1 : 0);
            } else {
                return e1[key] < e2[key] ? 1 : (e1[key] > e2[key] ? -1 : 0);
            }
        });
        return [...list];
    }

    /**
     * to get color based on the state/status
     * @param state: string
     * @return: string
     */
    public static getColorCode(state: string) {
        if (state !== undefined && state !== null) {
            try {
                switch (state.toLowerCase()) {
                    case 'available':
                    case 'completed':
                    case 'registered':
                    case 'active':
                    case 'open':
                        return '#0E8B18';
                    case 'offline':
                    case 'failed':
                    case 'unregistered':
                    case 'expired':
                    case 'closed':
                        return '#CB3333';
                    case 'initiated':
                    case 'inprogress':
                    case 'unavailable':
                    case 'rebooting':
                    case 'inactive':
                        return '#7694B7';
                    default:
                        return 'red';
                }
            } catch (e: any) {
                return 'red';
            }
        }
    }

    /**
     * to get the available options for a given table based on the user role(s)
     * @param roles: string[]
     * @param optionType: string
     * @param options: Object
     * @return: string[]
     */
    public static getTableOptions(roles: string[], options: any, optionType: string): string[] {
        //new Set([]) is used to avoid repeated options when a user has multiple roles
        const set = new Set([]);
        roles.forEach(accountRole => {
            permissions[accountRole]?.tables[optionType]?.forEach(item => set.add(options[item]));
        });
        return [...set];
    }

    /**
     * to get the available paths for a navbar based on the user role(s)
     * @param roles: Object
     * @param options: any[]
     * @return: any[]
     */
    public static getNavbarOptions(roles: string[], options: ISidebar[], featureToggleService: FeatureToggleService, subaccountId: string): any[] {
        //new Set([]) is used to avoid repeated options when a user has multiple roles
        const set = new Set([]);
        options.forEach((item) => {
            if (featureToggleService.isFeatureEnabled(item.path, subaccountId)) {
                roles.forEach(accountRole => {
                    const found: boolean = item.element ? permissions[accountRole]?.elements.includes(item.element)
                        : permissions[accountRole]?.paths.includes(item.path);
                    if (found)
                        set.add(item)
                });
            }
        });
        return [ ...set ];
    }

    public static sortDatesInAscendingOrder(list: any[] | [any], key: string): any[] {
        list.sort((e1, e2) => {
            return new Date(e1[key]).valueOf() - new Date(e2[key]).valueOf();
        });
        return [...list];
    }

    public static sortingDataTable(data: any, keyName: string, direction: string): any[] {
        let sortedData; 
        sortedData = data.sort((a: any, b: any) => {
            if(a[keyName] == null && b[keyName] == null) 
                return 0;
            else if(a[keyName] == null && b[keyName] != null)
                return (direction === 'asc') ? 1 : -1;
            else if(a[keyName] != null && b[keyName] == null)
                return (direction === 'asc')? -1 : 1;
            else if (typeof a[keyName] === 'number') {
                if(direction === 'asc')
                    return +a[keyName] > +b[keyName] ? 1 : (+a[keyName] < +b[keyName] ? -1 : 0);
                return +a[keyName] < +b[keyName] ? 1 : (+a[keyName] > +b[keyName] ? -1 : 0);
            }
            return (direction === 'asc')? a[keyName].localeCompare(b[keyName]) : b[keyName].localeCompare(a[keyName]);
        })
        return sortedData;
    }
    
    public static parseReportDate(incomingDate: Moment): string {
        let parsedDate = "";
        const parsedYear = incomingDate.year().toString().slice(-2);
        let parsedMonth: any = incomingDate.month() + 1;
        parsedMonth = parsedMonth > 9 ? parsedMonth : '0' + parsedMonth.toString();
        let parsedDay: any = incomingDate.date();
        parsedDay = parsedDay > 9 ? parsedDay : '0' + parsedDay.toString();
        let parsedHours: any = incomingDate.hours();
        parsedHours = parsedHours > 9 ? parsedHours : '0' + parsedHours.toString();
        let parsedMinutes: any = incomingDate.minutes();
        parsedMinutes = parsedMinutes > 9 ? parsedMinutes : '0' + parsedMinutes.toString();
        let parsedSeconds: any = incomingDate.seconds();
        parsedSeconds = parsedSeconds > 9 ? parsedSeconds : '0' + parsedSeconds.toString();
        parsedDate = `${parsedYear}${parsedMonth}${parsedDay}${parsedHours}${parsedMinutes}${parsedSeconds}`;
        return parsedDate;
    }

    public static setHoursOfDate(date){
        const today = moment().utc();
        if(date.format("MM-DD-YYYY") === today.format("MM-DD-YYYY"))
            return date.hour(today.get("hour")).minute(today.get("minute")).seconds(today.get("seconds"));
        return date.endOf("day");
    }

    public static setMinutesOfDate(date){
        const today = moment().utc();
        if(date.format("MM-DD-YYYY HH") === today.format("MM-DD-YYYY HH"))
            return date.minute(today.get("minute")).seconds(today.get("seconds"));
        return date.endOf("hour");
    }

}
