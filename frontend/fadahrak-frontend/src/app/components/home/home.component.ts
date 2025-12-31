import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>
            مرحباً بك في <span class="highlight">سَهلة</span>
          </h1>
          <p class="hero-subtitle">
            ابحث عن <strong>وظائف محلية حقيقية</strong> في مصر، أو انشر فرص عمل في محلك بسهولة<br class="hidden sm:block">
            تواصل مباشر مع الباحثين عن عمل أو أصحاب الأعمال – بدون وسطاء أو تعقيد
          </p>

          <div class="hero-buttons">
            <ng-container *ngIf="isLoggedIn; else guestButtons">
              <a [routerLink]="user?.role === 'shop_owner' ? '/owner-dashboard' : '/seeker-dashboard'"
                 class="btn-primary">
                <i class="fas fa-tachometer-alt"></i>
                لوحة التحكم
              </a>
              <a routerLink="/jobs" class="btn-secondary">
                <i class="fas fa-search"></i>
                تصفح الوظائف
              </a>
            </ng-container>

            <ng-template #guestButtons>
              <a routerLink="/jobs" class="btn-primary">
                <i class="fas fa-search"></i>
                ابحث عن وظائف
              </a>
              <a routerLink="/signup" class="btn-secondary">
                <i class="fas fa-user-plus"></i>
                إنشاء حساب
              </a>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="how-it-works">
        <div class="section-container">
          <h2>
            كيف تعمل <span class="highlight">سَهلة</span>؟
          </h2>

          <div class="steps-grid">
            <div class="step-card">
              <div class="step-icon">
                <i class="fas fa-user-plus"></i>
              </div>
              <h3>1. أنشئ حسابك</h3>
              <p>سجل كباحث عن عمل أو صاحب محل في ثواني معدودة</p>
            </div>

            <div class="step-card">
              <div class="step-icon">
                <i class="fas fa-briefcase"></i>
              </div>
              <h3>2. ابحث أو انشر</h3>
              <p>اعرض مهاراتك أو انشر وظيفة محلية بكل سهولة ووضوح</p>
            </div>

            <div class="step-card">
              <div class="step-icon">
                <i class="fas fa-comments"></i>
              </div>
              <h3>3. تواصل مباشر</h3>
              <p>دردش فوراً بعد قبول الطلب – بدون انتظار أو تعقيد</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Success Stories -->
      <section class="success-stories">
        <div class="section-container">
          <h2>قصص نجاح حقيقية</h2>
          <p class="section-subtitle">
            آلاف الأشخاص وجدوا فرصهم أو موظفيهم المثاليين من خلال سَهلة
          </p>
          <a routerLink="/success-stories" class="btn-primary large">
            <i class="fas fa-trophy"></i>
            شوف قصص عملائنا
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      direction: rtl;
      font-family: 'Tajawal', system-ui, sans-serif;
      background: linear-gradient(to bottom, #F9FAFB, #E0F2FE);
    }

    /* Hero Section */
    .hero-section {
      padding: 4rem 1rem 6rem;
      text-align: center;
      background: linear-gradient(to bottom, #E0F2FE, #F8FAFC);
      position: relative;
      overflow: hidden;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .hero-section h1 {
      font-size: 2.75rem;
      font-weight: 800;
      color: #1F2937;
      margin: 0 0 1.5rem;
      line-height: 1.2;
    }

    .highlight {
      color: #0EA5E9;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #4B5563;
      max-width: 800px;
      margin: 0 auto 3rem;
      line-height: 1.8;
    }

    .hero-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }

    @media (min-width: 640px) {
      .hero-buttons {
        flex-direction: row;
        justify-content: center;
      }

      .hero-section h1 {
        font-size: 3.5rem;
      }

      .hero-subtitle {
        font-size: 1.5rem;
      }
    }

    /* Buttons */
    .btn-primary {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      padding: 1rem 2.5rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(14, 165, 233, 0.15);
    }

    .btn-primary:hover {
      background: #B2DDFA;
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(14, 165, 233, 0.2);
    }

    .btn-primary.large {
      font-size: 1.5rem;
      padding: 1.25rem 3rem;
    }

    .btn-secondary {
      background: transparent;
      color: #0EA5E9;
      border: 2px solid #0EA5E9;
      font-weight: 600;
      padding: 1rem 2.5rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #E0F2FE;
      transform: translateY(-4px);
    }

    /* How It Works */
    .how-it-works {
      padding: 5rem 1rem;
      background: white;
    }

    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .how-it-works h2 {
      font-size: 2.75rem;
      font-weight: 800;
      color: #1F2937;
      margin-bottom: 4rem;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 640px) {
      .steps-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .steps-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .step-card {
      background: #F8FAFC;
      border-radius: 1.5rem;
      padding: 2.5rem;
      border: 1px solid #E0F2FE;
      transition: all 0.4s ease;
    }

    .step-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 35px rgba(0, 0, 0, 0.1);
      border-color: #B2DDFA;
    }

    .step-icon {
      width: 5rem;
      height: 5rem;
      background: #E0F2FE;
      color: #0EA5E9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      font-size: 2.5rem;
      box-shadow: 0 8px 20px rgba(14, 165, 233, 0.15);
    }

    .step-card h3 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 1rem;
    }

    .step-card p {
      font-size: 1.125rem;
      color: #6B7280;
      line-height: 1.7;
    }

    /* Success Stories */
    .success-stories {
      padding: 5rem 1rem;
      background: #F0F9FF;
      text-align: center;
    }

    .success-stories h2 {
      font-size: 2.75rem;
      font-weight: 800;
      color: #1F2937;
      margin-bottom: 1.5rem;
    }

    .section-subtitle {
      font-size: 1.25rem;
      color: #6B7280;
      max-width: 800px;
      margin: 0 auto 3rem;
      line-height: 1.8;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .hero-section {
        padding: 3rem 1rem 5rem;
      }

      .hero-section h1 {
        font-size: 2.25rem;
      }

      .hero-subtitle {
        font-size: 1.125rem;
      }

      .how-it-works, .success-stories {
        padding: 4rem 1rem;
      }

      .how-it-works h2, .success-stories h2 {
        font-size: 2.25rem;
      }

      .step-card {
        padding: 2rem;
      }

      .step-icon {
        width: 4rem;
        height: 4rem;
        font-size: 2rem;
      }

      .step-card h3 {
        font-size: 1.5rem;
      }
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
