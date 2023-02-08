import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeatureToggleService } from "../services/feature-toggle.service";

@Directive({
    selector: '[lcFeatureToggle]'
})
export class FeatureToggleDirective implements OnInit{

    private _lcFeatureToggle: string;
    private _lcFeatureToggleSubaccountId: string;
    @Input() set lcFeatureToggle(value: string) {
        this._lcFeatureToggle = value;
    }
    @Input() set lcFeatureToggleSubaccountId(value: string) {
        this._lcFeatureToggleSubaccountId = value;
    }
    constructor(
        private vcr: ViewContainerRef,
        private tpl: TemplateRef<any>,
        private featureToggleService: FeatureToggleService
    ) { }

    ngOnInit() {
        if (this.featureToggleService.isFeatureEnabled(this._lcFeatureToggle, this._lcFeatureToggleSubaccountId)) {
            this.vcr.createEmbeddedView(this.tpl);
        }
    }

}
