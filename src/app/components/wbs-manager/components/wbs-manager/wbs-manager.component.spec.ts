import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WbsManagerComponent } from './wbs-manager.component';

describe('WbsManagerComponent', () => {
  let component: WbsManagerComponent;
  let fixture: ComponentFixture<WbsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WbsManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WbsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
