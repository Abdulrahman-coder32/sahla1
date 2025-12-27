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
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">

      <div class="p-4 sm:p-5">

        <h3 class="text-lg sm:text-xl font-bold text-primary mb-3">
          {{ job.shop_name }}
        </h3>

        <div class="space-y-2 mb-5 text-gray-700 text-sm sm:text-base">
          <p class="flex items-center gap-2">
            <i class="fas fa-tag text-primary text-sm sm:text-base"></i>
            {{ job.category }}
          </p>
          <p class="flex items-center gap-2">
            <i class="fas fa-map-marker-alt text-primary text-sm sm:text-base"></i>
            {{ job.governorate }} - {{ job.city }}
          </p>
          <p class="flex items-center gap-2">
            <i class="fas fa-money-bill-wave text-primary text-sm sm:text-base"></i>
            {{ job.salary || 'حسب الاتفاق' }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

          <a routerLink="/job/{{job._id}}"
             class="text-primary text-sm sm:text-base hover:underline transition-all flex items-center gap-1">
            <i class="fas fa-eye text-sm"></i>
            عرض التفاصيل
          </a>

          <!-- قبل التقديم -->
          <button *ngIf="isJobSeeker && !hasApplied"
                  (click)="openModal()"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base flex items-center gap-2 transition-all shadow-md hover:shadow-lg">
            <i class="fas fa-paper-plane"></i>
            تقديم الآن
          </button>

          <!-- بعد التقديم (ثابت وواضح) -->
          <span *ngIf="isJobSeeker && hasApplied"
                class="text-green-600 text-sm sm:text-base font-semibold flex items-center gap-1">
            <i class="fas fa-check-circle"></i>
            تم التقديم
          </span>

        </div>
      </div>

      <app-apply-modal
        *ngIf="isJobSeeker"
        [isOpen]="modalOpen"
        [jobTitle]="job.shop_name"
        (onClose)="closeModal()"
        (onSubmit)="apply($event)">
      </app-apply-modal>
    </div>
  `,
  styles: [`
    .hover\:shadow-lg:hover {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class JobCardComponent {
  @Input() job: any;
  @Input() hasApplied = false;
  @Output() applySuccess = new EventEmitter<void>();

  modalOpen = false;

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  get isJobSeeker(): boolean {
    const user = this.authService.getUser();
    return this.authService.isLoggedIn() && user?.role === 'job_seeker';
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

        // تغيير الحالة فورًا
        this.hasApplied = true;

        // رجوع لأول الصفحة
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // إبلاغ الأب (لو بيعمل reload)
        this.applySuccess.emit();
      }
    });
  }
}
