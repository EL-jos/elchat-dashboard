import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteCrawlComponent } from './site-crawl.component';

describe('SiteCrawlComponent', () => {
  let component: SiteCrawlComponent;
  let fixture: ComponentFixture<SiteCrawlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteCrawlComponent]
    });
    fixture = TestBed.createComponent(SiteCrawlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
