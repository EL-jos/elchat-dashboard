import { Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SiteService } from 'src/app/services/site/site.service';
import { MessageService } from 'primeng/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SiteOverviewResponse } from 'src/app/models/site/site-overview-response';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-site-crawl',
  templateUrl: './site-crawl.component.html',
  styleUrls: ['./site-crawl.component.scss']
})
export class SiteCrawlComponent {

  @Input() overview!: SiteOverviewResponse;

  useSitemap = false;
  sitemapFile: File | null = null;
  loading = false;

  // ===============================
  // 📦 Import produits – mapping
  // ===============================
  productFile: File | null = null;
  fileColumns: string[] = [];
  showMapping = false;

  standardColumns = [
    { key: 'product_name', label: 'Nom du produit', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'price', label: 'Prix', required: false },
    { key: 'currency', label: 'Devise', required: false },
    { key: 'sku', label: 'SKU', required: false },
    { key: 'brand', label: 'Marque', required: false },
    { key: 'category', label: 'Catégorie', required: false },
    { key: 'image_url', label: 'Image URL', required: false },
  ];

  mapping: Record<string, string | null> = {};
  isMappingValid = false;

  // ===============================
  // 📊 Preview & parsing
  // ===============================
  previewRows: any[] = [];
  maxPreviewRows = 5;



  constructor(
    private siteService: SiteService,
    private snackBar: MatSnackBar
  ) { }

  onFileSelect(event: any) {
    this.sitemapFile = event.files?.[0] ?? null;
  }

  onSubmit(form: NgForm) {

    if (form.invalid || this.loading) return;

    this.loading = true;

    const includePages = this.parseLines(form.value.include_pages);
    const excludePages = this.parseLines(form.value.exclude_pages);

    // 🟢 SITEMAP
    if (this.useSitemap) {
      if (!this.sitemapFile) {
        this.snackBar.open('Veuillez sélectionner un fichier sitemap.', 'Fermer', {
          duration: 3000,
          panelClass: ['snackbar-warn'],
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
        this.loading = false;
        return;
      }

      this.siteService.uploadSitemap(
        this.overview.site.id,
        this.sitemapFile,
        includePages,
        excludePages
      ).subscribe({
        next: () => {
          this.snackBar.open('Le crawl via sitemap a démarré.', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-success'],
            horizontalPosition: 'right',
            verticalPosition: 'bottom'
          });
        },
        error: () => {
          this.snackBar.open('Échec de l’upload du sitemap.', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'right',
            verticalPosition: 'bottom'
          });
        },
        complete: () => this.loading = false
      });

      return;
    }

    // 🔵 CRAWL CLASSIQUE
    this.siteService.crawl(this.overview.site.id).subscribe({
      next: () => {
        this.snackBar.open('Le crawl du site a démarré.', 'Fermer', {
          duration: 3000,
          panelClass: ['snackbar-success'],
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
      },
      error: () => {
        this.snackBar.open('Impossible de lancer le crawl.', 'Fermer', {
          duration: 3000,
          panelClass: ['snackbar-error'],
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
      },
      complete: () => this.loading = false
    });
  }

  private parseLines(value?: string | string[]): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean); // déjà un tableau → juste filtrer les valeurs vides
    return value
      .split(/[\n,;|]+/)
      .map(v => v.trim())
      .filter(Boolean);
  }

  onProductFileSelect(event: any) {
    this.productFile = event.files?.[0] ?? null;
    if (!this.productFile) return;

    const extension = this.productFile.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      this.parseCsv(this.productFile);
    } else if (['xlsx', 'xls'].includes(extension!)) {
      this.parseExcel(this.productFile);
    } else {
      this.snackBar.open('Format de fichier non supporté.', 'Fermer', {
        duration: 3000
      });
    }
  }

  private parseCsv(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        this.fileColumns = result.meta.fields ?? [];
        this.previewRows = result.data.slice(0, this.maxPreviewRows);
        this.initAutoMapping();
        this.showMapping = true;
      }
    });
  }

  private parseExcel(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      this.fileColumns = Object.keys(json[0] || {});
      this.previewRows = json.slice(0, this.maxPreviewRows);
      this.initAutoMapping();
      this.showMapping = true;
    };

    reader.readAsBinaryString(file);
  }

  private initAutoMapping() {
    this.mapping = {};

    const normalize = (v: string) =>
      v.toLowerCase().replace(/[^a-z0-9]/g, '');

    this.standardColumns.forEach(col => {
      const match = this.fileColumns.find(fc =>
        normalize(fc).includes(normalize(col.key)) ||
        normalize(fc).includes(normalize(col.label))
      );

      this.mapping[col.key] = match ?? null;
    });

    this.onMappingChange();
  }

  availableFileColumns(currentKey: string): string[] {
    const usedColumns = Object.entries(this.mapping)
      .filter(([key, val]) => key !== currentKey)
      .map(([_, val]) => val)
      .filter(Boolean);

    return this.fileColumns.filter(col => !usedColumns.includes(col));
  }

  onMappingChange() {
    this.isMappingValid = this.standardColumns
      .filter(c => c.required)
      .every(c => !!this.mapping[c.key]);
  }

}
