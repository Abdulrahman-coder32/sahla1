import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-success-stories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen py-12 px-4 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div class="max-w-7xl mx-auto">
        <h1 class="section-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center">قصص نجاح عملائنا</h1>

        <!-- تحسين الـ Grid: إضافة breakpoint للأجهزة المتوسطة (xl) لتجنب الازدحام -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
          <div class="card p-6 sm:p-8 text-center hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl">
            <div class="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6"></div>
            <p class="text-base sm:text-lg italic text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              "لقيت موظف ممتاز في نفس الشارع في أقل من يومين! سَهلة غيرت طريقة توظيفي تمامًا"
            </p>
            <p class="font-bold text-primary text-lg sm:text-xl">أحمد - صاحب سوبر ماركت، الجيزة</p>
          </div>

          <div class="card p-6 sm:p-8 text-center hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl">
            <div class="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6"></div>
            <p class="text-base sm:text-lg italic text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              "كنت بدور على شغل قريب من البيت، ولقيت وظيفة مثالية في الكافيه تحت العمارة"
            </p>
            <p class="font-bold text-primary text-lg sm:text-xl">سارة - باحثة عن عمل، القاهرة</p>
          </div>

          <div class="card p-6 sm:p-8 text-center hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl">
            <div class="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6"></div>
            <p class="text-base sm:text-lg italic text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              "التواصل المباشر ساعدني أختار أفضل المتقدمين بسرعة وكفاءة"
            </p>
            <p class="font-bold text-primary text-lg sm:text-xl">محمد - صاحب صيدلية، الإسكندرية</p>
          </div>
        </div>

        <div class="text-center mt-12 sm:mt-16">
          <p class="text-xl sm:text-2xl md:text-3xl text-gray-800 mb-6 sm:mb-8">كن أنت القصة التالية!</p>
          <!-- تحسين حجم الزر: أكبر على الموبايل، مع padding أفضل لسهولة الضغط -->
          <a routerLink="/jobs" class="btn-primary px-8 py-4 sm:px-12 sm:py-5 rounded-full text-lg sm:text-xl inline-flex items-center gap-3 hover:bg-primary-dark transition-colors duration-200">
            <i class="fas fa-rocket"></i> ابدأ رحلتك الآن
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: bold;
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }
    .section-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 2rem;
    }
  `]
})
export class SuccessStoriesComponent {}
