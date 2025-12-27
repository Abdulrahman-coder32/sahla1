import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { JobCardComponent } from '../job-card/job-card.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, JobCardComponent],
  template: `
    <div class="min-h-screen py-12 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 text-gray-900">
          الوظائف المتاحة
        </h1>

        <!-- الفلاتر -->
        <div class="card p-6 sm:p-8 lg:p-10 mb-10 lg:mb-14">
          <form (ngSubmit)="applyFilters()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">

            <!-- المحافظة -->
            <div>
              <label class="block text-gray-800 font-semibold mb-3 text-lg">
                المحافظة
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.governorate"
                  name="governorate"
                  class="custom-select"
                  (change)="onGovernorateChange()">
                  <option value="">كل المحافظات</option>
                  <option *ngFor="let gov of governorates" [value]="gov">{{ gov }}</option>
                </select>
                <!-- أيقونة السهم -->
                <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-600 pointer-events-none transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- المدينة -->
            <div>
              <label class="block text-gray-800 font-semibold mb-3 text-lg">
                المدينة
              </label>
              <div class="relative">
                <select [(ngModel)]="filters.city" name="city" class="custom-select">
                  <option value="">كل المدن</option>
                  <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
                </select>
                <!-- أيقونة السهم -->
                <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-600 pointer-events-none transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- الفئة -->
            <div>
              <label class="block text-gray-800 font-semibold mb-3 text-lg">
                الفئة
              </label>
              <div class="relative">
                <select [(ngModel)]="filters.category" name="category" class="custom-select">
                  <option value="">كل الفئات</option>
                  <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                </select>
                <!-- أيقونة السهم -->
                <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-600 pointer-events-none transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- زر التصفية -->
            <div class="flex items-end">
              <button
                type="submit"
                class="btn-primary w-full py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                تصفية النتائج
              </button>
            </div>
          </form>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-32">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p class="mt-6 text-xl text-gray-600">جاري تحميل الوظائف...</p>
        </div>

        <!-- الوظائف -->
        <div *ngIf="!loading && jobs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          <app-job-card
            *ngFor="let job of jobs"
            [job]="job"
            [hasApplied]="appliedJobs.includes(job._id)"
            (applySuccess)="loadJobs()">
          </app-job-card>
        </div>

        <!-- لا توجد وظائف -->
        <div *ngIf="!loading && jobs.length === 0" class="text-center py-32">
          <div class="text-6xl mb-6 text-gray-300">لا توجد وظائف</div>
          <p class="text-xl text-gray-600 mb-8">لا توجد وظائف تطابق الفلاتر المختارة</p>
          <button
            (click)="resetFilters()"
            class="btn-primary px-10 py-4 text-lg font-bold rounded-xl">
            إعادة تعيين الفلاتر
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* تحسين مظهر الـ select - سهم جميل وموحد */
    .custom-select {
      @apply w-full px-5 py-4 rounded-xl border-2 border-gray-300 bg-white text-gray-900 text-base font-medium;
      @apply focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100;
      @apply transition-all duration-300 appearance-none cursor-pointer;
      @apply hover:border-indigo-400 hover:shadow-md hover:scale-105;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); /* خلفية gradient خفيفة */
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* shadow خفيف */
      padding-left: 3.5rem; /* مسافة للأيقونة */
      padding-right: 1.25rem;
      text-align: right; /* RTL */
    }

    /* إخفاء السهم الافتراضي للمتصفح */
    .custom-select::-ms-expand {
      display: none;
    }

    /* للفايرفوكس */
    .custom-select {
      -moz-appearance: none;
      -webkit-appearance: none;
    }

    /* تحسين الـ spinner بدون أيقونات */
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }

    /* تأثير على الأيقونة عند الـ hover/focus */
    .custom-select:hover + svg,
    .custom-select:focus + svg {
      @apply text-indigo-700 transform scale-110;
    }
  `]
})
export class JobListComponent implements OnInit {
  jobs: any[] = [];
  appliedJobs: string[] = [];
  loading = true;

  filters = {
    governorate: '',
    city: '',
    category: ''
  };

  governorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'البحيرة', 'المنوفية',
    'القليوبية', 'كفر الشيخ', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'أسوان',
    'الأقصر', 'البحر الأحمر', 'الوادي الجديد', 'مرسى مطروح', 'شمال سيناء', 'جنوب سيناء',
    'الإسماعيلية', 'بورسعيد', 'السويس', 'دمياط'
  ];

  categories = [
    'مطاعم', 'كافيهات', 'سوبر ماركت', 'صيدليات', 'محلات ملابس', 'محلات أحذية', 'محلات إكسسوارات',
    'محلات موبايلات', 'محلات كمبيوتر', 'جيم', 'صالون تجميل', 'حضانة', 'مغسلة', 'كوافير', 'أخرى'
  ];

  cities: string[] = [];

  private citiesMap: { [key: string]: string[] } = {
    'القاهرة': ['مدينة نصر', 'المطرية', 'حلوان', 'المعادي', 'شبرا', 'الزيتون', 'عين شمس', 'وسط البلد', 'الدقي', 'المهندسين', 'مصر الجديدة', 'الزمالك', 'حدائق القبة', 'روض الفرج'],
    'الجيزة': ['الهرم', 'فيصل', '6 أكتوبر', 'الشيخ زايد', 'الدقي', 'المهندسين', 'إمبابة', 'بولاق الدكرور', 'الوراق'],
    'الإسكندرية': ['محرم بك', 'سموحة', 'سان ستيفانو', 'العجمي', 'ميامي', 'الرمل', 'سبورتنج', 'لوران', 'المنتزه'],
    'الدقهلية': ['المنصورة', 'ميت غمر', 'طلخا', 'دكرنس', 'بلقاس', 'شربين'],
    'الشرقية': ['الزقازيق', 'منيا القمح', 'بلبيس', 'فاقوس', 'أبو كبير', 'ههيا'],
    '': []
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadJobs();
  }

  onGovernorateChange() {
    this.filters.city = '';
    const selectedGov = this.filters.governorate;
    this.cities = this.citiesMap[selectedGov] ? [...this.citiesMap[selectedGov]] : [];
  }

  applyFilters() {
    this.loadJobs();
  }

  resetFilters() {
    this.filters = { governorate: '', city: '', category: '' };
    this.cities = [];
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.api.getJobs(this.filters).subscribe({
      next: (res) => {
        this.jobs = res;
        this.loadMyApplications();
      },
      error: () => this.loading = false
    });
  }

  loadMyApplications() {
    this.api.getMyApplications().subscribe({
      next: (res: any[]) => {
        this.appliedJobs = res.map(app => app.job_id._id || app.job_id);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
