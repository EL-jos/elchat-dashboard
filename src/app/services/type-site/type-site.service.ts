import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeSite } from '../../models/type-site/type-site';

@Injectable({
  providedIn: 'root'
})
export class TypeSiteService {

  private api = `${environment.serveur.url}`;

  constructor(private http: HttpClient) {}

  // =======================
  // Types de sites
  // =======================

  getTypeSites(): Observable<TypeSite[]> {
    return this.http
      .get<any[]>(`${this.api}/type_site`)
      .pipe(
        map(res => res.map(t => TypeSite.fromJson(t)))
      );
  }

  getTypeSite(id: string): Observable<TypeSite> {
    return this.http
      .get<any>(`${this.api}/type_site/${id}`)
      .pipe(
        map(res => TypeSite.fromJson(res))
      );
  }
}
