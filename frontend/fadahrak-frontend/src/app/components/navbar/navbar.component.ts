import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div class="nav-container">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" (click)="closeMobileMenu()">
              <img src="assets/logo.png" alt="سَهلة" class="h-12 w-auto max-w-32 object-contain transition-transform duration-300 hover:scale-105 hover:translate-x-1 translate-x-4">
            </a>
          </div>
          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-8">
            <!-- الروابط الأساسية -->
            <a routerLink="/" class="nav-link" routerLinkActive="active-link">الرئيسية</a>
            <a routerLink="/jobs" class="nav-link" routerLinkActive="active-link">الوظائف</a>
            <a routerLink="/about" class="nav-link" routerLinkActive="active-link">عننا</a>
            <a routerLink="/contact" class="nav-link" routerLinkActive="active-link">اتصل بنا</a>
            <!-- لو مسجل دخول -->
            <ng-container *ngIf="user; else guestDesktop">
              <!-- الإشعارات -->
              <div class="relative group">
                <button class="nav-link flex items-center gap-1.5">
                  الإشعارات
                  <ng-container *ngIf="notificationCount$ | async as count">
                    <span *ngIf="count > 0" class="absolute -top-1 -end-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {{ count > 9 ? '9+' : count }}
                    </span>
                  </ng-container>
                </button>
                <!-- Dropdown الإشعارات -->
                <div class="absolute end-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div class="p-4 border-b border-gray-200 font-semibold text-lg">الإشعارات</div>
                  <div class="max-h-80 overflow-y-auto scrollbar-hide">
                    <ng-container *ngIf="notifications$ | async as notifications; else loading">
                      <button *ngFor="let notif of notifications.slice(0, 10)" (click)="navigateToNotification(notif)"
                              class="w-full p-3 hover:bg-indigo-50 border-b border-gray-100 flex items-start gap-3 text-right"
                              [class.font-semibold]="!notif.read" [class.bg-indigo-50]="!notif.read">
                        <div class="w-2 h-2 rounded-full mt-2 flex-shrink-0" [class.bg-indigo-500]="!notif.read" [class.bg-gray-300]="notif.read"></div>
                        <div>
                          <p class="text-sm">{{ notif.message }}</p>
                          <p class="text-xs text-gray-500 mt-1">{{ notif.createdAt | date:'short' }}</p>
                        </div>
                      </button>
                      <div *ngIf="notifications.length === 0" class="p-6 text-center text-gray-500">
                        لا توجد إشعارات جديدة
                      </div>
                    </ng-container>
                    <ng-template #loading>
                      <div class="p-6 text-center text-gray-400">جاري التحميل...</div>
                    </ng-template>
                  </div>
                  <a routerLink="/notifications" class="block p-3 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-b-xl">
                    عرض جميع الإشعارات
                  </a>
                </div>
              </div>
              <a routerLink="/inbox" class="nav-link" routerLinkActive="active-link">الرسائل</a>
              <a [routerLink]="user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 class="nav-link" routerLinkActive="active-link">لوحة التحكم</a>
              <!-- Profile Dropdown مع الصورة والاسم -->
              <div class="relative group">
                <button class="flex items-center gap-3 rounded-full focus:outline-none p-1">
                  <img
                    [src]="getProfileImageUrl()"
                    alt="صورة الملف الشخصي"
                    class="w-10 h-10 rounded-full object-cover ring-2 ring-gray-300 shadow-md">
                  <span class="text-gray-700 font-medium hidden lg:block">{{ user.name || 'مستخدم' }}</span>
                </button>
                <!-- Dropdown للملف الشخصي والخروج -->
                <div class="absolute end-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <a routerLink="/profile" class="block px-5 py-3 hover:bg-gray-50 text-right font-medium text-gray-700 border-b border-gray-100">
                    الملف الشخصي
                  </a>
                  <button (click)="onLogout()" class="w-full text-right px-5 py-3 hover:bg-red-50 text-red-600 font-medium">
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </ng-container>
            <!-- لو ضيف -->
            <ng-template #guestDesktop>
              <a routerLink="/login" class="nav-link" routerLinkActive="active-link">دخول</a>
              <a routerLink="/signup" class="btn-primary">إنشاء حساب</a>
            </ng-template>
          </div>
          <!-- Mobile: Bell + Hamburger -->
          <div class="md:hidden flex items-center gap-4">
            <ng-container *ngIf="user">
              <button (click)="mobileNotificationsOpen = !mobileNotificationsOpen" class="relative p-2">
                <i class="fas fa-bell text-xl text-gray-700"></i>
                <ng-container *ngIf="notificationCount$ | async as count">
                  <span *ngIf="count > 0" class="absolute -top-1 -end-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {{ count > 9 ? '9+' : count }}
                  </span>
                </ng-container>
              </button>
            </ng-container>
            <button (click)="mobileMenuOpen = !mobileMenuOpen" class="p-2">
              <div class="relative w-8 h-8 flex flex-col justify-between items-center">
                <span [ngClass]="{'rotate-45 translate-y-3': mobileMenuOpen}" class="block h-1 w-8 bg-gray-800 rounded-full transition-all duration-300"></span>
                <span [ngClass]="{'opacity-0': mobileMenuOpen}" class="block h-1 w-8 bg-gray-800 rounded-full transition-all duration-300"></span>
                <span [ngClass]="{'-rotate-45 -translate-y-3': mobileMenuOpen}" class="block h-1 w-8 bg-gray-800 rounded-full transition-all duration-300"></span>
              </div>
            </button>
          </div>
        </div>
        <!-- Mobile Menu + Mobile Notifications (باقي الـ template بدون تغيير كبير) -->
        <!-- ... باقي الكود للـ mobile menu والـ notifications ... -->
      </div>
    </nav>
  `,
  styles: [/* باقي الـ styles بدون تغيير */]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() user: any = null;  // الـ Input الجديد لاستقبال currentUser من الـ parent

  mobileMenuOpen = false;
  mobileNotificationsOpen = false;
  notificationCount$!: Observable<number>;
  notifications$!: Observable<any[]>;
  private destroy$ = new Subject<void>();
  private cacheBuster = Date.now();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.notificationCount$ = this.notificationService.unreadCount$;
    this.notifications$ = this.notificationService.getNotifications();
  }

  ngOnInit() {
    // لو الـ user مش جاي من Input (للاختبار أو حالات تانية)، نتابع من AuthService
    // بس دلوقتي الـ user هيجي أساساً من الـ @Input
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authUser => {
        if (!this.user && authUser) {
          this.user = authUser;
        }
        if (authUser?.profileImage) {
          this.cacheBuster = Date.now();
        }
      });
  }

  getProfileImageUrl(): string {
    if (!this.user?.profileImage) {
      return `https://via.placeholder.com/40?text=${this.user?.name?.charAt(0) || 'م'}`;
    }
    return `${this.user.profileImage}?t=${this.cacheBuster}`;
  }

  onLogout() {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.mobileNotificationsOpen = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToNotification(notification: any) {
    this.closeMobileMenu();
    let route: string[] = ['/notifications'];
    const appId = notification.application_id || null;
    switch (notification.type) {
      case 'new_message':
        if (appId) route = ['/inbox', appId];
        break;
      case 'application_accepted':
      case 'application_rejected':
      case 'new_application':
        if (appId) route = ['/applications', appId];
        break;
    }
    this.router.navigate(route);
    if (!notification.read) {
      this.notificationService.markAsReadAndUpdate(notification._id);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
