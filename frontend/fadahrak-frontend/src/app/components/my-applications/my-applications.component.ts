import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="loading" class="text-center py-16 sm:py-20">
      <i class="fas fa-spinner fa-spin text-4xl sm:text-5xl lg:text-6xl text-primary"></i>
      <p class="mt-4 text-lg sm:text-xl lg:text-2xl">جاري تحميل تقديماتك...</p>
    </div>

    <div *ngIf="!loading && applications.length === 0" class="text-center py-16 sm:py-20">
      <i class="fas fa-file-alt text-4xl sm:text-5xl lg:text-6xl text-warning mb-4"></i>
      <p class="text-lg sm:text-xl lg:text-2xl text-gray-600">لم تقدم على أي وظائف بعد</p>
      <a routerLink="/jobs" class="btn-primary mt-6 py-3 sm:py-4 ripple flex items-center" aria-label="البحث عن وظائف">
        <i class="fas fa-search icon mr-2"></i>ابحث عن وظائف
      </a>
    </div>

    <div class="space-y-6 sm:space-y-8" *ngIf="!loading && applications.length > 0">
      <div *ngFor="let app of applications" class="card p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
          <div class="mb-4 sm:mb-0">
            <h4 class="text-xl sm:text-2xl font-bold flex items-center">
              <i class="fas fa-store icon text-primary mr-2"></i>{{ app.job_id.shop_name }}
            </h4>
            <p class="text-gray-600 flex items-center">
              <i class="fas fa-tags icon mr-2"></i>{{ app.job_id.category }} • {{ app.job_id.governorate }} - {{ app.job_id.city }}
            </p>
          </div>
          <span [class]="getStatusClass(app.status)" class="px-3 py-1 sm:px-4 rounded-full text-sm font-bold flex items-center self-start sm:self-auto">
            <i [class]="getStatusIcon(app.status)" class="mr-1"></i>{{ getStatusText(app.status) }}
          </span>
        </div>
        <p class="text-gray-700 mb-6 bg-gray-100 p-4 rounded-lg">{{ app.message }}</p>
        <a *ngIf="app.status === 'accepted'" [routerLink]="['/inbox', app._id]" class="btn-primary inline-block mt-4 py-3 sm:py-4 ripple flex items-center" aria-label="فتح الدردشة">
          <i class="fas fa-comments icon mr-2"></i>فتح الدردشة
        </a>
      </div>
    </div>
  `
})
export class MyApplicationsComponent implements OnInit {
  applications: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.api.getMyApplications().subscribe({
      next: (res) => {
        this.applications = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getStatusText(status: string) {
    return status === 'pending' ? 'معلق' : status === 'accepted' ? 'مقبول' : 'مرفوض';
  }

  getStatusClass(status: string) {
    return status === 'pending' ? 'bg-warning text-gray-900' : status === 'accepted' ? 'bg-success text-white' : 'bg-danger text-white';
  }

  getStatusIcon(status: string) {
    return status === 'pending' ? 'fas fa-hourglass-half' : status === 'accepted' ? 'fas fa-check-circle' : 'fas fa-times-circle';
  }
}
