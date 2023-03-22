import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SharedModule } from "../../modules/shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AlertBannerComponent } from "./alert-banner.component";
import { BannerService } from "../../services/alert-banner.service";
import { BannerServiceMock } from "../../../test/mock/services/alert-banner-service.mock";
import { Subject } from "rxjs";

let testInstance: AlertBannerComponent;
let fixture: ComponentFixture<AlertBannerComponent>;

const defaultTestBedConfig = {
    declarations: [ AlertBannerComponent ],
    imports: [ BrowserAnimationsModule, MatSnackBarModule, SharedModule, FormsModule, ReactiveFormsModule ],
    providers: [
        {
            provide: BannerService,
            useValue: BannerServiceMock
        },
    ]
};

const beforeEachFunction = () => {
    TestBed.configureTestingModule(defaultTestBedConfig);
    fixture = TestBed.createComponent(AlertBannerComponent);
    testInstance = fixture.componentInstance;
};

describe('Alert banner component - UI verification tests', () => {
    beforeEach(beforeEachFunction);
    it('should display UI elements correctly', () => {
        testInstance.title = 'Test title';
        testInstance.message = 'Test message';
        testInstance.opened = true;
        fixture.detectChanges();

        const title = fixture.nativeElement.querySelector('#alert-banner-title');
        const message = fixture.nativeElement.querySelector('#alert-banner-message');

        console.log(fixture.nativeElement)
        expect(title.textContent).toBe('Test title');
        expect(message.textContent).toBe('Test message');
    });

    it('should open banner when open method is called', () => {
        testInstance.open('Test title', 'Test message', new Subject());
        fixture.detectChanges();

        const title = fixture.nativeElement.querySelector('#alert-banner-title');
        const message = fixture.nativeElement.querySelector('#alert-banner-message');

        expect(title.textContent).toBe('Test title');
        expect(message.textContent).toBe('Test message');
        expect(testInstance.opened).toBeTrue();
    });

    it('should close banner when close method is called', async() => {
        testInstance.open('Test title', 'Test message', new Subject());
        fixture.detectChanges();
        expect(testInstance.opened).toBeTrue();
        testInstance.close();
        fixture.detectChanges();

        expect(testInstance.opened).toBeFalse();
    });

    it('should close banner when onDestruction is emitted', async () => {
        const onDestruction = new Subject<void>();
        testInstance.open('Test title', 'Test message', onDestruction);
        fixture.detectChanges();

        expect(testInstance.opened).toBeTrue();

        onDestruction.next();
        onDestruction.complete();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(testInstance.opened).toBeFalse();
    });

    it('should log an error if its opened twice', () => {
        spyOn(console, 'error').and.callThrough();
        testInstance.open('Test title', 'Test message', new Subject());
        testInstance.open('Test title', 'Test message', new Subject());
        expect(console.error).toHaveBeenCalledWith('Tried to open banner when outlet was already opened.');
    });
});
