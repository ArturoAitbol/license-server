import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const renewalDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const renewalDate = control.get('renewalDate');
    const startDate = control.get('startDate');
    if ((renewalDate?.value as Date) <= (startDate?.value as Date)) {
        renewalDate.setErrors( {renewalIsBeforeStart: true});
        return { renewalIsBeforeStart: true };
    }
    renewalDate.updateValueAndValidity({onlySelf: true, emitEvent:false});
    return null;
}
