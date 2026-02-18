import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserConversationBottomSheetComponent } from 'src/app/bottom-sheet/user-conversation-bottom-sheet/user-conversation-bottom-sheet.component';
import { User } from 'src/app/models/user/user';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-site-users',
  templateUrl: './site-users.component.html',
  styleUrls: ['./site-users.component.scss']
})
export class SiteUsersComponent implements OnInit {

  displayedColumns: string[] = [
    'name',
    'email',
    'conversations',
    'messages',
    'last_seen',
    'status'
  ];

  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  selectedUser: User | null = null;
  summary: any = null;
  loading = false;

  chartData: any;
  chartOptions: any;

  filters = {
    page: 1,
    limit: 10,
    search: '',
    verified: ''
  };
  @Input() siteId!: string;

  constructor(
    private userService: UserService,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.initChart();
  }

  loadUsers(): void {
    this.loading = true;
    const siteId = this.siteId;

    this.userService.getUsers(siteId, this.filters)
      .subscribe(response => {
        this.dataSource.data = response.data;
        this.summary = response.summary;
        this.loading = false;
        this.dataSource.paginator = this.paginator;
      });
  }

  selectUser(user: User): void {
    this.bottomSheet.open(UserConversationBottomSheetComponent, {
      data: {
        userId: user.id,
        siteId: this.siteId,
        userName: `${user.firstname} ${user.lastname}`
      },
      panelClass: 'conversation-sheet'
    });
  }

  /* =============================
     CHART LOGIC
  ============================== */

  initChart(): void {
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      }
    };
  }

  generateActivityChart(user: User): void {
    if (!user.stats) return;

    this.chartData = {
      labels: ['Conversations', 'Messages'],
      datasets: [
        {
          label: 'Activité utilisateur',
          data: [
            user.stats.conversations_count,
            user.stats.messages_count
          ]
        }
      ]
    };
  }
}
