export class SessionStorageUtil {
    public static get(key: string): any {
        return sessionStorage.getItem(key);
    }

    public static remove(key: string) {
        sessionStorage.removeItem(key);
    }

    public static clear() {
        sessionStorage.clear();
    }
}