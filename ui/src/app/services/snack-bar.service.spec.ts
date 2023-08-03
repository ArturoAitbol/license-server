import { CtaasSupportEmailService } from "./ctaas-support-email.service";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "src/environments/environment";
import { SnackBarService } from "./snack-bar.service";

let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;

let snackBarService: SnackBarService;
describe('Auto Logout Service - ', () => {
    beforeEach(async () => {
        matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['dismiss','open']);
        snackBarService = new SnackBarService(matSnackBarSpy);
    });

    it('should open snack bar correctly', () => {
        snackBarService.openSnackBar("message", "action");
        expect(matSnackBarSpy.dismiss).toHaveBeenCalled();
        expect(matSnackBarSpy.open).toHaveBeenCalledWith("message","action",{
            horizontalPosition: "right",
            verticalPosition: "top",
            duration: 2000
        });
        snackBarService.openSnackBar("message", "action", 1000);
        expect(matSnackBarSpy.open).toHaveBeenCalledWith("message","action",{
            horizontalPosition: "right",
            verticalPosition: "top",
            duration: 1000
        });
    });
});