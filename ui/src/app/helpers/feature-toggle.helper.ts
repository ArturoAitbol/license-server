import { MsalService } from "@azure/msal-angular";
import FeatureToggles from 'src/assets/feature-toggles/feature-toggles.json';
import UserFeatureToggles from 'src/assets/feature-toggles/user-feature-toggles.json';
import { environment } from "../../environments/environment";

export class FeatureToggleHelper {
    static isFeatureEnabled(toggleName: string, msalService?: MsalService) {
        if (FeatureToggles[environment.ENVIRONMENT_NAME].features[toggleName])
            return true;
        if (msalService && UserFeatureToggles[environment.ENVIRONMENT_NAME][msalService.instance.getActiveAccount()?.username]?.features?.[toggleName])
            return true;
        return false;
    }
}