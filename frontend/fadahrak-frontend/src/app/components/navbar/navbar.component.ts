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
    <nav class="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div class="flex justify-between items-center h-12 sm:h-14 lg:h-16">

          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" (click)="closeMobileMenu()">
              <img src="assets/logo.png" alt="سَهلة" class="h-8 sm:h-10 lg:h-12 w-auto max-w-24 sm:max-w-28 lg:max-w-32 object-contain transition-transform duration-300 hover:scale-105">
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
            <a routerLink="/" class="nav-link" routerLinkActive="active-link">الرئيسية</a>
            <a routerLink="/jobs" class="nav-link" routerLinkActive="active-link">الوظائف</a>
            <a routerLink="/about" class="nav-link" routerLinkActive="active-link">عننا</a>
            <a routerLink="/contact" class="nav-link" routerLinkActive="active-link">اتصل بنا</a>

            <!-- لو مسجل دخول -->
            <ng-container *ngIf="user; else guestDesktop">
              <!-- الإشعارات (Desktop) -->
              <div class="relative group">
                <button class="nav-link flex items-center gap-1.5 relative">
                  الإشعارات
                  <ng-container *ngIf="notificationCount$ | async as count">
                    <span *ngIf="count > 0" class="absolute -top-1.5 -end-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {{ count > 9 ? '9+' : count }}
                    </span>
                  </ng-container>
                </button>

                <div class="absolute end-0 mt-2 w-72 lg:w-80 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div class="p-3 border-b border-slate-200 font-semibold text-base lg:text-lg">الإشعارات</div>
                  <div class="max-h-64 lg:max-h-80 overflow-y-auto">
                    <ng-container *ngIf="notifications$ | async as notifications; else loading">
                      <button *ngFor="let notif of notifications.slice(0, 10)" (click)="navigateToNotification(notif)"
                              class="w-full p-2 lg:p-3 hover:bg-slate-50 border-b border-slate-100 flex items-start gap-2 lg:gap-3 text-right"
                              [class.font-semibold]="!notif.read" [class.bg-slate-50]="!notif.read">
                        <div class="w-2 h-2 rounded-full mt-1.5 lg:mt-2 flex-shrink-0" [class.bg-slate-500]="!notif.read" [class.bg-slate-300]="notif.read"></div>
                        <div>
                          <p class="text-xs lg:text-sm">{{ notif.message }}</p>
                          <p class="text-xs text-slate-500 mt-1">{{ notif.createdAt | date:'short' }}</p>
                        </div>
                      </button>
                      <div *ngIf="notifications.length === 0" class="p-4 lg:p-6 text-center text-slate-500">
                        لا توجد إشعارات جديدة
                      </div>
                    </ng-container>
                    <ng-template #loading>
                      <div class="p-4 lg:p-6 text-center text-slate-400">جاري التحميل...</div>
                    </ng-template>
                  </div>
                  <a routerLink="/notifications" class="block p-2 lg:p-3 text-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-b-lg">
                    عرض جميع الإشعارات
                  </a>
                </div>
              </div>

              <a routerLink="/inbox" class="nav-link" routerLinkActive="active-link">الرسائل</a>
              <a [routerLink]="user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 class="nav-link" routerLinkActive="active-link">لوحة التحكم</a>

              <!-- Profile Dropdown -->
              <div class="relative group">
                <button class="flex items-center gap-2 lg:gap-3 rounded-full focus:outline-none p-1">
                  <img [src]="getProfileImageUrl()" alt="صورة الملف الشخصي"
                       class="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover ring-2 ring-slate-300 shadow-sm">
                  <span class="text-slate-700 font-medium hidden lg:block text-sm lg:text-base">{{ user.name || 'مستخدم' }}</span>
                </button>

                <div class="absolute end-0 mt-2 w-48 lg:w-56 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <a routerLink="/profile" class="block px-4 py-2 lg:px-5 lg:py-3 hover:bg-slate-50 text-right font-medium text-slate-700 border-b border-slate-100">
                    الملف الشخصي
                  </a>
                  <button (click)="onLogout()" class="w-full text-right px-4 py-2 lg:px-5 lg:py-3 hover:bg-red-50 text-red-600 font-medium">
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </ng-container>

            <!-- لو ضيف -->
            <ng-template #guestDesktop>
              <a routerLink="/login" class="nav-link" routerLinkActive="active-link">دخول</a>
              <a routerLink="/signup" class="btn-primary px-4 py-1.5 lg:px-6 lg:py-2 rounded-lg text-sm lg:text-base">إنشاء حساب</a>
            </ng-template>
          </div>

          <!-- Mobile Buttons -->
          <div class="md:hidden flex items-center gap-2 lg:gap-4">
            <ng-container *ngIf="user">
              <button (click)="mobileNotificationsOpen = !mobileNotificationsOpen; mobileMenuOpen = false" class="relative p-1.5 lg:p-2">
                <i class="fas fa-bell text-lg lg:text-xl text-slate-700"></i>
                <ng-container *ngIf="notificationCount$ | async as count">
                  <span *ngIf="count > 0" class="absolute -top-1 -end-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {{ count > 9 ? '9+' : count }}
                  </span>
                </ng-container>
              </button>
            </ng-container>

            <button (click)="mobileMenuOpen = !mobileMenuOpen; mobileNotificationsOpen = false" class="p-1.5 lg:p-2">
              <div class="w-6 h-6 lg:w-8 lg:h-8 flex flex-col justify-center gap-1">
                <span [ngClass]="{'rotate-45 translate-y-1.5 lg:translate-y-2.5': mobileMenuOpen}" class="block h-0.5 w-full bg-slate-800 rounded transition-all duration-300"></span>
                <span [ngClass]="{'opacity-0': mobileMenuOpen}" class="block h-0.5 w-full bg-slate-800 rounded transition-all duration-300"></span>
                <span [ngClass]="{'-rotate-45 -translate-y-1.5 lg:-translate-y-2.5': mobileMenuOpen}" class="block h-0.5 w-full bg-slate-800 rounded transition-all duration-300"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Overlay للإغلاق بالضغط خارج المنيو -->
      <div *ngIf="mobileMenuOpen || mobileNotificationsOpen"
           class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
           (click)="closeMobileMenu()"></div>

      <!-- Mobile Sliding Panel (من الأعلى - Dropdown Style) -->
      <div [ngClass]="{
        'translate-y-0': mobileMenuOpen || mobileNotificationsOpen,
        'translate-y-[-100%]': !(mobileMenuOpen || mobileNotificationsOpen)
      }" class="fixed top-12 sm:top-14 left-0 right-0 bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out md:hidden border-t border-slate-200">

        <div class="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 class="text-lg font-bold">{{ mobileNotificationsOpen ? 'الإشعارات' : 'القائمة' }}</h2>
          <button (click)="closeMobileMenu()" class="p-2">
            <i class="fas fa-times text-xl text-slate-600"></i>
          </button>
        </div>

        <!-- محتوى الإشعارات على الموبايل -->
        <div *ngIf="mobileNotificationsOpen" class="p-4">
          <div class="max-h-96 overflow-y-auto">
            <ng-container *ngIf="notifications$ | async as notifications; else loadingMobile">
              <button *ngFor="let notif of notifications.slice(0, 20)" (click)="navigateToNotification(notif)"
                      class="w-full p-3 hover:bg-slate-50 border-b border-slate-100 flex items-start gap-3 text-right mb-2 rounded-lg"
                      [class.font-semibold]="!notif.read" [class.bg-slate-50]="!notif.read">
                <div class="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" [class.bg-slate-500]="!notif.read" [class.bg-slate-300]="notif.read"></div>
                <div class="flex-1">
                  <p class="text-sm">{{ notif.message }}</p>
                  <p class="text-sm text-slate-500 mt-1">{{ notif.createdAt | date:'medium' }}</p>
                </div>
              </button>
              <div *ngIf="notifications.length === 0" class="p-8 text-center text-slate-500">
                لا توجد إشعارات جديدة
              </div>
            </ng-container>
            <ng-template #loadingMobile>
              <div class="p-8 text-center text-slate-400">جاري التحميل...</div>
            </ng-template>
          </div>
          <a routerLink="/notifications" (click)="closeMobileMenu()" class="block mt-4 p-3 text-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-lg">
            عرض جميع الإشعارات
          </a>
        </div>

        <!-- محتوى المنيو على الموبايل -->
        <div *ngIf="mobileMenuOpen && !mobileNotificationsOpen" class="p-4">
          <ng-container *ngIf="user; else guestMobile">
            <a routerLink="/inbox" (click)="closeMobileMenu()" class="block py-2 px-3 text-base hover:bg-slate-100 rounded-lg text-right">الرسائل</a>
            <a [routerLink]="user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
               (click)="closeMobileMenu()" class="block py-2 px-3 text-base hover:bg-slate-100 rounded-lg text-right">لوحة التحكم</a>
            <a routerLink="/profile" (click)="closeMobileMenu()" class="block py-2 px-3 text-base hover:bg-slate-100 rounded-lg text-right">الملف الشخصي</a>
            <hr class="my-3">
            <button (click)="onLogout()" class="w-full py-2 px-3 text-base hover:bg-red-50 text-red-600 rounded-lg text-right font-medium">
              تسجيل الخروج
            </button>
          </ng-container>

          <ng-template #guestMobile>
            <a routerLink="/login" (click)="closeMobileMenu()" class="block py-2 px-3 text-base hover:bg-slate-100 rounded-lg text-right">دخول</a>
            <a routerLink="/signup" (click)="closeMobileMenu()" class="block py-2 px-3 text-base bg-slate-600 text-white hover:bg-slate-700 rounded-lg text-right font-medium">إنشاء حساب</a>
          </ng-template>

          <hr class="my-4">
          <div class="space-y-1">
            <a routerLink="/" (click)="closeMobileMenu()" class="block py-2 px-3 text-base hover:bg-slate-100 rounded-lg text-right">الرئيسية</a>
            <a routerLink="/jobs" (click)="closeMobileMenu()" class="block py-2 px-3 text-base hover:bg-slate-100 rounded-lg text-right">الوظائف</a>
            <a routerLink="/about" (click)="closeMobileMenu()" class="block py-2 px-3 text-base hover:bg-slate-100 rounded-lg text-right">عننا</a>
            <a routerLink="/contact" (click)="closeMobileMenu()" class="block py-2 px-3 text-base hover:bg-slate-100 rounded-lg text-right">اتصل بنا</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      @apply text-slate-700 hover:text-slate-600 font-medium transition-colors duration-200 relative text-sm lg:text-base;
    }
    .active-link::after {
      content: '';
      @apply absolute bottom-[-4px] left-0 right-0 h-0.5 bg-slate-600 rounded-full;
    }
    .btn-primary {
      @apply bg-slate-600 text-white hover:bg-slate-700 font-medium transition-colors duration-200;
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() user: any = null;
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
