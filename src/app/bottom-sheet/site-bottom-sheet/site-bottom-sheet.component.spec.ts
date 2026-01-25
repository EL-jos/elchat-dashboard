import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteBottomSheetComponent } from './site-bottom-sheet.component';

describe('SiteBottomSheetComponent', () => {
  let component: SiteBottomSheetComponent;
  let fixture: ComponentFixture<SiteBottomSheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteBottomSheetComponent]
    });
    fixture = TestBed.createComponent(SiteBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
