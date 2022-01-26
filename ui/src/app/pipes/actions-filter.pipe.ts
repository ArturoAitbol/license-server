import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'actionsFilter'
})
export class ActionsFilterPipe implements PipeTransform {
  transform(items: any[], query: string): any[] {
    let helpArray = items;
    let result = [];
    let auxCat: any;
    if (query == "") return items;
    else {
      helpArray.forEach(category => {
        let filteredActions = [];
        auxCat = JSON.parse(JSON.stringify(category));
        category.actionItems.forEach(actionItem => {
          if (actionItem.name.toLowerCase().includes(query.toLowerCase()))
            filteredActions.push(actionItem);
        })
        auxCat.actionItems = filteredActions;
        result.push(auxCat);
      })
      return result;
    }
  }

}
