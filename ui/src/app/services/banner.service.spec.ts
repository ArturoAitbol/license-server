import { BannerComponent } from "../generics/banner/banner.component";
import { BannerService } from "./banner.service";
import { Subject } from "rxjs";
import { TestBed } from "@angular/core/testing";

let bannerComponentSpy: jasmine.SpyObj<BannerComponent>;
let bannerService: BannerService;
describe('Alert banner service - Basic functionality', () => {
    beforeEach(async () => {
        bannerComponentSpy = jasmine.createSpyObj('BannerComponent', ['open', 'close']);
        TestBed.configureTestingModule({
            // Provide both the service-to-test and its (spy) dependency
            providers: [
                BannerService,
            ]
        });
        bannerService = TestBed.inject(BannerService);
        bannerService.init(bannerComponentSpy);
    });

    it('should open the banner when the open method is called', () => {
        const onDestruction = new Subject<void>();
        bannerService.open('Test', 'Test message', onDestruction, "alert", false);
        expect(bannerComponentSpy.open).toHaveBeenCalledWith('Test', 'Test message', onDestruction, "alert", false);
    });

    it('should display the close button on the banner when property is added', () => {
        const onDestruction = new Subject<void>();
        bannerService.open('Test', 'Test message', onDestruction, "alert", true);
        expect(bannerComponentSpy.open).toHaveBeenCalledWith('Test', 'Test message', onDestruction, "alert", true);
    });

    it('should close the banner before showing another', (done) => {
        const onDestruction = new Subject<void>();
        bannerService.open('Test', 'Test message', onDestruction, "alert", false);
        expect(bannerComponentSpy.open).toHaveBeenCalledWith('Test', 'Test message', onDestruction, "alert", false);
        bannerService.open('Test2', 'Test message', onDestruction, "alert", false);
        expect(bannerComponentSpy.close).toHaveBeenCalledWith();
        setTimeout(() => {
            expect(bannerComponentSpy.open).toHaveBeenCalledWith('Test2', 'Test message', onDestruction, "alert", false);
            done();
        }, 501);
    });

    it('should log a message when no outlet is defined', () => {
        bannerService.init(null);
        spyOn(console, 'error').and.callThrough();
        const onDestruction = new Subject<void>();
        bannerService.open('Test', 'Test message', onDestruction, "alert");
        expect(console.error).toHaveBeenCalledWith('Tried to open banner but no outlet was defined. ', 'Test', 'Test message');
    });
});
