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

  product: Product;
  stepForms: FormGroup[] = [];  // un FormGroup par step
  stepLabels: string[] = [];    // labels des steps
  standardColumnGroups: any[];

  constructor(
    private fb: FormBuilder,
    private bottomSheetRef: MatBottomSheetRef<ProductBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { product: Product, standardColumnGroups: any[] }
  ) {
    this.product = data.product;
    this.standardColumnGroups = data.standardColumnGroups;
  }

  ngOnInit(): void {
    this.standardColumnGroups.forEach(group => {
      const controls: any = {};
      group.columns.forEach((col: any) => {
        // Pré-remplit la valeur si elle existe sinon vide
        controls[col.key] = new FormControl(this.product.getField(col.key) ?? '');
      });
      this.stepForms.push(this.fb.group(controls));
      this.stepLabels.push(group.label);
    });
  }

  save() {
    // On récupère toutes les valeurs
    const updatedFields: Record<string, any> = {};
    this.stepForms.forEach(g => Object.assign(updatedFields, g.value));

    // On renvoie les valeurs modifiées au composant parent
    this.bottomSheetRef.dismiss(updatedFields);
  }

  close() {
    this.bottomSheetRef.dismiss();
  }
}