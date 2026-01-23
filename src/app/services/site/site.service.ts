import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Site } from '../../models/site/site';
import { Page } from '../../models/page/page';
import { Document } from '../../models/document/document';
import { Conversation } from '../../models/conversation/conversation';

@Injectable({
  providedIn: 'root'
})
export class SiteService {

  private api = `${environment.serveur.url}/v1`;

  constructor(private http: HttpClient) { }

  // =======================
  // Sites
  // =======================

  getSites(): Observable<Site[]> {
    return this.http.get<any[]>(`${this.api}/site`).pipe(
      map(res => res.map(site => Site.fromJson(site)))
    );
  }

  getSite(id: string): Observable<Site> {
    return this.http.get<any>(`${this.api}/site/${id}`).pipe(
      map(site => Site.fromJson(site))
    );
  }

  createSite(payload: Partial<Site>): Observable<Site> {
    return this.http.post<any>(`${this.api}/site`, payload).pipe(
      map(site => Site.fromJson(site))
    );
  }

  updateSite(site: Site): Observable<Site> {
    return this.http.put<any>(`${this.api}/site/${site.id}`, site).pipe(
      map(updated => Site.fromJson(updated))
    );
  }

  deleteSite(siteId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/site/${siteId}`);
  }

  // =======================
  // Crawl
  // =======================

  crawl(siteId: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(
      `${this.api}/site/${siteId}/crawl`,
      {}
    );
  }

  // =======================
  // Relations lazy-load
  // =======================

  getPages(siteId: string): Observable<Page[]> {
    return this.http.get<any[]>(`${this.api}/site/${siteId}/pages`).pipe(
      map(res => res.map(p => Page.fromJson(p)))
    );
  }

  getDocuments(siteId: string): Observable<Document[]> {
    return this.http.get<any[]>(`${this.api}/site/${siteId}/documents`).pipe(
      map(res => res.map(d => Document.fromJson(d)))
    );
  }

  getConversations(siteId: string): Observable<Conversation[]> {
    return this.http.get<any[]>(`${this.api}/conversation?site_id=${siteId}`).pipe(
      map(res => res.map(c => Conversation.fromJson(c)))
    );
  }

  // =======================
  // Upload document
  // =======================

  uploadDocument(siteId: string, formData: FormData): Observable<Document> {
    return this.http.post<any>(
      `${this.api}/site/${siteId}/documents`,
      formData
    ).pipe(
      map(doc => Document.fromJson(doc))
    );
  }
}
