import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteConversationsComponent } from './site-conversations.component';

describe('SiteConversationsComponent', () => {
  let component: SiteConversationsComponent;
  let fixture: ComponentFixture<SiteConversationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteConversationsComponent]
    });
    fixture = TestBed.createComponent(SiteConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
