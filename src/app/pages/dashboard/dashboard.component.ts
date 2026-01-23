import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user/user';
import { DashboardOverview, DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { UserStoreService } from 'src/app/services/user-store/user-store.service';
import { faGlobe, faFileLines, faCubes, faComments, faMessage, faUsers } from '@fortawesome/free-solid-svg-icons';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ChartData, ChartOptions } from 'chart.js';
import { NumberShortPipe } from 'src/app/pipes/number-short/number-short.pipe';

/** --- Table Example --- */
interface StiteElement {
  icon: string;
  name: string;
  url: string;
  status: string;
  created_at: string;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // User & Stats
  user: User | null = null;
  overview: DashboardOverview | null = null;
  ELEMENT_DATA: StiteElement[] = [];

  // --- Table ---
  displayedColumns: string[] = ['icon', 'name', 'url', 'status', 'created_at'];
  dataSource = new MatTableDataSource<StiteElement>(this.ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  stats: { title: string, value: number, icon: string, color: string }[] = [];
  icons = {
    sites: faGlobe,
    documents: faFileLines,
    //chunks: faCubes,
    conversations: faComments,
    messages: faMessage,
    users: faUsers,
  };

  // Charts
  conversationsChartData: ChartData<'line'> = { labels: [], datasets: [] };
  messagesChartData: ChartData<'line'> = { labels: [], datasets: [] };
  sourcesChartData: ChartData<'pie'> = { labels: [], datasets: [] };


  conversationsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    //maintainAspectRatio: false, // permet à la hauteur de suivre le container
    plugins: { legend: { display: false }, title: { display: true, text: 'Conversations par jour' } },
    scales: { x: { title: { display: true, text: 'Date' } }, y: { title: { display: true, text: 'Nombre' }, beginAtZero: true } }
  };

  messagesChartOptions: ChartOptions<'line'> = {
    responsive: true,
    //maintainAspectRatio: false, // permet à la hauteur de suivre le container
    plugins: { legend: { display: false }, title: { display: true, text: 'Messages IA par jour' } },
    scales: { x: { title: { display: true, text: 'Date' } }, y: { title: { display: true, text: 'Nombre' }, beginAtZero: true } }
  };

  sourcesChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: 'Répartition des sources' } }
  };

  constructor(
    private userStore: UserStoreService,
    private dashboardService: DashboardService,
  ) { }

  ngOnInit(): void {
    this.userStore.user$.subscribe(user => (this.user = user));
    this.loadOverview();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private loadOverview(): void {
    this.dashboardService.getOverview().subscribe({
      next: (data) => {
        this.overview = data;
        this.ELEMENT_DATA = data.sites;
        this.dataSource.data = this.ELEMENT_DATA;

        // --- Conversations par jour (concat de tous les sites) ---
        const allDates = this.collectDates(data.conversations_per_day);
        this.conversationsChartData = {
          labels: allDates,
          datasets: data.conversations_per_day.map((site, index) => ({
            label: site.site_name,
            data: allDates.map(date =>
              site.data.find(d => d.date === date)?.count ?? 0
            ),
            tension: 0.4,
            fill: false,
            borderWidth: 2
          }))
        };

        // --- Messages par jour (concat de tous les sites) ---
        const allDatesMsg = this.collectDates(data.messages_per_day);
        this.messagesChartData = {
          labels: allDatesMsg,
          datasets: data.messages_per_day.map(site => ({
            label: site.site_name,
            data: allDatesMsg.map(date =>
              site.data.find(d => d.date === date)?.count ?? 0
            ),
            tension: 0.4,
            fill: false,
            borderWidth: 2
          }))
        };

        // --- Source distribution (concat de tous les sites) ---
        const sourcesMerged: Record<string, number> = {};
        data.source_distribution.forEach(site => {
          Object.entries(site.sources).forEach(([key, val]) => {
            sourcesMerged[key] = (sourcesMerged[key] || 0) + val;
          });
        });
        this.sourcesChartData = {
          labels: Object.keys(sourcesMerged),
          datasets: [{ data: Object.values(sourcesMerged), backgroundColor: ['#007ad9', '#ff9800', '#9c27b0', '#f44336'], hoverOffset: 4 }]
        };

      },
      error: err => console.error('Erreur dashboard', err)
    });
  }

  private collectDates(
    input: { data: { date: string }[] }[]
  ): string[] {
    return Array.from(
      new Set(input.flatMap(s => s.data.map(d => d.date)))
    ).sort();
  }
  getSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 'ready':
        return 'success';   // vert
      case 'pending':
        return 'info';      // bleu clair
      case 'crawling':
        return 'warning';      // orange
      case 'indexing':
        return 'secondary';   // orange
      case 'error':
        return 'danger';    // rouge
      default:
        return 'info';
    }
  }

}