import { Observable } from "rxjs";

export const BannerServiceMock = {
    init: () => { return },
    open: (title: string, message: string, onComponentDestruction: Observable<void>) => { return },
}
