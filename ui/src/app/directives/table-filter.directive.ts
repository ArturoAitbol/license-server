import { Directive, ContentChild, TemplateRef } from '@angular/core';

@Directive({
  selector: 'tableFilter'
})
export class TableFilterDirective {
  @ContentChild(TemplateRef, { static: true }) filterTemplate: any;
  constructor() { }
}
