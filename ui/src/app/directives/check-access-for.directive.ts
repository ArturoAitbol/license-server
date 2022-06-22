import { Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { permissions } from '../helpers/role-permissions';

@Directive({
  selector: '[checkAccessFor]'
})
export class CheckAccessForDirective implements OnInit {

  @Input() checkAccessFor: string;

  constructor(
    private msalService:MsalService,
    private viewContainerRef:ViewContainerRef,
    private templateRef:TemplateRef<any>) {}

  ngOnInit(): void {
    if(this.isAuthorized())
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    else
      this.viewContainerRef.clear();
  }

  isAuthorized():boolean{
    let accountRoles = this.msalService.instance.getActiveAccount().idTokenClaims["roles"];
    const premissionsMatch = accountRoles?.findIndex((role : string) => permissions[role].elements.indexOf(this.checkAccessFor) !==-1);
    return (premissionsMatch >= 0);
  }

}