import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
    <nav class="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14 sm:h-16 lg:h-18">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" (click)="closeMobileMenu()">
              <img src="assets/logo.png" alt="سَهلة" class="h-10 sm:h-12 lg:h-14 w-auto max-w-28 sm:max-w-32 lg:max-w-36 object-contain transition-transform duration-300 hover:scale-105">
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10">
            <a routerLink="/" class="nav-link" routerLinkActive="active-link">الرئيسية</a>
            <a routerLink="/jobs" class="nav-link" routerLinkActive="active-link">الوظائف</a>
            <a routerLink="/about" class="nav-link" routerLinkActive="active-link">عننا</a>
            <a routerLink="/contact" class="nav-link" routerLinkActive="active-link">اتصل بنا</a>

            <ng-container *ngIf="user; else guestDesktop">
              <!-- Notifications Dropdown (Desktop) -->
              <div class="relative group">
                <button class="nav-link flex items-center gap-2 relative">
                  الإشعارات
                  <ng-container *ngIf="notificationCount$ | async as count">
                    <span *ngIf="count > 0" class="absolute -top-2 -end-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {{ count > 9 ? '9+' : count }}
                    </span>
                  </ng-container>
                </button>
                <div class="absolute end-0 mt-3 w-80 lg:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div class="p-4 border-b border-gray-200 font-semibold text-lg lg:text-xl">الإشعارات</div>
                  <div class="max-h-96 overflow-y-auto">
                    <ng-container *ngIf="notifications$ | async as notifications; else loading">
                      <button *ngFor="let notif of notifications.slice(0, 10)" (click)="navigateToNotification(notif)"
                              class="w-full p-3 lg:p-4 hover:bg-gray-50 border-b border-gray-100 flex items-start gap-3 lg:gap-4 text-right rounded-lg"
                              [class.font-semibold]="!notif.read" [class.bg-gray-50]="!notif.read">
                        <div class="w-3 h-3 rounded-full mt-2 lg:mt-3 flex-shrink-0" [class.bg-indigo-500]="!notif.read" [class.bg-gray-300]="notif.read"></div>
                        <div>
                          <p class="text-sm lg:text-base">{{ notif.message }}</p>
                          <p class="text-xs lg:text-sm text-gray-500 mt-1">{{ notif.createdAt | date:'short' }}</p>
                        </div>
                      </button>
                      <div *ngIf="notifications.length === 0" class="p-6 lg:p-8 text-center text-gray-500">
                        لا توجد إشعارات جديدة
                      </div>
                    </ng-container>
                    <ng-template #loading>
                      <div class="p-6 lg:p-8 text-center text-gray-400">جاري التحميل...</div>
                    </ng-template>
                  </div>
                  <!-- زر عرض جميع الإشعارات في الديسكتوب -->
                  <a routerLink="/notifications" class="block p-4 text-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium rounded-b-xl">
                    عرض جميع الإشعارات
                  </a>
                </div>
              </div>

              <a routerLink="/inbox" class="nav-link" routerLinkActive="active-link">الرسائل</a>
              <a [routerLink]="user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 class="nav-link" routerLinkActive="active-link">لوحة التحكم</a>

              <!-- Profile Dropdown -->
              <div class="relative group">
                <button class="flex items-center gap-3 lg:gap-4 rounded-full focus:outline-none p-2">
                  <img [src]="getProfileImageUrl()" alt="صورة الملف الشخصي"
                       class="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover ring-2 ring-gray-300 shadow-md">
                  <span class="text-gray-700 font-medium hidden lg:block text-base lg:text-lg">{{ user.name || 'مستخدم' }}</span>
                </button>
                <div class="absolute end-0 mt-3 w-56 lg:w-64 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <a routerLink="/profile" class="block px-5 py-3 lg:px-6 lg:py-4 hover:bg-gray-50 text-right font-medium text-gray-700 border-b border-gray-100 rounded-t-xl">
                    الملف الشخصي
                  </a>
                  <button (click)="onLogout()" class="w-full text-right px-5 py-3 lg:px-6 lg:py-4 hover:bg-red-50 text-red-600 font-medium rounded-b-xl">
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </ng-container>

            <ng-template #guestDesktop>
              <a routerLink="/login" class="nav-link" routerLinkActive="active-link">دخول</a>
              <a routerLink="/signup" class="btn-primary px-5 py-2 lg:px-7 lg:py-3 rounded-xl text-base lg:text-lg">إنشاء حساب</a>
            </ng-template>
          </div>

          <!-- Mobile Buttons -->
          <div class="md:hidden flex items-center gap-4">
            <ng-container *ngIf="user">
              <button (click)="toggleNotifications()" class="relative p-2">
                <i class="fas fa-bell text-xl text-gray-700"></i>
                <ng-container *ngIf="notificationCount$ | async as count">
                  <span *ngIf="count > 0" class="absolute -top-1 -end-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{ count > 9 ? '9+' : count }}
                  </span>
                </ng-container>
              </button>
            </ng-container>

            <button (click)="toggleMenu()" class="p-2">
              <div class="w-7 h-7 flex flex-col justify-center gap-1.5">
                <span [ngClass]="{'rotate-45 translate-y-2.5': mobileMenuOpen}" class="block h-0.5 w-full bg-gray-800 rounded transition-all duration-300 origin-center"></span>
                <span [ngClass]="{'opacity-0': mobileMenuOpen}" class="block h-0.5 w-full bg-gray-800 rounded transition-all duration-300"></span>
                <span [ngClass]="{'-rotate-45 -translate-y-2.5': mobileMenuOpen}" class="block h-0.5 w-full bg-gray-800 rounded transition-all duration-300 origin-center"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Overlay -->
      <div *ngIf="mobileMenuOpen || mobileNotificationsOpen"
           class="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden"
           (click)="closeMobileMenu()"></div>

      <!-- Mobile Sidebar (من اليمين) -->
      <div [ngClass]="{
        'translate-x-0': mobileMenuOpen || mobileNotificationsOpen,
        'translate-x-full': !(mobileMenuOpen || mobileNotificationsOpen)
      }" class="fixed inset-y-0 right-0 w-80 max-w-full bg-white shadow-2xl z-50 transition-transform duration-500 ease-in-out md:hidden overflow-y-auto">
        <div class="p-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0">
          <h2 class="text-xl font-bold">{{ mobileNotificationsOpen ? 'الإشعارات' : 'القائمة' }}</h2>
          <button (click)="closeMobileMenu()" class="p-2">
            <i class="fas fa-times text-2xl text-gray-600"></i>
          </button>
        </div>

        <!-- Notifications Content (Mobile) -->
        <div *ngIf="mobileNotificationsOpen" class="p-5">
          <div class="max-h-[calc(100vh-120px)] overflow-y-auto pb-20">
            <ng-container *ngIf="notifications$ | async as notifications; else loadingMobile">
              <button *ngFor="let notif of notifications.slice(0, 20)" (click)="navigateToNotification(notif)"
                      class="w-full p-4 hover:bg-gray-50 border-b border-gray-100 flex items-start gap-4 text-right mb-2 rounded-xl"
                      [class.font-semibold]="!notif.read" [class.bg-gray-50]="!notif.read">
                <div class="w-3 h-3 rounded-full mt-2 flex-shrink-0" [class.bg-indigo-500]="!notif.read" [class.bg-gray-300]="notif.read"></div>
                <div class="flex-1">
                  <p class="text-sm">{{ notif.message }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ notif.createdAt | date:'medium' }}</p>
                </div>
              </button>
              <div *ngIf="notifications.length === 0" class="p-8 text-center text-gray-500">
                لا توجد إشعارات جديدة
              </div>
            </ng-container>
            <ng-template #loadingMobile>
              <div class="p-8 text-center text-gray-400">جاري التحميل...</div>
            </ng-template>
          </div>
          <!-- زر عرض جميع الإشعارات في الموبايل -->
          <a routerLink="/notifications" (click)="closeMobileMenu()" class="block mt-6 p-4 text-center bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-medium">
            عرض جميع الإشعارات
          </a>
        </div>

        <!-- Menu Content (Mobile) -->
        <div *ngIf="mobileMenuOpen && !mobileNotificationsOpen" class="p-5">
          <ng-container *ngIf="user; else guestMobile">
            <a routerLink="/inbox" (click)="closeMobileMenu()" class="block py-4 px-5 text-lg hover:bg-gray-100 rounded-xl text-right mb-2">الرسائل</a>
            <a [routerLink]="user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'" (click)="closeMobileMenu()" class="block py-4 px-5 text-lg hover:bg-gray-100 rounded-xl text-right mb-2">لوحة التحكم</a>
            <a routerLink="/profile" (click)="closeMobileMenu()" class="block py-4 px-5 text-lg hover:bg-gray-100 rounded-xl text-right mb-2">الملف الشخصي</a>
            <hr class="my-6 border-gray-300">
            <button (click)="onLogout(); closeMobileMenu()" class="w-full py-4 px-5 text-lg hover:bg-red-50 text-red-600 rounded-xl text-right font-medium">
              تسجيل الخروج
            </button>
          </ng-container>

          <ng-template #guestMobile>
            <a routerLink="/login" (click)="closeMobileMenu()" class="block py-4 px-5 text-lg hover:bg-gray-100 rounded-xl text-right mb-2">دخول</a>
            <a routerLink="/signup" (click)="closeMobileMenu()" class="block py-4 px-5 text-lg bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-right font-medium mb-6">إنشاء حساب</a>
          </ng-template>

          <hr class="my-6 border-gray-300">
          <div class="space-y-3">
            <a routerLink="/" (click)="closeMobileMenu()" class="block py-4 px-5 text-lg hover:bg-gray-100 rounded-xl text-right">الرئيسية</a>
            <a routerLink="/jobs" (click)="closeMobileMenu()" class="block py-4 px-5 text-lg hover:bg-gray-100 rounded-xl text-right">الوظائف</a>
            <a routerLink="/about" (click)="closeMobileMenu()" class="block py-4 px-5 text-lg hover:bg-gray-100 rounded-xl text-right">عننا</a>
            <a routerLink="/contact" (click)="closeMobileMenu()" class="block py-4 px-5 text-lg hover:bg-gray-100 rounded-xl text-right">اتصل بنا</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      @apply text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 relative text-base lg:text-lg;
    }
    .active-link::after {
      content: '';
      @apply absolute bottom-[-8px] left-0 right-0 h-1 bg-indigo-600 rounded-full;
    }
    .btn-primary {
      @apply bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-all duration-200 shadow-md rounded-xl;
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

  ngOnInit(): void {
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

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.mobileNotificationsOpen = false;
  }

  toggleNotifications(): void {
    this.mobileNotificationsOpen = !this.mobileNotificationsOpen;
    this.mobileMenuOpen = false;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.mobileNotificationsOpen = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getProfileImageUrl(): string {
    if (!this.user?.profileImage) {
      return `https://via.placeholder.com/48?text=${encodeURIComponent(this.user?.name?.charAt(0) || 'م')}`;
    }
    return `${this.user.profileImage}?t=${this.cacheBuster}`;
  }

  onLogout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  navigateToNotification(notification: any): void {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
