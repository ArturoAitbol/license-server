import { Role } from './role';

export enum PageNames {
    Users = 'users',
    UserProfile = 'userProfile',
    PhoneInventory = 'phoneInventory',
    PhoneList = 'phoneList',
    UserInventory = 'userInventory',
    UserList = 'userList',
    Projects = 'projects'
}

export class Utility {

    // tslint:disable-next-line:max-line-length
    public static readonly LINK_IS_DOWN_MSG = 'Connection to onPOINT link is down. Cannot execute this action at this moment. Please try later';

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
        const currentPermissions: [string] = JSON.parse(localStorage.getItem('currentUser')).roles;
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
                    return '#0E8B18';
                case 'offline':
                case 'failed':
                case 'unregistered':
                    return '#CB3333';
                case 'initiated':
                case 'inprogress':
                case 'unavailable':
                case 'rebooting':
                    return '#7694B7';
            }
        }
    }

    public static downloadFile(data: any, filename: string): void {
        // const blob = new Blob([data], { type: 'application/octet-stream' });
        // const url = window.URL.createObjectURL(blob);
        // if (navigator.msSaveOrOpenBlob) {
        //     navigator.msSaveBlob(blob, filename);
        // } else {
        //     const a = document.createElement('a');
        //     a.href = url;
        //     a.download = filename;
        //     document.body.appendChild(a);
        //     a.click();
        //     document.body.removeChild(a);
        // }
        // window.URL.revokeObjectURL(url);
    }
    /**
     * get data table height by height of the screen
     * @param pageName: string 
     */
    public static getDataTableHeight(pageName: string): string {
        const SCREEN_HEIGHT = window.screen.height.toString();
        switch (SCREEN_HEIGHT) {
            case '768': {
                switch (pageName) {
                    case PageNames.Users:
                        return '45vh';
                    case PageNames.UserProfile:
                        return '50vh';
                }
                break;
            }
            default:
                return '62.5vh';
        }
    }
    /**
     * get data table height by width of the screen
     * @param pageName: string 
     */
    public static getDataTableHeightByWidth(pageName: string): string {
        if (pageName === PageNames.PhoneInventory) {
            const SCREEN_WIDTH = window.screen.width.toString();
            switch (SCREEN_WIDTH) {
                case '1024': {
                    return '40vh';
                }
                case '1366': {
                    return '45vh';
                }
                case '1440': {
                    return '50vh';
                }
                case '1600': {
                    return '55vh';
                }
                case '1680': {
                    return '60vh';
                }
                case '1920': {
                    return '65vh';
                }
                default:
                    return '45vh';
            }
        } else if (PageNames.Projects) {
            return '50vh';
        }
        return '60vh';
    }

    /**
     * set the download file name based
     * @param fileName: string
     * @param fileMode: string
     * @param fileType: string
     * @return: string
     */
    public static getDownloadFileName(fileName: string, fileMode: string, fileType: string): string {
        return 'onPOINT_' + fileName + '_' + fileMode + fileType;
    }
    public static getDownloadReportFileName(fileName: string, fileMode: string, fileType: string): string {
        return '360AP_' + fileName + '_' + fileMode + fileType;
    }
    /**
     * get vendor name by resource variable
     * @param resources: any[] 
     * @param resource: string 
     */
    public static getVendorNameByResource(resources: any[], resource: string): string {
        const vendorName: string = resources.filter(e => e.name == resource)[0]['vendor'];
        return (vendorName) ? vendorName.toLowerCase() : '';
    }
}
