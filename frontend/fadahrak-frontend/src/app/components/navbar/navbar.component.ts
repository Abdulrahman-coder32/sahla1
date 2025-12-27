import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Observable, Subject } from 'rxjs';

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

                <!-- Dropdown الإشعارات (ديسكتوب) -->
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
              <button (click)="onLogout()" class="nav-link text-red-600 hover:text-red-700 font-medium">خروج</button>
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

            <!-- رجعت أيقونة الهامبرجر زي ما كانت -->
            <button (click)="mobileMenuOpen = !mobileMenuOpen" class="p-2">
              <div class="relative w-8 h-8 flex flex-col justify-between items-center">
                <span [ngClass]="{'rotate-45 translate-y-3': mobileMenuOpen}" class="block h-1 w-8 bg-gray-800 rounded-full transition-all duration-300"></span>
                <span [ngClass]="{'opacity-0': mobileMenuOpen}" class="block h-1 w-8 bg-gray-800 rounded-full transition-all duration-300"></span>
                <span [ngClass]="{'-rotate-45 -translate-y-3': mobileMenuOpen}" class="block h-1 w-8 bg-gray-800 rounded-full transition-all duration-300"></span>
              </div>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div [class.hidden]="!mobileMenuOpen" class="md:hidden bg-white border-t border-gray-200">
          <div class="py-2">
            <a routerLink="/" class="mobile-link" (click)="closeMobileMenu()">الرئيسية</a>
            <a routerLink="/jobs" class="mobile-link" (click)="closeMobileMenu()">الوظائف</a>
            <a routerLink="/about" class="mobile-link" (click)="closeMobileMenu()">عننا</a>
            <a routerLink="/contact" class="mobile-link" (click)="closeMobileMenu()">اتصل بنا</a>

            <ng-container *ngIf="user; else guestMobile">
              <a routerLink="/inbox" class="mobile-link" (click)="closeMobileMenu()">الرسائل</a>
              <a [routerLink]="user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'" class="mobile-link" (click)="closeMobileMenu()">لوحة التحكم</a>
              <button (click)="onLogout(); closeMobileMenu()" class="mobile-link text-red-600 font-medium">خروج</button>
            </ng-container>

            <ng-template #guestMobile>
              <a routerLink="/login" class="mobile-link" (click)="closeMobileMenu()">دخول</a>
              <a routerLink="/signup" class="mobile-link bg-indigo-600 text-white font-medium rounded-none" (click)="closeMobileMenu()">إنشاء حساب</a>
            </ng-template>
          </div>
        </div>

        <!-- Mobile Notifications Dropdown -->
        <div [class.hidden]="!mobileNotificationsOpen" class="md:hidden fixed inset-x-0 top-16 h-1/2 bg-white shadow-2xl z-50 flex flex-col">
          <div class="p-4 border-b border-gray-200 font-semibold text-lg text-right bg-gray-50">الإشعارات</div>
          <div class="flex-1 overflow-y-auto scrollbar-hide">
            <ng-container *ngIf="notifications$ | async as notifications; else loading">
              <button *ngFor="let notif of notifications.slice(0, 10)" (click)="navigateToNotification(notif); mobileNotificationsOpen = false"
                      class="w-full text-right p-3 hover:bg-indigo-50 border-b border-gray-100 flex items-start gap-3"
                      [class.font-semibold]="!notif.read" [class.bg-indigo-50]="!notif.read">
                <div class="w-2 h-2 rounded-full mt-2 flex-shrink-0" [class.bg-indigo-500]="!notif.read" [class.bg-gray-300]="notif.read"></div>
                <div class="flex-1">
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
          <a routerLink="/notifications" (click)="mobileNotificationsOpen = false" class="p-4 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium border-t border-gray-200">
            عرض جميع الإشعارات
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    /* إخفاء شريط السكرول مع الحفاظ على الوظيفة (يعمل في كل المتصفحات) */
    .scrollbar-hide {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;     /* Firefox */
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;             /* Chrome, Safari, Opera */
    }

    /* خط الهوفر تحت الروابط */
    .nav-link {
      @apply relative text-gray-700 text-base font-medium px-4 py-2 transition-all duration-300 hover:text-indigo-600;
      /* تعديل: جعل العرض يتناسب مع النص فقط ليبقى الخط داخل الكلمة */
      width: fit-content;
    }
    .nav-link::after {
      content: '';
      @apply absolute bottom-0 w-0 h-0.5 bg-indigo-600 rounded-full transition-all duration-500;
      /* تعديل: بدء الخط من 4px من اليسار */
      left: 10px;
    }
    .nav-link:hover::after,
    .active-link::after {
      @apply w-full;
    }
    .active-link {
      @apply text-indigo-600 font-bold;
    }
  `]
})
export class NavbarComponent implements OnDestroy {
  @Input() user: any = null;
  mobileMenuOpen = false;
  mobileNotificationsOpen = false;

  notificationCount$!: Observable<number>;
  notifications$!: Observable<any[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.notificationCount$ = this.notificationService.unreadCount$;
    this.notifications$ = this.notificationService.getNotifications();
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
