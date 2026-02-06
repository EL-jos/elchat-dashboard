import { Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SiteService } from 'src/app/services/site/site.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SiteOverviewResponse } from 'src/app/models/site/site-overview-response';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

type SourceType = 'crawl' | 'file' | 'manual';

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

  standardColumnGroups = [
    {
      key: 'core',
      label: '🧩 Informations produit (CORE)',
      columns: [
        { key: 'product_name', label: 'Nom du produit', required: true },
        { key: 'product_reference', label: 'Référence (SKU)' },
        { key: 'product_type', label: 'Type de produit' },
        { key: 'product_category', label: 'Catégorie' },
        { key: 'description', label: 'Description' }
      ]
    },
    {
      key: 'pricing',
      label: '💰 Prix & commercial',
      columns: [
        { key: 'price', label: 'Prix' },
        { key: 'currency', label: 'Devise' },
        { key: 'price_min', label: 'Prix min' },
        { key: 'price_max', label: 'Prix max' },
        { key: 'discount_price', label: 'Prix promo' },
        { key: 'tax_rate', label: 'TVA' }
      ]
    },
    {
      key: 'descriptive',
      label: '🧾 Descriptions & SEO',
      columns: [
        { key: 'short_description', label: 'Description courte' },
        { key: 'features', label: 'Caractéristiques' },
        { key: 'brand', label: 'Marque' },
        { key: 'tags', label: 'Tags' },
        { key: 'keywords', label: 'Mots-clés' }
      ]
    },
    {
      key: 'logistics',
      label: '📦 Logistique',
      columns: [
        { key: 'stock_status', label: 'Statut stock' },
        { key: 'stock_quantity', label: 'Quantité stock' },
        { key: 'weight', label: 'Poids' },
        { key: 'dimensions', label: 'Dimensions' },
        { key: 'colors', label: 'Couleurs' },
        { key: 'materials', label: 'Matières' },
        { key: 'availability', label: 'Disponibilité' }
      ]
    },
    {
      key: 'media',
      label: '🖼 Médias',
      columns: [
        { key: 'image_url', label: 'Image principale' },
        { key: 'product_url', label: 'Url' },
        { key: 'gallery_urls', label: 'Galerie images' },
        { key: 'video_url', label: 'Vidéo' }
      ]
    },
    {
      key: 'meta',
      label: '🔧 Métadonnées',
      columns: [
        { key: 'status', label: 'Statut' },
        { key: 'language', label: 'Langue' },
        { key: 'visibility', label: 'Visibilité' },
        { key: 'created_at', label: 'Date création' }
      ]
    }
  ];


  mapping: Record<string, string | null> = {};
  isMappingValid = false;

  // ===============================
  // 📊 Preview & parsing
  // ===============================
  previewRows: any[] = [];
  maxPreviewRows = 5;

  activeSource: SourceType | null = null;


  constructor(
    private siteService: SiteService,
    private snackBar: MatSnackBar
  ) { }
  onFileSelect(event: any) {
    this.sitemapFile = event.files?.[0] ?? null;
  }
  onCrawlSubmit(form: NgForm) {

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
    this.mapping = {};
    this.fileColumns = [];
    this.previewRows = [];
    this.showMapping = false;
    this.isMappingValid = false;

    if (!this.productFile) return;

    const extension = this.productFile.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      this.parseCsv(this.productFile);
    } else if (['xlsx', 'xls', 'doc', 'docx', 'txt', 'pdf'].includes(extension!)) {
      if (['xlsx', 'xls'].includes(extension!)) {
        this.parseExcel(this.productFile);
      } else {
        // Word ou TXT → peut juste afficher le nom, pas de parsing
        this.previewRows = [];
        this.fileColumns = [];
        this.showMapping = false;
      }
    } else {
      this.snackBar.open('Format de fichier non supporté.', 'Fermer', { duration: 3000 });
      this.productFile = null;
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

    this.standardColumnGroups.forEach(group => {
      group.columns.forEach(col => {
        const match = this.fileColumns.find(fc =>
          normalize(fc).includes(normalize(col.key)) ||
          normalize(fc).includes(normalize(col.label))
        );

        this.mapping[col.key] = match ?? null;
      });
    });

    this.onMappingChange();
  }
  onMappingChange() {
    const requiredColumns = this.standardColumnGroups
      .flatMap(g => g.columns)
      .filter(c => c.required);

    this.isMappingValid = requiredColumns.every(
      c => !!this.mapping[c.key]
    );
  }
  isColumnAlreadyUsed(fileColumn: string, currentKey: string): boolean {
    return Object.entries(this.mapping)
      .some(([key, value]) => key !== currentKey && value === fileColumn);
  }
  downloadTemplate(format: 'csv' | 'xlsx' = 'csv') {
    const columns: string[] = this.standardColumnGroups
      .flatMap(group => group.columns.map(col => col.key));

    if (format === 'csv') {
      const csvContent = columns.join(',') + '\n';
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-produits.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // XLSX
      const ws = XLSX.utils.aoa_to_sheet([columns]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Produits');
      XLSX.writeFile(wb, 'template-produits.xlsx');
    }
  }
  getNormalizedRows(): any[] {
    if (!this.productFile || !this.previewRows.length) return [];

    return this.previewRows.map(row => {
      const normalized: any = {};
      Object.entries(this.mapping).forEach(([key, fileCol]) => {
        normalized[key] = fileCol ? row[fileCol] ?? '' : '';
      });
      return normalized;
    });
  }
  uploadProducts() {
    if (!this.productFile) return;

    // Validation métier avant upload
    const normalizedRows = this.getNormalizedRows();
    const invalidRows = normalizedRows.filter(row => !row.product_name);
    if (invalidRows.length > 0) {
      this.snackBar.open(`Erreur : certaines lignes n'ont pas de nom de produit.`, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
      return;
    }

    // Préparer FormData
    const formData = new FormData();
    formData.append('file', this.productFile);
    formData.append('mapping', JSON.stringify(this.mapping));

    this.siteService.uploadDocument(this.overview.site.id, formData)
      .subscribe({
        next: doc => {
          this.snackBar.open(`✅ Fichier importé avec succès`, 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
        },
        error: err => {
          this.snackBar.open(`❌ Erreur lors de l'import`, 'Fermer', { duration: 5000, panelClass: ['snackbar-error'] });
          console.error(err);
        }
      });
  }
  onTextManuelSubmit(textManuelForm: NgForm) {

    if (textManuelForm.invalid || this.loading) return;

    this.loading = true;

    const payload = {
      title: textManuelForm.value.title,
      content: textManuelForm.value.content,
    };

    this.siteService
      .submitManualContent(this.overview.site.id, payload)
      .subscribe({
        next: () => {
          this.snackBar.open(
            'Le contenu manuel a été ajouté et indexé avec succès.',
            'Fermer',
            {
              duration: 3000,
              panelClass: ['snackbar-success'],
              horizontalPosition: 'right',
              verticalPosition: 'bottom',
            }
          );

          textManuelForm.resetForm();
        },
        error: (err: any) => {
          const message =
            err?.error?.message ??
            'Erreur lors de l’envoi du contenu manuel.';

          this.snackBar.open(message, 'Fermer', {
            duration: 4000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
          });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  selectSource(source: SourceType) {
    this.activeSource = source;
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      const chat = document.querySelector('.el-chat-messages');
      if (chat) chat.scrollTop = chat.scrollHeight;
    }, 100);
  }

  launchKnowledgeAnalysis(): void {
    this.siteService
      .calculateKnowledgeQuality(this.overview.site.id)
      .subscribe({
        next: res => {
          this.snackBar.open(
            'Analyse de la connaissance IA lancée',
            'OK',
            { duration: 4000 }
          );
        },
        error: () => {
          this.snackBar.open(
            'Erreur lors du lancement de l’analyse',
            'Fermer',
            { duration: 4000 }
          );
        }
      });
  }

  get showMappingForFile(): boolean {
    if (!this.showMapping || !this.productFile) return false;

    const ext = this.productFile.name.split('.').pop()?.toLowerCase();
    return ['csv', 'xls', 'xlsx'].includes(ext!);
  }


}
