import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl: string;
  private imageBaseUrl: string;

  constructor(private http: HttpClient) {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDev) {
      this.apiUrl = '/api';        // مهم جدًا في الـ dev عشان الـ proxy
      this.imageBaseUrl = '';
    } else {
      this.apiUrl = '';            // في الـ production مفيش /api
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

  private fixImageUrl(data: any): any {
    if (!data) return data;

    if (data.profileImage && typeof data.profileImage === 'string' && !data.profileImage.startsWith('http')) {
      data.profileImage = this.prependBaseUrl(data.profileImage);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.fixImageUrl(item));
    }

    Object.keys(data).forEach(key => {
      if (data[key] && typeof data[key] === 'object') {
        data[key] = this.fixImageUrl(data[key]);
      } else if (key === 'profileImage' && data[key] && typeof data[key] === 'string' && !data[key].startsWith('http')) {
        data[key] = this.prependBaseUrl(data[key]);
      }
    });

    return data;
  }

  private prependBaseUrl(path: string): string {
    if (path.startsWith('/')) path = path.substring(1);
    if (this.imageBaseUrl === '') return `/${path}`;
    return `${this.imageBaseUrl}/${path}`;
  }

  // Auth
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, data);
  }

  // Profile
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, { headers: this.getHeaders() }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    const headers = this.getHeaders(true, true);
    return this.http.put(`${this.apiUrl}/users/profile`, formData, { headers }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  // Jobs
  getJobs(filters?: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/jobs`, filters || {}, { headers }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  getJob(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/${id}`, { headers: this.getHeaders(false) }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  getMyJobs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/my`, { headers: this.getHeaders() }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  createJob(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/jobs/create`, data, { headers: this.getHeaders() });
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/jobs/${id}`, { headers: this.getHeaders() });
  }

  // Applications
  applyToJob(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications`, data, { headers: this.getHeaders() });
  }

  getMyApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/my`, { headers: this.getHeaders() }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  getApplicationsForOwner(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/my-jobs`, { headers: this.getHeaders() }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  getApplicationsForJob(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/job/${jobId}`, { headers: this.getHeaders() }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  updateApplicationStatus(applicationId: string, status: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/applications/${applicationId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  // Messages
  getMessages(appId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${appId}`, { headers: this.getHeaders() }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  sendMessage(data: { application_id: string; message: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, data, { headers: this.getHeaders() });
  }

  sendMedia(applicationId: string, file: File, type: 'image' | 'audio' | 'file', filename?: string): Observable<any> {
    const formData = new FormData();
    formData.append('application_id', applicationId);
    formData.append('file', file);
    formData.append('type', type);
    if (filename) {
      formData.append('filename', filename);
    }
    const headers = this.getHeaders(true, true);
    return this.http.post(`${this.apiUrl}/messages/media`, formData, { headers });
  }

  markMessagesAsRead(applicationId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/messages/${applicationId}/mark-read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Notifications
  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/notifications/unread-count`, { headers: this.getHeaders() });
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() });
  }

  markChatNotificationsAsRead(applicationId: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/notifications/mark-chat-read/${applicationId}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
