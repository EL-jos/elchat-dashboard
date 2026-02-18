import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConversationBottomSheetComponent } from './user-conversation-bottom-sheet.component';

describe('UserConversationBottomSheetComponent', () => {
  let component: UserConversationBottomSheetComponent;
  let fixture: ComponentFixture<UserConversationBottomSheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserConversationBottomSheetComponent]
    });
    fixture = TestBed.createComponent(UserConversationBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
