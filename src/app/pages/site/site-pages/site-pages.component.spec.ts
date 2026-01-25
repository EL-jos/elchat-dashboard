import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitePagesComponent } from './site-pages.component';

describe('SitePagesComponent', () => {
  let component: SitePagesComponent;
  let fixture: ComponentFixture<SitePagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SitePagesComponent]
    });
    fixture = TestBed.createComponent(SitePagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
