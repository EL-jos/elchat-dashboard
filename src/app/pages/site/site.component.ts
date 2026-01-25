import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SiteService } from '../../services/site/site.service';
import { SiteOverviewResponse } from '../../models/site/site-overview-response';
import { Site } from 'src/app/models/site/site';
import { User } from 'src/app/models/user/user';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit {
  siteId!: string;
  overview!: SiteOverviewResponse;

  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService
  ) {}

  ngOnInit(): void {
    this.siteId = this.route.snapshot.paramMap.get('id')!;
    this.loadOverview();
  }

  loadOverview(): void {
    this.loading = true;

    this.siteService.getSiteOverview(this.siteId).subscribe({
      next: (res) => {
        this.overview = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du site';
        this.loading = false;
      }
    });
  }

  crawl(): void {
    this.siteService.crawl(this.siteId).subscribe(() => this.loadOverview());
  }

  reindex(): void {
    this.siteService.reindex(this.siteId).subscribe(() => this.loadOverview());
  }
}

