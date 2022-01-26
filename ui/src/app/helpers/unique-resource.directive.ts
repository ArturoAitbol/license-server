import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';
import { AutomationEditorService } from '../services/automation-editor.service';

@Directive({
  selector: '[appUniqueResource][ngModel]',
  providers: [{ provide: NG_VALIDATORS, useExisting: UniqueResourceDirective, multi: true }]
})

export class UniqueResourceDirective implements Validator {

  existingResources: any;
  constructor(private AEService: AutomationEditorService) {
    this.existingResources = this.AEService.getResources();
  }

  validate(control: AbstractControl): { [key: string]: any } | null {
    let response: any = null;
    if (control.value) {
      this.existingResources.forEach((resource: any) => {
        if (resource.name.toLowerCase() === control.value.toLowerCase()) {
          response = { 'appUniqueResource': true };
        }
      });
    }
    return response;
  }
}
