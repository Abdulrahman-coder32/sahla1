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
        <div class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          <!-- زر الرجوع -->
          <div class="p-6 sm:p-8">
            <button
              (click)="goBack()"
              class="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
              <i class="fas fa-arrow-right text-xl"></i>
              رجوع إلى الوظائف
            </button>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" class="flex flex-col items-center justify-center py-32">
            <div class="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            <p class="mt-8 text-2xl text-gray-700 font-medium">جاري تحميل تفاصيل الوظيفة...</p>
          </div>

          <!-- تفاصيل الوظيفة -->
          <div *ngIf="!loading && job" class="px-6 sm:px-8 lg:px-12 pb-12">
            <div class="text-center space-y-8">
              <!-- صورة صاحب الوظيفة -->
              <div class="relative inline-block">
                <img
                  [src]="getOwnerImage()"
                  alt="صورة {{ job.shop_name }}"
                  class="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover ring-8 ring-white shadow-2xl"
                  loading="lazy"
                >
                <div class="absolute inset-0 rounded-full ring-4 ring-blue-200 opacity-30"></div>
              </div>

              <!-- العنوان والتصنيف -->
              <div>
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                  {{ job.shop_name }}
                </h1>
                <p class="mt-4 text-2xl sm:text-3xl text-blue-700 font-semibold">
                  {{ job.category }}
                </p>
                <p class="mt-6 text-xl sm:text-2xl text-gray-600 flex items-center justify-center gap-3">
                  <i class="fas fa-map-marker-alt text-blue-600 text-2xl"></i>
                  {{ job.governorate }} - {{ job.city }}
                </p>
              </div>
            </div>

            <!-- بطاقات المعلومات -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div class="bg-gradient-to-br from-blue-50 to-sky-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
                <div class="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-clock text-3xl text-blue-700"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">ساعات العمل</h3>
                <p class="text-lg text-gray-700">{{ job.working_hours }}</p>
              </div>

              <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
                <div class="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-money-bill-wave text-3xl text-green-700"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">الراتب</h3>
                <p class="text-lg text-gray-700 font-medium">{{ job.salary || 'حسب الاتفاق' }}</p>
              </div>

              <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow md:col-span-3 lg:col-span-1">
                <div class="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-list-ul text-3xl text-indigo-700"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">المتطلبات</h3>
                <p class="text-lg text-gray-700 leading-relaxed text-right">{{ job.requirements }}</p>
              </div>
            </div>

            <!-- منطقة التقديم -->
            <div class="mt-20 text-center">
              <div *ngIf="authService.user$ | async as user">
                <!-- باحث عن عمل -->
                <div *ngIf="user.role === 'job_seeker'">
                  <button
                    *ngIf="!hasApplied"
                    (click)="openModal()"
                    [disabled]="applying"
                    class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-4 mx-auto">
                    <i class="fas fa-spinner fa-spin text-2xl" *ngIf="applying"></i>
                    <i class="fas fa-paper-plane text-2xl" *ngIf="!applying"></i>
                    {{ applying ? 'جاري التقديم...' : 'تقديم على الوظيفة الآن' }}
                  </button>

                  <div *ngIf="hasApplied"
                       class="inline-flex items-center gap-5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-12 py-6 rounded-full text-2xl font-bold shadow-xl">
                    <i class="fas fa-check-circle text-4xl"></i>
                    تم التقديم بنجاح!
                  </div>
                </div>

                <!-- صاحب عمل -->
                <div *ngIf="user.role === 'shop_owner'"
                     class="inline-flex items-center gap-5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-12 py-6 rounded-full text-xl font-bold shadow-xl">
                  <i class="fas fa-building text-3xl"></i>
                  هذه إحدى وظائفك! تابع المتقدمين من لوحة التحكم
                </div>
              </div>

              <!-- غير مسجل دخول -->
              <p *ngIf="!(authService.user$ | async)" class="text-xl text-gray-600 mt-10">
                يجب
                <a routerLink="/login" class="text-blue-600 font-bold hover:underline">تسجيل الدخول</a> أو
                <a routerLink="/signup" class="text-blue-600 font-bold hover:underline">إنشاء حساب</a>
                للتقديم على الوظيفة
              </p>
            </div>
          </div>

          <!-- الوظيفة غير موجودة -->
          <div *ngIf="!loading && !job" class="text-center py-32">
            <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <i class="fas fa-exclamation-triangle text-6xl text-gray-400"></i>
            </div>
            <h2 class="text-3xl font-bold text-gray-800 mb-4">الوظيفة غير موجودة</h2>
            <p class="text-xl text-gray-600">ربما تم حذفها أو انتهت صلاحيتها</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Message مخصص (بدل alert) -->
    <div *ngIf="toastMessage"
         class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 px-8 py-6 flex items-center gap-5 min-w-[320px]">
        <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
        <div>
          <p class="font-bold text-gray-900 text-lg">فشل التقديم</p>
          <p class="text-gray-700 mt-1">{{ toastMessage }}</p>
        </div>
        <button (click)="toastMessage = null" class="text-gray-400 hover:text-gray-600 ml-auto">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.5s ease-out;
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
  private cacheBuster = Date.now();

  private readonly DEFAULT_IMAGE = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

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

  getOwnerImage(): string {
    const ownerImage = this.job?.owner_id?.profileImage;
    if (!ownerImage) {
      return this.DEFAULT_IMAGE;
    }
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
