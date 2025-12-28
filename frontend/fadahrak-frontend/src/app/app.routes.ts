import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { JobListComponent } from './components/job-list/job-list.component';
import { JobDetailComponent } from './components/job-detail/job-detail.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { SuccessStoriesComponent } from './components/success-stories/success-stories.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { OwnerDashboardComponent } from './components/owner-dashboard/owner-dashboard.component';
import { SeekerDashboardComponent } from './components/seeker-dashboard/seeker-dashboard.component';
import { InboxListComponent } from './components/inbox-list/inbox-list.component';
import { InboxComponent } from './components/inbox/inbox.component';
import { NotificationsPageComponent } from './components/notifications-page/notifications-page.component';
import { ProfileComponent } from './components/profile/profile.component'; // ← جديد

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'jobs', component: JobListComponent },
  { path: 'job/:id', component: JobDetailComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'success-stories', component: SuccessStoriesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'owner-dashboard', component: OwnerDashboardComponent },
  { path: 'seeker-dashboard', component: SeekerDashboardComponent },
  { path: 'notifications', component: NotificationsPageComponent },
  { path: 'profile', component: ProfileComponent }, // ← جديد: صفحة الملف الشخصي
  // قائمة الدردشات + الچات الفردي
  { path: 'inbox', component: InboxListComponent },
  { path: 'inbox/:id', component: InboxComponent },
  { path: '**', redirectTo: '' }
];
