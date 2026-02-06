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
import { WidgetSetting } from 'src/app/models/widget-setting/widget-setting';

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

  // ==================================================
  // ⚙️ Widget Settings
  // ==================================================

  getWidgetSettings(siteId: string): Observable<WidgetSetting> {
    return this.http
      .get<{ data: any }>(`${this.api}/site/${siteId}/widget/setting`)
      .pipe(map(res => WidgetSetting.fromJson(res.data)));
  }

  updateWidgetSettings(
    widgetSettingId: string,
    payload: Partial<WidgetSetting>
  ): Observable<WidgetSetting> {
    return this.http
      .put<{ data: any }>(
        `${this.api}/widget_setting/${widgetSettingId}`,
        payload
      )
      .pipe(map(res => WidgetSetting.fromJson(res.data)));
  }

  uploadSitemap(
    siteId: string,
    file: File,
    includePages: string[],
    excludePages: string[]
  ): Observable<any> {

    const formData = new FormData();
    formData.append('sitemap_file', file);

    includePages.forEach(p =>
      formData.append('include_pages[]', p)
    );

    excludePages.forEach(p =>
      formData.append('exclude_pages[]', p)
    );

    return this.http.post(
      `${this.api}/site/${siteId}/sitemap`,
      formData
    );
  }

  // ==================================================
  // ⚙️ Actions
  // ==================================================
  /**
   * Lance la génération du sitemap pour un site donné
   */
  generateSitemap(siteId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.api}/site/sitemap`,
      { site_id: siteId } // ✅ clé obligatoire pour Laravel
    );
  }

  // ==================================================
  // ✍️ Contenu manuel
  // ==================================================

  submitManualContent(
    siteId: string,
    payload: { title: string; content: string }
  ): Observable<{ message: string; page_id: number }> {
    return this.http.post<{ message: string; page_id: number }>(
      `${this.api}/site/${siteId}/manual-content`,
      payload
    );
  }

  // ==================================================
  // 🧠 IA – Knowledge Quality
  // ==================================================

  /**
   * Lance le calcul de la qualité de la connaissance IA
   * pour un site donné
   */
  calculateKnowledgeQuality(siteId: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
    }>(
      `${this.api}/knowledge-quality/calculate`,
      {
        site_id: siteId
      }
    );
  }


}
