import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

export interface DashboardOverview {
  total_sites: number;
  total_documents: number;
  //total_chunks: number;
  total_conversations: number;
  total_messages: number;
  total_users: number;

  // Graphes par site
  conversations_per_day: {
    site_name: string;
    data: { date: string; count: number }[];
  }[];

  messages_per_day: {
    site_name: string;
    data: { date: string; count: number }[];
  }[];

  source_distribution: {
    site_name: string;
    sources: Record<string, number>; // ex: { pages: 50, woocommerce: 40 }
  }[];

  sites: {
    icon: string;
    name: string;
    url: string;
    status: string;
    created_at: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = environment.serveur.url;

  constructor(private http: HttpClient) { }

  getOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.api}/dashboard/overview`);
  }

  /** Transforme source_distribution pour PrimeNG PieChart */
  formatSourceDistribution(sources: Record<string, number>) {
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }

  /** Transforme data pour PrimeNG LineChart */
  formatLineGraph(data: { date: string; count: number }[]) {
    return {
      labels: data.map(d => d.date),
      datasets: [
        {
          label: 'Valeurs',
          data: data.map(d => d.count),
          fill: false,
          borderColor: '#007ad9',
          backgroundColor: '#007ad9',
          tension: 0.4
        }
      ]
    };
  }
}

