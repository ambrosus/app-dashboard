import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsLoaderIndicatorComponent } from './assets-loader-indicator.component';

describe('AssetsLoaderIndicatorComponent', () => {
  let component: AssetsLoaderIndicatorComponent;
  let fixture: ComponentFixture<AssetsLoaderIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsLoaderIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsLoaderIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
