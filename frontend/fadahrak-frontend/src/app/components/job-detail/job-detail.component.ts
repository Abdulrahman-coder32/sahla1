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

    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:py-16 lg:py-24">
      <div class="max-w-5xl mx-auto">
        <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <!-- زر الرجوع -->
          <div class="p-6 sm:p-8">
            <button
              (click)="goBack()"
              class="inline-flex items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <i class="fas fa-arrow-right text-2xl"></i>
              رجوع إلى الوظائف
            </button>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" class="flex flex-col items-center justify-center py-32">
            <div class="animate-spin rounded-full h-20 w-20 border-6 border-gray-200 border-t-blue-600"></div>
            <p class="mt-10 text-2xl text-gray-700 font-medium">جاري تحميل تفاصيل الوظيفة...</p>
          </div>

          <!-- تفاصيل الوظيفة -->
          <div *ngIf="!loading && job" class="px-6 sm:px-8 lg:px-16 pb-16">
            <div class="text-center space-y-10">
              <!-- صورة صاحب الوظيفة -->
              <div class="relative inline-block">
                <img
                  [src]="job?.owner_id?.profileImage || defaultImage"
                  alt="صورة {{ job.shop_name }}"
                  class="w-40 h-40 sm:w-52 sm:h-52 rounded-full object-cover ring-8 ring-white shadow-2xl transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  (error)="onImageError($event)"
                >
                <div class="absolute inset-0 rounded-full ring-6 ring-blue-100 opacity-40"></div>
              </div>

              <!-- العنوان والتصنيف -->
              <div>
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                  {{ job.shop_name }}
                </h1>
                <p class="mt-6 text-2xl sm:text-3xl lg:text-4xl text-blue-700 font-bold">
                  {{ job.category }}
                </p>
                <p class="mt-8 text-xl sm:text-2xl text-gray-600 flex items-center justify-center gap-4">
                  <i class="fas fa-map-marker-alt text-blue-600 text-2xl"></i>
                  <span class="font-medium">{{ job.governorate }} - {{ job.city }}</span>
                </p>
              </div>
            </div>

            <!-- بطاقات المعلومات -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
              <div class="bg-gradient-to-br from-blue-50 to-sky-100 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow text-center">
                <div class="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <i class="fas fa-clock text-4xl text-blue-700"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-3">ساعات العمل</h3>
                <p class="text-xl text-gray-700">{{ job.working_hours }}</p>
              </div>

              <div class="bg-gradient-to-br from-green-50 to-emerald-100 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow text-center">
                <div class="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <i class="fas fa-money-bill-wave text-4xl text-green-700"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-3">الراتب</h3>
                <p class="text-xl text-gray-700 font-bold">{{ job.salary || 'حسب الاتفاق' }}</p>
              </div>

              <div class="bg-gradient-to-br from-indigo-50 to-purple-100 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow md:col-span-3 lg:col-span-1">
                <div class="w-20 h-20 bg-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <i class="fas fa-list-ul text-4xl text-indigo-700"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">المتطلبات</h3>
                <p class="text-lg text-gray-700 leading-loose text-right px-4">{{ job.requirements }}</p>
              </div>
            </div>

            <!-- منطقة التقديم -->
            <div class="mt-24 text-center">
              <div *ngIf="authService.user$ | async as user">
                <!-- باحث عن عمل -->
                <div *ngIf="user.role === 'job_seeker'">
                  <button
                    *ngIf="!hasApplied"
                    (click)="openModal()"
                    [disabled]="applying"
                    class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-2xl px-16 py-7 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-5 mx-auto">
                    <i class="fas fa-spinner fa-spin text-3xl" *ngIf="applying"></i>
                    <i class="fas fa-paper-plane text-3xl" *ngIf="!applying"></i>
                    {{ applying ? 'جاري التقديم...' : 'تقديم على الوظيفة الآن' }}
                  </button>

                  <div *ngIf="hasApplied"
                       class="inline-flex items-center gap-6 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-16 py-7 rounded-full text-3xl font-bold shadow-2xl">
                    <i class="fas fa-check-circle text-5xl"></i>
                    تم التقديم بنجاح!
                  </div>
                </div>

                <!-- صاحب عمل -->
                <div *ngIf="user.role === 'shop_owner'"
                     class="inline-flex items-center gap-6 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-16 py-7 rounded-full text-2xl font-bold shadow-2xl">
                  <i class="fas fa-building text-4xl"></i>
                  هذه إحدى وظائفك! تابع المتقدمين من لوحة التحكم
                </div>
              </div>

              <!-- غير مسجل دخول -->
              <p *ngIf="!(authService.user$ | async)" class="text-xl sm:text-2xl text-gray-600 mt-12">
                يجب
                <a routerLink="/login" class="text-blue-600 font-bold hover:underline text-2xl">تسجيل الدخول</a> أو
                <a routerLink="/signup" class="text-blue-600 font-bold hover:underline text-2xl">إنشاء حساب</a>
                للتقديم على الوظيفة
              </p>
            </div>
          </div>

          <!-- الوظيفة غير موجودة -->
          <div *ngIf="!loading && !job" class="text-center py-32">
            <div class="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
              <i class="fas fa-exclamation-triangle text-8xl text-gray-400"></i>
            </div>
            <h2 class="text-4xl font-bold text-gray-800 mb-6">الوظيفة غير موجودة</h2>
            <p class="text-xl text-gray-600">ربما تم حذفها أو انتهت صلاحيتها</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Message -->
    <div *ngIf="toastMessage"
         class="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div class="bg-white rounded-3xl shadow-2xl border border-gray-200 px-10 py-8 flex items-center gap-6 min-w-[360px]">
        <i class="fas fa-exclamation-triangle text-5xl text-red-500"></i>
        <div>
          <p class="font-bold text-gray-900 text-2xl">فشل التقديم</p>
          <p class="text-gray-700 text-lg mt-3">{{ toastMessage }}</p>
        </div>
        <button (click)="toastMessage = null" class="text-gray-400 hover:text-gray-600 ml-auto">
          <i class="fas fa-times text-3xl"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.6s ease-out;
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
