import { Action } from "src/app/model/action";

export class AddResourceToGroup {
    public static generateQuery(data: Action): string {
        const $commented = (data.comment) ? '//' : '';
        return  $commented + `${data.resourceGroup}.addResourcesToGroup([${data.value}])`;
    }
}