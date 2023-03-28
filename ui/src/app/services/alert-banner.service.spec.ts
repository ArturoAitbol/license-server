import { AlertBannerComponent } from "../generics/alert-banner/alert-banner.component";
import { BannerService } from "./alert-banner.service";
import { Subject } from "rxjs";
import { TestBed } from "@angular/core/testing";

let alertBannerComponentSpy: jasmine.SpyObj<AlertBannerComponent>;
let alertBannerService: BannerService;
describe('Alert banner service - Basic functionality', () => {
    beforeEach(async () => {
        alertBannerComponentSpy = jasmine.createSpyObj('AlertBannerComponent', ['open', 'close']);
        TestBed.configureTestingModule({
            // Provide both the service-to-test and its (spy) dependency
            providers: [
                BannerService,
            ]
        });
        alertBannerService = TestBed.inject(BannerService);
        alertBannerService.init(alertBannerComponentSpy);
    });

    it('should open the banner when the open method is called', () => {
        const onDestruction = new Subject<void>();
        alertBannerService.open('Test', 'Test message', onDestruction);
        expect(alertBannerComponentSpy.open).toHaveBeenCalledWith('Test', 'Test message', onDestruction);
    });

    it('should close the banner before showing another', (done) => {
        const onDestruction = new Subject<void>();
        alertBannerService.open('Test', 'Test message', onDestruction);
        expect(alertBannerComponentSpy.open).toHaveBeenCalledWith('Test', 'Test message', onDestruction);
        alertBannerService.open('Test2', 'Test message', onDestruction);
        expect(alertBannerComponentSpy.close).toHaveBeenCalledWith();
        setTimeout(() => {
            expect(alertBannerComponentSpy.open).toHaveBeenCalledWith('Test2', 'Test message', onDestruction);
            done();
        }, 501);
    });

    it ('should log a message when no outlet is defined', () => {
        alertBannerService.init(null);
        spyOn(console, 'error').and.callThrough();
        const onDestruction = new Subject<void>();
        alertBannerService.open('Test', 'Test message', onDestruction);
        expect(console.error).toHaveBeenCalledWith('Tried to open banner but no outlet was defined. ', 'Test', 'Test message');
    });
});
