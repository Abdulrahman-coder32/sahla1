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
            class="bg-blue-500 text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-medium
                   hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50
                   disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg">
            <i class="fas fa-paper-plane" *ngIf="!loading"></i>
            <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
            {{ loading ? 'جاري الإرسال...' : 'إرسال التقديم' }}
          </button>

          <!-- زر الإلغاء -->
          <button
            (click)="close()"
            [disabled]="loading"
            class="bg-gray-200 text-gray-800 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-medium
                   hover:bg-gray-300 active:scale-95 transition-all text-base sm:text-lg">
            إلغاء
          </button>

        </div>
      </div>
    </div>
  `
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
