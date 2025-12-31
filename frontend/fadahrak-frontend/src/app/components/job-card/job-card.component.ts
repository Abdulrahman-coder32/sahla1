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
    <div class="job-card">
      <!-- Header: صورة صاحب الوظيفة + اسم المتجر -->
      <div class="job-header">
        <div class="header-user">
          <img
            [src]="job?.owner_id?.profileImage || defaultImage"
            alt="صورة {{ job.shop_name }}"
            class="owner-avatar"
            loading="lazy"
            (error)="onImageError($event)"
          >
          <div>
            <h3 class="shop-name">{{ job.shop_name }}</h3>
            <p class="shop-label">صاحب العمل</p>
          </div>
        </div>
      </div>

      <!-- التفاصيل -->
      <div class="job-details">
        <div class="details-grid">
          <div class="detail-item">
            <i class="fas fa-tag"></i>
            <span>{{ job.category }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ job.governorate }} - {{ job.city }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-money-bill-wave"></i>
            <span class="salary">{{ job.salary || 'حسب الاتفاق' }}</span>
          </div>
        </div>

        <!-- الأزرار -->
        <div class="job-actions">
          <a routerLink="/job/{{job._id}}" class="btn-details">
            <i class="fas fa-eye"></i>
            عرض التفاصيل
          </a>

          <!-- زر التقديم -->
          <ng-container *ngIf="isJobSeeker">
            <button *ngIf="!hasApplied" (click)="openModal()" class="btn-apply">
              <i class="fas fa-paper-plane"></i>
              تقديم الآن
            </button>
            <div *ngIf="hasApplied" class="applied-status">
              <i class="fas fa-check-circle"></i>
              تم التقديم بنجاح
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Toast Message -->
      <div *ngIf="toastMessage" class="toast">
        <div class="toast-content">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <p class="toast-title">فشل التقديم</p>
            <p class="toast-message">{{ toastMessage }}</p>
          </div>
          <button (click)="toastMessage = null" class="toast-close">×</button>
        </div>
      </div>
    </div>

    <!-- Modal التقديم خارج الكارد -->
    <app-apply-modal
      *ngIf="isJobSeeker && modalOpen"
      [isOpen]="modalOpen"
      [jobTitle]="job.shop_name"
      (onClose)="closeModal()"
      (onSubmit)="apply($event)">
    </app-apply-modal>
  `,
  styles: [`
    .job-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      border: 1px solid #E5E7EB;
      overflow: hidden;
      transition: all 0.4s ease;
      max-width: 100%;
    }

    .job-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 35px rgba(0, 0, 0, 0.12);
    }

    .job-header {
      background: linear-gradient(to right, #E0F2FE, #CFFAFE);
      padding: 1.5rem;
      display: flex;
      align-items: center;
    }

    .header-user {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    .owner-avatar {
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .shop-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .shop-label {
      font-size: 0.9375rem;
      color: #6B7280;
      margin: 0.25rem 0 0;
    }

    .job-details {
      padding: 1.5rem;
    }

    .details-grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.0625rem;
      color: #374151;
    }

    .detail-item i {
      color: #0EA5E9;
      width: 1.5rem;
      text-align: center;
    }

    .salary {
      font-weight: 600;
      color: #1F2937;
    }

    .job-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #E5E7EB;
    }

    @media (min-width: 640px) {
      .job-actions {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .btn-details {
      color: #0EA5E9;
      font-weight: 600;
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-details:hover {
      color: #0284C7;
      text-decoration: underline;
    }

    .btn-apply {
      background: #E0F2FE;
      color: #0EA5E9;
      font-weight: 600;
      font-size: 1.125rem;
      padding: 0.875rem 1.5rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-apply:hover {
      background: #B2DDFA;
      transform: translateY(-2px);
    }

    .applied-status {
      background: #D1E7DD;
      color: #16A34A;
      font-weight: 600;
      font-size: 1.125rem;
      padding: 0.875rem 1.5rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
    }

    .toast-content {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border: 1px solid #E5E7EB;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 320px;
      animation: fade-in-up 0.4s ease-out;
    }

    .toast-title {
      font-weight: 700;
      color: #1F2937;
      margin: 0;
    }

    .toast-message {
      color: #6B7280;
      margin: 0.25rem 0 0;
    }

    .toast-close {
      background: none;
      border: none;
      color: #9CA3AF;
      font-size: 1.5rem;
      cursor: pointer;
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .job-card { margin: 0.5rem; }
      .job-header { padding: 1rem; }
      .owner-avatar { width: 4rem; height: 4rem; }
      .shop-name { font-size: 1.375rem; }
      .job-details { padding: 1rem; }
      .details-grid { gap: 0.875rem; }
      .detail-item { font-size: 1rem; }
      .btn-apply, .applied-status { font-size: 1rem; padding: 0.75rem 1rem; }
    }
  `]
})
export class JobCardComponent {
  @Input() job!: any;
  @Input() hasApplied = false;
  @Output() applySuccess = new EventEmitter<void>();

  modalOpen = false;
  toastMessage: string | null = null;
  readonly defaultImage = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  get isJobSeeker(): boolean {
    const user = this.authService.getUser();
    return this.authService.isLoggedIn() && user?.role === 'job_seeker';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.defaultImage) {
      img.src = this.defaultImage;
    }
    img.onerror = null;
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
