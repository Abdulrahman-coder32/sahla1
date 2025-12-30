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

  constructor(private http: HttpClient) {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    this.apiUrl = '/api';
    if (isDev) {
      this.imageBaseUrl = '';
    } else {
      this.imageBaseUrl = 'https://positive-christiana-sahla-18a86cd2.koyeb.app';
    }
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

  private prependBaseUrl(path: string): string {
    if (!path) return '';

    // لو الرابط كامل (Cloudinary, S3, أي رابط خارجي) → نرجعه زي ما هو بدون تغيير
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    let cleanedPath = path;

    // تصليح المسار القديم الغلط (لو لسه موجود في الداتابيز)
    if (cleanedPath.includes('/sahla-profiles/')) {
      cleanedPath = cleanedPath.replace('/sahla-profiles/', '/uploads/');
    }

    // إزالة / من البداية لو موجود
    if (cleanedPath.startsWith('/')) {
      cleanedPath = cleanedPath.substring(1);
    }

    // إرجاع الرابط مع الـ base المناسب
    return this.imageBaseUrl === '' 
      ? `/${cleanedPath}` 
      : `${this.imageBaseUrl}/${cleanedPath}`;
  }

  private cleanUrl(url: string): string {
    if (!url) return '';
    return url.split('?')[0]; // نزيل أي query string موجود
  }

  private addCacheBuster(data: any): any {
    if (!data) return data;
    const timestamp = Date.now();

    const processProfileImage = (url: string | null | undefined): string | null => {
      if (!url || typeof url !== 'string') return null;

      const clean = this.cleanUrl(url);

      // حالة 1: رابط كامل (Cloudinary مثلاً) → نضيف cache buster بس
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        return `${clean}?t=${timestamp}`;
      }

      // حالة 2: مسار نسبي → نضيف base URL + cache buster
      const base = this.prependBaseUrl(clean);
      return `${base}?t=${timestamp}`;
    };

    // معالجة profileImage في الـ object الرئيسي
    if (data.profileImage && typeof data.profileImage === 'string') {
      data.profileImage = processProfileImage(data.profileImage);
    } else if (data.hasOwnProperty('profileImage')) {
      data.profileImage = null;
    }

    // owner_id.profileImage
    if (data.owner_id && typeof data.owner_id === 'object') {
      if (data.owner_id.profileImage && typeof data.owner_id.profileImage === 'string') {
        data.owner_id.profileImage = processProfileImage(data.owner_id.profileImage);
      } else {
        data.owner_id.profileImage = null;
      }
    }

    // seeker_id.profileImage
    if (data.seeker_id && typeof data.seeker_id === 'object') {
      if (data.seeker_id.profileImage && typeof data.seeker_id.profileImage === 'string') {
        data.seeker_id.profileImage = processProfileImage(data.seeker_id.profileImage);
      } else {
        data.seeker_id.profileImage = null;
      }
    }

    // لو array (قائمة وظائف أو تقديمات)
    if (Array.isArray(data)) {
      return data.map(item => this.addCacheBuster(item));
    }

    // معالجة أي key اسمه profileImage في أي nested object
    Object.keys(data).forEach(key => {
      if (data[key] && typeof data[key] === 'object') {
        data[key] = this.addCacheBuster(data[key]);
      } else if (key === 'profileImage' && typeof data[key] === 'string') {
        data[key] = processProfileImage(data[key]);
      } else if (key === 'profileImage') {
        data[key] = null;
      }
    });

    return data;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'خطأ في الاتصال بالسيرفر'));
  }

  // ────────────────────────────────────────────────────────────────────────
  // باقي الدوال بدون تغيير
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
