import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';  // بفضل الـ proxy

  constructor(private http: HttpClient) {}

  private getHeaders(includeToken: boolean = true, isMultipart: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();

    if (!isMultipart) {
      headers = headers.set('Content-Type', 'application/json');
    }

    if (includeToken) {
      const token = localStorage.getItem('token');
      console.log('ApiService: Token from localStorage:', token ? 'موجود' : 'مش موجود');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  // ──────────────────────────────────────────────────────────────
  // Auth
  // ──────────────────────────────────────────────────────────────
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, data);
  }

  // ──────────────────────────────────────────────────────────────
  // Jobs
  // ──────────────────────────────────────────────────────────────
  getJobs(filters?: any): Observable<any> {
    console.log('طلب بحث عن وظائف (بدون توكن):', filters || {});
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/jobs`, filters || {}, { headers });
  }

  getJob(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/${id}`, { headers: this.getHeaders(false) });
  }

  getMyJobs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/my`, { headers: this.getHeaders() });
  }

  createJob(data: any): Observable<any> {
    console.log('إرسال طلب إنشاء وظيفة جديدة:', data);
    return this.http.post(`${this.apiUrl}/jobs/create`, data, { headers: this.getHeaders() });
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/jobs/${id}`, { headers: this.getHeaders() });
  }

  // ──────────────────────────────────────────────────────────────
  // Applications
  // ──────────────────────────────────────────────────────────────
  applyToJob(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications`, data, { headers: this.getHeaders() });
  }

  getMyApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/my`, { headers: this.getHeaders() });
  }

  getApplicationsForOwner(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/my-jobs`, { headers: this.getHeaders() });
  }

  getApplicationsForJob(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/job/${jobId}`, { headers: this.getHeaders() });
  }

  updateApplicationStatus(id: string, status: 'accepted' | 'rejected'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/applications/${id}`, { status }, { headers: this.getHeaders() });
  }

  // ──────────────────────────────────────────────────────────────
  // Users
  // ──────────────────────────────────────────────────────────────
  updateProfile(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}`, data, { headers: this.getHeaders() });
  }

  // ──────────────────────────────────────────────────────────────
  // Messages
  // ──────────────────────────────────────────────────────────────

  getMessages(appId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${appId}`, { headers: this.getHeaders() });
  }

  /** إرسال رسالة نصية عادية */
  sendMessage(data: { application_id: string; message: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, data, { headers: this.getHeaders() });
  }

  /**
   * إرسال ملف/صورة/صوت (multipart/form-data)
   * @param applicationId معرف الطلب/المحادثة
   * @param file الملف نفسه
   * @param type نوع المحتوى (image / audio / file)
   * @param originalFileName الاسم الأصلي للملف (اختياري)
   */
  sendMedia(
    applicationId: string,
    file: File,
    type: 'image' | 'audio' | 'file',
    originalFileName?: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('application_id', applicationId);
    formData.append('file', file);
    formData.append('type', type);

    if (originalFileName) {
      formData.append('filename', originalFileName);
    }

    const headers = this.getHeaders(true, true); // isMultipart = true → بدون Content-Type

    return this.http.post(`${this.apiUrl}/messages/media`, formData, { headers });
  }

  /** جديد: وضع علامة قراءة لكل الرسائل في محادثة معينة (تصفير unreadCount) */
  markMessagesAsRead(applicationId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/messages/${applicationId}/mark-read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Notifications (إضافات جديدة)
  // ──────────────────────────────────────────────────────────────

  /** جلب جميع الإشعارات للمستخدم الحالي */
  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  /** جلب عدد الإشعارات غير المقروءة */
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/notifications/unread-count`, { headers: this.getHeaders() });
  }

  /** تحديث حالة الإشعار إلى مقروء */
  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() });
  }

  /** حذف إشعار */
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/${notificationId}`, { headers: this.getHeaders() });
  }

  // ← جديد: وضع علامة قراءة على إشعارات الشات المحدد في الداتابيز
  markChatNotificationsAsRead(applicationId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/notifications/mark-chat-read/${applicationId}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
