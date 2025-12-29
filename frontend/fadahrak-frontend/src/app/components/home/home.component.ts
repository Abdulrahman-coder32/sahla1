import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex flex-col">
      <!-- Hero Section -->
      <section class="bg-gradient-to-r from-slate-900 via-gray-900 to-black text-white py-20 md:py-28 lg:py-36 text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-40"></div>
        <div class="max-w-5xl mx-auto px-6 sm:px-8 relative z-10">
          <h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-8 leading-tight">
            مرحباً بك في <span class="text-gray-300">سَهلة</span>
          </h1>
          <p class="text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed px-4 text-gray-200">
            ابحث عن <strong class="text-gray-300">وظائف محلية حقيقية</strong> في مصر، أو انشر فرص عمل في محلك بسهولة<br class="hidden sm:block">
            تواصل مباشر مع الباحثين عن عمل أو أصحاب الأعمال – بدون وسطاء أو تعقيد
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-8">
            <ng-container *ngIf="isLoggedIn; else guestButtons">
              <a [routerLink]="user?.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 class="btn-primary px-10 py-4 md:px-12 md:py-5 rounded-full flex items-center justify-center gap-4 text-lg md:text-xl font-bold transition-all hover:scale-105 shadow-2xl">
                <i class="fas fa-tachometer-alt text-xl"></i>
                لوحة التحكم
              </a>
              <a routerLink="/jobs"
                 class="btn-secondary px-10 py-4 md:px-12 md:py-5 rounded-full flex items-center justify-center gap-4 text-lg md:text-xl font-bold transition-all hover:scale-105">
                <i class="fas fa-search text-xl"></i>
                تصفح الوظائف
              </a>
            </ng-container>
            <ng-template #guestButtons>
              <a routerLink="/jobs"
                 class="btn-primary px-10 py-4 md:px-12 md:py-5 rounded-full flex items-center justify-center gap-4 text-lg md:text-xl font-bold transition-all hover:scale-105 shadow-2xl">
                <i class="fas fa-search text-xl"></i>
                ابحث عن وظائف
              </a>
              <a routerLink="/signup"
                 class="btn-secondary px-10 py-4 md:px-12 md:py-5 rounded-full flex items-center justify-center gap-4 text-lg md:text-xl font-bold transition-all hover:scale-105">
                <i class="fas fa-user-plus text-xl"></i>
                إنشاء حساب
              </a>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-20 md:py-28 lg:py-36 bg-white">
        <div class="max-w-6xl mx-auto px-6 sm:px-8 text-center">
          <h2 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-20">
            كيف تعمل <span class="text-slate-800">سَهلة</span>؟
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            <div class="home-card p-10 text-center transition-all hover:shadow-2xl hover:-translate-y-2">
              <i class="fas fa-user-plus text-6xl text-slate-800 mb-8"></i>
              <h3 class="text-3xl font-bold text-slate-800 mb-6">1. أنشئ حسابك</h3>
              <p class="text-slate-600 leading-relaxed text-lg">
                سجل كباحث عن عمل أو صاحب محل في ثواني معدودة
              </p>
            </div>
            <div class="home-card p-10 text-center transition-all hover:shadow-2xl hover:-translate-y-2">
              <i class="fas fa-briefcase text-6xl text-slate-800 mb-8"></i>
              <h3 class="text-3xl font-bold text-slate-800 mb-6">2. ابحث أو انشر</h3>
              <p class="text-slate-600 leading-relaxed text-lg">
                اعرض مهاراتك أو انشر وظيفة محلية بكل سهولة ووضوح
              </p>
            </div>
            <div class="home-card p-10 text-center transition-all hover:shadow-2xl hover:-translate-y-2">
              <i class="fas fa-comments text-6xl text-slate-800 mb-8"></i>
              <h3 class="text-3xl font-bold text-slate-800 mb-6">3. تواصل مباشر</h3>
              <p class="text-slate-600 leading-relaxed text-lg">
                دردش فوراً بعد قبول الطلب – بدون انتظار أو تعقيد
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Success Stories -->
      <section class="py-20 md:py-28 lg:py-36 bg-gradient-to-br from-gray-50 to-slate-100">
        <div class="max-w-4xl mx-auto text-center px-6">
          <h2 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-10">
            قصص نجاح حقيقية
          </h2>
          <p class="text-xl md:text-2xl text-slate-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            آلاف الأشخاص وجدوا فرصهم أو موظفيهم المثاليين من خلال سَهلة
          </p>
          <a routerLink="/success-stories"
             class="btn-primary px-12 py-5 md:px-16 md:py-6 rounded-full inline-flex items-center gap-5 text-xl md:text-2xl font-bold transition-all hover:scale-105 shadow-2xl">
            <i class="fas fa-trophy text-2xl"></i>
            شوف قصص عملائنا
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* تنسيقات خاصة بالـ Home Page - بدون أي indigo */
    .btn-primary {
      @apply bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-full shadow-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1;
    }
    .btn-secondary {
      @apply bg-transparent hover:bg-white/10 text-white font-bold rounded-full border-2 border-white transition-all duration-300 backdrop-blur-sm;
    }
    .home-card {
      @apply bg-white rounded-2xl shadow-xl border border-slate-200 p-10 transition-all duration-500 hover:border-slate-400 hover:shadow-2xl hover:-translate-y-2;
    }
    /* تحسين الخلفية العامة */
    body {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }
    /* تحسين الـ Hero text */
    .text-gray-300 {
      text-shadow: 0 2px 10px rgba(0,0,0,0.4);
    }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit {
  isLoggedIn = false;
  user: any = null;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user: any) => {
      this.user = user;
      this.isLoggedIn = !!user;
    });
  }

  ngAfterViewInit() {
    this.scrollToTop();
  }

  private scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
