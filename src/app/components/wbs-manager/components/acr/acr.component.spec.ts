import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcrComponent } from './acr.component';

describe('AcrComponent', () => {
  let component: AcrComponent;
  let fixture: ComponentFixture<AcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
