import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import FeatureToggles from 'src/assets/feature-toggles/feature-toggles.json';
import UserFeatureToggles from 'src/assets/feature-toggles/user-feature-toggles.json';
import { MsalService } from '@azure/msal-angular';
import { environment } from "../../environments/environment";

@Directive({
    selector: '[lcFeatureToggle]'
})
export class FeatureToggleDirective implements OnInit{
    @Input() lcFeatureToggle: string;
    private environmentFeatureToggles;
    private environmentUserFeatureToggles;

    constructor(
        private vcr: ViewContainerRef,
        private tpl: TemplateRef<any>,
        private msalService: MsalService
    ) {
        this.environmentFeatureToggles = FeatureToggles[environment.ENVIRONMENT_NAME];
        this.environmentUserFeatureToggles = UserFeatureToggles[environment.ENVIRONMENT_NAME];
    }

    ngOnInit() {
        if (this.environmentFeatureToggles.features[this.lcFeatureToggle] || this.environmentUserFeatureToggles[this.msalService.instance.getActiveAccount()?.username]?.features?.[this.lcFeatureToggle]) {
            this.vcr.createEmbeddedView(this.tpl);
        }
    }

}
