import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTariffeComponent } from './dialog-tariffe.component';

describe('DialogTariffeComponent', () => {
  let component: DialogTariffeComponent;
  let fixture: ComponentFixture<DialogTariffeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTariffeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTariffeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
