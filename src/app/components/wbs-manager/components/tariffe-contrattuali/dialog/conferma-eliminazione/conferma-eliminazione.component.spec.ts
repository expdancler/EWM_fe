import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfermaEliminazioneComponent } from './conferma-eliminazione.component';

describe('ConfermaEliminazioneComponent', () => {
  let component: ConfermaEliminazioneComponent;
  let fixture: ComponentFixture<ConfermaEliminazioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfermaEliminazioneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfermaEliminazioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
