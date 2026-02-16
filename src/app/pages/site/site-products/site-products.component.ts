import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, debounceTime } from 'rxjs';
import { ProductBottomSheetComponent } from 'src/app/bottom-sheet/product-bottom-sheet/product-bottom-sheet.component';
import { Page } from 'src/app/models/page/page';
import { Product } from 'src/app/models/product/product';
import { ProductService } from 'src/app/services/product/product.service';


@Component({
  selector: 'app-site-products',
  templateUrl: './site-products.component.html',
  styleUrls: ['./site-products.component.scss']
})
export class SiteProductsComponent implements OnInit {

  @Input() siteId!: string;

  products: Product[] = [];
  dataSource = new MatTableDataSource<Product>([]);
  selection = new SelectionModel<Product>(true, []);

  displayedColumns: string[] = [
    //'select',
    'product_name',
    'product_reference',
    'product_category',
    'price',
    'discount_price',
    'actions'
  ];

  loading = false;

  search$ = new Subject<string>();

  pagination = {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20
  };

  pageSizeOptions = [10, 20, 50, 100];

  currentSearch = '';
  currentSortField = '';
  currentSortDirection: 'asc' | 'desc' | '' = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit(): void {

    this.search$.pipe(debounceTime(400)).subscribe(value => {
      this.currentSearch = value;
      this.loadProducts(1);
    });

    this.loadProducts();
  }

  /* ===================== LOAD ===================== */

  loadProducts(page: number = 1) {

    if (!this.siteId) return;

    this.loading = true;

    this.productService
      .getProducts(
        this.siteId,
        page,
        this.pagination.per_page,
        this.currentSearch
      )
      .subscribe({
        next: res => {
          this.products = res.products;
          this.dataSource.data = this.products;

          this.pagination = {
            current_page: res.pagination.current_page,
            last_page: res.pagination.last_page,
            total: res.pagination.total,
            per_page: res.pagination.per_page
          };

          this.selection.clear();
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Erreur de chargement.', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  /* ===================== PAGINATION ===================== */

  onPageChange(event: PageEvent) {
    this.pagination.per_page = event.pageSize;
    this.loadProducts(event.pageIndex + 1);
  }

  /* ===================== SORT ===================== */

  onSortChange(sort: Sort) {
    this.currentSortField = sort.active;
    this.currentSortDirection = sort.direction;
    this.loadProducts(1);
  }

  /* ===================== SEARCH ===================== */

  onSearch(event: any) {
    this.search$.next(event.target.value);
  }

  /* ===================== ACTIONS ===================== */

  deleteProduct(product: Product) {
    if (!confirm(`Supprimer "${product.getField('product_name')}" ?`)) return;

    this.productService.deleteProduct(this.siteId, product.document_id!)
      .subscribe(() => {
        this.snackBar.open('Produit supprimé.', 'Fermer', { duration: 3000 });
        this.loadProducts(this.pagination.current_page);
      });
  }

  reindexProduct(product: Product) {
    this.productService
      .reindexProduct(this.siteId, product.document_id!, product.product_index!)
      .subscribe(() => {
        this.snackBar.open('Produit re-indexé.', 'Fermer', { duration: 3000 });
      });
  }

  reindexSelected() {
    const selected = this.selection.selected;

    selected.forEach(product => {
      this.reindexProduct(product);
    });

    this.snackBar.open(`${selected.length} produits re-indexés.`, 'Fermer', { duration: 3000 });
  }

  /* ===================== UTIL ===================== */

  getDisplayValue(product: Product, key: string): string {
    const value = product.getField(key);
    if (!value) return '-';
    return value;
  }

  isAllSelected() {
    return this.selection.selected.length === this.products.length;
  }

  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.products.forEach(row => this.selection.select(row));
  }

  openReindexForm(product: Product): void {

    const ref = this.bottomSheet.open(ProductBottomSheetComponent, {
      data: {
        product,
        siteId: this.siteId,
        standardColumnGroups: this.standardColumnGroups
      },
      hasBackdrop: true,
      disableClose: true, // empêche fermeture accidentelle
      panelClass: 'reindex-bottom-sheet'
    });

    ref.afterDismissed().subscribe((updatedFields: Record<string, any> | undefined) => {

      if (!updatedFields) return;

      this.loading = true;

      this.productService
        .updateAndReindexProduct(
          this.siteId,
          product.document_id!,
          product.product_index!,
          updatedFields
        )
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Produit mis à jour et re-indexé avec succès.',
              'Fermer',
              { duration: 3000 }
            );
            this.loadProducts(this.pagination.current_page);
          },
          error: () => {
            this.snackBar.open(
              'Erreur lors du re-index.',
              'Fermer',
              { duration: 3000 }
            );
            this.loading = false;
          }
        });

    });
  }

}
