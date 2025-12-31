import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="my-applications-container">
      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل تقديماتك...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && applications.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <h2>لم تقدم على أي وظائف بعد</h2>
        <a routerLink="/jobs" class="btn-browse">
          <i class="fas fa-search"></i>
          ابحث عن وظائف
        </a>
      </div>

      <!-- Applications List -->
      <div *ngIf="!loading && applications.length > 0" class="applications-list">
        <div *ngFor="let app of applications" class="application-card">
          <div class="card-header">
            <h4 class="job-title">
              <i class="fas fa-store"></i>
              {{ app.job_id.shop_name }}
            </h4>
            <p class="job-info">
              <i class="fas fa-tags"></i>
              {{ app.job_id.category }} • {{ app.job_id.governorate }} - {{ app.job_id.city }}
            </p>
          </div>

          <div class="application-message">
            <p>{{ app.message }}</p>
          </div>

          <div class="card-footer">
            <span [class]="getStatusClass(app.status)" class="status-badge">
              <i [class]="getStatusIcon(app.status)"></i>
              {{ getStatusText(app.status) }}
            </span>

            <a *ngIf="app.status === 'accepted'"
               [routerLink]="['/inbox', app._id]"
               class="btn-chat">
              <i class="fas fa-comments"></i>
              فتح الدردشة
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-applications-container {
      min-height: 100vh;
      padding: 2rem 1rem;
      direction: rtl;
      background: linear-gradient(to bottom, #F9FAFB, #E0F2FE);
      font-family: 'Tajawal', system-ui, sans-serif;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 5rem 2rem;
    }

    .spinner {
      width: 4.5rem;
      height: 4.5rem;
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

    .btn-browse {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      font-size: 1.25rem;
      padding: 1rem 2.5rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      margin-top: 1.5rem;
    }

    .btn-browse:hover {
      background: #B2DDFA;
      transform: translateY(-2px);
    }

    .applications-list {
      display: grid;
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .application-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E7EB;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .application-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 35px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #E5E7EB;
    }

    .job-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0 0 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .job-info {
      font-size: 1.0625rem;
      color: #6B7280;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .application-message {
      padding: 1.5rem;
      background: #F8FAFC;
    }

    .application-message p {
      margin: 0;
      color: #374151;
      line-height: 1.7;
    }

    .card-footer {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    @media (min-width: 640px) {
      .card-footer {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .status-badge {
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 120px;
      justify-content: center;
    }

    .btn-chat {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      font-size: 1.125rem;
      padding: 0.875rem 2rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-chat:hover {
      background: #B2DDFA;
      transform: translateY(-2px);
    }

    /* Status Colors - هادئة */
    .bg-pending { background: #FEF3C7; color: #D97706; } /* أصفر ناعم */
    .bg-accepted { background: #D1E7DD; color: #16A34A; } /* أخضر ناعم */
    .bg-rejected { background: #FEE2E2; color: #DC2626; } /* أحمر ناعم */

    /* Responsive */
    @media (max-width: 640px) {
      .my-applications-container { padding: 1.5rem 1rem; }
      .job-title { font-size: 1.375rem; }
      .job-info { font-size: 1rem; }
      .application-message { padding: 1rem; }
      .card-footer { padding: 1rem; }
      .btn-chat { font-size: 1rem; padding: 0.75rem 1.5rem; }
    }
  `]
})
export class MyApplicationsComponent implements OnInit {
  applications: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.api.getMyApplications().subscribe({
      next: (res) => {
        this.applications = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getStatusText(status: string) {
    return status === 'pending' ? 'معلق' 
         : status === 'accepted' ? 'مقبول' 
         : 'مرفوض';
  }

  getStatusClass(status: string) {
    return status === 'pending' ? 'bg-pending' 
         : status === 'accepted' ? 'bg-accepted' 
         : 'bg-rejected';
  }

  getStatusIcon(status: string) {
    return status === 'pending' ? 'fas fa-hourglass-half' 
         : status === 'accepted' ? 'fas fa-check-circle' 
         : 'fas fa-times-circle';
  }
}
