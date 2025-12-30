import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ApplyModalComponent } from '../apply-modal/apply-modal.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ApplyModalComponent],
  template: `
    <div class="bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden max-w-full">
      <!-- Header: صورة صاحب الوظيفة + اسم المتجر -->
      <div class="p-6 flex items-center gap-5 bg-gradient-to-r from-sky-50 to-blue-50">
        <div class="flex-shrink-0">
          <img
            [src]="getOwnerImage()"
            alt="صورة {{ job.shop_name }}"
            class="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-xl"
            loading="lazy"
          >
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-2xl font-bold text-gray-900 truncate">
            {{ job.shop_name }}
          </h3>
          <p class="text-base text-gray-600 mt-1">صاحب العمل</p>
        </div>
      </div>

      <!-- التفاصيل -->
      <div class="p-6 space-y-5">
        <div class="space-y-4 text-gray-700">
          <p class="flex items-center gap-4 text-lg">
            <i class="fas fa-tag text-blue-600 text-xl"></i>
            <span class="font-medium">{{ job.category }}</span>
          </p>
          <p class="flex items-center gap-4 text-lg">
            <i class="fas fa-map-marker-alt text-blue-600 text-xl"></i>
            <span>{{ job.governorate }} - {{ job.city }}</span>
          </p>
          <p class="flex items-center gap-4 text-lg">
            <i class="fas fa-money-bill-wave text-blue-600 text-xl"></i>
            <span class="font-medium">{{ job.salary || 'حسب الاتفاق' }}</span>
          </p>
        </div>

        <!-- الأزرار -->
        <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-5 pt-6 border-t border-gray-100">
          <a routerLink="/job/{{job._id}}"
             class="text-blue-600 hover:text-blue-800 font-semibold text-lg flex items-center justify-center gap-3 hover:underline transition-all">
            <i class="fas fa-eye text-xl"></i>
            عرض التفاصيل
          </a>

          <!-- زر التقديم -->
          <ng-container *ngIf="isJobSeeker">
            <button *ngIf="!hasApplied"
                    (click)="openModal()"
                    class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300">
              <i class="fas fa-paper-plane text-xl"></i>
              تقديم الآن
            </button>

            <div *ngIf="hasApplied"
                 class="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-bold text-lg px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl">
              <i class="fas fa-check-circle text-2xl"></i>
              تم التقديم بنجاح
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Modal التقديم -->
      <app-apply-modal
        *ngIf="isJobSeeker"
        [isOpen]="modalOpen"
        [jobTitle]="job.shop_name"
        (onClose)="closeModal()"
        (onSubmit)="apply($event)">
      </app-apply-modal>

      <!-- Toast Message -->
      <div *ngIf="toastMessage"
           class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
        <div class="bg-white rounded-3xl shadow-2xl border border-gray-200 px-10 py-6 flex items-center gap-6 min-w-[340px]">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
          <div>
            <p class="font-bold text-gray-900 text-xl">فشل التقديم</p>
            <p class="text-gray-700 mt-2">{{ toastMessage }}</p>
          </div>
          <button (click)="toastMessage = null" class="text-gray-400 hover:text-gray-600 ml-auto">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
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
export class JobCardComponent {
  @Input() job: any;
  @Input() hasApplied = false;
  @Output() applySuccess = new EventEmitter<void>();

  modalOpen = false;
  toastMessage: string | null = null;

  private readonly DEFAULT_IMAGE = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';
  private cacheBuster = Date.now();

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  get isJobSeeker(): boolean {
    const user = this.authService.getUser();
    return this.authService.isLoggedIn() && user?.role === 'job_seeker';
  }

  getOwnerImage(): string {
    const ownerImage = this.job?.owner_id?.profileImage;
    if (ownerImage) {
      return `${ownerImage}?t=${this.cacheBuster}`;
    }
    return this.DEFAULT_IMAGE;
  }

  openModal() {
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  apply(message: string) {
    this.api.applyToJob({
      job_id: this.job._id,
      message
    }).subscribe({
      next: () => {
        this.modalOpen = false;
        this.hasApplied = true;
        this.applySuccess.emit();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: any) => {
        const errorMsg = err.error?.msg || err.error?.message || 'حدث خطأ أثناء التقديم، حاول مرة أخرى';
        this.toastMessage = errorMsg;
        setTimeout(() => this.toastMessage = null, 6000);
      }
    });
  }
}
