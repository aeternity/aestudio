import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TxValuesComponent } from './tx-values.component';

describe('TxValuesComponent', () => {
  let component: TxValuesComponent;
  let fixture: ComponentFixture<TxValuesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TxValuesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TxValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
