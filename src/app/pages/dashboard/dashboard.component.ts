import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user/user';
import { DashboardOverview, DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { UserStoreService } from 'src/app/services/user-store/user-store.service';
import { faGlobe, faFileLines, faCubes, faComments, faMessage, faUsers } from '@fortawesome/free-solid-svg-icons';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ChartData, ChartOptions } from 'chart.js';
import { NumberShortPipe } from 'src/app/pipes/number-short/number-short.pipe';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SiteBottomSheetComponent } from 'src/app/bottom-sheet/site-bottom-sheet/site-bottom-sheet.component';
import { Site } from 'src/app/models/site/site';
import { SiteService } from 'src/app/services/site/site.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  private destroy$ = new Subject<void>();
  // User & Stats
  user: User | null = null;
  overview: DashboardOverview | null = null;
  sites: Site[] = [];

  // --- Table ---
  displayedColumns: string[] = ['icon', 'name', 'url', 'type', 'status', 'created_at', 'action'];
  dataSource = new MatTableDataSource<Site>(this.sites);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  stats: { title: string, value: number, icon: string, color: string }[] = [];
  icons = {
    sites: faGlobe,
    documents: faFileLines,
    //chunks: faCubes,
    conversations: faComments,
    messages: faMessage,
    users: faUsers,
  };

  // Charts
  conversationsChartData: ChartData<'line'> = { labels: [], datasets: [] };
  messagesChartData: ChartData<'line'> = { labels: [], datasets: [] };
  sourcesChartData: ChartData<'pie'> = { labels: [], datasets: [] };


  conversationsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    //maintainAspectRatio: false, // permet à la hauteur de suivre le container
    plugins: { legend: { display: false }, title: { display: true, text: 'Conversations par jour' } },
    scales: { x: { title: { display: true, text: 'Date' } }, y: { title: { display: true, text: 'Nombre' }, beginAtZero: true } }
  };

  messagesChartOptions: ChartOptions<'line'> = {
    responsive: true,
    //maintainAspectRatio: false, // permet à la hauteur de suivre le container
    plugins: { legend: { display: false }, title: { display: true, text: 'Messages IA par jour' } },
    scales: { x: { title: { display: true, text: 'Date' } }, y: { title: { display: true, text: 'Nombre' }, beginAtZero: true } }
  };

  sourcesChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' }, title: { display: true, text: 'Répartition des sources' } }
  };

  constructor(
    private userStore: UserStoreService,
    private dashboardService: DashboardService,
    private siteBottomsheet: MatBottomSheet,
    private snackBar: MatSnackBar,
    private siteService: SiteService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    //this.userStore.user$.subscribe(user => (this.user = user));
    this.userStore.user$.pipe(takeUntil(this.destroy$)).subscribe(user => this.user = user);
    this.loadOverview();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOverview(): void {
    this.dashboardService.getOverview().subscribe({
      next: (data) => {
        this.overview = data;
        this.sites = data.sites.map(Site.fromJson);
        this.dataSource.data = this.sites;

        // --- Conversations par jour (concat de tous les sites) ---
        const allDates = this.collectDates(data.conversations_per_day);
        this.conversationsChartData = {
          labels: allDates,
          datasets: data.conversations_per_day.map((site, index) => ({
            label: site.site_name,
            data: allDates.map(date =>
              site.data.find(d => d.date === date)?.count ?? 0
            ),
            tension: 0.4,
            fill: false,
            borderWidth: 2
          }))
        };

        // --- Messages par jour (concat de tous les sites) ---
        const allDatesMsg = this.collectDates(data.messages_per_day);
        this.messagesChartData = {
          labels: allDatesMsg,
          datasets: data.messages_per_day.map(site => ({
            label: site.site_name,
            data: allDatesMsg.map(date =>
              site.data.find(d => d.date === date)?.count ?? 0
            ),
            tension: 0.4,
            fill: false,
            borderWidth: 2
          }))
        };

        // --- Source distribution (concat de tous les sites) ---
        const sourcesMerged: Record<string, number> = {};
        data.source_distribution.forEach(site => {
          Object.entries(site.sources).forEach(([key, val]) => {
            sourcesMerged[key] = (sourcesMerged[key] || 0) + val;
          });
        });
        this.sourcesChartData = {
          labels: Object.keys(sourcesMerged),
          datasets: [{ data: Object.values(sourcesMerged), backgroundColor: ['#007ad9', '#ff9800', '#9c27b0', '#f44336'], hoverOffset: 4 }]
        };

      },
      error: err => console.error('Erreur dashboard', err)
    });
  }

  private collectDates(
    input: { data: { date: string }[] }[]
  ): string[] {
    return Array.from(
      new Set(input.flatMap(s => s.data.map(d => d.date)))
    ).sort();
  }
  getSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 'ready':
        return 'success';   // vert
      case 'pending':
        return 'info';      // bleu clair
      case 'crawling':
        return 'warning';      // orange
      case 'indexing':
        return 'secondary';   // orange
      case 'error':
        return 'danger';    // rouge
      default:
        return 'info';
    }
  }

  onCreateSite() {

    type BottomSheetResult =
      | { status: true; action: 'create' | 'update'; site: Site; message: string }
      | { status: false };

    const bottomSheetRef = this.siteBottomsheet.open(SiteBottomSheetComponent);

    bottomSheetRef.afterDismissed().subscribe((res: BottomSheetResult) => {
      if (res.status) {

        if (res.action === 'create') {
          /* this.sites = [res.site, ...this.sites];
          this.dataSource.data = this.sites; */
          this.loadOverview();
        }

        this.snackBar.open(res.message, "Fermer");
      }

    });
  }

  onUpdateSite(site: Site) {
    type BottomSheetResult =
      | { status: true; action: 'create' | 'update'; site: Site; message: string }
      | { status: false };

    const bottomSheetRef = this.siteBottomsheet.open(SiteBottomSheetComponent, {
      data: site
    });

    bottomSheetRef.afterDismissed().subscribe((res: BottomSheetResult) => {

      if (res.status) {

        if (res.action === 'update') {
          this.sites = this.sites.map(s =>
            s.id === res.site.id ? res.site : s
          );
          this.dataSource.data = this.sites;
        }

        this.snackBar.open(res.message, "Fermer");

      }

    });
  }

  onDeleteSite(site: Site): void {
    if (!site?.id) return;

    if (site.status === 'crawling' || site.status === 'indexing') {
      this.snackBar.open('⏳ Impossible de supprimer un site en cours de traitement.', "Fermer");
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer le site',
        message:
          `⚠️ Voulez-vous vraiment supprimer le site "${site.name}" ?\n` +
          `Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.siteService.deleteSite(site.id!).subscribe({
        next: () => {
          // 🔥 retirer le site supprimé de la liste
          /* this.sites = this.sites.filter(s => s.id !== site.id);
          this.dataSource.data = this.sites; */
          this.loadOverview();

          this.snackBar.open('✅ Site supprimé avec succès', "Fermer");
        },
        error: err => {
          this.snackBar.open('❌ Erreur suppression site' + err, "Fermer");
        }
      });
    });


  }


}