import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { Conversation } from 'src/app/models/conversation/conversation';
import { Message } from 'src/app/models/message/message';
import { User } from 'src/app/models/user/user';
import { ConversationService } from 'src/app/services/conversation/conversation.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-site-conversations',
  templateUrl: './site-conversations.component.html',
  styleUrls: ['./site-conversations.component.scss']
})
export class SiteConversationsComponent implements OnInit {

  conversation: Conversation = new Conversation('', '', '');
  userName: string = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private conversationService: ConversationService
  ) { }

  ngOnInit(): void {
    const conversationId = this.route.snapshot.params['conversationId']!;
    const siteId = this.route.snapshot.params['siteId']!;
    const userId = this.route.snapshot.params['userId']!;
    

    this.loadConversation(conversationId, siteId, userId);
  }

  loadConversation(conversationId: string, siteId: string, userId: string): void {
    this.loading = true;
    this.userService.getConversation(siteId, conversationId, userId)
      .subscribe(convo => {
        this.conversation = convo;
        console.log(this.conversation);
        
        //this.userName = convo.userName; // backend fournit nom de user pour ce site
        this.loading = false;
      });
  }

  goBack(): void {
    this.router.navigate(['/site', this.route.snapshot.params['siteId']!]);
  }

  deleteConversation(): void {
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
      this.conversationService.deleteConversation(this.conversation.id)
        .subscribe(() => {
          this.goBack();
        });
    });
  }

  analyzeConversation(): void {
    // Appel backend pour analyser la conversation
    /* this.userService.analyzeConversation(this.conversation.id)
      .subscribe(res => {
        console.log('Analyse IA :', res);
        // Tu peux afficher un toast/snackbar avec résumé ou insights
      }); */
  }

  formatMessage(content: string): string {
    if (!content) return '';

    // Ajoute un saut de ligne avant les listes si manquant
    content = content.replace(/\* /g, '\n* ');

    return content;
  }
}
