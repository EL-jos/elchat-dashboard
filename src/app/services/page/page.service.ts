import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Page } from 'src/app/models/page/page';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PageService {

  private api = `${environment.serveur.url}`;

  constructor(private http: HttpClient) { }

  createPage(siteId: string, payload: any) {
    return this.http.post(`${this.api}/site/${siteId}/pages`, payload);
  }

  getPage(pageId: string) {
    return this.http.get(`${this.api}/pages/${pageId}`);
  }

  updatePage(pageId: string, payload: any) {
    return this.http.patch(`${this.api}/pages/${pageId}`, payload);
  }

  deletePage(pageId: string) {
    return this.http.delete(`${this.api}/pages/${pageId}`);
  }


  getPages(siteId: string): Observable<{
    site: any;
    stats: any;
    pages: Page[];
  }> {
    return this.http.get<any>(`${this.api}/site/${siteId}/pages/overview`).pipe(
      map(res => ({
        site: res.site,
        stats: res.stats,
        pages: res.pages.map((p: any) => Page.fromJson(p))
      }))
    );
  }

  recrawlPage(pageId: string) {
    return this.http.post(`${this.api}/pages/${pageId}/recrawl`, {});
  }

  toggleIndex(pageId: string, indexed: boolean) {
    return this.http.patch(`${this.api}/pages/${pageId}`, {
      is_indexed: indexed
    });
  }
}