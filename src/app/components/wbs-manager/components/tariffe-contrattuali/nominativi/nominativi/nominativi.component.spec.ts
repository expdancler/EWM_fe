import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NominativiComponent } from './nominativi.component';

describe('NominativiComponent', () => {
  let component: NominativiComponent;
  let fixture: ComponentFixture<NominativiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NominativiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NominativiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
