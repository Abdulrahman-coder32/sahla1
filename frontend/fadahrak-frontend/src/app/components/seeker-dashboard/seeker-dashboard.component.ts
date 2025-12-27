import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyApplicationsComponent } from '../my-applications/my-applications.component';
import { JobListComponent } from '../job-list/job-list.component';
import { RouterLink } from '@angular/router'; // أضفته عشان الـ routerLink للإشعارات

@Component({
  selector: 'app-seeker-dashboard',
  standalone: true,
  imports: [CommonModule, MyApplicationsComponent, JobListComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 sm:py-20 px-4 sm:px-6">
      <div class="max-w-7xl mx-auto">

        <!-- Header Section -->
        <div class="text-center mb-8 sm:mb-12">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <i class="fas fa-user-graduate text-white text-2xl"></i>
          </div>
          <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            لوحة تحكم الباحث عن عمل
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            استكشف الوظائف المناسبة لك وتابع تقديماتك بسهولة.
          </p>
        </div>

        <!-- My Applications Section -->
        <section class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 mb-8 sm:mb-12">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mb-4 shadow-lg">
              <i class="fas fa-file-alt text-white text-xl"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
              تقديماتي
            </h2>
            <p class="text-gray-600 mt-2">
              مراجعة ومتابعة طلبات التقديم التي قدمتها.
            </p>
          </div>
          <app-my-applications></app-my-applications>
        </section>

        <!-- Recommended Jobs Section -->
        <section class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 mb-8 sm:mb-12">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4 shadow-lg">
              <i class="fas fa-thumbs-up text-white text-xl"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
              وظائف موصى بها
            </h2>
            <p class="text-gray-600 mt-2">
              وظائف مناسبة لمهاراتك واهتماماتك.
            </p>
          </div>
          <app-job-list></app-job-list>
        </section>

        <!-- Tip Section -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full mb-4 shadow-lg">
            <i class="fas fa-lightbulb text-white text-lg"></i>
          </div>
          <p class="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            نصيحة: راجع تقديماتك بانتظام، وتابع حالة كل طلب. إذا تم قبولك، ابدأ الدردشة فورًا مع صاحب العمل لزيادة فرصك!
          </p>
        </div>
      </div>
    </div>
  `
})
export class SeekerDashboardComponent {
  notificationCount = 3; // مثال، هيبقى من الـ API في الواقع

  // ممكن تضيف ngOnInit هنا عشان تحمل الإشعارات
}
