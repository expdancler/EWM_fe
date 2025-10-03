import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTabellaDettaglioComponent } from './dialog-tabella-dettaglio.component';

describe('DialogTabellaDettaglioComponent', () => {
  let component: DialogTabellaDettaglioComponent;
  let fixture: ComponentFixture<DialogTabellaDettaglioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTabellaDettaglioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTabellaDettaglioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
