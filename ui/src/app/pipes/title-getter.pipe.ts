import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleGetter'
})
export class TitleGetterPipe implements PipeTransform {
  transform(value: unknown, key: string, ...args: unknown[]): unknown {
    const currentView = window.location.href;
    const title = value[key];
    const customFields = [
      { name: "subaccountName", value: "View token Consumption", view: "dashboard" },
      { name: "status", value: "View Subscription(s)", view: "dashboard" },
    ];
    const customTitle = customFields.filter((field) => {
      if (field.name === key && currentView.includes(field.view))
        return field;
    });
    return customTitle.length ? customTitle[0].value : title;
  }

}
