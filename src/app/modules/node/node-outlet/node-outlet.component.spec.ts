import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeOutletComponent } from './node-outlet.component';

describe('NodeOutletComponent', () => {
  let component: NodeOutletComponent;
  let fixture: ComponentFixture<NodeOutletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeOutletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
