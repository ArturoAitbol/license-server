import { FeatureToggleDirective } from "../directives/feature-toggle.directive";
import { FeatureToggleHelper } from "./feature-toggle.helper";
import { Utility } from "./utils";
import { MsalServiceMock } from "src/test/mock/services/msal-service.mock";

describe('testing changing utils', () => {

    it('should return the color of a specific case', () => {
        let color;
        spyOn(Utility, 'getColorCode').and.callThrough();
        color = Utility.getColorCode('')
        expect(color).toBe('red');

        color = Utility.getColorCode('available');
        expect(color).toBe('#0E8B18');
        color = Utility.getColorCode('completed');
        expect(color).toBe('#0E8B18');
        color = Utility.getColorCode('registered');
        expect(color).toBe('#0E8B18');
        color = Utility.getColorCode('active');
        expect(color).toBe('#0E8B18');
        color = Utility.getColorCode('open');
        expect(color).toBe('#0E8B18');

        color = Utility.getColorCode('initiated');
        expect(color).toBe('#7694B7');
        color = Utility.getColorCode('inprogress');
        expect(color).toBe('#7694B7');
        color = Utility.getColorCode('unavailable');
        expect(color).toBe('#7694B7');
        color = Utility.getColorCode('rebooting');
        expect(color).toBe('#7694B7');
        color = Utility.getColorCode('inactive');
        expect(color).toBe('#7694B7');

        color = Utility.getColorCode('offline');
        expect(color).toBe('#CB3333');
        color = Utility.getColorCode('failed');
        expect(color).toBe('#CB3333');
        color = Utility.getColorCode('unregistered');
        expect(color).toBe('#CB3333');
        color = Utility.getColorCode('expired');
        expect(color).toBe('#CB3333');
        color = Utility.getColorCode('closed');
        expect(color).toBe('#CB3333');
    });
});

describe('testing utils sorting', () => {
    
    it('should call sortByLastModifiedDateInDescOrder', () => { 
        let dateList = [{lastModifiedDate:'2022-08-01'},{lastModifiedDate:'2022-07-01'},{lastModifiedDate:'2022-08-01'}]   
        const desList = [{lastModifiedDate: '2022-08-01'}, {lastModifiedDate: '2022-08-01'}, {lastModifiedDate: '2022-07-01'}];
        Utility.sortByLastModifiedDateInDescOrder(dateList);
        expect(Utility.sortByLastModifiedDateInDescOrder(dateList)).toEqual(desList);
    });

    it('should call sortListInAscendingOrderWithoutKey', () => {
        spyOn(Utility, 'sortListInAscendingOrderWithoutKey').and.callThrough();
        let numberList = [4, 2, 2, 1, 3];
        const expetedList = [1, 2, 2, 3, 4];
        let sortedList = Utility.sortListInAscendingOrderWithoutKey(numberList);
        expect(sortedList).toEqual(expetedList);
    });

    it('should call sortListInAscendingOrder', () => {
        spyOn(Utility, 'sortListInAscendingOrder').and.callThrough();
        const objList = [{number:2}, {number:0}, {number:1}, {number:0}];
        const sortedAscList = [{number: 0},{number: 0},{number: 1}, {number: 2}];
        const objLettersList = [{name:"a"}, {name:"d"}, {name:"c"}, {name:"d"}];
        const sortedAscLetterList = [{name: 'a'}, {name: 'c'}, {name: 'd'}, {name: 'd'}];

        Utility.sortListInAscendingOrder(objList, 'number', true);
        expect(Utility.sortListInAscendingOrder(objList, 'number', true)).toEqual(sortedAscList);

        Utility.sortListInAscendingOrder(objLettersList, 'name', false);
        expect(Utility.sortListInAscendingOrder(objLettersList, 'name', false)).toEqual(sortedAscLetterList);
    });

    it('should call sortListInDescendingOrder', () => {
        spyOn(Utility, 'sortListInDescendingOrder').and.callThrough();
        const objList = [{number:2}, {number:0}, {number:1}, {number:0}];
        const sortedDescList = [{number: 2}, {number: 1}, {number: 0}, {number: 0}];
        const objLettersList = [{name:"a"}, {name:"d"}, {name:"c"}, {name:"d"}];
        const sortedDescLetterList = [{name: 'd'}, {name: 'd'}, {name: 'c'}, {name: 'a'}];

        Utility.sortListInDescendingOrder(objList, 'number', true);
        expect(Utility.sortListInDescendingOrder(objList, 'number', true)).toEqual(sortedDescList);

        Utility.sortListInDescendingOrder(objLettersList, 'name',false);
        expect(Utility.sortListInDescendingOrder(objLettersList, 'name',false)).toEqual(sortedDescLetterList);
    });
});

describe('table options', () => {
    it('should call getTableOptions', () => {
        spyOn(Utility, 'getTableOptions').and.callThrough();
        Utility.getTableOptions(['tekvizion.FullAdmin'], 'MODIFY_STAKEHOLDER', "stakeholderOptions")
        expect(Utility.getTableOptions).toHaveBeenCalled();
    });
});



