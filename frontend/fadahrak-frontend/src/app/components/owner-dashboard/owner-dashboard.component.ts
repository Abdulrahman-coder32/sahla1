import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { JobFormComponent } from '../job-form/job-form.component';
import { ApplicationListComponent } from '../application-list/application-list.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, JobFormComponent, ApplicationListComponent, RouterLink],
  template: `
    <div class="owner-dashboard-container">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="dashboard-header">
          <div class="header-icon">
            <i class="fas fa-tachometer-alt"></i>
          </div>
          <h1>لوحة تحكم صاحب العمل</h1>
          <p>إدارة وظائفك ومتابعة المتقدمين بسهولة.</p>
        </div>

        <!-- Job Form Section -->
        <section class="job-form-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-plus"></i>
            </div>
            <h2>نشر وظيفة جديدة</h2>
            <p>أضف وظيفة جديدة لجذب أفضل المواهب.</p>
          </div>
          <app-job-form (submitSuccess)="onJobCreated($event)"></app-job-form>
        </section>

        <!-- Jobs Section -->
        <section class="my-jobs-section">
          <div class="section-header">
            <div class="section-icon jobs">
              <i class="fas fa-briefcase"></i>
            </div>
            <h2>وظائفي الحالية</h2>
            <p>إدارة ومتابعة الوظائف التي نشرتها.</p>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل الوظائف...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && myJobs.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-briefcase"></i>
            </div>
            <h3>لا توجد وظائف منشورة حاليًا</h3>
            <p>ابدأ بنشر وظيفة جديدة من الأعلى لبدء جذب المتقدمين!</p>
          </div>

          <!-- Jobs List -->
          <div *ngIf="!loading && myJobs.length > 0" class="jobs-list">
            <div *ngFor="let job of myJobs" class="job-item">
              <div class="job-summary">
                <div class="job-summary-header">
                  <div class="job-icon">
                    <i class="fas fa-building"></i>
                  </div>
                  <h3 class="job-title">
                    {{ job.shop_name || job.owner_id?.shop_name || 'غير معروف' }} -
                    {{ job.category || 'غير محدد' }}
                  </h3>
                </div>

                <div class="job-details-grid">
                  <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                      <span class="detail-label">الموقع</span>
                      <span class="detail-value">{{ job.governorate || 'غير محدد' }} - {{ job.city || 'غير محدد' }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <div>
                      <span class="detail-label">ساعات العمل</span>
                      <span class="detail-value">{{ job.working_hours || 'غير محدد' }}</span>
                    </div>
                  </div>

                  <div class="detail-item" *ngIf="job.salary">
                    <i class="fas fa-money-bill-wave"></i>
                    <div>
                      <span class="detail-label">الراتب</span>
                      <span class="detail-value">{{ job.salary }}</span>
                    </div>
                  </div>
                </div>

                <div class="requirements-section">
                  <span class="requirements-label">المتطلبات:</span>
                  <div class="requirements-content">
                    <p>{{ job.requirements || 'لا توجد متطلبات محددة' }}</p>
                  </div>
                </div>

                <button (click)="deleteJob(job._id)" class="btn-delete">
                  <i class="fas fa-trash"></i>
                  حذف الوظيفة
                </button>
              </div>

              <!-- Applications Section -->
              <div class="applications-section">
                <div class="applications-header">
                  <div class="applications-icon">
                    <i class="fas fa-users"></i>
                  </div>
                  <h4>المتقدمين على هذه الوظيفة</h4>
                </div>
                <app-application-list [jobId]="job._id"></app-application-list>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .owner-dashboard-container {
      min-height: 100vh;
      padding: 2rem 1rem;
      direction: rtl;
      background: linear-gradient(to bottom, #F9FAFB, #E0F2FE);
      font-family: 'Tajawal', system-ui, sans-serif;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .header-icon {
      width: 4.5rem;
      height: 4.5rem;
      background: #E0F2FE;
      color: #0EA5E9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.25rem;
      box-shadow: 0 8px 20px rgba(14, 165, 233, 0.15);
    }

    .dashboard-header h1 {
      font-size: 2.75rem;
      font-weight: 800;
      color: #1F2937;
      margin: 0 0 1rem;
    }

    .dashboard-header p {
      font-size: 1.125rem;
      color: #6B7280;
      max-width: 600px;
      margin: 0 auto;
    }

    .job-form-section, .my-jobs-section {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E7EB;
      margin-bottom: 3rem;
      overflow: hidden;
    }

    .section-header {
      text-align: center;
      padding: 2rem 1.5rem 1.5rem;
      border-bottom: 1px solid #E5E7EB;
    }

    .section-icon {
      width: 4rem;
      height: 4rem;
      background: #E0F2FE;
      color: #0EA5E9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 2rem;
      box-shadow: 0 8px 20px rgba(14, 165, 233, 0.15);
    }

    .section-icon.jobs {
      background: #D1E7DD;
      color: #16A34A;
    }

    .section-header h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0 0 0.75rem;
    }

    .section-header p {
      font-size: 1rem;
      color: #6B7280;
      margin: 0;
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

    .empty-state h3 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #374151;
      margin-bottom: 1rem;
    }

    .empty-state p {
      font-size: 1.125rem;
      color: #6B7280;
      max-width: 500px;
      margin: 0 auto;
    }

    .jobs-list {
      display: grid;
      gap: 2rem;
      padding: 2rem;
    }

    .job-item {
      background: #F8FAFC;
      border-radius: 1.25rem;
      border: 1px solid #E0F2FE;
      overflow: hidden;
      transition: all 0.4s ease;
    }

    .job-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 35px rgba(0, 0, 0, 0.1);
    }

    .job-summary {
      padding: 1.5rem;
    }

    .job-summary-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .job-icon {
      width: 3rem;
      height: 3rem;
      background: #E0F2FE;
      color: #0EA5E9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .job-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0;
    }

    .job-details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 640px) {
      .job-details-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .detail-item i {
      color: #0EA5E9;
      margin-top: 0.25rem;
      flex-shrink: 0;
    }

    .detail-label {
      font-size: 0.875rem;
      color: #6B7280;
      font-weight: 600;
      display: block;
    }

    .detail-value {
      color: #374151;
      font-weight: 500;
    }

    .requirements-section {
      margin-bottom: 1.5rem;
    }

    .requirements-label {
      font-weight: 600;
      color: #1F2937;
      display: block;
      margin-bottom: 0.75rem;
    }

    .requirements-content {
      background: white;
      padding: 1rem;
      border-radius: 1rem;
      border: 1px solid #E5E7EB;
    }

    .requirements-content p {
      margin: 0;
      color: #374151;
      line-height: 1.7;
    }

    .btn-delete {
      background: #FEE2E2;
      color: #DC2626;
      font-weight: 600;
      padding: 0.875rem 1.5rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      margin: 1rem 1.5rem 0 0;
    }

    .btn-delete:hover {
      background: #FCA5A5;
      transform: translateY(-2px);
    }

    .applications-section {
      background: white;
      padding: 1.5rem;
      border-top: 1px solid #E5E7EB;
    }

    .applications-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .applications-icon {
      width: 2.5rem;
      height: 2.5rem;
      background: #D1E7DD;
      color: #16A34A;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .applications-header h4 {
      font-size: 1.375rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .owner-dashboard-container { padding: 1.5rem 1rem; }
      .dashboard-header h1 { font-size: 2.25rem; }
      .section-header { padding: 1.5rem 1rem 1rem; }
      .section-header h2 { font-size: 1.75rem; }
      .job-summary { padding: 1rem; }
      .job-title { font-size: 1.375rem; }
      .applications-section { padding: 1rem; }
      .applications-header h4 { font-size: 1.25rem; }
    }
  `]
})
export class OwnerDashboardComponent implements OnInit {
  myJobs: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadMyJobs();
  }

  loadMyJobs() {
    this.loading = true;
    this.api.getMyJobs().subscribe({
      next: (res: any) => {
        this.myJobs = res || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('خطأ في جلب الوظائف:', err);
        this.myJobs = [];
        this.loading = false;
      }
    });
  }

  onJobCreated(newJob: any) {
    if (!newJob || !newJob._id) {
      this.loadMyJobs();
      return;
    }
    this.myJobs.unshift(newJob);
  }

  deleteJob(id: string) {
    if (confirm('متأكد إنك عايز تحذف الوظيفة؟')) {
      this.api.deleteJob(id).subscribe({
        next: () => {
          this.myJobs = this.myJobs.filter(job => job._id !== id);
        },
        error: (err: any) => {
          console.error('خطأ في حذف الوظيفة:', err);
        }
      });
    }
  }
}
