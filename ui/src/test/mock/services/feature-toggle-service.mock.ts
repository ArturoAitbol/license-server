import { Observable } from "rxjs";

export const FeatureToggleServiceMock = {
    refreshToggles: () => {
        return new Observable((observer) => {
            observer.next(void 0);
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    },
    clearPeriodicRefresh: () => {
        return;
    },
    isFeatureEnabled: () => {
        return true;
    },
};
