import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { faCheckCircle, faTimesCircle, faCopy } from '@fortawesome/free-solid-svg-icons';
import { NgForm } from '@angular/forms';
import { WidgetSetting } from 'src/app/models/widget-setting/widget-setting';
import { SiteService } from 'src/app/services/site/site.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss'],
  encapsulation: ViewEncapsulation.None  // <--- important !
})
export class SiteSettingsComponent implements OnInit {

  @Input() site!: { id: string; name: string; url: string; };
  @Input() settings!: WidgetSetting;

  widgetSnippet: string = '';
  rawSnippet: string = '';
  testing = false;
  testResult: string | null = null;
  copied = false;

  // icônes
  icons = {
    success: faCheckCircle,
    error: faTimesCircle,
    copy: faCopy
  };

  button_position: string[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
  widgetSetting: WidgetSetting = new WidgetSetting();

  constructor(
    private http: HttpClient,
    private siteService: SiteService,
        private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    console.log(this.settings);
    
    if (!this.site?.id) return;

    this.siteService.getWidgetSettings(this.site.id).subscribe(setting => {
      this.widgetSetting = setting;
    });

    this.rawSnippet = `
      <!-- ELChat tag (elchat.js) -->
      <script async src="http://localhost:8000/js/widget.js" data-site-id="${this.site.id}"></script>
      <!-- END ELChat tag (elchat.js) -->
    `;//URL doit être le domaine où widget.js sera hébergé

    // transformer les caractères spéciaux en entités HTML et ajouter coloration simple
    this.widgetSnippet = this.rawSnippet
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;!--.*--&gt;)/g, '<span class="comment">$1</span>')
      .replace(/(&lt;script.*&gt;)/g, '<span class="tag">$1</span>')
      .replace(/(&lt;\/script&gt;)/g, '<span class="tag">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
  }


  // 🔹 Copier le snippet dans le presse-papiers
  copySnippet(): void {
    navigator.clipboard.writeText(this.rawSnippet).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 1500);
    });
  }

  // 🔹 Tester la connexion du widget sur le site
  testWidget(): void {
    if (!this.site?.id) return;

    this.testing = true;
    this.testResult = null;

    this.http.get<{ detected_tag: boolean, message: string, status: string }>(`${environment.serveur.url}/site/${this.site.id}/widget-test`).subscribe({
      next: (res) => {
        this.testing = false;
        this.testResult = res.detected_tag ? 'connected' : 'disconnected';
      },
      error: () => {
        this.testing = false;
        this.testResult = 'error';
      }
    });
  }

  onSubmit(settingsWidget: NgForm) {
    console.log(settingsWidget.value);
    this.siteService.updateWidgetSettings(this.widgetSetting.id!, this.widgetSetting).subscribe(updated => {
      console.log(updated);
      
      this.widgetSetting = updated;
      this.snackBar.open("Updated settings", "Fermer")
    });
  }

}
