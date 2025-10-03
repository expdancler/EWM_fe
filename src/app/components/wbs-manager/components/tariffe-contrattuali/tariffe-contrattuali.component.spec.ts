import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TariffeContrattualiComponent } from './tariffe-contrattuali.component';

describe('TariffeContrattualiComponent', () => {
  let component: TariffeContrattualiComponent;
  let fixture: ComponentFixture<TariffeContrattualiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TariffeContrattualiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TariffeContrattualiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
