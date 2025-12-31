import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ApplyModalComponent } from '../apply-modal/apply-modal.component';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, ApplyModalComponent, AsyncPipe],
  template: `
    <!-- Apply Modal -->
    <app-apply-modal
      *ngIf="authService.user$ | async as user"
      [isOpen]="modalOpen && user.role === 'job_seeker'"
      [jobTitle]="job?.shop_name || ''"
      (onClose)="closeModal()"
      (onSubmit)="apply($event)">
    </app-apply-modal>

    <div class="job-detail-container">
      <div class="max-w-5xl mx-auto">
        <div class="job-detail-card">
          <!-- زر الرجوع -->
          <div class="back-button-wrapper">
            <button (click)="goBack()" class="back-button">
              <i class="fas fa-arrow-right"></i>
              رجوع إلى الوظائف
            </button>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل تفاصيل الوظيفة...</p>
          </div>

          <!-- تفاصيل الوظيفة -->
          <div *ngIf="!loading && job" class="job-content">
            <div class="job-header">
              <!-- صورة صاحب الوظيفة -->
              <div class="owner-avatar-wrapper">
                <img
                  [src]="job?.owner_id?.profileImage || defaultImage"
                  alt="صورة {{ job.shop_name }}"
                  class="owner-avatar"
                  loading="lazy"
                  (error)="onImageError($event)"
                >
              </div>

              <!-- العنوان والتصنيف -->
              <div class="job-info">
                <h1 class="job-title">{{ job.shop_name }}</h1>
                <p class="job-category">{{ job.category }}</p>
                <p class="job-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ job.governorate }} - {{ job.city }}
                </p>
              </div>
            </div>

            <!-- بطاقات المعلومات -->
            <div class="info-cards">
              <div class="info-card">
                <div class="info-icon working-hours">
                  <i class="fas fa-clock"></i>
                </div>
                <h3>ساعات العمل</h3>
                <p>{{ job.working_hours }}</p>
              </div>

              <div class="info-card">
                <div class="info-icon salary">
                  <i class="fas fa-money-bill-wave"></i>
                </div>
                <h3>الراتب</h3>
                <p class="salary-value">{{ job.salary || 'حسب الاتفاق' }}</p>
              </div>

              <div class="info-card requirements">
                <div class="info-icon">
                  <i class="fas fa-list-ul"></i>
                </div>
                <h3>المتطلبات</h3>
                <p class="requirements-text">{{ job.requirements }}</p>
              </div>
            </div>

            <!-- منطقة التقديم -->
            <div class="apply-section">
              <div *ngIf="authService.user$ | async as user">
                <!-- باحث عن عمل -->
                <div *ngIf="user.role === 'job_seeker'">
                  <button
                    *ngIf="!hasApplied"
                    (click)="openModal()"
                    [disabled]="applying"
                    class="btn-apply">
                    <i class="fas fa-spinner fa-spin" *ngIf="applying"></i>
                    <i class="fas fa-paper-plane" *ngIf="!applying"></i>
                    {{ applying ? 'جاري التقديم...' : 'تقديم على الوظيفة الآن' }}
                  </button>

                  <div *ngIf="hasApplied" class="applied-status">
                    <i class="fas fa-check-circle"></i>
                    تم التقديم بنجاح!
                  </div>
                </div>

                <!-- صاحب عمل -->
                <div *ngIf="user.role === 'shop_owner'" class="owner-status">
                  <i class="fas fa-building"></i>
                  هذه إحدى وظائفك! تابع المتقدمين من لوحة التحكم
                </div>
              </div>

              <!-- غير مسجل دخول -->
              <p *ngIf="!(authService.user$ | async)" class="login-prompt">
                يجب
                <a routerLink="/login" class="login-link">تسجيل الدخول</a> أو
                <a routerLink="/signup" class="login-link">إنشاء حساب</a>
                للتقديم على الوظيفة
              </p>
            </div>
          </div>

          <!-- الوظيفة غير موجودة -->
          <div *ngIf="!loading && !job" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2>الوظيفة غير موجودة</h2>
            <p>ربما تم حذفها أو انتهت صلاحيتها</p>
          </div>
        </div>
      </div>

      <!-- Toast Message -->
      <div *ngIf="toastMessage" class="toast">
        <div class="toast-content">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <p class="toast-title">فشل التقديم</p>
            <p class="toast-message">{{ toastMessage }}</p>
          </div>
          <button (click)="toastMessage = null" class="toast-close">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }

    .job-detail-container {
      min-height: 100vh;
      padding: 2rem 1rem;
      direction: rtl;
      background: linear-gradient(to bottom, #F9FAFB, #E0F2FE);
      font-family: 'Tajawal', system-ui, sans-serif;
    }

    .job-detail-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E7EB;
      overflow: hidden;
    }

    .back-button-wrapper {
      padding: 1.5rem;
    }

    .back-button {
      background: #E0F2FE;
      color: #0EA5E9;
      padding: 0.875rem 2rem;
      border-radius: 1rem;
      font-weight: 600;
      font-size: 1.125rem;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .back-button:hover {
      background: #B2DDFA;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 5rem 2rem;
    }

    .spinner {
      width: 4rem;
      height: 4rem;
      border: 4px solid #E0F2FE;
      border-top: 4px solid #0EA5E9;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 2rem;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-icon {
      width: 6rem;
      height: 6rem;
      background: #F3F4F6;
      color: #9CA3AF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      font-size: 3rem;
    }

    .empty-state h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #374151;
      margin-bottom: 1rem;
    }

    .job-content {
      padding: 2rem;
    }

    .job-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .owner-avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 1.5rem;
    }

    .owner-avatar {
      width: 10rem;
      height: 10rem;
      border-radius: 50%;
      object-fit: cover;
      border: 6px solid white;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .owner-avatar:hover {
      transform: scale(1.05);
    }

    .job-title {
      font-size: 2.75rem;
      font-weight: 800;
      color: #1F2937;
      margin: 0 0 1rem;
    }

    .job-category {
      font-size: 1.875rem;
      font-weight: 700;
      color: #0EA5E9;
      margin: 0 0 1.5rem;
    }

    .job-location {
      font-size: 1.375rem;
      color: #6B7280;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .info-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin: 3rem 0;
    }

    @media (min-width: 768px) {
      .info-cards {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .info-card {
      background: #F8FAFC;
      border-radius: 1.25rem;
      padding: 2rem;
      text-align: center;
      border: 1px solid #E0F2FE;
      transition: all 0.3s ease;
    }

    .info-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    }

    .info-icon {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 1.75rem;
    }

    .working-hours { background: #E0F2FE; color: #0EA5E9; }
    .salary { background: #D1E7DD; color: #16A34A; }

    .info-card h3 {
      font-size: 1.375rem;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 1rem;
    }

    .salary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #16A34A;
    }

    .requirements-text {
      font-size: 1.125rem;
      color: #374151;
      line-height: 1.8;
      text-align: right;
    }

    .apply-section {
      margin-top: 3rem;
      text-align: center;
    }

    .btn-apply {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      font-size: 1.5rem;
      padding: 1rem 3rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-apply:hover:not(:disabled) {
      background: #B2DDFA;
      transform: translateY(-4px);
    }

    .btn-apply:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .applied-status {
      background: #D1E7DD;
      color: #16A34A;
      font-weight: 600;
      font-size: 1.5rem;
      padding: 1rem 3rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 1rem;
    }

    .owner-status {
      background: #E9D5FF;
      color: #A78BFA;
      font-weight: 600;
      font-size: 1.375rem;
      padding: 1rem 3rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 1rem;
    }

    .login-prompt {
      font-size: 1.25rem;
      color: #6B7280;
    }

    .login-link {
      color: #0EA5E9;
      font-weight: 700;
      text-decoration: underline;
    }

    .login-link:hover {
      color: #0284C7;
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
    }

    .toast-content {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border: 1px solid #E5E7EB;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 340px;
      animation: fade-in-up 0.4s ease-out;
    }

    .toast-title {
      font-weight: 700;
      color: #1F2937;
      margin: 0;
    }

    .toast-message {
      color: #6B7280;
      margin: 0.25rem 0 0;
    }

    .toast-close {
      background: none;
      border: none;
      color: #9CA3AF;
      font-size: 1.5rem;
      cursor: pointer;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .job-detail-container { padding: 1rem; }
      .job-header { margin-bottom: 2rem; }
      .owner-avatar { width: 8rem; height: 8rem; }
      .job-title { font-size: 2.25rem; }
      .job-category { font-size: 1.5rem; }
      .job-location { font-size: 1.125rem; }
      .info-cards { gap: 1rem; margin: 2rem 0; }
      .info-card { padding: 1.5rem; }
      .info-card h3 { font-size: 1.25rem; }
      .btn-apply, .applied-status, .owner-status { font-size: 1.25rem; padding: 0.875rem 2rem; }
      .login-prompt { font-size: 1.125rem; }
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job: any = null;
  loading = true;
  hasApplied = false;
  modalOpen = false;
  applying = false;
  toastMessage: string | null = null;
  readonly defaultImage = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getJob(id).subscribe({
        next: (res: any) => {
          this.job = res;
          this.loading = false;
          this.checkApplicationStatus();
        },
        error: (err: any) => {
          console.error('خطأ في جلب الوظيفة:', err);
          this.loading = false;
        }
      });
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.defaultImage) {
      img.src = this.defaultImage;
    }
    img.onerror = null;
  }

  checkApplicationStatus() {
    const user = this.authService.getUser();
    if (!user || user.role !== 'job_seeker') return;
    this.api.getMyApplications().subscribe({
      next: (apps: any[]) => {
        this.hasApplied = apps.some(app =>
          app.job_id === this.job._id || (app.job_id?._id === this.job._id)
        );
      },
      error: () => {
        this.hasApplied = false;
      }
    });
  }

  openModal() {
    if (this.applying) return;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  apply(message: string) {
    if (!message.trim()) return;
    this.applying = true;
    this.api.applyToJob({
      job_id: this.job._id,
      message: message.trim()
    }).subscribe({
      next: () => {
        this.modalOpen = false;
        this.hasApplied = true;
        this.applying = false;
      },
      error: (err: any) => {
        const errorMsg = err.error?.msg || err.error?.message || 'حدث خطأ أثناء التقديم، حاول مرة أخرى';
        this.toastMessage = errorMsg;
        this.applying = false;
        setTimeout(() => this.toastMessage = null, 6000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/jobs']);
  }
}
