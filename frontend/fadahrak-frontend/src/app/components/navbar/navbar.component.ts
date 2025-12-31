import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-content">
          <!-- Logo -->
          <div class="logo-wrapper">
            <a routerLink="/" (click)="closeMobileMenu()">
              <img src="assets/logo.png" alt="سَهلة" class="logo">
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="desktop-nav">
            <a routerLink="/" class="nav-link" routerLinkActive="active-link">الرئيسية</a>
            <a routerLink="/jobs" class="nav-link" routerLinkActive="active-link">الوظائف</a>
            <a routerLink="/about" class="nav-link" routerLinkActive="active-link">عننا</a>
            <a routerLink="/contact" class="nav-link" routerLinkActive="active-link">اتصل بنا</a>

            <ng-container *ngIf="currentUser$ | async as user; else guestDesktop">
              <!-- Notifications -->
              <div class="dropdown-wrapper">
                <button class="nav-link notifications-btn">
                  الإشعارات
                  <ng-container *ngIf="notificationCount$ | async as count">
                    <span *ngIf="count > 0" class="notification-badge">
                      {{ count > 9 ? '9+' : count }}
                    </span>
                  </ng-container>
                </button>
                <div class="dropdown-menu notifications-dropdown">
                  <div class="dropdown-header">الإشعارات</div>
                  <div class="dropdown-body">
                    <ng-container *ngIf="notifications$ | async as notifications; else loadingNotifications">
                      <button *ngFor="let notif of notifications.slice(0, 10)"
                              (click)="navigateToNotification(notif)"
                              class="notification-item"
                              [class.unread]="!notif.read">
                        <div class="unread-dot" [class.visible]="!notif.read"></div>
                        <div class="notification-content">
                          <p class="notification-message">{{ notif.message }}</p>
                          <p class="notification-time">{{ notif.createdAt | date:'short' }}</p>
                        </div>
                      </button>
                      <div *ngIf="notifications.length === 0" class="no-notifications">
                        لا توجد إشعارات جديدة
                      </div>
                    </ng-container>
                    <ng-template #loadingNotifications>
                      <div class="loading-notifications">جاري التحميل...</div>
                    </ng-template>
                  </div>
                  <a routerLink="/notifications" class="dropdown-footer">
                    عرض جميع الإشعارات
                  </a>
                </div>
              </div>

              <a routerLink="/inbox" class="nav-link" routerLinkActive="active-link">الرسائل</a>
              <a [routerLink]="user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 class="nav-link" routerLinkActive="active-link">لوحة التحكم</a>

              <!-- Profile Dropdown -->
              <div class="dropdown-wrapper">
                <button class="profile-btn">
                  <img [src]="getProfileImage(user)"
                       alt="صورة الملف الشخصي"
                       class="profile-avatar"
                       (error)="handleImageError($event)">
                  <div class="profile-info">
                    <span class="profile-name">{{ user.name || 'مستخدم' }}</span>
                    <span class="profile-email">{{ user.email || '' }}</span>
                  </div>
                </button>
                <div class="dropdown-menu profile-dropdown">
                  <a routerLink="/profile" class="dropdown-item">الملف الشخصي</a>
                  <button (click)="onLogout()" class="dropdown-item logout-btn">
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </ng-container>

            <ng-template #guestDesktop>
              <a routerLink="/login" class="nav-link" routerLinkActive="active-link">دخول</a>
              <a routerLink="/signup" class="btn-signup">إنشاء حساب</a>
            </ng-template>
          </div>

          <!-- Mobile Buttons -->
          <div class="mobile-buttons">
            <ng-container *ngIf="currentUser$ | async">
              <button (click)="toggleNotifications()" class="mobile-btn">
                <i class="fas fa-bell"></i>
                <ng-container *ngIf="notificationCount$ | async as count">
                  <span *ngIf="count > 0" class="mobile-notification-badge">
                    {{ count > 9 ? '9+' : count }}
                  </span>
                </ng-container>
              </button>
            </ng-container>
            <button (click)="toggleMenu()" class="mobile-btn hamburger">
              <div class="hamburger-lines" [class.open]="mobileMenuOpen">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Sidebar -->
      <div *ngIf="mobileMenuOpen || mobileNotificationsOpen" class="mobile-overlay" (click)="closeMobileMenu()"></div>
      <div class="mobile-sidebar" [class.open]="mobileMenuOpen || mobileNotificationsOpen">
        <div class="mobile-header">
          <ng-container *ngIf="currentUser$ | async as user">
            <img [src]="getProfileImage(user)"
                 alt="صورة الملف الشخصي"
                 class="mobile-avatar"
                 (error)="handleImageError($event)">
            <div class="mobile-user-info">
              <h2 class="mobile-user-name">{{ user.name || 'مستخدم' }}</h2>
              <p class="mobile-user-email">{{ user.email || '' }}</p>
            </div>
          </ng-container>
         
        </div>

        <div class="mobile-content">
          <div *ngIf="mobileNotificationsOpen" class="mobile-notifications">
            <ng-container *ngIf="notifications$ | async as notifications; else loadingMobileNotifications">
              <button *ngFor="let notif of notifications.slice(0, 20)"
                      (click)="navigateToNotification(notif)"
                      class="mobile-notification-item"
                      [class.unread]="!notif.read">
                <div class="mobile-unread-dot" [class.visible]="!notif.read"></div>
                <div class="mobile-notification-content">
                  <p class="mobile-notification-message">{{ notif.message }}</p>
                  <p class="mobile-notification-time">{{ notif.createdAt | date:'medium' }}</p>
                </div>
              </button>
              <div *ngIf="notifications.length === 0" class="mobile-no-notifications">
                لا توجد إشعارات جديدة
              </div>
            </ng-container>
            <ng-template #loadingMobileNotifications>
              <div class="mobile-loading-notifications">جاري التحميل...</div>
            </ng-template>
          </div>

          <div *ngIf="mobileMenuOpen && !mobileNotificationsOpen" class="mobile-menu">
            <ng-container *ngIf="currentUser$ | async as user; else guestMobileMenu">
              <a routerLink="/inbox" (click)="closeMobileMenu()" class="mobile-menu-link">الرسائل</a>
              <a [routerLink]="user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 (click)="closeMobileMenu()" class="mobile-menu-link">لوحة التحكم</a>
              <a routerLink="/profile" (click)="closeMobileMenu()" class="mobile-menu-link">الملف الشخصي</a>
              <hr class="menu-divider">
              <button (click)="onLogout(); closeMobileMenu()" class="mobile-logout-btn">
                تسجيل الخروج
              </button>
            </ng-container>

            <ng-template #guestMobileMenu>
              <a routerLink="/login" (click)="closeMobileMenu()" class="mobile-menu-link">دخول</a>
              <a routerLink="/signup" (click)="closeMobileMenu()" class="mobile-menu-link signup">إنشاء حساب</a>
            </ng-template>

            <hr class="menu-divider">
            <div class="mobile-common-links">
              <a routerLink="/" (click)="closeMobileMenu()" class="mobile-menu-link">الرئيسية</a>
              <a routerLink="/jobs" (click)="closeMobileMenu()" class="mobile-menu-link">الوظائف</a>
              <a routerLink="/about" (click)="closeMobileMenu()" class="mobile-menu-link">عننا</a>
              <a routerLink="/contact" (click)="closeMobileMenu()" class="mobile-menu-link">اتصل بنا</a>
            </div>
          </div>
        </div>

        <div *ngIf="mobileNotificationsOpen" class="mobile-footer">
          <a routerLink="/notifications" (click)="closeMobileMenu()" class="mobile-footer-link">
            عرض جميع الإشعارات
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 1px solid #E5E7EB;
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .navbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 4.5rem;
    }

    .logo-wrapper {
      display: flex;
      align-items: center;
    }

    .logo {
      height: 2.75rem;
      width: auto;
      transition: transform 0.3s ease;
    }

    .logo:hover {
      transform: scale(1.05);
    }

    .desktop-nav {
      display: none;
      align-items: center;
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .desktop-nav {
        display: flex;
      }
    }

    .nav-link {
      color: #374151;
      font-weight: 600;
      font-size: 1.0625rem;
      position: relative;
      transition: color 0.3s ease;
      padding: 0.5rem 0;
    }

    .nav-link:hover {
      color: #0EA5E9;
    }

    .active-link {
      color: #0EA5E9;
      font-weight: 700;
    }

    .active-link::after {
      content: '';
      position: absolute;
      bottom: -12px;
      left: 0;
      right: 0;
      height: 3px;
      background: #0EA5E9;
      border-radius: 2px;
    }

    .dropdown-wrapper {
      position: relative;
    }

    .notifications-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .notification-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #FEE2E2;
      color: #DC2626;
      font-size: 0.75rem;
      font-weight: 700;
      min-width: 1.25rem;
      height: 1.25rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.75rem;
      width: 320px;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid #E5E7EB;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 50;
    }

    .dropdown-wrapper:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
    }

    .dropdown-header {
      padding: 1rem;
      border-bottom: 1px solid #E5E7EB;
      font-weight: 700;
      font-size: 1.125rem;
      color: #1F2937;
    }

    .dropdown-body {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      width: 100%;
      padding: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      text-align: right;
      transition: background 0.3s ease;
      border-bottom: 1px solid #F3F4F6;
    }

    .notification-item:hover {
      background: #F8FAFC;
    }

    .notification-item.unread {
      background: #F0F9FF;
      font-weight: 600;
    }

    .unread-dot {
      width: 0.5rem;
      height: 0.5rem;
      background: #0EA5E9;
      border-radius: 50%;
      margin-top: 0.5rem;
      flex-shrink: 0;
      opacity: 0;
    }

    .unread-dot.visible {
      opacity: 1;
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      color: #374151;
      margin: 0;
      line-height: 1.5;
    }

    .notification-time {
      font-size: 0.875rem;
      color: #9CA3AF;
      margin-top: 0.25rem;
    }

    .no-notifications, .loading-notifications {
      padding: 2rem;
      text-align: center;
      color: #9CA3AF;
    }

    .dropdown-footer {
      display: block;
      padding: 1rem;
      text-align: center;
      background: #F8FAFC;
      color: #0EA5E9;
      font-weight: 600;
      border-radius: 0 0 1rem 1rem;
      transition: background 0.3s ease;
    }

    .dropdown-footer:hover {
      background: #E0F2FE;
    }

    .profile-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 9999px;
      transition: all 0.3s ease;
    }

    .profile-btn:hover {
      background: #F0F9FF;
    }

    .profile-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #E0F2FE;
    }

    .profile-info {
      display: none;
      text-align: right;
    }

    @media (min-width: 1024px) {
      .profile-info {
        display: block;
      }

      .profile-name {
        font-weight: 600;
        color: #374151;
        font-size: 1rem;
      }

      .profile-email {
        font-size: 0.875rem;
        color: #6B7280;
        margin-top: 0.25rem;
      }
    }

    .profile-dropdown {
      width: 220px;
    }

    .dropdown-item {
      width: 100%;
      padding: 1rem;
      text-align: right;
      color: #374151;
      font-weight: 500;
      transition: background 0.3s ease;
      border-bottom: 1px solid #F3F4F6;
    }

    .dropdown-item:hover {
      background: #F8FAFC;
    }

    .logout-btn {
      color: #DC2626;
    }

    .logout-btn:hover {
      background: #FEE2E2;
    }

    .btn-signup {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      transition: all 0.3s ease;
    }

    .btn-signup:hover {
      background: #B2DDFA;
    }

    .mobile-buttons {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    @media (min-width: 768px) {
      .mobile-buttons {
        display: none;
      }
    }

    .mobile-btn {
      background: transparent;
      border: none;
      color: #374151;
      font-size: 1.5rem;
      cursor: pointer;
      position: relative;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: background 0.3s ease;
    }

    .mobile-btn:hover {
      background: #F3F4F6;
    }

    .mobile-notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #FEE2E2;
      color: #DC2626;
      font-size: 0.75rem;
      font-weight: 700;
      min-width: 1.25rem;
      height: 1.25rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .hamburger-lines {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      transition: all 0.3s ease;
    }

    .hamburger-lines span {
      width: 1.75rem;
      height: 0.1875rem;
      background: #374151;
      border-radius: 9999px;
      transition: all 0.3s ease;
    }

    .hamburger-lines.open span:nth-child(1) {
      transform: rotate(45deg) translate(0.375rem, 0.375rem);
    }

    .hamburger-lines.open span:nth-child(2) {
      opacity: 0;
    }

    .hamburger-lines.open span:nth-child(3) {
      transform: rotate(-45deg) translate(0.375rem, -0.375rem);
    }

    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 40;
    }

    .mobile-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 80%;
      max-width: 320px;
      height: 100%;
      background: white;
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
      z-index: 50;
      transform: translateX(100%);
      transition: transform 0.4s ease;
      display: flex;
      flex-direction: column;
    }

    .mobile-sidebar.open {
      transform: translateX(0);
    }

    .mobile-header {
      padding: 1.5rem;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
    }

    .mobile-avatar {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #E0F2FE;
    }

    .mobile-user-info {
      flex: 1;
    }

    .mobile-user-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0;
    }

    .mobile-user-email {
      font-size: 0.9375rem;
      color: #6B7280;
      margin: 0.25rem 0 0;
    }

    .close-sidebar-btn {
      background: transparent;
      border: none;
      color: #6B7280;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: background 0.3s ease;
    }

    .close-sidebar-btn:hover {
      background: #F3F4F6;
    }

    .mobile-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .mobile-notifications {
      padding: 0 1rem;
    }

    .mobile-notification-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-bottom: 1px solid #F3F4F6;
      transition: background 0.3s ease;
    }

    .mobile-notification-item:hover {
      background: #F8FAFC;
    }

    .mobile-notification-item.unread {
      background: #F0F9FF;
      font-weight: 600;
    }

    .mobile-unread-dot {
      width: 0.5rem;
      height: 0.5rem;
      background: #0EA5E9;
      border-radius: 50%;
      margin-top: 0.5rem;
      flex-shrink: 0;
      opacity: 0;
    }

    .mobile-unread-dot.visible {
      opacity: 1;
    }

    .mobile-notification-content {
      flex: 1;
    }

    .mobile-notification-message {
      color: #374151;
      margin: 0;
      line-height: 1.5;
    }

    .mobile-notification-time {
      font-size: 0.875rem;
      color: #9CA3AF;
      margin-top: 0.25rem;
    }

    .mobile-no-notifications, .mobile-loading-notifications {
      padding: 2rem;
      text-align: center;
      color: #9CA3AF;
    }

    .mobile-menu {
      padding: 0 1rem;
    }

    .mobile-menu-link {
      display: block;
      padding: 1rem;
      color: #374151;
      font-weight: 500;
      font-size: 1.125rem;
      border-bottom: 1px solid #F3F4F6;
      transition: background 0.3s ease;
    }

    .mobile-menu-link:hover {
      background: #F8FAFC;
    }

    .mobile-menu-link.signup {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
    }

    .mobile-menu-link.signup:hover {
      background: #B2DDFA;
    }

    .menu-divider {
      margin: 1rem 0;
      border-color: #E5E7EB;
    }

    .mobile-logout-btn {
      display: block;
      width: 100%;
      padding: 1rem;
      color: #DC2626;
      font-weight: 600;
      font-size: 1.125rem;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .mobile-logout-btn:hover {
      background: #FEE2E2;
    }

    .mobile-footer {
      padding: 1rem;
      border-top: 1px solid #E5E7EB;
      background: white;
    }

    .mobile-footer-link {
      display: block;
      text-align: center;
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      padding: 1rem;
      border-radius: 1rem;
      transition: background 0.3s ease;
    }

    .mobile-footer-link:hover {
      background: #B2DDFA;
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  currentUser$ = this.authService.user$;
  notificationCount$!: Observable<number>;
  notifications$!: Observable<any[]>;
  mobileMenuOpen = false;
  mobileNotificationsOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.notificationCount$ = this.notificationService.unreadCount$;
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {}

  getProfileImage(user: any): string {
    if (user?.profileImage) {
      return user.profileImage;
    }
    return 'assets/default-profile.png';
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/default-profile.png';
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
