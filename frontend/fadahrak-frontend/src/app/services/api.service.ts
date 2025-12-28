import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // ← أضفنا ده

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // غير ده للدومين الحقيقي في الـ production (أو استخدم environment)
  private apiUrl = '/api'; // proxy في dev
  private imageBaseUrl = ''; // هنا الحل الذكي

  constructor(private http: HttpClient) {
    // في الـ production هيبقى الدومين الحقيقي
    // في الـ dev هيبقى فاضي عشان يشتغل مع الـ proxy
    this.imageBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? '' 
      : 'https://yourdomain.com'; // ← غيّر ده لدومينك الحقيقي
  }

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

  // ── دالة مساعدة لإضافة الـ base URL للصورة ──
  private fixImageUrl(data: any): any {
    if (!data) return data;

    // لو object واحد
    if (data.profileImage && typeof data.profileImage === 'string' && !data.profileImage.startsWith('http')) {
      data.profileImage = this.prependBaseUrl(data.profileImage);
    }

    // لو array من objects
    if (Array.isArray(data)) {
      return data.map(item => this.fixImageUrl(item));
    }

    // لو object فيه nested objects (مثل owner_id, seeker_id)
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
    return `${this.imageBaseUrl}/${path}`;
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
  // Profile
  // ──────────────────────────────────────────────────────────────
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

  // ──────────────────────────────────────────────────────────────
  // Jobs & Applications & Messages (نطبق نفس الـ fix)
  // ──────────────────────────────────────────────────────────────
  getJobs(filters?: any): Observable<any> {
    console.log('طلب بحث عن وظائف (بدون توكن):', filters || {});
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

  getMessages(appId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${appId}`, { headers: this.getHeaders() }).pipe(
      map(res => this.fixImageUrl(res))
    );
  }

  // ... باقي الدوال بدون تغيير (لأنها مش بترجع profileImage مباشرة)
  // يمكنك إضافة .pipe(map(...)) لأي دالة تانية لو لقيت فيها profileImage

  // ──────────────────────────────────────────────────────────────
  // باقي الدوال كما هي
  // ──────────────────────────────────────────────────────────────
  // (copy-paste الباقي من الكود القديم)
}
