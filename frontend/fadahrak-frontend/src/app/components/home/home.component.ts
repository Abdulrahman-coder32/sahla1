import { Component, OnInit, AfterViewInit } from '@angular/core';  // ← أضفت AfterViewInit
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 p-2 sm:p-4 flex flex-col">  <!-- ← تحسين: أضفت flex flex-col للريسبونسفية -->
      <section class="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white py-16 md:py-20 lg:py-32 text-center relative overflow-hidden flex-1">  <!-- ← تحسين: غيرت py-20 إلى py-16 md:py-20 lg:py-32 للريسبونسفية -->
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">  <!-- ← تحسين: أضفت px-4 sm:px-6 للريسبونسفية -->
          <h1 class="text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight flex items-center justify-center gap-2 md:gap-4">  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
            مرحباً بك في سَهلة
          </h1>
          <p class="text-base md:text-lg lg:text-2xl xl:text-3xl mb-6 md:mb-10 max-w-3xl mx-auto px-2 md:px-4">  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
            ابحث عن وظائف محلية في مصر أو انشر فرص عمل بسهولة. تواصل مباشر مع أصحاب العمل.
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 px-2 md:px-4">  <!-- ← تحسين: غيرت md:flex-row إلى sm:flex-row و gap للريسبونسفية -->
            <ng-container *ngIf="isLoggedIn; else guestButtons">
              <a [routerLink]="user?.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 class="btn-primary text-base md:text-lg lg:text-xl px-4 md:px-6 lg:px-10 xl:px-12 py-2 md:py-3 lg:py-4 xl:py-5 rounded-full flex items-center justify-center gap-2 md:gap-3 transition hover:scale-105">  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
                <i class="fas fa-tachometer-alt icon"></i>
                لوحة التحكم
              </a>
              <a routerLink="/jobs" class="btn-secondary text-base md:text-lg lg:text-xl px-4 md:px-6 lg:px-10 xl:px-12 py-2 md:py-3 lg:py-4 xl:py-5 rounded-full flex items-center justify-center gap-2 md:gap-3 transition hover:scale-105">  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
                <i class="fas fa-search icon"></i>
                تصفح الوظائف
              </a>
            </ng-container>

            <ng-template #guestButtons>
              <a routerLink="/jobs" class="btn-primary text-base md:text-lg lg:text-xl px-4 md:px-6 lg:px-10 xl:px-12 py-2 md:py-3 lg:py-4 xl:py-5 rounded-full flex items-center justify-center gap-2 md:gap-3 transition hover:scale-105">  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
                <i class="fas fa-search icon"></i>
                ابحث عن وظائف
              </a>
              <a routerLink="/signup" class="btn-secondary text-base md:text-lg lg:text-xl px-4 md:px-6 lg:px-10 xl:px-12 py-2 md:py-3 lg:py-4 xl:py-5 rounded-full flex items-center justify-center gap-2 md:gap-3 transition hover:scale-105">  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
                <i class="fas fa-user-plus icon"></i>
                إنشاء حساب
              </a>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- باقي الصفحة responsive -->
      <section class="py-12 md:py-16 lg:py-24 bg-white flex-1">  <!-- ← تحسين: غيرت py-16 إلى py-12 md:py-16 lg:py-24 -->
        <div class="max-w-6xl mx-auto px-4 sm:px-6">  <!-- ← تحسين: أضفت px-4 sm:px-6 -->
          <h2 class="section-title text-2xl md:text-3xl lg:text-4xl xl:text-5xl">كيف تعمل سَهلة؟</h2>  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">  <!-- ← تحسين: أضفت sm:grid-cols-2 للريسبونسفية -->
            <div class="card p-4 md:p-6 lg:p-8 xl:p-12 text-center transition hover:shadow-lg">  <!-- ← تحسين: غيرت p-6 إلى p-4 md:p-6 lg:p-8 xl:p-12 -->
              <i class="fas fa-user-plus icon-lg text-primary mb-4"></i>
              <h3 class="text-lg md:text-xl lg:text-2xl font-bold mb-4">1. أنشئ حسابك</h3>  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
              <p class="text-gray-600 leading-relaxed text-sm md:text-base lg:text-lg">سجل كباحث عن عمل أو صاحب محل في ثواني.</p>  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
            </div>
            <div class="card p-4 md:p-6 lg:p-8 xl:p-12 text-center transition hover:shadow-lg">  <!-- ← تحسين: غيرت p-6 إلى p-4 md:p-6 lg:p-8 xl:p-12 -->
              <i class="fas fa-briefcase icon-lg text-primary mb-4"></i>
              <h3 class="text-lg md:text-xl lg:text-2xl font-bold mb-4">2. ابحث أو انشر</h3>  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
              <p class="text-gray-600 leading-relaxed text-sm md:text-base lg:text-lg">اعرض مهاراتك أو انشر وظيفة محلية بسهولة.</p>  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
            </div>
            <div class="card p-4 md:p-6 lg:p-8 xl:p-12 text-center transition hover:shadow-lg">  <!-- ← تحسين: غيرت p-6 إلى p-4 md:p-6 lg:p-8 xl:p-12 -->
              <i class="fas fa-comments icon-lg text-primary mb-4"></i>
              <h3 class="text-lg md:text-xl lg:text-2xl font-bold mb-4">3. تواصل مباشر</h3>  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
              <p class="text-gray-600 leading-relaxed text-sm md:text-base lg:text-lg">دردش فوراً مع صاحب العمل بعد القبول.</p>  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
            </div>
          </div>
        </div>
      </section>

      <section class="bg-gray-100 py-12 md:py-16 lg:py-24 flex-1">  <!-- ← تحسين: غيرت py-16 إلى py-12 md:py-16 lg:py-24 -->
        <div class="max-w-4xl mx-auto text-center px-4 sm:px-6">  <!-- ← تحسين: أضفت px-4 sm:px-6 -->
          <h2 class="section-title text-2xl md:text-3xl lg:text-4xl xl:text-5xl">قصص نجاح</h2>  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
          <a routerLink="/success-stories" class="btn-primary text-base md:text-lg lg:text-xl px-6 md:px-8 lg:px-10 xl:px-12 py-2 md:py-3 lg:py-4 xl:py-5 rounded-full inline-flex items-center gap-2 md:gap-3 transition hover:scale-105">  <!-- ← تحسين: غيرت الحجم للريسبونسفية -->
            <i class="fas fa-trophy icon"></i>
            شوف قصص عملائنا
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .icon {
      color: #ffffff; /* لون الأيقونات في الأزرار */
    }
    .btn-primary {
      background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
      color: #4f46e5;
      font-weight: bold;
    }
    .btn-secondary {
      background: transparent;
      border: 2px solid #ffffff;
      color: #ffffff;
    }
    .btn-secondary:hover {
      background: #ffffff;
      color: #4f46e5;
    }
    .card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .section-title {
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 2rem;
    }
    
    /* إضافة لمنع الزوم على الموبايل */
    * {
      font-size: 16px !important;  /* فرض 16px على جميع العناصر لمنع الزوم */
      -webkit-text-size-adjust: 100%;  /* منع تعديل حجم النص على iOS */
    }
    
    /* تحسين الريسبونسفية للحاوي الرئيسي */
    .min-h-screen {
      min-height: 100vh;
      min-height: -webkit-fill-available;  /* لـ Safari على iOS */
    }
    
    /* تحسين الريسبونسفية للعناصر على الشاشات الصغيرة */
    @media (max-width: 640px) {
      .gap-4 {
        gap: 1rem;
      }
      .p-4 {
        padding: 1rem;
      }
      .text-3xl {
        font-size: 1.5rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit {  // ← أضفت AfterViewInit
  isLoggedIn = false;
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe((user: any) => {
      this.user = user;
      this.isLoggedIn = !!user;
    });
  }

  ngAfterViewInit() {
    // ← جديد: فتح الصفحة من أولها (scroll to top) عند التحميل
    this.scrollToTop();
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
