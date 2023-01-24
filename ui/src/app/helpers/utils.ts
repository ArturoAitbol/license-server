import { FocusKeyManager } from "@angular/cdk/a11y";
import { permissions } from "./role-permissions";

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
    public static getNavbarOptions(roles: string[], options: any[]): any[] {
        //new Set([]) is used to avoid repeated options when a user has multiple roles
        const set = new Set([]);
        options.forEach((item) => {
            roles.forEach(accountRole => {
                const found = permissions[accountRole]?.paths.find(path => path === item.path);
                if (found)
                    set.add(item)
            });
        });
        return [...set];
    }

    public static sortDatesInAscendingOrder(list: any[] | [any], key: string, isValueNumber: boolean): any[] {
        list.sort((e1, e2) => {
            if (isValueNumber) {
                return new Date(e1[key]).valueOf() - new Date(e2[key]).valueOf();
            }
        })
        return [...list];
    }

}
