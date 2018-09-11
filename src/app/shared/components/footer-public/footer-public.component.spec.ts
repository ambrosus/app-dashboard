import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterPublicComponent } from './footer-public.component';

describe('FooterPublicComponent', () => {
  let component: FooterPublicComponent;
  let fixture: ComponentFixture<FooterPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
