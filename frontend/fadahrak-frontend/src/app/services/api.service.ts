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

    // دايمًا نستخدم /api سواء dev أو production
    this.apiUrl = '/api';

    if (isDev) {
      this.imageBaseUrl = ''; // في dev الصور relative
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
    if (path.startsWith('http')) return path; // لو كان URL كامل بالفعل
    if (path.startsWith('/')) path = path.substring(1);
    return this.imageBaseUrl === '' ? `/${path}` : `${this.imageBaseUrl}/${path}`;
  }

  private addCacheBuster(data: any): any {
    if (!data) return data;

    const timestamp = Date.now();

    if (data.profileImage && typeof data.profileImage === 'string') {
      const base = this.prependBaseUrl(data.profileImage);
      data.profileImage = `${base}?t=${timestamp}`;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.addCacheBuster(item));
    }

    Object.keys(data).forEach(key => {
      if (data[key] && typeof data[key] === 'object') {
        data[key] = this.addCacheBuster(data[key]);
      } else if (key === 'profileImage' && data[key] && typeof data[key] === 'string') {
        const base = this.prependBaseUrl(data[key]);
        data[key] = `${base}?t=${timestamp}`;
      }
    });

    return data;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'خطأ في الاتصال بالسيرفر'));
  }

  // Auth
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data).pipe(
      catchError(this.handleError)
    );
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Profile
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, { headers: this.getHeaders() }).pipe(
      map(res => this.addCacheBuster(res)), // ← أضفنا cache buster هنا
      catchError(this.handleError)
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    const headers = this.getHeaders(true, true);
    return this.http.put(`${this.apiUrl}/users/profile`, formData, { headers }).pipe(
      map(res => this.addCacheBuster(res)), // ← cache buster بعد التحديث
      catchError(this.handleError)
    );
  }

  // Jobs
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

  // Applications
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

  // Messages
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

  // Notifications
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
