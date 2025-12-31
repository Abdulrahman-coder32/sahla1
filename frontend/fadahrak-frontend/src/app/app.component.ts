import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar (logout)="onLogout()"></app-navbar>
    <main class="flex-grow">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub!: Subscription;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    // تهيئة الإشعارات والسوكت بناءً على حالة اللوجين
    this.authSub = this.authService.user$.subscribe(user => {
      if (user) {
        console.log('مستخدم مسجل دخول → تهيئة السوكت والإشعارات');
        this.notificationService.init();
      } else {
        console.log('لا يوجد مستخدم أو تم تسجيل الخروج → فصل السوكت');
        this.notificationService.disconnectSocket();
      }
    });

    // === إضافة جديدة: إرجاع الـ scroll للأعلى عند كل navigation ===
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
