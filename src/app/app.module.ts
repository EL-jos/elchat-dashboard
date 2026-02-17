import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { AuthService } from './services/auth/auth.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatListModule} from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ChartModule } from 'primeng/chart';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatIconModule } from "@angular/material/icon";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatMenuModule } from "@angular/material/menu";
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CKEditorModule } from 'ng2-ckeditor';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
// Importez la locale fr pour le français
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { VerificationComponent } from './pages/verification/verification.component';
import { MatCardModule } from '@angular/material/card';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CardModule } from 'primeng/card';
import { NumberShortPipe } from './pipes/number-short/number-short.pipe';
import { TagModule } from 'primeng/tag';
import { SiteBottomSheetComponent } from './bottom-sheet/site-bottom-sheet/site-bottom-sheet.component';
import { FileUploadModule } from 'primeng/fileupload';
import {MatStepperModule} from '@angular/material/stepper';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { SiteComponent } from './pages/site/site.component';
import { TruncatePipe } from './pipes/truncate/truncate.pipe';
import { SiteOverviewComponent } from './pages/site/site-overview/site-overview.component';
import { SitePagesComponent } from './pages/site/site-pages/site-pages.component';
import { SiteCrawlComponent } from './pages/site/site-crawl/site-crawl.component';
import { SiteSettingsComponent } from './pages/site/site-settings/site-settings.component';
import { SiteConversationsComponent } from './pages/site/site-conversations/site-conversations.component';
import { SiteUsersComponent } from './pages/site/site-users/site-users.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MessageService } from 'primeng/api';
import { SiteProductsComponent } from './pages/site/site-products/site-products.component';
import { MatSortModule } from '@angular/material/sort';
import { ProductBottomSheetComponent } from './bottom-sheet/product-bottom-sheet/product-bottom-sheet.component';
import { PageImportBottomSheetComponent } from './bottom-sheet/page-import-bottom-sheet/page-import-bottom-sheet.component';


registerLocaleData(localeFr, 'fr');
@NgModule({
  declarations: [
    AppComponent,
    NewPasswordComponent,
    ResetPasswordComponent,
    SignInComponent,
    SignUpComponent,
    VerificationComponent,
    DashboardComponent,
    NumberShortPipe,
    SiteBottomSheetComponent,
    ConfirmDialogComponent,
    SiteComponent,
    TruncatePipe,
    SiteOverviewComponent,
    SitePagesComponent,
    SiteCrawlComponent,
    SiteSettingsComponent,
    SiteConversationsComponent,
    SiteUsersComponent,
    SiteProductsComponent,
    ProductBottomSheetComponent,
    PageImportBottomSheetComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatSnackBarModule,
    HttpClientModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatListModule,
    MatTabsModule,
    FullCalendarModule,
    ChartModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatIconModule,
    FontAwesomeModule,
    //MatProgressBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    AngularEditorModule,
    MatBottomSheetModule,
    CKEditorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    CardModule,
    TagModule,
    FileUploadModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatSortModule
  ],
  providers: [
    MatDatepickerModule,
    AuthService,
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: LOCALE_ID, useValue: 'fr' }, // Définissez la locale pour les nombres et autres
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true // ⚠️ OBLIGATOIRE
    },
    NumberShortPipe,
    MessageService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
