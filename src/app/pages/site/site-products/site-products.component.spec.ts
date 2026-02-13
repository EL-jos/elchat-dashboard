import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteProductsComponent } from './site-products.component';

describe('SiteProductsComponent', () => {
  let component: SiteProductsComponent;
  let fixture: ComponentFixture<SiteProductsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteProductsComponent]
    });
    fixture = TestBed.createComponent(SiteProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
