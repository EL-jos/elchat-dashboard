import { Component, Inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Site } from 'src/app/models/site/site';
import { TypeSite } from 'src/app/models/type-site/type-site';
import { SiteService } from 'src/app/services/site/site.service';
import { TypeSiteService } from 'src/app/services/type-site/type-site.service';

@Component({
  selector: 'app-site-bottom-sheet',
  templateUrl: './site-bottom-sheet.component.html',
  styleUrls: ['./site-bottom-sheet.component.scss']
})
export class SiteBottomSheetComponent implements OnInit {

  typeSites: TypeSite[] = [];
  sitemapFile: File | null = null;
  site: Site = new Site(); // le site à modifier ou null pour création
  isLoading = false; // optionnel pour indiquer le chargement

  constructor(
    private typeSiteService: TypeSiteService,
    private siteService: SiteService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private data: any,
    private bottomSheetRef: MatBottomSheetRef<SiteBottomSheetComponent>
  ) { }

  ngOnInit() {
    // Charger types de sites
    this.typeSiteService.getTypeSites().subscribe(types => {
      this.typeSites = types;
    });

    // Si data contient un siteId → récupération du site pour édition
    if (this.data?.id) {
      this.isLoading = true;
      this.siteService.getSite(this.data.id).subscribe({
        next: site => {
          this.site = site;
          console.log(this.site);
          
          
          // Pré-remplir les champs du formulaire si nécessaire
          // (pour template driven forms, on peut utiliser ngModel binding directement)
          this.isLoading = false;
        },
        error: err => {
          console.error('Erreur récupération site', err);
          this.isLoading = false;
        }
      });
    }
  }

  onFileSelect(event: any) {
    const file = event.files?.[0];
    if (file) {
      this.sitemapFile = file;
    }
  }

  onSubmit(siteFormGroup: NgForm): void {
    
    if (!siteFormGroup.valid) return;

    const formValue = siteFormGroup.value;

    const payload: Partial<Site> = {
      name: formValue.name,
      type_site_id: formValue.type_site_id,
      url: formValue.url,
      include_pages: formValue.include_pages,
      exclude_pages: formValue.exclude_pages,
    };

    // Si site existe → update, sinon create
    const request$ = this.site.exists()
      ? this.siteService.updateSite(this.site.id!, payload)
      : this.siteService.createSite(payload);

    request$.subscribe({
      next: site => {
        // si sitemap fourni → upload
        if (this.sitemapFile) {
          const formData = new FormData();
          formData.append('file', this.sitemapFile);

          this.siteService.uploadDocument(site.id!, formData).subscribe();
        }

        if(this.site.id){
          this.bottomSheetRef.dismiss({ site: site, message: '✅ Site modifié', status: true, action: 'update' }); // ferme le bottom-sheet en renvoyant le site
        }else{
          this.bottomSheetRef.dismiss({ site: site, message: '✅ Site créé', status: true, action: 'create' }); // ferme le bottom-sheet en renvoyant le site
        }
          
      },
      error: err => {
        console.error('❌ Erreur création/modification site', err);
      }
    });
  }

  private parseLines(value: string | undefined): string[] {
    if (!value) return [];
    return value
      .split(/[\n,;|]+/)
      .map(v => v.trim())
      .filter(Boolean);
  }

}