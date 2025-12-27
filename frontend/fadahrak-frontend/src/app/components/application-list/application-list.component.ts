import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="w-full overflow-x-hidden bg-gray-50 py-12 px-4 sm:px-6" dir="rtl">

      <!-- Unread Notifications Badge -->
      <div *ngIf="unreadNotifications > 0"
           class="fixed top-16 sm:top-20 left-4 right-4 sm:left-4 sm:right-auto z-50
                  max-w-[calc(100vw-2rem)] sm:max-w-[90vw]
                  bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full
                  shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base animate-pulse">
        <i class="fas fa-bell"></i>
        <span>{{ unreadNotifications }} إشعار جديد</span>
        <button (click)="clearNotifications()"
                class="text-white hover:text-gray-200 active:text-gray-300">
          ×
        </button>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto">

        <!-- Loading State -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-6"></div>
          <p class="text-xl text-gray-700 font-medium">جاري تحميل المتقدمين...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && applications.length === 0"
             class="text-center py-16 bg-white rounded-3xl shadow-xl border border-gray-100">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <i class="fas fa-users-slash text-6xl text-gray-400"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-4">
            لا يوجد متقدمين حاليًا
          </h3>
          <p class="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            عندما يتقدم أحد الباحثين عن عمل، سيظهر هنا فورًا.
          </p>
        </div>

        <!-- Applications List -->
        <div *ngIf="!loading && applications.length > 0" class="space-y-8">
          <div *ngFor="let app of applications"
               class="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] border border-gray-100">

            <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">

              <!-- Applicant Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <i class="fas fa-user text-white text-lg"></i>
                  </div>
                  <h3 class="text-xl sm:text-2xl font-bold text-gray-900">
                    {{ app.seeker_id?.name || 'غير معروف' }}
                    <span class="text-sm font-normal text-gray-600">
                      (العمر: {{ app.seeker_id?.age || 'غير محدد' }})
                    </span>
                  </h3>
                </div>

                <!-- Applicant Info Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div class="flex items-start gap-3">
                    <i class="fas fa-envelope text-blue-500 mt-1"></i>
                    <div>
                      <p class="text-sm text-gray-500 font-medium">البريد الإلكتروني</p>
                      <p class="text-gray-700 break-all">{{ maskEmail(app.seeker_id?.email) }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <i class="fas fa-map-marker-alt text-blue-500 mt-1"></i>
                    <div>
                      <p class="text-sm text-gray-500 font-medium">الموقع</p>
                      <p class="text-gray-700">{{ app.seeker_id?.governorate }} - {{ app.seeker_id?.city }}</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <i class="fas fa-briefcase text-blue-500 mt-1"></i>
                    <div>
                      <p class="text-sm text-gray-500 font-medium">الخبرة</p>
                      <p class="text-gray-700">{{ app.seeker_id?.work_experience || 'غير محددة' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Application Message -->
                <div class="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-100">
                  <p class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <i class="fas fa-comment-dots text-blue-500"></i>
                    رسالة التقديم:
                  </p>
                  <p class="text-gray-700 leading-relaxed break-words">
                    {{ app.message }}
                  </p>
                </div>
              </div>

              <!-- Status and Actions -->
              <div class="flex flex-col gap-4 w-full lg:w-auto lg:min-w-[200px]">

                <!-- Status Badge -->
                <span [class]="getStatusClass(app.status)"
                      class="inline-flex justify-center items-center gap-2
                             px-4 py-3 rounded-xl font-bold text-sm sm:text-base shadow-md">
                  <i [class]="getStatusIcon(app.status)"></i>
                  {{ getStatusText(app.status) }}
                </span>

                <!-- Accept/Reject Buttons -->
                <div *ngIf="app.status === 'pending'"
                     class="flex flex-col sm:flex-row gap-3">
                  <button (click)="acceptApplication(app._id)"
                          class="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-medium
                                 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
                    <i class="fas fa-check"></i> قبول
                  </button>
                  <button (click)="rejectApplication(app._id)"
                          class="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium
                                 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
                    <i class="fas fa-times"></i> رفض
                  </button>
                </div>

                <!-- Open Chat Button -->
                <a *ngIf="app.status === 'accepted'"
                   [routerLink]="['/inbox', app._id]"
                   class="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium
                          flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg">
                  <i class="fas fa-comments"></i>
                  فتح الدردشة
                </a>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ApplicationListComponent implements OnInit, OnDestroy {
  @Input() jobId!: string;

  applications: any[] = [];
  loading = true;
  unreadNotifications = 0;
  private socketSubscription!: Subscription;

  constructor(
    private api: ApiService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    // Scroll to top
    window.scrollTo(0, 0);

    this.loadApplications();

    this.socketService.onNewApplication((data: any) => {
      if (data.application.job_id._id === this.jobId) {
        this.applications.unshift(data.application);
        this.unreadNotifications++;
        // Removed alert for better UX; notifications are shown via badge
      }
    });
  }

  loadApplications() {
    this.loading = true;
    this.api.getApplicationsForJob(this.jobId).subscribe({
      next: (res) => {
        this.applications = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  acceptApplication(id: string) {
    this.updateStatus(id, 'accepted');
  }

  rejectApplication(id: string) {
    this.updateStatus(id, 'rejected');
  }

  private updateStatus(id: string, status: 'accepted' | 'rejected') {
    this.api.updateApplicationStatus(id, status).subscribe({
      next: (updatedApp) => {
        const i = this.applications.findIndex(a => a._id === id);
        if (i !== -1) this.applications[i] = updatedApp;
      }
    });
  }

  clearNotifications() {
    this.unreadNotifications = 0;
  }

  maskEmail(email: string): string {
    if (!email) return 'غير متوفر';
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return local.substring(0, 2) + '...@' + domain;
  }

  getStatusText(status: string) {
    return status === 'pending' ? 'معلق'
         : status === 'accepted' ? 'مقبول'
         : status === 'rejected' ? 'مرفوض'
         : 'غير معروف';
  }

  getStatusClass(status: string) {
    return status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
         : status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-300'
         : status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300'
         : 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string) {
    return status === 'pending' ? 'fas fa-hourglass-half'
         : status === 'accepted' ? 'fas fa-check-circle'
         : status === 'rejected' ? 'fas fa-times-circle'
         : 'fas fa-question-circle';
  }

  ngOnDestroy() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }
}
