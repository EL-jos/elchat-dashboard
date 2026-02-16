import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBottomSheetComponent } from './product-bottom-sheet.component';

describe('ProductBottomSheetComponent', () => {
  let component: ProductBottomSheetComponent;
  let fixture: ComponentFixture<ProductBottomSheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductBottomSheetComponent]
    });
    fixture = TestBed.createComponent(ProductBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
