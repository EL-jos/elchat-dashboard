import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SiteService } from '../../services/site/site.service';
import { SiteOverviewResponse } from '../../models/site/site-overview-response';
import { ChartData, ChartOptions } from 'chart.js';
import {
  faGlobe,
  faFileLines,
  faComments,
  faMessage,
  faUsers,
  faCubes
} from '@fortawesome/free-solid-svg-icons';
import { Site } from 'src/app/models/site/site';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Chunk } from 'src/app/models/chunk/chunk';
import { User } from 'src/app/models/user/user';


@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit, AfterViewInit {

  siteId!: string;
  site: Site = new Site();
  overview!: SiteOverviewResponse;
  chunks : Chunk[] = [];
  users: User[] = [];

  loading = true;
  error: string | null = null;

  // --- Table ---
  displayedColumns: string[] = ['firstname', 'lastname', 'email', 'first_seen_at', 'last_seen_at', 'action'];
  dataSource = new MatTableDataSource<User>(this.users);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ===============================
  // 📊 Charts
  // ===============================
  conversationsChartData!: ChartData<'line'>;
  conversationsChartOptions!: ChartOptions;

  messagesChartData!: ChartData<'line'>;
  messagesChartOptions!: ChartOptions;

  sourcesChartData!: ChartData<'pie'>;
  sourcesChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: 'Répartition des sources' } }
  };

  // ===============================
  // 🎨 Icons (FontAwesome)
  // ===============================
  icons = {
    chunks: faCubes,
    documents: faFileLines,
    conversations: faComments,
    messages: faMessage,
    users: faUsers
  };

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService
  ) { }

  ngOnInit(): void {
    this.siteId = this.route.snapshot.paramMap.get('id')!;
    this.loadOverview();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // ==================================================
  // 📥 Load overview
  // ==================================================
  loadOverview(): void {
    this.loading = true;

    this.siteService.getSiteOverview(this.siteId).subscribe({
      next: (res) => {
        this.overview = res;
        //console.log(this.overview);
        this.users = res.users.map(user => User.fromJson(user));
        this.dataSource.data = this.users;
        

        this.site = Site.fromJson(this.overview.site);

        this.buildConversationsChart();
        this.buildMessagesChart();
        this.buildSourcesChart();

        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du site';
        this.loading = false;
      }
    });
  }

  // ==================================================
  // 📈 Conversations chart
  // ==================================================
  private buildConversationsChart(): void {
    const labels = this.overview.activity.conversations_per_day.map(i => i.date);
    const data = this.overview.activity.conversations_per_day.map(i => i.count);

    this.conversationsChartData = {
      labels,
      datasets: [
        {
          label: 'Conversations',
          data,
          tension: 0.4,
          fill: false
        }
      ]
    };

    this.conversationsChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    };
  }

  // ==================================================
  // 💬 Messages chart
  // ==================================================
  private buildMessagesChart(): void {
    const labels = this.overview.activity.messages_per_day.map(i => i.date);
    const data = this.overview.activity.messages_per_day.map(i => i.count);

    this.messagesChartData = {
      labels,
      datasets: [
        {
          label: 'Messages',
          data,
          tension: 0.4,
          fill: false
        }
      ]
    };

    this.messagesChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    };
  }

  // ==================================================
  // 🥧 Sources chart
  // ==================================================
  private buildSourcesChart(): void {
    const distribution = this.overview.sources.distribution;

    this.sourcesChartData = {
      labels: ['Crawl', 'Sitemap', 'Manuel', 'WooCommerce'],
      datasets: [
        {
          data: [
            distribution.crawl,
            distribution.sitemap,
            distribution.manuel,
            distribution.woocommerce
          ]
        }
      ]
    };

    this.sourcesChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  // ==================================================
  // ⚙️ Actions
  // ==================================================
  crawl(): void {
    this.siteService.crawl(this.siteId).subscribe(() => {
      this.loadOverview();
    });
  }

  reindex(): void {
    this.siteService.reindex(this.siteId).subscribe(() => {
      this.loadOverview();
    });
  }
}
