import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { JobCardComponent } from '../job-card/job-card.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, JobCardComponent],
  template: `
    <div class="job-list-container">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="job-list-header">
          <h1>الوظائف المتاحة</h1>
          <p>ابحث عن الوظيفة المناسبة لك بسهولة</p>
        </div>

        <!-- الفلاتر -->
        <div class="filters-card">
          <form (ngSubmit)="applyFilters()" class="filters-form">
            <!-- المحافظة -->
            <div class="filter-group">
              <label>المحافظة</label>
              <div class="select-wrapper">
                <select [(ngModel)]="filters.governorate" name="governorate" class="custom-select"
                        (change)="onGovernorateChange()">
                  <option value="">كل المحافظات</option>
                  <option *ngFor="let gov of governorates" [value]="gov">{{ gov }}</option>
                </select>
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>

            <!-- المدينة -->
            <div class="filter-group">
              <label>المدينة</label>
              <div class="select-wrapper">
                <select [(ngModel)]="filters.city" name="city" class="custom-select">
                  <option value="">كل المدن</option>
                  <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
                </select>
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>

            <!-- الفئة -->
            <div class="filter-group">
              <label>الفئة</label>
              <div class="select-wrapper">
                <select [(ngModel)]="filters.category" name="category" class="custom-select">
                  <option value="">كل الفئات</option>
                  <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                </select>
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>

            <!-- زر التصفية -->
            <div class="filter-group filter-button">
              <button type="submit" class="filter-btn">
                تصفية النتائج
              </button>
            </div>
          </form>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل الوظائف...</p>
        </div>

        <!-- الوظائف -->
        <div *ngIf="!loading && jobs.length > 0" class="jobs-grid">
          <app-job-card
            *ngFor="let job of jobs"
            [job]="job"
            [hasApplied]="appliedJobs.includes(job._id)"
            (applySuccess)="loadJobs()">
          </app-job-card>
        </div>

        <!-- لا توجد وظائف -->
        <div *ngIf="!loading && jobs.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-briefcase"></i>
          </div>
          <h2>لا توجد وظائف</h2>
          <p>لا توجد وظائف تطابق الفلاتر المختارة</p>
          <button (click)="resetFilters()" class="reset-btn">
            إعادة تعيين الفلاتر
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .job-list-container {
      min-height: 100vh;
      padding: 3rem 1rem;
      direction: rtl;
      background: linear-gradient(to bottom, #F9FAFB, #E0F2FE);
      font-family: 'Tajawal', system-ui, sans-serif;
    }

    .job-list-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .job-list-header h1 {
      font-size: 2.75rem;
      font-weight: 800;
      color: #1F2937;
      margin: 0 0 1rem;
    }

    .job-list-header p {
      font-size: 1.125rem;
      color: #6B7280;
    }

    .filters-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E7EB;
      padding: 2rem;
      margin-bottom: 3rem;
    }

    .filters-form {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 640px) {
      .filters-form { grid-template-columns: repeat(2, 1fr); }
    }

    @media (min-width: 1024px) {
      .filters-form { grid-template-columns: repeat(4, 1fr); }
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.75rem;
      font-size: 1.0625rem;
    }

    .select-wrapper {
      position: relative;
    }

    .custom-select {
      width: 100%;
      padding: 1rem 2rem 1.2rem 3rem;
      border-radius: 1rem;
      border: 1px solid #D1D5DB;
      background: white;
      font-size: 1.0625rem;
      transition: all 0.3s ease;
      appearance: none;
      cursor: pointer;
    }

    .custom-select:focus {
      outline: none;
      border-color: #0EA5E9;
      box-shadow: 0 0 0 3px #E0F2FE;
    }

    .custom-select option {
      font-size: 1rem;
    }

    .select-wrapper i {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #0EA5E9;
      pointer-events: none;
      font-size: 1rem;
    }

    .filter-btn {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      font-size: 1.125rem;
      padding: 1rem;
      border-radius: 1rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .filter-btn:hover {
      background: #B2DDFA;
      transform: translateY(-2px);
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

    .empty-state p {
      font-size: 1.125rem;
      color: #6B7280;
    }

    .reset-btn {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      font-size: 1.125rem;
      padding: 1rem 2rem;
      border-radius: 1rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      margin-top: 1.5rem;
    }

    .reset-btn:hover {
      background: #B2DDFA;
      transform: translateY(-2px);
    }

    .jobs-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 640px) {
      .jobs-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (min-width: 1024px) {
      .jobs-grid { grid-template-columns: repeat(3, 1fr); }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .job-list-container { padding: 2rem 1rem; }
      .job-list-header h1 { font-size: 2.25rem; }
      .filters-card { padding: 1.5rem; }
      .filter-btn { font-size: 1rem; padding: 0.875rem; }
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
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'البحيرة', 'الغربية', 'المنوفية',
  'القليوبية', 'كفر الشيخ', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'أسوان',
  'الأقصر', 'البحر الأحمر', 'الوادي الجديد', 'مرسى مطروح', 'شمال سيناء', 'جنوب سيناء',
  'الإسماعيلية', 'بورسعيد', 'السويس', 'دمياط', 'الأقصر'
];

  categories = [
  'مطاعم وكافيهات', 'سوبر ماركت وهايبر', 'صيدليات', 'ملابس وأحذية', 'إكسسوارات ومجوهرات',
  'موبايلات وإكسسوارات', 'كمبيوتر ولاب توب', 'أجهزة كهربائية', 'أثاث وديكور', 'مفروشات',
  'أدوات منزلية', 'مكتبات وقرطاسية', 'ألعاب أطفال', 'مستلزمات أطفال', 'جيم ورياضة',
  'صالون تجميل وحلاقة', 'سبا ومساج', 'حضانات وروضات', 'مغسلة ملابس', 'كوافير وسبا',
  'خياطة وتفصيل', 'ورش صيانة سيارات', 'قطع غيار سيارات', 'محلات دراجات', 'محلات دراجات نارية',
  'عيادات طبية', 'مراكز أشعة وتحاليل', 'مكاتب محاماة', 'مكاتب هندسية', 'مراكز تدريب',
  'مدارس خاصة', 'مراكز لغات', 'أخرى'
];
  cities: string[] = [];

  private citiesMap: { [key: string]: string[] } = {
  'القاهرة': ['مدينة نصر', 'المطرية', 'حلوان', 'المعادي', 'شبرا', 'الزيتون', 'عين شمس', 'وسط البلد', 'الدقي', 'المهندسين', 'مصر الجديدة', 'الزمالك', 'حدائق القبة', 'روض الفرج', 'الساحل', 'بولاق', 'الجمالية'],
  'الجيزة': ['الهرم', 'فيصل', '6 أكتوبر', 'الشيخ زايد', 'الدقي', 'المهندسين', 'إمبابة', 'بولاق الدكرور', 'الوراق', 'حدائق الأهرام', 'الحوامدية', 'البدرشين'],
  'الإسكندرية': ['محرم بك', 'سموحة', 'سان ستيفانو', 'العجمي', 'ميامي', 'الرمل', 'سبورتنج', 'لوران', 'المنتزه', 'سيدي بشر', 'العصافرة', 'باكوس', 'كفر عبده'],
  'الدقهلية': ['المنصورة', 'ميت غمر', 'طلخا', 'دكرنس', 'بلقاس', 'شربين', 'السنبلاوين', 'جمصة', 'الجمالية'],
  'الشرقية': ['الزقازيق', 'منيا القمح', 'بلبيس', 'فاقوس', 'أبو كبير', 'ههيا', 'العاشر من رمضان', 'ديرب نجم'],
  'البحيرة': ['دمنهور', 'كفر الدوار', 'رشيد', 'إدكو', 'أبو المطامير', 'حوش عيسى', 'الدلنجات', 'المحمودية'],
  'الغربية': ['طنطا', 'المحلة الكبرى', 'كفر الزيات', 'زفتى', 'السنطة', 'بسيون', 'قطور', 'سمنود'],
  'المنوفية': ['شبين الكوم', 'منوف', 'سرس الليان', 'قويسنا', 'الباجور', 'أشمون', 'السادات', 'بركة السبع'],
  'القليوبية': ['بنها', 'قليوب', 'القناطر الخيرية', 'شبرا الخيمة', 'العبور', 'الخانكة', 'طوخ', 'كفر شكر'],
  'كفر الشيخ': ['كفر الشيخ', 'دسوق', 'فوه', 'بلطيم', 'سيدي سالم', 'الرياض', 'الحامول', 'بيلا'],
  'الفيوم': ['الفيوم', 'سنورس', 'إطسا', 'يوسف الصديق', 'طامية', 'الفيوم الجديدة'],
  'بني سويف': ['بني سويف', 'الواسطى', 'ناصر', 'سمسطا', 'ببا', 'الفشن', 'إهناسيا'],
  'المنيا': ['المنيا', 'ملوي', 'دير مواس', 'مطاي', 'سمالوط', 'بني مزار', 'أبو قرقاص', 'مغاغة'],
  'أسيوط': ['أسيوط', 'ديروط', 'القوصية', 'منفلوط', 'أبنوب', 'الفتح', 'أبو تيج', 'ساحل سليم'],
  'سوهاج': ['سوهاج', 'جرجا', 'طما', 'المنشأة', 'أخميم', 'البلينا', 'المراغة', 'طهطا'],
  'قنا': ['قنا', 'نجع حمادي', 'دشنا', 'الوقف', 'قفط', 'نقادة', 'قوص', 'أرمنت'],
  'أسوان': ['أسوان', 'إدفو', 'كوم أمبو', 'دراو', 'نصر النوبة'],
  'الأقصر': ['الأقصر', 'إسنا', 'أرمنت', 'الزينية'],
  'البحر الأحمر': ['الغردقة', 'رأس غارب', 'سفاجا', 'القصير', 'مرسى علم'],
  'الوادي الجديد': ['الخارجة', 'الداخلة', 'الفرافرة', 'باريس', 'بلاط'],
  'مرسى مطروح': ['مرسى مطروح', 'سيوة', 'الحمام', 'العلمين', 'الضبعة', 'النجيلة'],
  'شمال سيناء': ['العريش', 'الشيخ زويد', 'رفح', 'بئر العبد', 'الحسنة'],
  'جنوب سيناء': ['شرم الشيخ', 'دهب', 'نويبع', 'طابا', 'سانت كاترين', 'رأس سدر'],
  'الإسماعيلية': ['الإسماعيلية', 'فايد', 'القنطرة شرق', 'القنطرة غرب', 'أبو صوير'],
  'بورسعيد': ['بورسعيد', 'بورفؤاد'],
  'السويس': ['السويس', 'الجناين', 'الأربعين', 'فيصل'],
  'دمياط': ['دمياط', 'رأس البر', 'فارسكور', 'كفر البطيخ', 'الزرقا', 'كفر سعد'],
  '': [] // للحالة الفارغة
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
