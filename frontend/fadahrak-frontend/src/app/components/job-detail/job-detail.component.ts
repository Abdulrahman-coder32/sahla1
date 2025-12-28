import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ApplyModalComponent } from '../apply-modal/apply-modal.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, ApplyModalComponent, AsyncPipe],
  template: `
    <app-apply-modal
      *ngIf="authService.user$ | async as user; else noUser"
      [isOpen]="modalOpen && user.role === 'job_seeker'"
      [jobTitle]="job?.shop_name || ''"
      (onClose)="closeModal()"
      (onSubmit)="apply($event)">
    </app-apply-modal>
    <ng-template #noUser></ng-template>
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:py-16 lg:py-20">
      <div class="max-w-4xl sm:max-w-5xl mx-auto">
        <div class="bg-white p-6 sm:p-8 md:p-12 shadow-2xl rounded-2xl border border-gray-100">
          <!-- زر الرجوع -->
          <button
            (click)="goBack()"
            class="mb-10 flex items-center gap-3 bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-blue-700 transition text-lg sm:text-xl font-semibold shadow-md hover:shadow-lg">
            <i class="fas fa-arrow-right text-2xl"></i>
            رجوع للوظائف
          </button>
          <!-- Loading -->
          <div *ngIf="loading" class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-6"></div>
            <p class="text-xl text-gray-700 font-medium">جاري تحميل تفاصيل الوظيفة...</p>
          </div>
          <!-- تفاصيل الوظيفة -->
          <div *ngIf="!loading && job" class="space-y-10">
            <!-- الهيدر مع الصورة -->
            <div class="text-center space-y-4">
              <div class="flex justify-center">
                <div class="relative">
                  <img
                    [src]="getOwnerImage()"
                    alt="{{ job.shop_name }}"
                    class="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-white shadow-2xl">
                  <!-- إطار خارجي اختياري -->
                  <div class="absolute inset-0 rounded-full border-4 border-blue-500 opacity-20"></div>
                </div>
              </div>
              <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900">{{ job.shop_name }}</h1>
              <p class="text-2xl sm:text-3xl text-gray-800 font-semibold">{{ job.category }}</p>
              <p class="text-xl sm:text-2xl text-gray-600 flex items-center justify-center gap-2">
                <i class="fas fa-map-marker-alt text-blue-500"></i>
                {{ job.governorate }} - {{ job.city }}
              </p>
            </div>
            <!-- معلومات الوظيفة -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-indigo-50 p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
                <h3 class="text-xl font-bold mb-2 flex items-center justify-center gap-2 text-blue-600">
                  <i class="fas fa-clock text-2xl"></i> ساعات العمل
                </h3>
                <p class="text-lg text-gray-800">{{ job.working_hours }}</p>
              </div>
              <div class="bg-green-50 p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
                <h3 class="text-xl font-bold mb-2 flex items-center justify-center gap-2 text-green-600">
                  <i class="fas fa-money-bill-wave text-2xl"></i> الراتب
                </h3>
                <p class="text-lg text-gray-800">{{ job.salary || 'حسب الاتفاق' }}</p>
              </div>
              <div class="bg-blue-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
                <h3 class="text-xl font-bold mb-2 flex items-center justify-center gap-2 text-blue-600">
                  <i class="fas fa-list-ul text-2xl"></i> المتطلبات
                </h3>
                <p class="text-lg text-gray-800 leading-relaxed text-left break-words">{{ job.requirements }}</p>
              </div>
            </div>
            <!-- التقديم -->
            <div class="text-center mt-12 space-y-4">
              <div *ngIf="authService.user$ | async as user">
                <!-- زر التقديم -->
                <button
                  *ngIf="user.role === 'job_seeker' && !hasApplied"
                  (click)="openModal()"
                  [disabled]="applying"
                  class="bg-blue-600 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full text-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
                  <i class="fas fa-file-alt" *ngIf="!applying"></i>
                  <i class="fas fa-spinner fa-spin" *ngIf="applying"></i>
                  {{ applying ? 'جاري التقديم...' : 'تقديم على الوظيفة الآن' }}
                </button>
                <!-- تم التقديم -->
                <div *ngIf="user.role === 'job_seeker' && hasApplied"
                     class="inline-flex items-center gap-4 bg-green-100 text-green-800 px-10 sm:px-12 py-4 sm:py-5 rounded-full text-xl font-bold shadow-lg">
                  <i class="fas fa-check-circle text-3xl"></i>
                  تم التقديم بنجاح!
                </div>
                <!-- صاحب المحل -->
                <div *ngIf="user.role === 'shop_owner'"
                     class="inline-flex items-center gap-4 bg-indigo-100 text-indigo-800 px-10 sm:px-12 py-4 sm:py-5 rounded-full text-xl font-bold shadow-lg">
                  <i class="fas fa-building text-3xl"></i>
                  هذه إحدى وظائفك! تابع المتقدمين من لوحة التحكم
                </div>
              </div>
              <!-- لغير المسجلين -->
              <p *ngIf="!(authService.user$ | async)" class="text-lg text-gray-600">
                لازم
                <a routerLink="/login" class="text-blue-500 font-semibold hover:underline transition">تسجل دخول</a> أو
                <a routerLink="/signup" class="text-blue-500 font-semibold hover:underline transition"> تنشئ حساب</a>
                عشان تتقدم على الوظيفة
              </p>
            </div>
          </div>
          <!-- الوظيفة غير موجودة -->
          <div *ngIf="!loading && !job" class="text-center py-20">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <i class="fas fa-exclamation-triangle text-5xl text-gray-400"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">الوظيفة غير موجودة أو تم حذفها</h3>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job: any = null;
  loading = true;
  hasApplied = false;
  modalOpen = false;
  applying = false;
  private cacheBuster = Date.now(); // لكسر الكاش

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

  // دالة لعرض صورة صاحب الوظيفة مع كسر الكاش
  getOwnerImage(): string {
    const ownerImage = this.job?.owner_id?.profileImage;
    if (!ownerImage) {
      // صورة افتراضية جميلة بناءً على اسم المتجر
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.job?.shop_name || 'متجر')}&background=3b82f6&color=fff&size=128&bold=true&font-size=0.33`;
    }
    // إضافة timestamp لتجنب مشكلة الكاش
    return `${ownerImage}?t=${this.cacheBuster}`;
  }

  checkApplicationStatus() {
    const user = this.authService.getUser();
    if (!user || user.role !== 'job_seeker') return;
    this.api.getMyApplications().subscribe({
      next: (apps: any[]) => {
        this.hasApplied = apps.some(app =>
          app.job_id === this.job._id || (app.job_id && app.job_id._id === this.job._id)
        );
      },
      error: (err: any) => {  // ← أضفنا type عشان نحل implicit any
        console.error('خطأ في جلب حالة التقديم:', err);
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
    this.api.applyToJob({ job_id: this.job._id, message: message.trim() }).subscribe({
      next: () => {
        this.modalOpen = false;
        this.hasApplied = true;
        this.applying = false;
      },
      error: (err: any) => {  // ← أضفنا type
        console.error('خطأ في التقديم:', err);
        alert('فشل التقديم، حاول مرة أخرى');
        this.applying = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/jobs']);
  }
}
