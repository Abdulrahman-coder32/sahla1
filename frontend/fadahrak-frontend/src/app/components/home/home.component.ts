import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Hero Section -->
      <section class="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white py-16 md:py-24 lg:py-32 text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="max-w-5xl mx-auto px-6 sm:px-8 relative z-10">
          <h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
            مرحباً بك في <span class="text-yellow-300">سَهلة</span>
          </h1>
          <p class="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            ابحث عن <strong>وظائف محلية حقيقية</strong> في مصر، أو انشر فرص عمل في محلك بسهولة<br class="hidden sm:block">
            تواصل مباشر مع الباحثين عن عمل أو أصحاب الأعمال – بدون وسطاء
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-6">
            <ng-container *ngIf="isLoggedIn; else guestButtons">
              <a [routerLink]="user?.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 class="btn-primary px-8 py-3 md:px-10 md:py-4 rounded-full flex items-center justify-center gap-3 transition hover:scale-105 font-semibold">
                <i class="fas fa-tachometer-alt"></i>
                لوحة التحكم
              </a>
              <a routerLink="/jobs"
                 class="btn-secondary px-8 py-3 md:px-10 md:py-4 rounded-full flex items-center justify-center gap-3 transition hover:scale-105 font-semibold">
                <i class="fas fa-search"></i>
                تصفح الوظائف
              </a>
            </ng-container>

            <ng-template #guestButtons>
              <a routerLink="/jobs"
                 class="btn-primary px-8 py-3 md:px-10 md:py-4 rounded-full flex items-center justify-center gap-3 transition hover:scale-105 font-semibold">
                <i class="fas fa-search"></i>
                ابحث عن وظائف
              </a>
              <a routerLink="/signup"
                 class="btn-secondary px-8 py-3 md:px-10 md:py-4 rounded-full flex items-center justify-center gap-3 transition hover:scale-105 font-semibold">
                <i class="fas fa-user-plus"></i>
                إنشاء حساب
              </a>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-16 md:py-24 lg:py-32 bg-white">
        <div class="max-w-6xl mx-auto px-6 sm:px-8 text-center">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-16">
            كيف تعمل <span class="text-indigo-600">سَهلة</span>؟
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            <div class="card p-8 text-center transition hover:shadow-xl">
              <i class="fas fa-user-plus text-5xl text-indigo-600 mb-6"></i>
              <h3 class="text-2xl font-bold mb-4">1. أنشئ حسابك</h3>
              <p class="text-gray-600 leading-relaxed text-lg">
                سجل كباحث عن عمل أو صاحب محل في ثواني معدودة
              </p>
            </div>

            <div class="card p-8 text-center transition hover:shadow-xl">
              <i class="fas fa-briefcase text-5xl text-indigo-600 mb-6"></i>
              <h3 class="text-2xl font-bold mb-4">2. ابحث أو انشر</h3>
              <p class="text-gray-600 leading-relaxed text-lg">
                اعرض مهاراتك أو انشر وظيفة محلية بكل سهولة ووضوح
              </p>
            </div>

            <div class="card p-8 text-center transition hover:shadow-xl">
              <i class="fas fa-comments text-5xl text-indigo-600 mb-6"></i>
              <h3 class="text-2xl font-bold mb-4">3. تواصل مباشر</h3>
              <p class="text-gray-600 leading-relaxed text-lg">
                دردش فوراً بعد قبول الطلب – بدون انتظار أو تعقيد
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Success Stories -->
      <section class="py-16 md:py-24 lg:py-32 bg-gray-100">
        <div class="max-w-4xl mx-auto text-center px-6">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-8">
            قصص نجاح حقيقية
          </h2>
          <p class="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            آلاف الأشخاص وجدوا فرصهم أو موظفيهم المثاليين من خلال سَهلة
          </p>
          <a routerLink="/success-stories"
             class="btn-primary px-10 py-4 rounded-full inline-flex items-center gap-3 transition hover:scale-105 font-semibold">
            <i class="fas fa-trophy"></i>
            شوف قصص عملائنا
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .btn-primary {
      background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
      color: #4f46e5;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
    }

    .btn-primary:hover {
      box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
    }

    .btn-secondary {
      background: transparent;
      border: 2px solid #ffffff;
      color: #ffffff;
      font-weight: bold;
    }

    .btn-secondary:hover {
      background: #ffffff;
      color: #4f46e5;
    }

    .card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 10px 30px rgba(79, 70, 229, 0.15);
    }

    .min-h-screen {
      min-height: 100vh;
      min-height: -webkit-fill-available;
    }

    /* منع الزوم على الموبايل */
    * {
      -webkit-text-size-adjust: 100%;
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
