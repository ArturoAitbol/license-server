import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { EditorComponent } from './editor.component';
import { EditorRoutingModule } from './editor-routing.module';
import { CovalentCommonModule } from '@covalent/core/common';
import { CovalentCodeEditorModule } from '@covalent/code-editor';
import { EditorActionsModule } from '../editor-actions/editor-actions.module';

@NgModule({
  declarations: [
    EditorComponent
  ],
  imports: [
    CommonModule,
    EditorRoutingModule,
    CovalentCommonModule,
    CovalentCodeEditorModule,
    SharedModule,
    EditorActionsModule
  ]
})
export class EditorModule { }
