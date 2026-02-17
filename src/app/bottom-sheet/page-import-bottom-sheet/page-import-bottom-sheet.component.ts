import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import * as Papa from 'papaparse';
import { PageService } from '../../services/page/page.service';

@Component({
  selector: 'app-page-import-bottom-sheet',
  templateUrl: './page-import-bottom-sheet.component.html',
  styleUrls: ['./page-import-bottom-sheet.component.scss']
})
export class PageImportBottomSheetComponent implements OnInit {

  siteId!: string;
  standardColumnGroups!: any[];

  file: File | null = null;

  headers: string[] = [];
  parsedData: any[] = [];
  previewData: any[] = [];

  mappingForm!: FormGroup;
  fileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private pageService: PageService,
    private bottomSheetRef: MatBottomSheetRef<PageImportBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: { siteId: string; standardColumns: any[] }
  ) {
    this.siteId = data.siteId;
    this.standardColumnGroups = data.standardColumns;
    console.log(data);
    
  }

  ngOnInit(): void {

    this.fileForm = this.fb.group({
      file: [null, Validators.required]
    });

    const controls: any = {};

    this.standardColumnGroups.forEach(group => {
      group.columns.forEach((col: any) => {
        controls[col.key] = new FormControl(
          null,
          col.required ? Validators.required : []
        );
      });
    });

    this.mappingForm = this.fb.group(controls);
  }

  /* ================= FILE SELECTION ================= */

  onFileSelected(event: any): void {

    const file = event.target.files[0];
    if (!file) return;

    this.file = file;
    this.fileForm.get('file')?.setValue(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {

        this.parsedData = result.data as any[];
        this.headers = result.meta.fields || [];

        // 🔥 Preview 5 premières lignes
        this.previewData = this.parsedData.slice(0, 5);

        // 🔥 Auto mapping
        this.autoMapColumns();
      }
    });
  }

  /* ================= AUTO MAPPING ================= */

  autoMapColumns(): void {

    this.standardColumnGroups.forEach(group => {
      group.columns.forEach((col: any) => {

        const match = this.headers.find(header =>
          header.toLowerCase().includes(col.key.toLowerCase())
        );

        if (match) {
          this.mappingForm.get(col.key)?.setValue(match);
        }

      });
    });
  }

  /* ================= DISABLE DUPLICATE ================= */

  getSelectedColumns(): string[] {
    return Object.values(this.mappingForm.value)
      .filter(v => !!v) as string[];
  }

  isOptionDisabled(option: string, currentKey: string): boolean {

    const selected = this.getSelectedColumns();
    const currentValue = this.mappingForm.get(currentKey)?.value;

    if (currentValue === option) return false;

    return selected.includes(option);
  }

  /* ================= SUBMIT ================= */

  submitImport(): void {

    if (this.mappingForm.invalid || !this.file) {
      this.mappingForm.markAllAsTouched();
      return;
    }

    const payload = {
      mapping: this.mappingForm.value,
      file: this.file
    };

    this.pageService.importPages(this.siteId, payload)
      .subscribe({
        next: () => {
          this.bottomSheetRef.dismiss(true);
        }
      });
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

}