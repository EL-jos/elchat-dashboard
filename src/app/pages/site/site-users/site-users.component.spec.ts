import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteUsersComponent } from './site-users.component';

describe('SiteUsersComponent', () => {
  let component: SiteUsersComponent;
  let fixture: ComponentFixture<SiteUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteUsersComponent]
    });
    fixture = TestBed.createComponent(SiteUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
