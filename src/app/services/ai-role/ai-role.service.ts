import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AiRole } from 'src/app/models/ai-role/ai-role';
import { TypeSite } from 'src/app/models/type-site/type-site';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiRoleService {

  private api = `${environment.serveur.url}`;

  constructor(private http: HttpClient) { }

  getAiRoles(): Observable<AiRole[]> {
    return this.http
      .get<any[]>(`${this.api}/ai_role`)
      .pipe(
        map(res => res.map(t => AiRole.fromJson(t)))
      );
  }

  getAiRole(id: string): Observable<AiRole> {
    return this.http
      .get<any>(`${this.api}/ai_role/${id}`)
      .pipe(
        map(res => AiRole.fromJson(res))
      );
  }
}
