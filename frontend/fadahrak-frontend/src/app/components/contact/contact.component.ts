import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen py-12 px-4 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div class="max-w-4xl mx-auto">
        <div class="card p-8 sm:p-12">
          <h1 class="text-4xl sm:text-5xl font-bold text-center mb-8 text-primary">اتصل بنا</h1>
          <p class="text-xl text-center text-gray-600 mb-12">
            عندك سؤال أو اقتراح أو مشكلة؟ راسلنا وهنرد عليك في أقرب وقت
          </p>

          <form #contactForm="ngForm" (ngSubmit)="onSubmit(contactForm)" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input type="text" name="name" [(ngModel)]="contact.name" placeholder="اسمك الكامل" class="input-field" required #name="ngModel">
              <input type="email" name="email" [(ngModel)]="contact.email" placeholder="بريدك الإلكتروني" class="input-field" required email #email="ngModel">
            </div>
            <input type="text" name="subject" [(ngModel)]="contact.subject" placeholder="موضوع الرسالة" class="input-field" required #subject="ngModel">
            <textarea name="message" [(ngModel)]="contact.message" placeholder="اكتب رسالتك هنا..." rows="8" class="input-field" required #message="ngModel"></textarea>

            <div class="text-center">
              <button type="submit" [disabled]="!contactForm.valid" class="btn-primary px-8 py-4 sm:px-12 sm:py-5 rounded-full text-lg sm:text-xl transition hover:scale-105">
                إرسال الرسالة
              </button>
            </div>
          </form>

          <div class="mt-12 text-center">
            <p class="text-lg text-gray-600 mb-6">أو تواصل معانا عبر:</p>
            <div class="flex justify-center gap-4 sm:gap-8 text-3xl sm:text-4xl">
              <a href="https://www.facebook.com/yourpage" target="_blank" class="text-primary hover:scale-110 transition"><i class="fab fa-facebook"></i></a>
              <a href="https://www.instagram.com/youraccount" target="_blank" class="text-primary hover:scale-110 transition"><i class="fab fa-instagram"></i></a>
              <a href="https://wa.me/1234567890" target="_blank" class="text-primary hover:scale-110 transition"><i class="fab fa-whatsapp"></i></a>
              <a href="mailto:your@email.com" class="text-primary hover:scale-110 transition"><i class="fas fa-envelope"></i></a>
            </div>
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
    .input-field {
      width: 100%;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    .input-field:focus {
      border-color: #6366f1;
      outline: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: bold;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ContactComponent {
  // أضفنا object للـ contact data
  contact = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Form submitted:', this.contact);
      // هنا هتضيف منطق إرسال الرسالة (مثل API call)
      alert('تم إرسال الرسالة بنجاح!');
      // Reset the form and the model
      form.reset();
      this.contact = { name: '', email: '', subject: '', message: '' };
    }
  }
}
