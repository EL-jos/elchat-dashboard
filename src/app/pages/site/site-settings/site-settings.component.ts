import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { faCheckCircle, faTimesCircle, faCopy } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss'],
  encapsulation: ViewEncapsulation.None  // <--- important !
})
export class SiteSettingsComponent implements OnInit {

  @Input() site!: { id: string; name: string; url: string; };

  widgetSnippet: string = '';
  testing = false;
  testResult: string | null = null;
  copied = false;

  // icônes
  icons = {
    success: faCheckCircle,
    error: faTimesCircle,
    copy: faCopy
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    if (!this.site?.id) return;

    const rawSnippet = `
      <!-- ELChat tag (elchat.js) -->
      <script async src="https://www.domain.com/elchat/js?id=${this.site.id}"></script>
      <script>
        (function() {
          // 1️⃣ Créer le bouton flottant
          const btn = document.createElement('button');
          btn.innerText = '💬 Chat avec ELChat';
          btn.id = 'elchat-btn';
          Object.assign(btn.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '25px',
            background: '#6200ee',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          });
          document.body.appendChild(btn);

          // 2️⃣ Ajouter le conteneur de l'iframe (invisible au départ)
          const iframe = document.createElement('iframe');
          iframe.src = 'https://www.domain.com/elchat/widget?site_id=' + encodeURIComponent('SITE_ID_ICI');
          iframe.style.position = 'fixed';
          iframe.style.bottom = '70px';
          iframe.style.right = '20px';
          iframe.style.width = '400px';
          iframe.style.height = '500px';
          iframe.style.border = '1px solid #ccc';
          iframe.style.borderRadius = '10px';
          iframe.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          iframe.style.zIndex = 9999;
          iframe.style.display = 'none';
          document.body.appendChild(iframe);

          // 3️⃣ Afficher l'iframe au clic sur le bouton
          btn.addEventListener('click', () => {
            iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
          });
        })();
      </script>
    `;

    // transformer les caractères spéciaux en entités HTML et ajouter coloration simple
    this.widgetSnippet = rawSnippet
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;!--.*--&gt;)/g, '<span class="comment">$1</span>')
      .replace(/(&lt;script.*&gt;)/g, '<span class="tag">$1</span>')
      .replace(/(&lt;\/script&gt;)/g, '<span class="tag">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
  }


  // 🔹 Copier le snippet dans le presse-papiers
  copySnippet(): void {
    navigator.clipboard.writeText(this.widgetSnippet).then(() => {
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

}
