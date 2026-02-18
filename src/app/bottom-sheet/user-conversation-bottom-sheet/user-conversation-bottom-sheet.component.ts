import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { ConversationService } from 'src/app/services/conversation/conversation.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-user-conversation-bottom-sheet',
  templateUrl: './user-conversation-bottom-sheet.component.html',
  styleUrls: ['./user-conversation-bottom-sheet.component.scss']
})
export class UserConversationBottomSheetComponent implements OnInit {

  conversations: any[] = [];
  filteredConversations: any[] = [];
  loading = false;

  // Stats et score
  totalMessages = 0;
  lastActivity: string | null = null;
  userScore: 'Hot' | 'Warm' | 'Cold' = 'Cold';

  filterOption: string = 'latest';

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private dialog: MatDialog,
    private userService: UserService,
    private conversationService: ConversationService,
    public router: Router,
    private bottomSheetRef: MatBottomSheetRef<UserConversationBottomSheetComponent>
  ) { }

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.loading = true;

    this.conversationService
      .getUserConversations(this.data.siteId, this.data.userId)
      .subscribe(res => {
        this.conversations = res;
        this.filteredConversations = [...this.conversations];
        this.loading = false;

        this.calculateStats();
        this.applyFilter();
      });
  }

  calculateStats(): void {
    this.totalMessages = this.conversations.reduce((acc, c) => acc + (c.messages_count || 0), 0);
    this.lastActivity = this.conversations
      .map(c => c.last_message?.created_at)
      .filter(d => d)
      .sort()
      .reverse()[0] || null;

    // Score simple: Hot si >20 messages, Warm si >5, Cold sinon
    if (this.totalMessages > 20) this.userScore = 'Hot';
    else if (this.totalMessages > 5) this.userScore = 'Warm';
    else this.userScore = 'Cold';
  }

  getScoreClass(score: string): string {
    return {
      Hot: 'score-hot',
      Warm: 'score-warm',
      Cold: 'score-cold'
    }[score] || '';
  }

  applyFilter(): void {
    if (this.filterOption === 'latest') {
      this.filteredConversations = [...this.conversations].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (this.filterOption === 'mostMessages') {
      this.filteredConversations = [...this.conversations].sort((a, b) =>
        (b.messages_count || 0) - (a.messages_count || 0)
      );
    }
  }

  deleteConversation(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Suppression conversation',
        message: `Voulez-vous vraiment supprimer cette conversation ?`,
        confirmText: 'Oui, supprimer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.conversationService.deleteConversation(id)
        .subscribe(() => {
          this.conversations = this.conversations.filter(c => c.id !== id);
          this.applyFilter();
          this.calculateStats();
        });
    });
  }

  viewFullConversation(conversationId: string): void {
    console.log('navigate to full page', conversationId);
    console.log(this.data.siteId, this.data.userId);
    
    this.router.navigate(['/site', this.data.siteId, 'user', this.data.userId, 'conversation', conversationId]);
    this.bottomSheetRef.dismiss() // Ferme le bottom sheet après navigation;
  }
}
