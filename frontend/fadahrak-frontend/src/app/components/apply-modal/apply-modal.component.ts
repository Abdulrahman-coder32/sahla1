import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-apply-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen"
         class="fixed inset-0 bg-black bg-opacity-50 z-50
                flex items-center justify-center p-4 overflow-y-auto">

      <!-- المودال -->
      <div class="bg-white rounded-2xl shadow-2xl
                  max-w-lg w-full mx-4 sm:mx-0 p-6 sm:p-8 lg:p-10
                  relative max-h-[90vh] overflow-y-auto">

        <!-- عداد الإشعارات -->
        <div *ngIf="notificationCount > 0"
             class="absolute -top-3 -right-3 sm:top-4 sm:right-4
                    bg-red-500 text-white px-2.5 py-1 rounded-full text-xs sm:text-sm
                    flex items-center gap-1 shadow-lg z-10">
          <i class="fas fa-bell"></i>
          <span>{{ notificationCount }}</span>
          <button (click)="clearNotifications()"
                  class="ml-1 text-white hover:text-gray-200 active:text-gray-300">
            ×
          </button>
        </div>

        <!-- العنوان -->
        <h2 class="text-2xl sm:text-3xl font-bold text-center mb-3 text-gray-900">
          تقديم على وظيفة
        </h2>

        <p class="text-center text-gray-600 mb-6 text-base sm:text-lg px-4">
          {{ jobTitle }}
        </p>

        <!-- رسالة التقديم -->
        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2 text-base sm:text-lg">
            رسالة التقديم (اختياري)
          </label>
          <textarea
            [(ngModel)]="message"
            placeholder="اكتب رسالتك هنا... (خبراتك، سبب اهتمامك، إلخ)"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                   transition-all text-base resize-none"
            rows="6">
          </textarea>
        </div>

        <!-- الأزرار -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">

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

    /* Badge الإشعارات - أحمر ناعم */
    .notification-badge {
      position: absolute;
      top: -12px;
      right: -12px;
      background: #FEE2E2;
      color: #DC2626;
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

    /* Textarea */
    .modal-textarea {
      width: 100%;
      padding: 1rem 1.25rem;
      border-radius: 1rem;
      border: 1px solid #D1D5DB;
      background: #FFFFFF;
      font-size: 1rem;
      line-height: 1.6;
      transition: all 0.3s ease;
      resize: none;
      font-family: inherit;
    }

    .modal-textarea:focus {
      outline: none;
      border-color: #0EA5E9;
      box-shadow: 0 0 0 3px #E0F2FE;
    }

    .modal-textarea::placeholder {
      color: #9CA3AF;
    }

    /* الأزرار - مطابقة للكود السابق */
    .modal-btn {
      padding: 0.875rem 2rem;
      border-radius: 1rem;
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
      background: #E0F2FE;
      color: #0EA5E9;
    }

    .modal-btn-submit:hover:not(:disabled) {
      background: #B2DDFA;
    }

    .modal-btn-cancel {
      background: #F3F4F6;
      color: #6B7280;
    }

    .modal-btn-cancel:hover:not(:disabled) {
      background: #E5E7EB;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .modal-btn {
        font-size: 1rem;
        padding: 0.75rem 1.5rem;
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
