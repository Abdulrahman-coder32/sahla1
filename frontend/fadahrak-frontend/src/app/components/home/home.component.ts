import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen">
      <section class="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white py-20 md:py-32 text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="max-w-5xl mx-auto px-6 relative z-10">
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight flex items-center justify-center gap-4">

            مرحباً بك في سَهلة
          </h1>
          <p class="text-lg md:text-2xl lg:text-3xl mb-10 max-w-3xl mx-auto px-4">
            ابحث عن وظائف محلية في مصر أو انشر فرص عمل بسهولة. تواصل مباشر مع أصحاب العمل.
          </p>

          <div class="flex flex-col md:flex-row justify-center gap-6 px-4">
            <ng-container *ngIf="isLoggedIn; else guestButtons">
              <a [routerLink]="user?.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 class="btn-primary text-lg md:text-xl px-6 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full flex items-center justify-center gap-3 transition hover:scale-105">
                <i class="fas fa-tachometer-alt icon"></i>
                لوحة التحكم
              </a>
              <a routerLink="/jobs" class="btn-secondary text-lg md:text-xl px-6 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full flex items-center justify-center gap-3 transition hover:scale-105">
                <i class="fas fa-search icon"></i>
                تصفح الوظائف
              </a>
            </ng-container>

            <ng-template #guestButtons>
              <a routerLink="/jobs" class="btn-primary text-lg md:text-xl px-6 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full flex items-center justify-center gap-3 transition hover:scale-105">
                <i class="fas fa-search icon"></i>
                ابحث عن وظائف
              </a>
              <a routerLink="/signup" class="btn-secondary text-lg md:text-xl px-6 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full flex items-center justify-center gap-3 transition hover:scale-105">
                <i class="fas fa-user-plus icon"></i>
                إنشاء حساب
              </a>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- باقي الصفحة responsive -->
      <section class="py-16 md:py-24 bg-white">
        <div class="max-w-6xl mx-auto px-6">
          <h2 class="section-title text-3xl md:text-4xl lg:text-5xl">كيف تعمل سَهلة؟</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div class="card p-6 md:p-8 lg:p-12 text-center transition hover:shadow-lg">
              <i class="fas fa-user-plus icon-lg text-primary mb-4"></i>
              <h3 class="text-xl md:text-2xl font-bold mb-4">1. أنشئ حسابك</h3>
              <p class="text-gray-600 leading-relaxed text-base md:text-lg">سجل كباحث عن عمل أو صاحب محل في ثواني.</p>
            </div>
            <div class="card p-6 md:p-8 lg:p-12 text-center transition hover:shadow-lg">
              <i class="fas fa-briefcase icon-lg text-primary mb-4"></i>
              <h3 class="text-xl md:text-2xl font-bold mb-4">2. ابحث أو انشر</h3>
              <p class="text-gray-600 leading-relaxed text-base md:text-lg">اعرض مهاراتك أو انشر وظيفة محلية بسهولة.</p>
            </div>
            <div class="card p-6 md:p-8 lg:p-12 text-center transition hover:shadow-lg">
              <i class="fas fa-comments icon-lg text-primary mb-4"></i>
              <h3 class="text-xl md:text-2xl font-bold mb-4">3. تواصل مباشر</h3>
              <p class="text-gray-600 leading-relaxed text-base md:text-lg">دردش فوراً مع صاحب العمل بعد القبول.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-gray-100 py-16 md:py-24">
        <div class="max-w-4xl mx-auto text-center px-6">
          <h2 class="section-title text-3xl md:text-4xl lg:text-5xl">قصص نجاح</h2>
          <a routerLink="/success-stories" class="btn-primary text-lg md:text-xl px-8 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 rounded-full inline-flex items-center gap-3 transition hover:scale-105">
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
  `]
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe((user: any) => {
      this.user = user;
      this.isLoggedIn = !!user;
    });
  }
}
