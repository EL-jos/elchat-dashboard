import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../../models/product/product';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private api = `${environment.serveur.url}`;
  
    constructor(private http: HttpClient) { }

  // Récupère les produits d'un site avec pagination
  getProducts(siteId: string, page: number = 1, perPage: number = 20): Observable<{ products: Product[], pagination: any }> {
    return this.http
      .get<any>(`${this.api}/chunk/${siteId}/products?page=${page}&per_page=${perPage}`)
      .pipe(
        map(res => ({
          products: res.data.map((p: any) => Product.fromJson(p)),
          pagination: {
            current_page: res.current_page,
            last_page: res.last_page,
            next_page_url: res.next_page_url,
            prev_page_url: res.prev_page_url,
            total: res.total,
            per_page: res.per_page
          }
        }))
      );
  }

  // Supprimer un produit
  deleteProduct(siteId: string, documentId: string): Observable<any> {
    return this.http.delete(`${this.api}/sites/${siteId}/products/${documentId}`);
  }

  // Re-indexer un produit
  reindexProduct(siteId: string, documentId: string, productIndex: number): Observable<any> {
    return this.http.get<any>(`${this.api}/chunk/product/${siteId}/${documentId}/${productIndex}/reindex`);
  }
}