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
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <!-- Header: صورة صاحب الوظيفة + اسم المتجر -->
      <div class="p-5 flex items-center gap-4 bg-gradient-to-r from-sky-50 to-blue-50">
        <div class="flex-shrink-0">
          <img
            [src]="getOwnerImage()"
            alt="صورة {{ job.shop_name }}"
            class="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
            loading="lazy"
          >
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-bold text-gray-800 truncate">
            {{ job.shop_name }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">صاحب العمل</p>
        </div>
      </div>

      <!-- التفاصيل -->
      <div class="p-5 space-y-4">
        <div class="space-y-3 text-gray-700">
          <p class="flex items-center gap-3 text-base">
            <i class="fas fa-tag text-blue-600"></i>
            <span class="font-medium">{{ job.category }}</span>
          </p>
          <p class="flex items-center gap-3 text-base">
            <i class="fas fa-map-marker-alt text-blue-600"></i>
            <span>{{ job.governorate }} - {{ job.city }}</span>
          </p>
          <p class="flex items-center gap-3 text-base">
            <i class="fas fa-money-bill-wave text-blue-600"></i>
            <span class="font-medium">{{ job.salary || 'حسب الاتفاق' }}</span>
          </p>
        </div>

        <!-- الأزرار -->
        <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4 border-t border-gray-100">
          <a routerLink="/job/{{job._id}}"
             class="text-blue-600 hover:text-blue-800 font-medium text-base flex items-center justify-center gap-2 hover:underline transition-all">
            <i class="fas fa-eye"></i>
            عرض التفاصيل
          </a>

          <!-- زر التقديم -->
          <ng-container *ngIf="isJobSeeker">
            <button *ngIf="!hasApplied"
                    (click)="openModal()"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
              <i class="fas fa-paper-plane"></i>
              تقديم الآن
            </button>

            <span *ngIf="hasApplied"
                  class="text-green-600 font-semibold text-base flex items-center gap-2 bg-green-50 px-5 py-3 rounded-xl">
              <i class="fas fa-check-circle text-lg"></i>
              تم التقديم بنجاح
            </span>
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

      <!-- Toast Message مخصص (بدل alert) -->
      <div *ngIf="toastMessage"
           class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
        <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 px-8 py-5 flex items-center gap-4 min-w-[300px]">
          <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          <div>
            <p class="font-semibold text-gray-800">فشل التقديم</p>
            <p class="text-sm text-gray-600 mt-1">{{ toastMessage }}</p>
          </div>
          <button (click)="toastMessage = null" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover\\:shadow-xl:hover {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.4s ease-out;
    }
  `]
})
export class JobCardComponent {
  @Input() job: any;
  @Input() hasApplied = false;
  @Output() applySuccess = new EventEmitter<void>();

  modalOpen = false;
  toastMessage: string | null = null;
  private cacheBuster = Date.now();

  private readonly DEFAULT_IMAGE = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

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
    if (!ownerImage) {
      return this.DEFAULT_IMAGE;
    }
    return `${ownerImage}?t=${this.cacheBuster}`;
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
        console.error('خطأ في التقديم:', err);
        const errorMsg = err.error?.msg || err.error?.message || 'حدث خطأ أثناء التقديم، حاول مرة أخرى';
        this.toastMessage = errorMsg;
        setTimeout(() => this.toastMessage = null, 5000);
      }
    });
  }
}
