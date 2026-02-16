import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Product } from '../../models/product/product';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ProductService } from '../../services/product/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-bottom-sheet',
  templateUrl: './product-bottom-sheet.component.html',
  styleUrls: ['./product-bottom-sheet.component.scss']
})
export class ProductBottomSheetComponent implements OnInit {

  product!: Product;
  siteId!: string;
  stepForms: FormGroup[] = [];
  standardColumnGroups!: any[];

  constructor(
    private fb: FormBuilder,
    private bottomSheetRef: MatBottomSheetRef<ProductBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      product: Product;
      siteId: string;
      standardColumnGroups: any[];
    }
  ) {
    this.product = data.product;
    this.siteId = data.siteId;
    this.standardColumnGroups = data.standardColumnGroups;
    console.log(this.product);
    
  }

  ngOnInit(): void {

    this.standardColumnGroups.forEach(group => {

      const controls: Record<string, FormControl> = {};

      group.columns.forEach((col: any) => {
        controls[col.key] = new FormControl(
          this.product.getField(col.key) ?? ''
        );
      });

      this.stepForms.push(this.fb.group(controls));
    });
  }

  save(): void {

    const updatedFields: Record<string, any> = {};

    this.stepForms.forEach(formGroup => {
      Object.assign(updatedFields, formGroup.value);
    });

    this.bottomSheetRef.dismiss(updatedFields);
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }
}