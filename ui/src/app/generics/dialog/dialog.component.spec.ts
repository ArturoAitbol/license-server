import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogComponent } from './dialog.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';  // Asegúrate de importar estos módulos

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogComponent ],
      imports: [MatDialogModule],  // Asegúrate de importar MatDialogModule aquí
      providers: [
        // Aquí proporcionamos el servicio MatDialogRef necesario para las pruebas
        { provide: MatDialogRef, useValue: {} },
        // Aquí proporcionamos el servicio MAT_DIALOG_DATA necesario para las pruebas
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
