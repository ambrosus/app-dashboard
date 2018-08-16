import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HermesregisterComponent } from './hermesregister.component';

describe('HermesregisterComponent', () => {
  let component: HermesregisterComponent;
  let fixture: ComponentFixture<HermesregisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HermesregisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HermesregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
