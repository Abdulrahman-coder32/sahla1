import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { JobFormComponent } from '../job-form/job-form.component';
import { ApplicationListComponent } from '../application-list/application-list.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, JobFormComponent, ApplicationListComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 sm:py-20 px-4 sm:px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mb-8 sm:mb-12">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <i class="fas fa-tachometer-alt text-white text-2xl"></i>
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            لوحة تحكم صاحب العمل
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            إدارة وظائفك ومتابعة المتقدمين بسهولة.
          </p>
        </div>

        <!-- Job Form Section -->
        <section class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 mb-8 sm:mb-12">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
              <i class="fas fa-plus text-white text-xl"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
              نشر وظيفة جديدة
            </h2>
            <p class="text-gray-600 mt-2">
              أضف وظيفة جديدة لجذب أفضل المواهب.
            </p>
          </div>
          <app-job-form (submitSuccess)="onJobCreated($event)"></app-job-form>
        </section>

        <!-- Jobs Section -->
        <section class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mb-4 shadow-lg">
              <i class="fas fa-briefcase text-white text-xl"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
              وظائفي الحالية
            </h2>
            <p class="text-gray-600 mt-2">
              إدارة ومتابعة الوظائف التي نشرتها.
            </p>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-6"></div>
            <p class="text-xl text-gray-700 font-medium">جاري تحميل الوظائف...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && myJobs.length === 0"
            class="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <i class="fas fa-briefcase text-5xl text-gray-400"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
              لا توجد وظائف منشورة حاليًا
            </h3>
            <p class="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
              ابدأ بنشر وظيفة جديدة من الأعلى لبدء جذب المتقدمين!
            </p>
          </div>

          <!-- Jobs List -->
          <div *ngIf="!loading && myJobs.length > 0" class="space-y-8">
            <div *ngFor="let job of myJobs"
              class="bg-gray-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] border border-gray-100">
              <div class="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                      <i class="fas fa-building text-white text-lg"></i>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold text-gray-900">
                      {{ job.shop_name || job.owner_id?.shop_name || 'غير معروف' }} -
                      {{ job.category || 'غير محدد' }}
                    </h3>
                  </div>
                  <!-- Job Details -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div class="flex items-start gap-3">
                      <i class="fas fa-map-marker-alt text-blue-500 mt-1"></i>
                      <div>
                        <p class="text-sm text-gray-500 font-medium">الموقع</p>
                        <p class="text-gray-700">{{ job.governorate || 'غير محدد' }} - {{ job.city || 'غير محدد' }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <i class="fas fa-clock text-blue-500 mt-1"></i>
                      <div>
                        <p class="text-sm text-gray-500 font-medium">ساعات العمل</p>
                        <p class="text-gray-700">{{ job.working_hours || 'غير محدد' }}</p>
                      </div>
                    </div>
                    <div *ngIf="job.salary" class="flex items-start gap-3">
                      <i class="fas fa-money-bill text-blue-500 mt-1"></i>
                      <div>
                        <p class="text-sm text-gray-500 font-medium">الراتب</p>
                        <p class="text-gray-700">{{ job.salary }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="mb-6">
                    <p class="text-gray-800 font-semibold mb-3">المتطلبات:</p>
                    <div class="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
                      <p class="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {{ job.requirements || 'لا توجد متطلبات محددة' }}
                      </p>
                    </div>
                  </div>
                </div>
                <!-- Delete Button -->
                <button
                  (click)="deleteJob(job._id)"
                  class="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium
                         flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
                  <i class="fas fa-trash"></i>
                  <span>حذف الوظيفة</span>
                </button>
              </div>
              <!-- Applications Section -->
              <div class="mt-8 border-t border-gray-200 pt-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                    <i class="fas fa-users text-white text-sm"></i>
                  </div>
                  <h4 class="text-xl font-bold text-gray-900">
                    المتقدمين على هذه الوظيفة
                  </h4>
                </div>
                <app-application-list [jobId]="job._id"></app-application-list>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class OwnerDashboardComponent implements OnInit {
  myJobs: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadMyJobs();
  }

  loadMyJobs() {
    this.loading = true;
    this.api.getMyJobs().subscribe({
      next: (res: any) => {
        this.myJobs = res || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('خطأ في جلب الوظائف:', err);
        this.myJobs = [];
        this.loading = false;
      }
    });
  }

  onJobCreated(newJob: any) {
    if (!newJob || !newJob._id) {
      this.loadMyJobs();
      return;
    }
    this.myJobs.unshift(newJob);
  }

  deleteJob(id: string) {
    if (confirm('متأكد إنك عايز تحذف الوظيفة؟')) {
      this.api.deleteJob(id).subscribe({
        next: () => {
          this.myJobs = this.myJobs.filter(job => job._id !== id);
        },
        error: (err: any) => {
          console.error('خطأ في حذف الوظيفة:', err);
          alert('فشل حذف الوظيفة، حاول مرة أخرى');
        }
      });
    }
  }
}
