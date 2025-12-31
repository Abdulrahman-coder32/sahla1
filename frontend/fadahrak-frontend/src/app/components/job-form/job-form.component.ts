import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="job-form">
      <div class="form-grid">
        <div class="input-group">
          <i class="fas fa-store"></i>
          <input
            id="shop_name"
            name="shop_name"
            [(ngModel)]="form.shop_name"
            placeholder="اسم المحل"
            class="form-input"
            required
          >
        </div>

        <div class="input-group">
          <i class="fas fa-tag"></i>
          <input
            id="category"
            name="category"
            [(ngModel)]="form.category"
            placeholder="الفئة"
            class="form-input"
            required
          >
        </div>

        <div class="input-group">
          <i class="fas fa-map-marker-alt"></i>
          <input
            id="governorate"
            name="governorate"
            [(ngModel)]="form.governorate"
            placeholder="المحافظة"
            class="form-input"
            required
          >
        </div>

        <div class="input-group">
          <i class="fas fa-city"></i>
          <input
            id="city"
            name="city"
            [(ngModel)]="form.city"
            placeholder="المدينة"
            class="form-input"
            required
          >
        </div>
      </div>

      <div class="input-group textarea-group">
        <i class="fas fa-list"></i>
        <textarea
          id="requirements"
          name="requirements"
          [(ngModel)]="form.requirements"
          placeholder="المتطلبات"
          rows="5"
          class="form-input form-textarea"
          required
        ></textarea>
      </div>

      <div class="form-grid">
        <div class="input-group">
          <i class="fas fa-clock"></i>
          <input
            id="working_hours"
            name="working_hours"
            [(ngModel)]="form.working_hours"
            placeholder="ساعات العمل"
            class="form-input"
            required
          >
        </div>

        <div class="input-group">
          <i class="fas fa-money-bill-wave"></i>
          <input
            id="salary"
            name="salary"
            [(ngModel)]="form.salary"
            placeholder="الراتب (اختياري)"
            class="form-input"
          >
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" [disabled]="loading" class="submit-btn">
          {{ loading ? 'جاري النشر...' : 'نشر الوظيفة' }}
        </button>
      </div>

      <p *ngIf="error" class="error-message">{{ error }}</p>
      <p *ngIf="success" class="success-message">
        تم نشر الوظيفة بنجاح! هتظهر في القائمة دلوقتي
      </p>
    </form>
  `,
  styles: [`
    .job-form {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      direction: rtl;
      font-family: 'Tajawal', system-ui, sans-serif;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .input-group {
      position: relative;
    }

    .input-group i {
      position: absolute;
      right: 1rem;
      top: 1rem;
      color: #0EA5E9;
      z-index: 10;
      font-size: 1.125rem;
    }

    .form-input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border-radius: 1rem;
      border: 1px solid #D1D5DB;
      background: #FFFFFF;
      font-size: 1.0625rem;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #0EA5E9;
      box-shadow: 0 0 0 3px #E0F2FE;
    }

    .form-textarea {
      min-height: 140px;
      resize: vertical;
    }

    .textarea-group {
      grid-column: 1 / -1;
    }

    .form-actions {
      text-align: center;
      margin-top: 2rem;
    }

    .submit-btn {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      font-size: 1.25rem;
      padding: 1rem 3rem;
      border-radius: 9999px;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      min-width: 240px;
    }

    .submit-btn:hover:not(:disabled) {
      background: #B2DDFA;
      transform: translateY(-2px);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      text-align: center;
      color: #DC2626;
      background: #FEE2E2;
      padding: 1rem;
      border-radius: 1rem;
      margin-top: 1.5rem;
      font-weight: 600;
    }

    .success-message {
      text-align: center;
      color: #16A34A;
      background: #D1E7DD;
      padding: 1rem;
      border-radius: 1rem;
      margin-top: 1.5rem;
      font-weight: 600;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .job-form { padding: 1.5rem 1rem; }
      .submit-btn { font-size: 1.125rem; padding: 0.875rem 2rem; }
    }
  `]
})
export class JobFormComponent {
  @Output() submitSuccess = new EventEmitter<any>();

  form = {
    shop_name: '',
    category: '',
    governorate: '',
    city: '',
    requirements: '',
    working_hours: '',
    salary: ''
  };

  loading = false;
  error = '';
  success = false;

  constructor(private api: ApiService) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.success = false;

    this.api.createJob(this.form).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;

        let newJob = response;
        if (Array.isArray(response) && response.length > 0) {
          newJob = response[0];
        }

        console.log('الوظيفة الجديدة المستقبلة:', newJob);

        this.form = {
          shop_name: '', category: '', governorate: '', city: '',
          requirements: '', working_hours: '', salary: ''
        };

        this.submitSuccess.emit(newJob);
        setTimeout(() => this.success = false, 5000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.msg || 'خطأ في النشر';
        console.error('خطأ في إنشاء الوظيفة:', err);
      }
    });
  }
}
