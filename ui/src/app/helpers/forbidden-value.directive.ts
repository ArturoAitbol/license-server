import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidatorFn } from '@angular/forms';

@Directive({
    selector: '[forbiddenValue]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenValueDirective, multi: true }]
})

export class ForbiddenValueDirective implements Validator {
    @Input('forbiddenValue') forbiddenValue: string;

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.forbiddenValue ? forbiddenValueValidator(new RegExp(this.forbiddenValue, 'i'))(control)
            : null;
    }
}

export function forbiddenValueValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const forbidden = nameRe.test(control.value);
        return forbidden ? { 'forbiddenName': { value: control.value } } : null;
    };
}