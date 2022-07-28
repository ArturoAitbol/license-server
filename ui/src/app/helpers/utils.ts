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

}
