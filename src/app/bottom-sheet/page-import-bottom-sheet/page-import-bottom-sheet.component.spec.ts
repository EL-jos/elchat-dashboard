import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageImportBottomSheetComponent } from './page-import-bottom-sheet.component';

describe('PageImportBottomSheetComponent', () => {
  let component: PageImportBottomSheetComponent;
  let fixture: ComponentFixture<PageImportBottomSheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageImportBottomSheetComponent]
    });
    fixture = TestBed.createComponent(PageImportBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
