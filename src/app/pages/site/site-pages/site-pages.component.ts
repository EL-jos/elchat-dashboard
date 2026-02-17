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
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PageImportBottomSheetComponent } from 'src/app/bottom-sheet/page-import-bottom-sheet/page-import-bottom-sheet.component';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';

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
  displayedColumns: string[] = ['select', 'icon', 'url', 'title', 'source', 'chunks_count', 'is_indexed', 'status', 'created_at', 'action'];
  dataSource = new MatTableDataSource<Page>(this.pages);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  standardContentColumns = [
    {
      key: 'core',
      label: '🧩 Informations principales',
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Titre', required: true },
        { key: 'content', label: 'Contenu', required: true },
        { key: 'excerpt', label: 'Résumé' },
        { key: 'published_at', label: 'Date de publication' },
        { key: 'slug', label: 'Slug' },
        { key: 'url', label: 'URL' }
      ]
    },
    {
      key: 'taxonomy',
      label: '🏷 Catégories & Tags',
      columns: [
        { key: 'categories', label: 'Catégories' },
        { key: 'tags', label: 'Tags' }
      ]
    },
    {
      key: 'seo',
      label: '🔎 SEO',
      columns: [
        { key: 'seo_keywords', label: 'SEO Keywords' },
        { key: 'seo_description', label: 'SEO Description' }
      ]
    }
  ];

  selection = new SelectionModel<Page>(true, []);

  constructor(private pageService: PageService, private bottomSheet: MatBottomSheet, private dialog: MatDialog) { }

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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer la page',
        message: `Voulez-vous vraiment supprimer "${page.title}" ?`,
        confirmText: 'Oui, supprimer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.pageService.deletePages([page.id]).subscribe(() => {
        this.loadPages();
        this.selection.clear();
      });
    });
  }

  deleteSelected() {

    const count = this.selection.selected.length;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Suppression multiple',
        message: `Voulez-vous vraiment supprimer ${count} page(s) ?`,
        confirmText: 'Oui, supprimer tout'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const ids = this.selection.selected.map(p => p.id);

      this.pageService.deletePages(ids).subscribe(() => {
        this.loadPages();
        this.selection.clear();
      });
    });
  }

  openImportSheet(): void {

    const ref = this.bottomSheet.open(PageImportBottomSheetComponent, {
      data: {
        siteId: this.siteId,
        standardColumns: this.standardContentColumns
      },
      disableClose: true,
      panelClass: 'import-bottom-sheet'
    });

    ref.afterDismissed().subscribe(result => {
      if (result) {
        this.loadPages();
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.dataSource.data);
    }
  }

}
