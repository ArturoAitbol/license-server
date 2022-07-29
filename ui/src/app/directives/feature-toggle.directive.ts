import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import FeatureToggles from '../../assets/feature-toggles.json';
import UserFeatureToggles from '../../assets/user-feature-toggles.json';
import { MsalService } from "@azure/msal-angular";

@Directive({
    selector: '[lcFeatureToggle]'
})
export class FeatureToggleDirective implements OnInit{
    @Input() lcFeatureToggle: string;

    constructor(
        private vcr: ViewContainerRef,
        private tpl: TemplateRef<any>,
        private msalService: MsalService
    ) {
    }

    ngOnInit() {
        if (FeatureToggles.features[this.lcFeatureToggle] || UserFeatureToggles[this.msalService.instance.getActiveAccount()?.username]?.features?.[this.lcFeatureToggle]) {
            this.vcr.createEmbeddedView(this.tpl);
        }
    }

}