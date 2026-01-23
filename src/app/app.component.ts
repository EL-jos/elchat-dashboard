import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { faThLarge, faHome, faBriefcase, faFileAlt, faUserGraduate, faChalkboardTeacher, faSignIn, faSignOut, faUserFriends } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'frontend-kelasi';
  @ViewChild("drawer") drawer!: MatDrawer;
  isOpened: boolean = true;
  faThLarge = faThLarge;
  faHome = faHome;
  faUserGraduate = faUserGraduate;
  faFileAlt = faFileAlt;
  faChalkboardTeacher = faChalkboardTeacher;
  faBriefcase = faBriefcase;
  faSignIn = faSignIn;
  faSignOut = faSignOut;
  faUserFriends = faUserFriends;

  user: any = null;

  constructor(){}

  ngOnInit(): void {
    
  }

}
