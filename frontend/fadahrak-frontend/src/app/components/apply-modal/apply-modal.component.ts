import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-apply-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay">
      <!-- المودال -->
      <div class="modal-content">
        <!-- عداد الإشعارات -->
        <div *ngIf="notificationCount > 0" class="notification-badge">
          <i class="fas fa-bell"></i>
          <span>{{ notificationCount }}</span>
          <button (click)="clearNotifications()" class="close-btn">×</button>
        </div>

        <!-- العنوان -->
        <h2 class="modal-title">
          تقديم على وظيفة
        </h2>

        <p class="modal-subtitle">
          {{ jobTitle }}
        </p>

        <!-- رسالة التقديم -->
        <div class="modal-form-group">
          <label class="modal-label">
            رسالة التقديم (اختياري)
          </label>
          <textarea
            [(ngModel)]="message"
            placeholder="اكتب رسالتك هنا... (خبراتك، سبب اهتمامك، إلخ)"
            class="modal-textarea"
            rows="6">
          </textarea>
        </div>

        <!-- الأزرار -->
        <div class="modal-buttons">
          <!-- زر الإرسال -->
          <button
            (click)="submit()"
            [disabled]="loading || !message.trim()"
            class="modal-btn modal-btn-submit">
            <i class="fas fa-paper-plane" *ngIf="!loading"></i>
            <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
            {{ loading ? 'جاري الإرسال...' : 'إرسال التقديم' }}
          </button>

          <!-- زر الإلغاء -->
          <button
            (click)="close()"
            [disabled]="loading"
            class="modal-btn modal-btn-cancel">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* الخلفية الشفافة للمودال */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999; /* فوق كل شيء */
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      overflow-y: auto;
    }

    /* المودال نفسه */
    .modal-content {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 600px; /* زيادة العرض قليلاً للشاشات الكبيرة */
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      z-index: 10000;
      padding: 2rem; /* padding أكبر للشاشات الكبيرة */
    }

    /* عداد الإشعارات */
    .notification-badge {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      background: #fee2e2;
      color: #dc2626;
      padding: 0.5rem 0.75rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }

    .close-btn {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.125rem;
      cursor: pointer;
      margin-left: 0.25rem;
      padding: 0;
    }

    /* العنوان */
    .modal-title {
      font-size: 2rem; /* أكبر قليلاً */
      font-weight: bold;
      text-align: center;
      margin-bottom: 0.75rem;
      color: #111827;
    }

    /* الوصف */
    .modal-subtitle {
      text-align: center;
      color: #6b7280;
      margin-bottom: 1.5rem;
      font-size: 1.125rem;
      padding: 0 1rem;
    }

    /* مجموعة النموذج */
    .modal-form-group {
      margin-bottom: 1.5rem;
    }

    .modal-label {
      display: block;
      color: #374151;
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 1.125rem;
    }

    /* Textarea */
    .modal-textarea {
      width: 100%;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.75rem;
      background: #ffffff;
      font-size: 1rem;
      line-height: 1.6;
      transition: all 0.3s ease;
      resize: none;
      font-family: inherit;
    }

    .modal-textarea:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px #e0f2fe;
    }

    .modal-textarea::placeholder {
      color: #9ca3af;
    }

    /* الأزرار */
    .modal-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: center;
      align-items: center;
    }

    .modal-btn {
      padding: 0.875rem 2rem;
      border-radius: 0.75rem;
      font-size: 1.125rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      min-width: 160px;
      cursor: pointer;
      border: none;
    }

    .modal-btn:hover {
      transform: translateY(-2px);
    }

    .modal-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .modal-btn-submit {
      background: #e0f2fe;
      color: #0ea5e9;
    }

    .modal-btn-submit:hover:not(:disabled) {
      background: #b2ddfa;
    }

    .modal-btn-cancel {
      background: #f3f4f6;
      color: #6b7280;
    }

    .modal-btn-cancel:hover:not(:disabled) {
      background: #e5e7eb;
    }

    /* Responsive للشاشات الصغيرة */
    @media (max-width: 640px) {
      .modal-content {
        margin: 1rem;
        padding: 1.5rem; /* padding أصغر على الهواتف */
        max-width: 95vw; /* أوسع قليلاً على الهواتف */
        max-height: 85vh;
      }

      .modal-title {
        font-size: 1.5rem; /* أصغر على الهواتف */
      }

      .modal-subtitle {
        font-size: 1rem;
        padding: 0;
      }

      .modal-label {
        font-size: 1rem;
      }

      .modal-textarea {
        font-size: 0.9rem;
        padding: 0.75rem;
      }

      .modal-btn {
        font-size: 1rem;
        padding: 0.75rem 1.5rem;
        min-width: 140px;
      }

      .modal-buttons {
        flex-direction: row; /* الأزرار جنب بعض على الهواتف */
        gap: 0.75rem;
      }
    }

    /* للشاشات المتوسطة */
    @media (min-width: 641px) and (max-width: 1024px) {
      .modal-content {
        max-width: 500px;
        padding: 1.75rem;
      }

      .modal-buttons {
        flex-direction: row; /* الأزرار جنب بعض على التابلت */
      }
    }
  `]
})
export class ApplyModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() jobTitle = '';
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<string>();

  message = '';
  loading = false;
  notificationCount = 0;

  constructor(private elRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        // منع scroll الـ background + إرجاع الـ scroll لأعلى
        document.body.classList.add('overflow-hidden');
        window.scrollTo(0, 0);

        // تركيز على الـ textarea بعد فتح المودال (تحسين UX)
        setTimeout(() => {
          const textarea = this.elRef.nativeElement.querySelector('textarea');
          textarea?.focus();
        }, 100);
      } else {
        // إعادة الـ scroll للـ body لما يتقفل
        document.body.classList.remove('overflow-hidden');
      }
    }
  }

  submit() {
    const trimmedMessage = this.message.trim();
    if (!trimmedMessage || this.loading) return;

    this.loading = true;
    this.onSubmit.emit(trimmedMessage);

    // محاكاة إرسال ناجح
    setTimeout(() => {
      this.loading = false;
      this.notificationCount++;
      this.close();
    }, 1000);
  }

  close() {
    if (this.loading) return;

    this.onClose.emit();
    this.message = '';
    this.loading = false;
  }

  clearNotifications() {
    this.notificationCount = 0;
  }
}
