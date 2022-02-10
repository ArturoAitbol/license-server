import { Constants } from '../model/constant';
import { Role } from './role';


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
     * verify whether user has respective roles or not
     * return true when the role is present in the array (or) if the role is "ROLE_ADMIN" (or) "ROLE_TEKV_ADMIN"
     * @param role: string
     * @return: boolean
     */
    public static userEnabled(role: string): boolean {
        const currentPermissions: [string] = JSON.parse(localStorage.getItem(Constants.CURRENT_USER)).roles;
        // tslint:disable-next-line:max-line-length
        if (currentPermissions.includes(role) || currentPermissions.includes((Role[0])) || currentPermissions.includes(Role[1])) {
            return true;
        }
        return false;
    }

    /**
     * to get color based on the state/status
     * @param state: string
     * @return: string
     */
    public static getColorCode(state: string) {
        if (state) {
            switch (state.toLowerCase()) {
                case 'available':
                case 'completed':
                case 'registered':
                case 'active':
                    return '#0E8B18';
                case 'offline':
                case 'failed':
                case 'unregistered':
                case 'expired':
                    return '#CB3333';
                case 'initiated':
                case 'inprogress':
                case 'unavailable':
                case 'rebooting':
                    return '#7694B7';
            }
        }
    }

}
