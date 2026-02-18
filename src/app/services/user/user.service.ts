import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../models/user/user';
import { environment } from 'src/environments/environment';
import { Conversation } from 'src/app/models/conversation/conversation';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  getConversation(siteId: string, conversation_id: string, userId: string): Observable<Conversation> {
    return this.http.get<any>(`${this.api}/conversation/${conversation_id}/site/${siteId}/user/${userId}`).pipe(
      map(c => Conversation.fromJson(c))
    );
  }

  private api = environment.serveur.url;

  constructor(private http: HttpClient) { }

  getUsers(siteId: string, filters: any): Observable<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<any>(`${this.api}/users/site/${siteId}`, { params })
      .pipe(
        map(response => {
          response.data = response.data.map((u: any) => {
            const user = User.fromJson(u);
            user.stats = u.stats;
            return user;
          });
          return response;
        })
      );
  }

  getUserDetails(userId: string, siteId: string): Observable<User> {
    return this.http.get<any>(`${this.api}/users/${userId}/site/${siteId}`)
      .pipe(
        map(json => {
          const user = User.fromJson(json);
          user.stats = json.stats;
          user.conversations = json.conversations || [];
          return user;
        })
      );
  }

}