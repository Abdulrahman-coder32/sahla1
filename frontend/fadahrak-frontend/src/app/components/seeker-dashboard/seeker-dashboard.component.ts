import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MyApplicationsComponent } from '../my-applications/my-applications.component';
import { JobListComponent } from '../job-list/job-list.component';

@Component({
  selector: 'app-seeker-dashboard',
  standalone: true,
  imports: [CommonModule, MyApplicationsComponent, JobListComponent, RouterLink],
  template: `
    <div class="seeker-dashboard-container">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="dashboard-header">
            <i class="fas fa-user-graduate"></i>
          </div>
          <h1>لوحة تحكم الباحث عن عمل</h1>
          <p>استكشف الوظائف المناسبة لك وتابع تقديماتك بسهولة.</p>
        </div>

        <!-- My Applications Section -->
        <section class="applications-section">
          <div class="section-header">
            <div class="section-icon applications">
              <i class="fas fa-file-alt"></i>
            </div>
            <h2>تقديماتي</h2>
            <p>مراجعة ومتابعة طلبات التقديم التي قدمتها.</p>
          </div>
          <app-my-applications></app-my-applications>
        </section>

        <!-- Recommended Jobs Section -->
        <section class="jobs-section">
          <div class="section-header">
            <div class="section-icon jobs">
              <i class="fas fa-thumbs-up"></i>
            </div>
            <h2>وظائف موصى بها</h2>
            <p>وظائف مناسبة لمهاراتك واهتماماتك.</p>
          </div>
          <app-job-list></app-job-list>
        </section>

        <!-- Tip Section -->
        <div class="tip-section">
          <div class="tip-icon">
            <i class="fas fa-lightbulb"></i>
          </div>
          <p>
            نصيحة: راجع تقديماتك بانتظام، وتابع حالة كل طلب. إذا تم قبولك، ابدأ الدردشة فورًا مع صاحب العمل لزيادة فرصك!
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seeker-dashboard-container {
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

    .applications-section, .jobs-section {
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

    .section-icon.applications {
      background: #D1E7DD;
      color: #16A34A;
    }

    .section-icon.jobs {
      background: #E9D5FF;
      color: #A78BFA;
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

    .tip-section {
      background: #F0F9FF;
      border-radius: 1.5rem;
      padding: 2.5rem;
      text-align: center;
      border: 1px solid #BAE6FD;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    }

    .tip-icon {
      width: 4rem;
      height: 4rem;
      background: #FEF3C7;
      color: #D97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2rem;
      box-shadow: 0 8px 20px rgba(217, 119, 6, 0.15);
    }

    .tip-section p {
      font-size: 1.25rem;
      color: #374151;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .seeker-dashboard-container { padding: 1.5rem 1rem; }
      .dashboard-header h1 { font-size: 2.25rem; }
      .section-header { padding: 1.5rem 1rem 1rem; }
      .section-header h2 { font-size: 1.75rem; }
      .tip-section { padding: 2rem; }
      .tip-section p { font-size: 1.125rem; }
    }
  `]
})
export class SeekerDashboardComponent {}
