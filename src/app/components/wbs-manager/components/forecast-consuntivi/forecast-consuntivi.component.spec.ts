import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastConsuntiviComponent } from './forecast-consuntivi.component';

describe('ForecastConsuntiviComponent', () => {
  let component: ForecastConsuntiviComponent;
  let fixture: ComponentFixture<ForecastConsuntiviComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForecastConsuntiviComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastConsuntiviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
