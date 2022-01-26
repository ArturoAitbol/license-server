import { Directive, ContentChild, TemplateRef } from '@angular/core';

@Directive({
  selector: 'tableRow'
})
export class TableRowDirective {
  @ContentChild(TemplateRef, {static: true}) rowTemplate: any;
  constructor() { }
}
