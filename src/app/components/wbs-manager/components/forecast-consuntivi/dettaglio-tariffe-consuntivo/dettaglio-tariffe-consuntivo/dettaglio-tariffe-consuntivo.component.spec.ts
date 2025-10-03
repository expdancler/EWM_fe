import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DettaglioTariffeConsuntivoComponent } from './dettaglio-tariffe-consuntivo.component';

describe('DettaglioTariffeConsuntivoComponent', () => {
  let component: DettaglioTariffeConsuntivoComponent;
  let fixture: ComponentFixture<DettaglioTariffeConsuntivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DettaglioTariffeConsuntivoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DettaglioTariffeConsuntivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
