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
    <nav class="bg-white shadow-lg sticky top-0 z-50 border-b border-slate-200">
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

            <!-- لو مسجل دخول -->
            <ng-container *ngIf="user; else guestDesktop">
              <!-- الإشعارات (Desktop) -->
              <div class="relative group">
                <button class="nav-link flex items-center gap-2 relative">
                  الإشعارات
                  <ng-container *ngIf="notificationCount$ | async as count">
                    <span *ngIf="count > 0" class="absolute -top-2 -end-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {{ count > 9 ? '9+' : count }}
                    </span>
                  </ng-container>
                </button>

                <div class="absolute end-0 mt-3 w-80 lg:w-96 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div class="p-4 border-b border-slate-200 font-semibold text-lg lg:text-xl">الإشعارات</div>
                  <div class="max-h-80 lg:max-h-96 overflow-y-auto">
                    <ng-container *ngIf="notifications$ | async as notifications; else loading">
                      <button *ngFor="let notif of notifications.slice(0, 10)" (click)="navigateToNotification(notif)"
                              class="w-full p-3 lg:p-4 hover:bg-slate-50 border-b border-slate-100 flex items-start gap-3 lg:gap-4 text-right rounded-lg"
                              [class.font-semibold]="!notif.read" [class.bg-slate-50]="!notif.read">
                        <div class="w-3 h-3 rounded-full mt-2 lg:mt-3 flex-shrink-0" [class.bg-slate-500]="!notif.read" [class.bg-slate-300]="notif.read"></div>
                        <div>
                          <p class="text-sm lg:text-base">{{ notif.message }}</p>
                          <p class="text-xs lg:text-sm text-slate-500 mt-1">{{ notif.createdAt | date:'short' }}</p>
                        </div>
                      </button>
                      <div *ngIf="notifications.length === 0" class="p-6 lg:p-8 text-center text-slate-500">
                        لا توجد إشعارات جديدة
                      </div>
                    </ng-container>
                    <ng-template #loading>
                      <div class="p-6 lg:p-8 text-center text-slate-400">جاري التحميل...</div>
                    </ng-template>
                  </div>
                  <a routerLink="/notifications" class="block p-4 text-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-b-xl">
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
                       class="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover ring-2 ring-slate-300 shadow-md">
                  <span class="text-slate-700 font-medium hidden lg:block text-base lg:text-lg">{{ user.name || 'مستخدم' }}</span>
                </button>

                <div class="absolute end-0 mt-3 w-56 lg:w-64 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <a routerLink="/profile" class="block px-5 py-3 lg:px-6 lg:py-4 hover:bg-slate-50 text-right font-medium text-slate-700 border-b border-slate-100 rounded-t-xl">
                    الملف الشخصي
                  </a>
                  <button (click)="onLogout()" class="w-full text-right px-5 py-3 lg:px-6 lg:py-4 hover:bg-red-50 text-red-600 font-medium rounded-b-xl">
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </ng-container>

            <!-- لو ضيف -->
            <ng-template #guestDesktop>
              <a routerLink="/login" class="nav-link" routerLinkActive="active-link">دخول</a>
              <a routerLink="/signup" class="btn-primary px-5 py-2 lg:px-7 lg:py-3 rounded-xl text-base lg:text-lg">إنشاء حساب</a>
            </ng-template>
          </div>

          <!-- Mobile Buttons -->
          <div class="md:hidden flex items-center gap-3 lg:gap-4">
            <ng-container *ngIf="user">
              <button (click)="mobileNotificationsOpen = !mobileNotificationsOpen; mobileMenuOpen = false" class="relative p-2">
                <i class="fas fa-bell text-xl lg:text-2xl text-slate-700"></i>
                <ng-container *ngIf="notificationCount$ | async as count">
                  <span *ngIf="count > 0" class="absolute -top-1 -end-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{ count > 9 ? '9+' : count }}
                  </span>
                </ng-container>
              </button>
            </ng-container>

            <button (click)="mobileMenuOpen = !mobileMenuOpen; mobileNotificationsOpen = false" class="p-2">
              <div class="w-7 h-7 lg:w-8 lg:h-8 flex flex-col justify-center gap-1">
                <span [ngClass]="{'rotate-45 translate-y-2 lg:translate-y-2.5': mobileMenuOpen}" class="block h-0.5 w-full bg-slate-800 rounded transition-all duration-300"></span>
                <span [ngClass]="{'opacity-0': mobileMenuOpen}" class="block h-0.5 w-full bg-slate-800 rounded transition-all duration-300"></span>
                <span [ngClass]="{'-rotate-45 -translate-y-2 lg:-translate-y-2.5': mobileMenuOpen}" class="block h-0.5 w-full bg-slate-800 rounded transition-all duration-300"></span>
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
      }" class="fixed top-14 sm:top-16 left-0 right-0 bg-white shadow-xl z-50 transition-transform duration-500 ease-in-out md:hidden border-t border-slate-200 rounded-b-xl">

        <div class="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 class="text-lg font-bold">{{ mobileNotificationsOpen ? 'الإشعارات' : 'القائمة' }}</h2>
          <button (click)="closeMobileMenu()" class="p-2">
            <i class="fas fa-times text-xl text-slate-600"></i>
          </button>
        </div>

        <!-- محتوى الإشعارات على الموبايل -->
        <div *ngIf="mobileNotificationsOpen" class="p-4">
          <div class="max-h-80 overflow-y-auto">
            <ng-container *ngIf="notifications$ | async as notifications; else loadingMobile">
              <button *ngFor="let notif of notifications.slice(0, 20)" (click)="navigateToNotification(notif)"
                      class="w-full p-4 hover:bg-slate-50 border-b border-slate-100 flex items-start gap-4 text-right mb-2 rounded-xl"
                      [class.font-semibold]="!notif.read" [class.bg-slate-50]="!notif.read">
                <div class="w-3 h-3 rounded-full mt-2 flex-shrink-0" [class.bg-slate-500]="!notif.read" [class.bg-slate-300]="notif.read"></div>
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
          <a routerLink="/notifications" (click)="closeMobileMenu()" class="block mt-4 p-4 text-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-xl">
            عرض جميع الإشعارات
          </a>
        </div>

        <!-- محتوى المنيو على الموبايل -->
        <div *ngIf="mobileMenuOpen && !mobileNotificationsOpen" class="p-4">
          <ng-container *ngIf="user; else guestMobile">
            <a routerLink="/inbox" (click)="closeMobileMenu()" class="block py-3 px-4 text-base hover:bg-slate-100 rounded-xl text-right">الرسائل</a>
            <a [routerLink]="user.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
               (click)="closeMobileMenu()" class="block py-3 px-4 text-base hover:bg-slate-100 rounded-xl text-right">لوحة التحكم</a>
            <a routerLink="/profile" (click)="closeMobileMenu()" class="block py-3 px-4 text-base hover:bg-slate-100 rounded-xl text-right">الملف الشخصي</a>
            <hr class="my-4">
            <button (click)="onLogout()" class="w-full py-3 px-4 text-base hover:bg-red-50 text-red-600 rounded-xl text-right font-medium">
              تسجيل الخروج
            </button>
          </ng-container>

          <ng-template #guestMobile>
            <a routerLink="/login" (click)="closeMobileMenu()" class="block py-3 px-4 text-base hover:bg-slate-100 rounded-xl text-right">دخول</a>
            <a routerLink="/signup" (click)="closeMobileMenu()" class="block py-3 px-4 text-base bg-slate-600 text-white hover:bg-slate-700 rounded-xl text-right font-medium">إنشاء حساب</a>
          </ng-template>

          <hr class="my-4">
          <div class="space-y-2">
            <a routerLink="/" (click)="closeMobileMenu()" class="block py-3 px-4 text-base hover:bg-slate-100 rounded-xl text-right">الرئيسية</a>
            <a routerLink="/jobs" (click)="closeMobileMenu()" class="block py-3 px-4 text-base hover:bg-slate-100 rounded-xl text-right">الوظائف</a>
            <a routerLink="/about" (click)="closeMobileMenu()" class="block py-3 px-4 text-base hover:bg-slate-100 rounded-xl text-right">عننا</a>
            <a routerLink="/contact" (click)="closeMobileMenu()" class="block py-3 px-4 text-base hover:bg-slate-100 rounded-xl text-right">اتصل بنا</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      @apply text-slate-700 hover:text-slate-600 font-medium transition-colors duration-200 relative text-base lg:text-lg;
    }
    .active-link::after {
      content: '';
      @apply absolute bottom-[-6px] left-0 right-0 h-0.5 bg-slate-600 rounded-full;
    }
    .btn-primary {
      @apply bg-slate-600
