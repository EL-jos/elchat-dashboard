import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Conversation } from '../../models/conversation/conversation';
import { Message } from '../../models/message/message';
import { MercureService } from '../mercure/mercure.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  private api = `${environment.serveur.url}/v1`;

  constructor(
    private http: HttpClient,
    private mercure: MercureService
  ) { }

  // =======================
  // Conversations
  // =======================

  getConversations(): Observable<Conversation[]> {
    return this.http.get<any[]>(`${this.api}/conversation`).pipe(
      map(res => res.map(c => Conversation.fromJson(c)))
    );
  }

  getConversation(id: string): Observable<Conversation> {
    return this.http.get<any>(`${this.api}/conversation/${id}`).pipe(
      map(c => Conversation.fromJson(c))
    );
  }

  // =======================
  // Messages (pagination)
  // =======================

  getMessages(
    conversationId: string,
    page: number = 1
  ): Observable<Message[]> {
    return this.http
      .get<any>(`${this.api}/conversation/${conversationId}/messages?page=${page}`)
      .pipe(
        map(res => res.data.map((m: any) => Message.fromJson(m)))
      );
  }

  // =======================
  // Chat IA
  // =======================

  askQuestion(payload: {
    site_id: string;
    question: string;
    conversation_id?: string | null;
  }): Observable<{ answer: string; conversation_id: string }> {
    return this.http.post<{ answer: string; conversation_id: string }>(
      `${this.api}/chat/ask`,
      payload
    );
  }

  // =======================
  // Mercure (Realtime)
  // =======================

  listenToConversation(
    siteId: string,
    conversationId: string
  ): Observable<Message> {
    const topic = `/sites/${siteId}/conversations/${conversationId}`;
    return this.mercure.subscribe<Message>(topic);
  }

  getByUser(userId: string): Observable<Conversation[]> {
    return this.http.get<any[]>(`${this.api}/users/${userId}/conversations`).pipe(
      map(res => res.map(c => Conversation.fromJson(c)))
    );
  }
}
