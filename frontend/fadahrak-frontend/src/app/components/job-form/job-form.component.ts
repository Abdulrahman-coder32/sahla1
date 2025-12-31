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
          <label for="shop_name" class="sr-only">اسم المحل</label>
          <input 
            id="shop_name" 
            name="shop_name" 
            [(ngModel)]="form.shop_name" 
            placeholder="اسم المحل" 
            class="input-field pr-12" 
            required
          >
        </div>
        <div class="relative">
          <i class="fas fa-tag absolute right-4 top-4 text-gray-500"></i>
          <label for="category" class="sr-only">الفئة</label>
          <input 
            id="category" 
            name="category" 
            [(ngModel)]="form.category" 
            placeholder="الفئة" 
            class="input-field pr-12" 
            required
          >
        </div>
        <div class="relative">
          <i class="fas fa-map-marker-alt absolute right-4 top-4 text-gray-500"></i>
          <label for="governorate" class="sr-only">المحافظة</label>
          <input 
            id="governorate" 
            name="governorate" 
            [(ngModel)]="form.governorate" 
            placeholder="المحافظة" 
            class="input-field pr-12" 
            required
          >
        </div>
        <div class="relative">
          <i class="fas fa-city absolute right-4 top-4 text-gray-500"></i>
          <label for="city" class="sr-only">المدينة</label>
          <input 
            id="city" 
            name="city" 
            [(ngModel)]="form.city" 
            placeholder="المدينة" 
            class="input-field pr-12" 
            required
          >
        </div>
      </div>
      <div class="relative">
        <i class="fas fa-list absolute right-4 top-4 text-gray-500"></i>
        <label for="requirements" class="sr-only">المتطلبات</label>
        <textarea 
          id="requirements" 
          name="requirements" 
          [(ngModel)]="form.requirements" 
          placeholder="المتطلبات" 
          rows="4" 
          class="input-field pr-12" 
          required
        ></textarea>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="relative">
          <i class="fas fa-clock absolute right-4 top-4 text-gray-500"></i>
          <label for="working_hours" class="sr-only">ساعات العمل</label>
          <input 
            id="working_hours" 
            name="working_hours" 
            [(ngModel)]="form.working_hours" 
            placeholder="ساعات العمل" 
            class="input-field pr-12" 
            required
          >
        </div>
        <div class="relative">
          <i class="fas fa-money-bill absolute right-4 top-4 text-gray-500"></i>
          <label for="salary" class="sr-only">الراتب (اختياري)</label>
          <input 
            id="salary" 
            name="salary" 
            [(ngModel)]="form.salary" 
            placeholder="الراتب (اختياري)" 
            class="input-field pr-12"
          >
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
