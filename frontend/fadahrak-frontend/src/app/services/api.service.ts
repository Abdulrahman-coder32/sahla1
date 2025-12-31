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
  private imageBaseUrl: string;

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
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private prependBaseUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) path = path.substring(1);
    return this.imageBaseUrl === '' ? `/${path}` : `${this.imageBaseUrl}/${path}`;
  }

  // === التعديل الرئيسي: إضافة cache buster لكل الصور ===
  private processProfileImages(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map(item => this.processProfileImages(item));
    }

    if (typeof data === 'object') {
      // معالجة profileImage لليوزر نفسه أو أي يوزر تاني
      if (data.profileImage !== undefined) {
        let imageUrl = data.profileImage;

        // لو public_id (مش URL كامل)
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = this.prependBaseUrl(imageUrl);
        }

        // إضافة cache buster
        if (imageUrl && imageUrl.startsWith('http')) {
          const separator = imageUrl.includes('?') ? '&' : '?';
          const cacheBuster = data.cacheBuster ?? Date.now(); // استخدم cacheBuster من الـ DB، لو مش موجود استخدم timestamp
          imageUrl = `${imageUrl}${separator}v=${cacheBuster}`;
        } else {
          imageUrl = DEFAULT_AVATAR;
        }

        data.profileImage = imageUrl;
      } else {
        data.profileImage = DEFAULT_AVATAR;
      }

      // تكرار العملية على كل object داخلي (مثل owner في job، applicant في application...)
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

  // باقي الدوال زي ما هي (مع map للـ processProfileImages)
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
