import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WidgetService {

    public refresh: EventEmitter<any>;
    public lisfOfWidgets: any;

    constructor() {
        this.saveOnLocalStorage();
        this.refresh = new EventEmitter<any>();
    }

    startVariables() {
        this.lisfOfWidgets = [
            [
                ["Test Plan Count", true],
                ["Test Case Count", true],
                ["Project Run Count", true]
            ],
            [
                ["Inventory", true],
                ["Links", true],
                ["Current Running Projects", true]
            ]
        ]
    }

    saveOnLocalStorage() {
        this.startVariables();
        if (!localStorage.getItem('visible widgets'))
            localStorage.setItem('visible widgets', JSON.stringify(this.lisfOfWidgets));

    }

    saveChanges(list) {
        localStorage.setItem('visible widgets', list);
    }

    refreshWidgets() {
        this.refresh.emit();
    }

    update(widget) {
        var list;
        if (localStorage.getItem('visible widgets'))
            list = JSON.parse(localStorage.getItem('visible widgets'));
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < list[i].length; j++) {
                if (list[i][j][0] == widget)
                    list[i][j][1] = false
            }
        }
        localStorage.setItem('visible widgets', JSON.stringify(list));
    }
}