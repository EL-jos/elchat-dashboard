import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Site } from '../../models/site/site';
import { Page } from '../../models/page/page';
import { Document } from '../../models/document/document';
import { Conversation } from '../../models/conversation/conversation';
import { User } from 'src/app/models/user/user';
import { SiteActivity } from 'src/app/models/site/site-activity';
import { SiteOverview } from 'src/app/models/site/site-overview';
import { SiteOverviewResponse } from 'src/app/models/site/site-overview-response';

@Injectable({ providedIn: 'root' })
export class SiteService {

  private api = `${environment.serveur.url}`;

  constructor(private http: HttpClient) {}

  // ==================================================
  // 🧩 CRUD – Sites (Account)
  // ==================================================

  getSites(): Observable<Site[]> {
    return this.http.get<any[]>(`${this.api}/site`).pipe(
      map(res => res.map(Site.fromJson))
    );
  }

  getSite(siteId: string): Observable<Site> {
    return this.http.get<any>(`${this.api}/site/${siteId}`).pipe(
      map(Site.fromJson)
    );
  }

  createSite(payload: Partial<Site>): Observable<Site> {
    return this.http.post<any>(`${this.api}/site`, payload).pipe(
      map(Site.fromJson)
    );
  }

  updateSite(siteId: string, payload: Partial<Site>): Observable<Site> {
    return this.http.put<any>(`${this.api}/site/${siteId}`, payload).pipe(
      map(Site.fromJson)
    );
  }

  deleteSite(siteId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/site/${siteId}`);
  }

  // ==================================================
  // 📊 Dashboard d’un site (DETAILS)
  // ==================================================

  /**
   * Stats globales d’un site
   * (documents, conversations, sources, status…)
   */
  getSiteOverview(siteId: string): Observable<SiteOverviewResponse> {
    return this.http.get<SiteOverviewResponse>(
      `${this.api}/dashboard/site/${siteId}/overview`
    );
  }

  /**
   * Timeline conversations/messages
   */
  getSiteActivity(siteId: string): Observable<SiteActivity> {
    return this.http.get<SiteActivity>(
      `${this.api}/site/${siteId}/activity`
    );
  }

  // ==================================================
  // ⚙️ Actions
  // ==================================================

  crawl(siteId: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(
      `${this.api}/site/${siteId}/crawl`,
      {}
    );
  }

  reindex(siteId: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(
      `${this.api}/site/${siteId}/reindex`,
      {}
    );
  }

  // ==================================================
  // 🔗 Relations – Lazy loading
  // ==================================================

  getPages(siteId: string): Observable<Page[]> {
    return this.http.get<any[]>(`${this.api}/site/${siteId}/pages`).pipe(
      map(res => res.map(Page.fromJson))
    );
  }

  getDocuments(siteId: string): Observable<Document[]> {
    return this.http.get<any[]>(`${this.api}/site/${siteId}/documents`).pipe(
      map(res => res.map(Document.fromJson))
    );
  }

  getConversations(siteId: string): Observable<Conversation[]> {
    return this.http.get<any[]>(
      `${this.api}/conversation?site_id=${siteId}`
    ).pipe(
      map(res => res.map(Conversation.fromJson))
    );
  }

  getUsers(siteId: string): Observable<User[]> {
    return this.http.get<any[]>(`${this.api}/site/${siteId}/users`).pipe(
      map(res => res.map(User.fromJson))
    );
  }

  // ==================================================
  // 📤 Upload document
  // ==================================================

  uploadDocument(siteId: string, formData: FormData): Observable<Document> {
    return this.http.post<any>(
      `${this.api}/site/${siteId}/documents`,
      formData
    ).pipe(
      map(Document.fromJson)
    );
  }
}
