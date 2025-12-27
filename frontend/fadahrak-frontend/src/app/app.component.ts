import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service'; // أضف ده
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar [user]="currentUser" (logout)="onLogout()"></app-navbar>
    <main class="flex-grow">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  private userSubscription!: Subscription;
  private authSub!: Subscription; // جديد للإشعارات

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService, // inject هنا
    private router: Router
  ) {}

  ngOnInit() {
    // اشتراك لتحديث الـ currentUser في الـ Navbar (زي ما كان)
    this.userSubscription = this.authService.user$.subscribe((user: any) => {
      this.currentUser = user;
    });

    // اشتراك جديد للتحكم في الإشعارات والسوكت
    this.authSub = this.authService.user$.subscribe(user => {
      if (user) {
        // في مستخدم → نتصل بالسوكت ونجيب الإشعارات
        console.log('مستخدم مسجل دخول أو تم تحميله → تهيئة الإشعارات والسوكت');
        this.notificationService.init();
      } else {
        // مفيش مستخدم → نفصل السوكت
        console.log('تم تسجيل الخروج → فصل السوكت');
        this.notificationService.disconnectSocket();
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  onLogout() {
    this.authService.logout(); // هيحذف التوكن واليوزر ويبعت null في user$
    this.currentUser = null; // مش ضروري دلوقتي لأن الـ subscribe هيعمله، بس تمام
    this.router.navigate(['/']);
  }
}
