import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  loading = false;

  pagination = {
    current_page: 1,
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
    total: 0,
    per_page: 20
  };

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

  constructor(private productService: ProductService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    if (!this.siteId) return;
    this.loadProducts();
    console.log(this.products);
    
  }

  loadProducts(page: number = 1) {
    this.loading = true;
    this.productService.getProducts(this.siteId, page).subscribe({
      next: res => {
        this.products = res.products;
        this.pagination = res.pagination;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des produits.', 'Fermer', { duration: 3000, panelClass: ['snackbar-error'] });
        this.loading = false;
      }
    });
  }

  deleteProduct(product: Product) {
    if (!confirm(`Supprimer le produit "${product.getField('product_name')}" ?`)) return;

    this.productService.deleteProduct(this.siteId, product.document_id!).subscribe({
      next: () => {
        this.snackBar.open('Produit supprimé.', 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
        this.loadProducts(this.pagination.current_page);
      },
      error: () => {
        this.snackBar.open('Impossible de supprimer le produit.', 'Fermer', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }

  reindexProduct(product: Product) {
    this.productService.reindexProduct(this.siteId, product.document_id!, product.product_index!).subscribe({
      next: () => {
        this.snackBar.open(`Produit "${product.getField('product_name')}" re-indexé.`, 'Fermer', { duration: 3000, panelClass: ['snackbar-success'] });
      },
      error: () => {
        this.snackBar.open('Erreur lors du re-index.', 'Fermer', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.pagination.last_page) return;
    this.loadProducts(page);
  }
}
