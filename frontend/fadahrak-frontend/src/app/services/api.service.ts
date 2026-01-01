import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const DEFAULT_AVATAR = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl: string;
  private cloudinaryBase = 'https://res.cloudinary.com/dv48puhaq/image/upload';

  constructor(private http: HttpClient) {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    this.apiUrl = '/api';
  }

  private getHeaders(includeToken: boolean = true, isMultipart: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();
    if (!isMultipart) {
      headers = headers.set('Content-Type', 'application/json');
    }
    if (includeToken) {
      const token = localStorage.getItem('token');
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // تحويل public_id إلى URL كامل من Cloudinary
  private getCloudinaryUrl(publicId: string): string {
    if (!publicId) return DEFAULT_AVATAR;
    return `${this.cloudinaryBase}/${publicId}`;
  }

  // معالجة الصور + إضافة cache buster قسري
  private processProfileImages(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map(item => this.processProfileImages(item));
    }

    if (typeof data === 'object') {
      if (data.profileImage !== undefined) {
        let imageUrl = data.profileImage;

        // لو public_id (مش URL كامل)
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = this.getCloudinaryUrl(imageUrl);
        }

        // لو URL كامل من Cloudinary أو ديفولت
        if (imageUrl && imageUrl.startsWith('http')) {
          const separator = imageUrl.includes('?') ? '&' : '?';
          // استخدم cacheBuster من الداتابيز، لو مش موجود أو 0 → استخدم timestamp عشوائي
          const cacheVersion = data.cacheBuster > 0 ? data.cacheBuster : Date.now();
          imageUrl = `${imageUrl}${separator}v=${cacheVersion}`;
        } else {
          imageUrl = DEFAULT_AVATAR;
        }

        data.profileImage = imageUrl;
      } else {
        data.profileImage = DEFAULT_AVATAR;
      }

      // معالجة كل object داخلي (owner_id, seeker_id, sender_id, etc.)
      Object.keys(data).forEach(key => {
        if (data[key] && typeof data[key] === 'object') {
          data[key] = this.processProfileImages(data[key]);
        }
      });
    }

    return data;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.error?.msg || error.message || 'خطأ في الاتصال بالسيرفر'));
  }

  // باقي الدوال مع map للـ processProfileImages
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data).pipe(
      map(res => this.processProfileImages(res)),
      catchError(this.handleError)
    );
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, data).pipe(
      map(res => this.processProfileImages(res)),
      catchError(this.handleError)
    );
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, { headers: this.getHeaders() }).pipe(
      map(res => this.processProfileImages(res)),
      catchError(this.handleError)
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/profile`, formData, { headers: this.getHeaders(true, true) }).pipe(
      map(res => this.processProfileImages(res)),
      catchError(this.handleError)
    );
  }

  getJobs(filters?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/jobs`, filters || {}, { headers: this.getHeaders() }).pipe(
      map(res => this.processProfileImages(res)),
      catchError(this.handleError)
    );
  }

  getJob(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/${id}`, { headers: this.getHeaders(false) }).pipe(
      map(res => this.processProfileImages(res)),
      catchError(this.handleError)
    );
  }

  getMyJobs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/my`, { headers: this.getHeaders() }).pipe(
      map(res => this.processProfileImages(res)),
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
      map(res => this.processProfileImages(res)),
      catchError(this.handleError)
    );
  }

  getApplicationsForOwner(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/my-jobs`, { headers: this.getHeaders() }).pipe(
      map(res => this.processProfileImages(res)),
      catchError(this.handleError)
    );
  }

  getApplicationsForJob(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/job/${jobId}`, { headers: this.getHeaders() }).pipe(
      map(res => this.processProfileImages(res)),
      catchError(this.handleError)
    );
  }

  updateApplicationStatus(applicationId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/applications/${applicationId}`, { status }, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getMessages(appId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${appId}`, { headers: this.getHeaders() }).pipe(
      map(res => this.processProfileImages(res)),
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
    return this.http.post(`${this.apiUrl}/messages/media`, formData, { headers: this.getHeaders(true, true) }).pipe(
      catchError(this.handleError)
    );
  }

  markMessagesAsRead(applicationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/messages/${applicationId}/mark-read`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
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
    return this.http.patch(`${this.apiUrl}/notifications/mark-chat-read/${applicationId}`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
}
