import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import FeatureToggles from '../../assets/feature-toggles.json';
import UserFeatureToggles from '../../assets/user-feature-toggles.json';
import { MsalService } from '@azure/msal-angular';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[featureToggle]'
})
export class FeatureToggleDirective implements OnInit {
    @Input() featureToggle: string;

    constructor(
        private vcr: ViewContainerRef,
        private tpl: TemplateRef<any>,
        private msalService: MsalService
    ) {
    }

    ngOnInit() {
        if (FeatureToggles.features[this.featureToggle] || UserFeatureToggles[this.msalService.instance.getActiveAccount()?.username]?.features?.[this.featureToggle]) {
            this.vcr.createEmbeddedView(this.tpl);
        }
    }

}
