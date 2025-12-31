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
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css']
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
    window.scrollTo(0, 0);
    this.loadApplications();

    this.socketService.onNewApplication((data: any) => {
      if (data.application.job_id._id === this.jobId) {
        this.applications.unshift(data.application);
        this.unreadNotifications++;
      }
    });
  }

  loadApplications() {
    this.loading = true;
    this.api.getApplicationsForJob(this.jobId).subscribe({
      next: (res: any) => {
        this.applications = res || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('خطأ في جلب المتقدمين:', err);
        this.loading = false;
      }
    });
  }

  // تحسين: استخدام cache buster ديناميكي (يتجدد كل مرة)
  getSeekerImage(app: any): string {
    const seeker = app.seeker_id;
    if (!seeker?.profileImage) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(seeker?.name || 'م')}&background=E0F2FE&color=0EA5E9&size=128&bold=true`;
    }
    const timestamp = Date.now();
    return `${seeker.profileImage}${seeker.profileImage.includes('?') ? '&' : '?'}v=${timestamp}`;
  }

  acceptApplication(id: string) {
    this.updateStatus(id, 'accepted');
  }

  rejectApplication(id: string) {
    this.updateStatus(id, 'rejected');
  }

  private updateStatus(id: string, status: 'accepted' | 'rejected') {
    this.api.updateApplicationStatus(id, status).subscribe({
      next: (updatedApp: any) => {
        const i = this.applications.findIndex(a => a._id === id);
        if (i !== -1) this.applications[i] = updatedApp;
      },
      error: (err: any) => {
        console.error('خطأ في تحديث الحالة:', err);
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

  getStatusText(status: string): string {
    return status === 'pending' ? 'معلق'
         : status === 'accepted' ? 'مقبول'
         : status === 'rejected' ? 'مرفوض'
         : 'غير معروف';
  }

  getStatusClass(status: string): string {
    return status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
         : status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-300'
         : status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300'
         : 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
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
