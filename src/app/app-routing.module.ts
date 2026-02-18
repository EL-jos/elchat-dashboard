import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { VerificationComponent } from './pages/verification/verification.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SiteComponent } from './pages/site/site.component';
import { SiteConversationsComponent } from './pages/site/site-conversations/site-conversations.component';

const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'verify', component: VerificationComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'new-password', component: NewPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'site/:id', component: SiteComponent },
  { path: 'site/:siteId/user/:userId/conversation/:conversationId', component: SiteConversationsComponent },
  { path: '**', redirectTo: '/sign-in' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
