import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabellaDettaglioComponent } from './tabella-dettaglio.component';

describe('TabellaDettaglioComponent', () => {
  let component: TabellaDettaglioComponent;
  let fixture: ComponentFixture<TabellaDettaglioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabellaDettaglioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabellaDettaglioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
