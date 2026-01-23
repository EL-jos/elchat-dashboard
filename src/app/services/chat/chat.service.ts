import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { Conversation } from '../../models/conversation/conversation';
import { Message } from '../../models/message/message';
import { MercureService } from '../mercure/mercure.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private api = `${environment.serveur.url}/v1`;

  constructor(private http: HttpClient, private mercure: MercureService) { }

  // =======================
  // Récupération conversations
  // =======================

  getUserConversations(siteId: string): Observable<Conversation[]> {
    return this.http.get<any[]>(`${this.api}/conversation?site_id=${siteId}`).pipe(
      map(res => res.map(c => Conversation.fromJson(c)))
    );
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<any>(`${this.api}/conversation/${conversationId}`).pipe(
      map(c => Conversation.fromJson(c))
    );
  }

  // =======================
  // Envoi message
  // =======================

  sendMessage(
    siteId: string,
    question: string,
    conversationId?: string | null
  ): Observable<Message> {
    return this.http.post<any>(`${this.api}/chat/ask`, {
      site_id: siteId,
      question,
      conversation_id: conversationId ?? null
    }).pipe(
      map(res => {
        // on met à jour conversation_id si nécessaire
        const msg = new Message(
          `${res.conversation_id}-${Date.now()}`, // id temporaire
          question,
          'user',
          new Date().toISOString()
        );
        return msg;
      })
    );
  }

  // =======================
  // Écoute temps réel via Mercure
  // =======================

  listenToConversation(siteId: string, conversationId: string): Observable<Message> {
    const topic = `/sites/${siteId}/conversations/${conversationId}`;
    return this.mercure.subscribe<Message>(topic).pipe(
      map(msg => Message.fromJson(msg))
    );
  }

  // =======================
  // Méthode helper pour envoyer et recevoir dans le modèle
  // =======================

  async sendAndUpdateConversation(
    conversation: Conversation,
    siteId: string,
    question: string
  ): Promise<void> {
    try {
      const message = await firstValueFrom(this.sendMessage(siteId, question, conversation.id));
      conversation.messages.push(message);
    } catch (error) {
      console.error('Erreur envoi message chat IA', error);
    }
  }
}
