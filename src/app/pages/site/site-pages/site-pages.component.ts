import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Page } from 'src/app/models/page/page';
import { PageService } from 'src/app/services/page/page.service';
import {
  faFileLines,
  faCheckCircle,
  faBan,
  faTriangleExclamation,
  faCubes,
  faHourglassHalf,
  faSpinner,
  IconDefinition,
  faExternalLinkAlt,
  faSpider,
  faRotateRight,
  faSitemap,
  faToggleOn
} from '@fortawesome/free-solid-svg-icons';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-site-pages',
  templateUrl: './site-pages.component.html',
  styleUrls: ['./site-pages.component.scss']
})
export class SitePagesComponent implements OnInit, AfterViewInit {

  @Input() siteId!: string;

  loading = true;
  error: string | null = null;

  // données serveur
  site!: {
    id: string;
    name: string;
    url: string;
    status: string;
    favicon: string;
  };

  stats!: {
    total_pages: number;
    indexed_pages: number;
    excluded_pages: number;
    error_pages: number;
    total_chunks: number;
  };

  pages: Page[] = [];

  icons = {
    pages: faFileLines,
    indexed: faCheckCircle,
    excluded: faBan,
    error: faTriangleExclamation,
    chunks: faCubes,
    externalLink: faExternalLinkAlt,
    pending: faHourglassHalf,
    processing: faSpinner,
    done: faCheckCircle,
    crawl: faSpider,
    sitemap: faSitemap,
    recrawl: faRotateRight,      // 🔄 icône pour relancer le crawl
    toggleIndex: faToggleOn       // 🔁 icône pour activer/désactiver index
  };



  // --- Table ---
  displayedColumns: string[] = ['icon', 'url', 'title', 'source', 'chunks_count', 'is_indexed', 'status', 'created_at', 'action'];
  dataSource = new MatTableDataSource<Page>(this.pages);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pageService: PageService) { }

  ngOnInit(): void {
    if (!this.siteId) {
      this.error = 'Site invalide';
      return;
    }

    this.loadPages();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadPages(): void {
    this.loading = true;

    this.pageService.getPages(this.siteId).subscribe({
      next: (res) => {
        this.site = res.site;
        this.stats = res.stats;
        this.pages = res.pages;
        this.dataSource.data = this.pages;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des pages';
        this.loading = false;
      }
    });
  }

  // 🔄 relancer le crawl d’une page
  recrawl(page: Page): void {
    this.pageService.recrawlPage(page.id).subscribe(() => {
      this.loadPages();
    });
  }

  // 🔁 activer / désactiver l’indexation
  toggleIndex(page: Page): void {
    const newValue = !page.is_indexed;

    this.pageService.toggleIndex(page.id, newValue).subscribe(() => {
      page.is_indexed = newValue;
    });
  }

  getIconForStatus(status: 'pending' | 'processing' | 'done' | 'error'): IconDefinition {
    return this.icons[status];
  }



  onUpdateSite(page: Page) {

  }

  onDeleteSite(page: Page) {

  }
}
