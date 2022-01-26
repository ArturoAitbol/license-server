import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { EditorComponent } from '../modules/editor/editor.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<EditorComponent> {
  canDeactivate(component: EditorComponent): boolean {
    if (component.hasUnsavedData() && !component.backPress) {
      if (confirm('You have unsaved changes! If you leave, your changes will be lost. Do you want to proceed?')) {
        // clear the unsaved script from local storage
        if (localStorage.getItem('unsavedScript')) {
          localStorage.removeItem('unsavedScript');
        }
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}
