import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl: string;
  private imageBaseUrl: string;

  // رابط Cloudinary الأساسي
  private readonly CLOUDINARY_BASE = 'https://res.cloudinary.com/dv48puhaq/image/upload/';

  constructor(private http: HttpClient) {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    this.apiUrl = '/api';
    this.imageBaseUrl = isDev ? '' : 'https://positive-christiana-sahla-18a86cd2.koyeb.app';
  }

  private getHeaders(includeToken: boolean = true, isMultipart: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();
    if (!isMultipart) {
      headers = headers.set('Content-Type', 'application/json');
    }
    if (includeToken) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  /**
   * تحويل أي شكل من profileImage إلى رابط صورة كامل
   */
  private getFullImageUrl(path: string): string {
    if (!path) return '';

    // 1. الرابط كامل بالفعل (Cloudinary أو غيره)
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // 2. مسار قديم يبدأ بـ /sahla-profiles/
    if (path.includes('/sahla-profiles/')) {
      const parts = path.split('/sahla-profiles/');
      const publicIdPart = parts[1]?.split('?')[0] || '';
      if (publicIdPart) {
        return `${this.CLOUDINARY_BASE}c_fill,f_auto,g_face,h_400,q_auto,r_max,w_400/v1/sahla-profiles/${publicIdPart}`;
      }
    }

    // 3. public_id خام بدون / (user_xxxxxx)
    if (!path.includes('/') && !path.startsWith('/')) {
      return `${this.CLOUDINARY_BASE}c_fill,f_auto,g_face,h_400,q_auto,r_max,w_400/v1/sahla-profiles/${path}`;
    }

    // 4. أي مسار نسبي آخر (نادر جدًا)
    let cleaned = path.startsWith('/') ? path.substring(1) : path;
    return this.imageBaseUrl ? `${this.imageBaseUrl}/${cleaned}` : `/${cleaned}`;
  }

  private addCacheBuster(data: any): any {
    if (!data) return data;

    const timestamp = Date.now();

    const processImage = (url: string | null | undefined): string | null => {
      if (!url || typeof url !== 'string') return null;

      const fullUrl = this.getFullImageUrl(url);
      const separator = fullUrl.includes('?') ? '&' : '?';
      return `${fullUrl}${separator}t=${timestamp}`;
    };

    // معالجة الحقول الرئيسية
    if (data.profileImage) {
      data.profileImage = processImage(data.profileImage);
    }

    if (data.owner_id?.profileImage) {
      data.owner_id.profileImage = processImage(data.owner_id.profileImage);
    }

    if (data.seeker_id?.profileImage) {
      data.seeker_id.profileImage = processImage(data.seeker_id.profileImage);
    }

    // معالجة القوائم
    if (Array.isArray(data)) {
      return data.map(item => this.addCacheBuster(item));
    }

    // معالجة الكائنات المتداخلة
    Object.keys(data).forEach(key => {
      if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        data[key] = this.addCacheBuster(data[key]);
      }
    });

    return data;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'خطأ في الاتصال بالسيرفر'));
  }

  // ────────────────────────────────────────────────────────────────────────
  // باقي الدوال بدون تغيير (انسخها من ملفك القديم)
  // ────────────────────────────────────────────────────────────────────────

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data).pipe(catchError(this.handleError));
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, data).pipe(catchError(this.handleError));
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, { headers: this.getHeaders() }).pipe(
      map(res => this.addCacheBuster(res)),
      catchError(this.handleError)
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    const headers = this.getHeaders(true, true);
    return this.http.put(`${this.apiUrl}/users/profile`, formData, { headers }).pipe(
      map(res => this.addCacheBuster(res)),
      catchError(this.handleError)
    );
  }

  getJobs(filters?: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/jobs`, filters || {}, { headers }).pipe(
      map(res => this.addCacheBuster(res)),
      catchError(this.handleError)
    );
  }

  getJob(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/${id}`, { headers: this.getHeaders(false) }).pipe(
      map(res => this.addCacheBuster(res)),
      catchError(this.handleError)
    );
  }

  getMyJobs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/my`, { headers: this.getHeaders() }).pipe(
      map(res => this.addCacheBuster(res)),
      catchError(this.handleError)
    );
  }

  createJob(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/jobs/create`, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/jobs/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  applyToJob(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications`, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getMyApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/my`, { headers: this.getHeaders() }).pipe(
      map(res => this.addCacheBuster(res)),
      catchError(this.handleError)
    );
  }

  getApplicationsForOwner(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/my-jobs`, { headers: this.getHeaders() }).pipe(
      map(res => this.addCacheBuster(res)),
      catchError(this.handleError)
    );
  }

  getApplicationsForJob(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/job/${jobId}`, { headers: this.getHeaders() }).pipe(
      map(res => this.addCacheBuster(res)),
      catchError(this.handleError)
    );
  }

  updateApplicationStatus(applicationId: string, status: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/applications/${applicationId}`,
      { status },
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getMessages(appId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${appId}`, { headers: this.getHeaders() }).pipe(
      map(res => this.addCacheBuster(res)),
      catchError(this.handleError)
    );
  }

  sendMessage(data: { application_id: string; message: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  sendMedia(applicationId: string, file: File, type: 'image' | 'audio' | 'file', filename?: string): Observable<any> {
    const formData = new FormData();
    formData.append('application_id', applicationId);
    formData.append('file', file);
    formData.append('type', type);
    if (filename) formData.append('filename', filename);
    const headers = this.getHeaders(true, true);
    return this.http.post(`${this.apiUrl}/messages/media`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  markMessagesAsRead(applicationId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/messages/${applicationId}/mark-read`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/notifications/unread-count`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  markChatNotificationsAsRead(applicationId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/notifications/mark-chat-read/${applicationId}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
}
