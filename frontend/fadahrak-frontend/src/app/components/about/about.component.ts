import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen py-12 px-4 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div class="max-w-6xl mx-auto">
        <div class="card p-8 sm:p-12 lg:p-16 text-center"> <!-- زيادة الـ padding في الشاشات الكبيرة -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-10 text-primary">عن سَهلة</h1>
          <p class="text-xl sm:text-2xl lg:text-3xl text-gray-700 leading-relaxed mb-12 max-w-4xl mx-auto">
            سَهلة هي منصة مصرية بسيطة وفعالة تهدف لتسهيل عملية التوظيف المحلي بين أصحاب المحلات والباحثين عن عمل في نفس المنطقة.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
            <div class="bg-primary/10 p-8 lg:p-10 rounded-3xl hover:bg-primary/20 transition-all duration-300 hover:scale-105">
              <i class="fas fa-map-marked-alt text-5xl lg:text-6xl text-primary mb-6"></i>
              <h3 class="text-2xl lg:text-3xl font-bold mb-4">محلي 100%</h3>
              <p class="text-gray-700 text-lg lg:text-xl">وظائف في منطقتك فقط، بدون سفر أو مواصلات</p>
            </div>
            <div class="bg-primary/10 p-8 lg:p-10 rounded-3xl hover:bg-primary/20 transition-all duration-300 hover:scale-105">
              <i class="fas fa-comments text-5xl lg:text-6xl text-primary mb-6"></i>
              <h3 class="text-2xl lg:text-3xl font-bold mb-4">تواصل مباشر</h3>
              <p class="text-gray-700 text-lg lg:text-xl">دردشة فورية مع صاحب العمل بعد القبول</p>
            </div>
            <div class="bg-primary/10 p-8 lg:p-10 rounded-3xl hover:bg-primary/20 transition-all duration-300 hover:scale-105">
              <i class="fas fa-shield-alt text-5xl lg:text-6xl text-primary mb-6"></i>
              <h3 class="text-2xl lg:text-3xl font-bold mb-4">آمن وموثوق</h3>
              <p class="text-gray-700 text-lg lg:text-xl">حماية بياناتك وتواصل آمن</p>
            </div>
          </div>

          <a routerLink="/jobs" class="btn-primary px-12 py-5 lg:px-16 lg:py-6 rounded-full text-xl lg:text-2xl inline-flex items-center gap-3 hover:scale-105 transition-all duration-300">
            <i class="fas fa-search"></i> ابدأ البحث عن وظيفتك
          </a>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent implements OnInit {

  ngOnInit(): void {
    // ده اللي هيرجع الصفحة لأعلى فورًا لما تفتح
    window.scrollTo(0, 0);

    // أو لو عايز تأكد أكتر (بعض المتصفحات بتحتاج setTimeout صغير)
    // setTimeout(() => window.scrollTo(0, 0), 0);
  }
}
