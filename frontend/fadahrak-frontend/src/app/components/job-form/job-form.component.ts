import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="relative">
          <i class="fas fa-store absolute right-4 top-4 text-gray-500"></i>
          <input [(ngModel)]="form.shop_name" name="shop_name" placeholder="اسم المحل" class="input-field pr-12" required>
        </div>
        <div class="relative">
          <i class="fas fa-tag absolute right-4 top-4 text-gray-500"></i>
          <input [(ngModel)]="form.category" name="category" placeholder="الفئة" class="input-field pr-12" required>
        </div>
        <div class="relative">
          <i class="fas fa-map-marker-alt absolute right-4 top-4 text-gray-500"></i>
          <input [(ngModel)]="form.governorate" name="governorate" placeholder="المحافظة" class="input-field pr-12" required>
        </div>
        <div class="relative">
          <i class="fas fa-city absolute right-4 top-4 text-gray-500"></i>
          <input [(ngModel)]="form.city" name="city" placeholder="المدينة" class="input-field pr-12" required>
        </div>
      </div>
      <div class="relative">
        <i class="fas fa-list absolute right-4 top-4 text-gray-500"></i>
        <textarea [(ngModel)]="form.requirements" name="requirements" placeholder="المتطلبات" rows="4" class="input-field pr-12" required></textarea>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="relative">
          <i class="fas fa-clock absolute right-4 top-4 text-gray-500"></i>
          <input [(ngModel)]="form.working_hours" name="working_hours" placeholder="ساعات العمل" class="input-field pr-12" required>
        </div>
        <div class="relative">
          <i class="fas fa-money-bill absolute right-4 top-4 text-gray-500"></i>
          <input [(ngModel)]="form.salary" name="salary" placeholder="الراتب (اختياري)" class="input-field pr-12">
        </div>
      </div>
      <div class="text-center">
        <button type="submit" [disabled]="loading" class="btn-primary px-12 py-4 rounded-full text-xl font-bold hover:scale-105 transition shadow-lg">
          {{ loading ? 'جاري النشر...' : 'نشر الوظيفة' }}
        </button>
      </div>
      <p *ngIf="error" class="text-danger text-center mt-4 font-medium">{{ error }}</p>
      <p *ngIf="success" class="text-success text-center mt-4 font-medium">تم نشر الوظيفة بنجاح! هتظهر في القائمة دلوقتي</p>
    </form>
  `
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
      next: (response: any) => {  // ← أضفنا type عشان نحل implicit any
        this.loading = false;
        this.success = true;

        // التعامل مع الـ response (لو array ناخد الأول)
        let newJob = response;
        if (Array.isArray(response) && response.length > 0) {
          newJob = response[0];
        } else if (Array.isArray(response)) {
          console.error('الـ response array فاضي!', response);
          this.submitSuccess.emit(null); // fallback
          return;
        }

        console.log('الوظيفة الجديدة المستقبلة:', newJob);

        // reset الـ form
        this.form = {
          shop_name: '', category: '', governorate: '', city: '',
          requirements: '', working_hours: '', salary: ''
        };

        // emit الوظيفة الجديدة
        this.submitSuccess.emit(newJob);

        // إخفاء الرسالة بعد 5 ثواني
        setTimeout(() => this.success = false, 5000);
      },
      error: (err: any) => {  // ← أضفنا type
        this.loading = false;
        this.error = err.error?.msg || 'خطأ في النشر';
        console.error('خطأ في إنشاء الوظيفة:', err);
      }
    });
  }
}
