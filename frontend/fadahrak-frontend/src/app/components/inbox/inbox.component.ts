import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faMicrophone,
  faStop,
  faPaperclip,
  faPaperPlane,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="inbox-chat-container">
      <div class="chat-wrapper">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-user">
            <img
              [src]="getOtherUserImage()"
              alt="{{ chatName }}"
              class="header-avatar"
              loading="lazy"
              (error)="onImageError($event)"
            >
            <div>
              <h1 class="header-name">{{ chatName }}</h1>
              <p class="header-status">
                {{ selectedApp?.status === 'accepted' ? 'متصل الآن' : 'في انتظار القبول' }}
              </p>
            </div>
          </div>
          <button (click)="goBack()" class="header-back-btn">
            <fa-icon [icon]="faArrowLeft"></fa-icon>
            رجوع
          </button>
        </div>
        <!-- Messages Area -->
        <div #messagesContainer class="messages-area">
          <!-- Loading -->
          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل الرسائل...</p>
          </div>
          <!-- No Messages -->
          <div *ngIf="!loading && messages.length === 0" class="empty-state">
            <div class="empty-icon">
              <fa-icon [icon]="['fas', 'comments']"></fa-icon>
            </div>
            <p class="empty-title">لا توجد رسائل بعد</p>
            <p class="empty-text">ابدأ المحادثة بإرسال رسالة</p>
          </div>
          <!-- Messages -->
          <div *ngFor="let msg of messages; let i = index"
               class="message-wrapper"
               [ngClass]="{'my-message': isMyMessage(msg), 'other-message': !isMyMessage(msg)}"
               [@fadeIn]>
            <img
              [src]="isMyMessage(msg) ? (currentUser?.profileImage || defaultImage) : getOtherUserImage()"
              alt="{{ isMyMessage(msg) ? 'أنت' : chatName }}"
              class="message-avatar"
              loading="lazy"
              (error)="onImageError($event)"
            >
            <div class="message-bubble">
              <!-- Text -->
              <p *ngIf="msg.type === 'text'" class="message-text">{{ msg.message }}</p>
              <!-- Media -->
              <div *ngIf="msg.type !== 'text'" class="media-preview">
                <p class="media-type">
                  {{ msg.type === 'image' ? 'صورة' : msg.type === 'audio' ? 'تسجيل صوتي' : 'ملف' }}
                </p>
                <a *ngIf="msg.url" [href]="msg.url" target="_blank" class="media-link">
                  {{ msg.filename || 'تحميل الملف' }}
                </a>
              </div>
              <span class="message-time">{{ msg.timestamp | date:'shortTime' }}</span>
            </div>
          </div>
        </div>
        <!-- Input Area -->
        <div class="input-area">
          <div class="input-wrapper">
            <input #fileInput type="file" multiple accept="image/*,audio/*,.pdf,.doc,.docx"
                   (change)="onFilesSelected($event)" class="hidden" [disabled]="isDisabledInput()">
            <button (click)="fileInput.click()" [disabled]="isDisabledInput()" class="input-btn">
              <fa-icon [icon]="faPaperclip"></fa-icon>
            </button>
            <button (click)="toggleRecording()" [disabled]="isDisabledInput()" class="input-btn record-btn"
                    [class.recording]="isRecording">
              <fa-icon [icon]="isRecording ? faStop : faMicrophone"></fa-icon>
            </button>
            <input [(ngModel)]="newMessage" (keyup.enter)="sendMessage()"
                   placeholder="اكتب رسالتك هنا..."
                   class="message-input"
                   [disabled]="isDisabledInput()">
            <button (click)="sendMessage()" [disabled]="!newMessage.trim() || isDisabledInput()"
                    class="send-btn">
              <fa-icon [icon]="faPaperPlane"></fa-icon>
            </button>
          </div>
          <!-- File Upload Status -->
          <div *ngIf="selectedFiles.length" class="files-status">
            <div *ngFor="let f of selectedFiles" class="file-item"
                 [class.uploading]="f.status === 'uploading'"
                 [class.success]="f.status === 'success'"
                 [class.error]="f.status === 'error'">
              <span class="file-name">{{ f.file.name }}</span>
              <span *ngIf="f.status === 'uploading'">جاري الرفع...</span>
              <span *ngIf="f.status === 'success'">تم</span>
              <span *ngIf="f.status === 'error'">فشل</span>
            </div>
          </div>
        </div>
        <!-- Toast -->
        <div *ngIf="toastMessage" class="toast">
          <div class="toast-content">
            <fa-icon [icon]="['fas', 'exclamation-triangle']"></fa-icon>
            <div>
              <p class="toast-title">فشل في الإرسال</p>
              <p class="toast-message">{{ toastMessage }}</p>
            </div>
            <button (click)="toastMessage = null" class="toast-close">×</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    [@fadeIn] { animation: fadeIn 0.4s ease-out; }
    .inbox-chat-container {
      min-height: 100vh;
      padding: 1rem;
      direction: rtl;
      background: linear-gradient(to bottom, #F9FAFB, #E0F2FE);
      font-family: 'Tajawal', system-ui, sans-serif;
    }
    .chat-wrapper {
      max-width: 4xl;
      margin: 0 auto;
      height: 90vh;
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .chat-header {
      background: linear-gradient(to left, #0EA5E9, #0284C7);
      color: white;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid white;
    }
    .header-name {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
    }
    .header-status {
      font-size: 0.875rem;
      opacity: 0.9;
      margin: 0;
    }
    .header-back-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }
    .header-back-btn:hover {
      background: rgba(255,255,255,0.3);
    }
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background: linear-gradient(to bottom, #F8FAFC, #FFFFFF);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .message-wrapper {
      display: flex;
      gap: 1rem;
      max-width: 100%;
    }
    .my-message { flex-direction: row; }
    .other-message { flex-direction: row-reverse; }
    .message-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #E0F2FE;
      flex-shrink: 0;
    }
    .message-bubble {
      max-width: 80%;
      padding: 0.75rem 1rem;
      border-radius: 1.25rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      position: relative;
    }
    .my-message .message-bubble {
      background: #E0F2FE;
      color: #0EA5E9;
      border-bottom-left-radius: 0.5rem;
    }
    .other-message .message-bubble {
      background: #F3F4F6;
      color: #374151;
      border-bottom-right-radius: 0.5rem;
    }
    .message-text {
      margin: 0;
      line-height: 1.5;
      word-break: break-word;
    }
    .media-preview {
      text-align: center;
    }
    .media-type {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    .media-link {
      color: #0EA5E9;
      text-decoration: underline;
      font-size: 0.875rem;
    }
    .message-time {
      font-size: 0.75rem;
      color: #9CA3AF;
      margin-top: 0.5rem;
      display: block;
    }
    .my-message .message-time { text-align: left; }
    .other-message .message-time { text-align: right; }
    .input-area {
      padding: 1rem;
      background: white;
      border-top: 1px solid #E5E7EB;
    }
    .input-wrapper {
      display: flex;
      align-items: end;
      gap: 0.75rem;
    }
    .input-btn {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: #F3F4F6;
      color: #6B7280;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    .input-btn:hover { background: #E5E7EB; }
    .record-btn.recording {
      background: #FEE2E2;
      color: #DC2626;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .message-input {
      flex: 1;
      padding: 0.875rem 1.25rem;
      border-radius: 9999px;
      border: 1px solid #D1D5DB;
      background: #F8FAFC;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    .message-input:focus {
      outline: none;
      border-color: #0EA5E9;
      box-shadow: 0 0 0 3px #E0F2FE;
    }
    .send-btn {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: #E0F2FE;
      color: #0EA5E9;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    .send-btn:hover:not(:disabled) {
      background: #B2DDFA;
      transform: scale(1.1);
    }
    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .files-status {
      margin-top: 0.75rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .file-item {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .file-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .uploading { background: #E0F2FE; color: #0EA5E9; }
    .success { background: #D1E7DD; color: #16A34A; }
    .error { background: #FEE2E2; color: #DC2626; }
    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .spinner {
      width: 3.5rem;
      height: 3.5rem;
      border: 4px solid #E0F2FE;
      border-top: 4px solid #0EA5E9;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon {
      width: 5rem;
      height: 5rem;
      background: #F3F4F6;
      color: #9CA3AF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
    }
    .empty-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #374151;
      margin: 0 0 0.5rem;
    }
    .empty-text {
      font-size: 1rem;
      color: #6B7280;
    }
    .toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
    }
    .toast-content {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border: 1px solid #E5E7EB;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 320px;
      animation: fade-in-up 0.4s ease-out;
    }
    .toast-title {
      font-weight: 700;
      color: #1F2937;
      margin: 0;
    }
    .toast-message {
      color: #6B7280;
      margin: 0.25rem 0 0;
    }
    .toast-close {
      background: none;
      border: none;
      color: #9CA3AF;
      font-size: 1.5rem;
      cursor: pointer;
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 640px) {
      .inbox-chat-container { padding: 0.5rem; }
      .chat-header { padding: 1rem; }
      .header-name { font-size: 1.125rem; }
      .messages-area { padding: 1rem; }
      .input-area { padding: 0.75rem; }
      .input-wrapper { gap: 0.5rem; }
      .input-btn, .send-btn { width: 2.75rem; height: 2.75rem; }
    }
  `]
})
export class InboxComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  selectedApp: any = null;
  messages: any[] = [];
  newMessage = '';
  loading = true;
  currentUserId = '';
  currentUser: any = null;
  chatName = '';
  otherUserImage: string | null = null;
  otherUserCacheBuster: number = Date.now(); // لكسر الكاش دايمًا عند التحديث
  isJobSeeker = false;
  selectedFiles: { file: File; status: 'uploading' | 'success' | 'error' }[] = [];
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  toastMessage: string | null = null;

  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private userSubscription!: Subscription;

  readonly defaultImage = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

  faArrowLeft = faArrowLeft;
  faPaperclip = faPaperclip;
  faMicrophone = faMicrophone;
  faStop = faStop;
  faPaperPlane = faPaperPlane;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private socketService: SocketService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private library: FaIconLibrary
  ) {
    this.library.addIcons(faMicrophone, faStop, faPaperclip, faPaperPlane, faArrowLeft);
  }

  ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) this.currentUser = user;
    });

    this.currentUser = this.authService.getUser();
    this.socketService.connect();

    const token = localStorage.getItem('token');
    if (!token) { this.goBack(); return; }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId = payload.id || payload._id;
      this.isJobSeeker = payload.role === 'job_seeker';
    } catch (e) { this.goBack(); return; }

    const appId = this.route.snapshot.paramMap.get('id');
    if (!appId) { this.goBack(); return; }

    const apiCall = this.isJobSeeker ? this.api.getMyApplications() : this.api.getApplicationsForOwner();

    apiCall.subscribe({
      next: (apps: any[]) => {
        this.selectedApp = apps.find(a => a._id === appId);

        if (!this.selectedApp || this.selectedApp.status !== 'accepted') {
          this.toastMessage = 'الدردشة غير متاحة حاليًا';
          this.goBack();
          return;
        }

        this.chatName = this.getChatName(this.selectedApp);
        this.otherUserImage = this.isJobSeeker
          ? this.selectedApp.job_id?.owner_id?.profileImage || null
          : this.selectedApp.seeker_id?.profileImage || null;

        // كسر الكاش من البداية
        this.otherUserCacheBuster = Date.now();

        this.socketService.joinChat(this.selectedApp._id);

        // mark as read + تحديث إشعارات الشات
        this.markAsRead();
        this.notificationService.markChatNotificationsAsRead(this.selectedApp._id);

        this.loadMessages();

        this.socketService.onNewMessage((msg: any) => {
          if (this.selectedApp && msg.application_id === this.selectedApp._id) {
            const normalized = this.normalizeMessage(msg);

            if (normalized.sender_id === this.currentUserId) {
              const tempIndex = this.messages.findIndex(m => m._id.toString().startsWith('temp-'));

              if (tempIndex !== -1 && this.messages[tempIndex].message === normalized.message) {
                this.ngZone.run(() => {
                  this.messages[tempIndex] = normalized;
                  this.scrollToBottom();
                  this.cdr.detectChanges();
                });
              }
              return;
            }

            if (!this.messages.some(m => m._id === normalized._id)) {
              this.ngZone.run(() => {
                this.messages.push(normalized);
                this.scrollToBottom();
                this.cdr.detectChanges();
              });

              // تحديث إشعارات الشات والـ unread في الـ navbar
              this.notificationService.markChatNotificationsAsRead(this.selectedApp._id);
              this.markAsRead();
            }
          }
        });
      },
      error: () => this.goBack()
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.socketService.onNewMessage(() => {});
    this.userSubscription?.unsubscribe();
    if (this.mediaRecorder) this.mediaRecorder.stop();
  }

  // دالة جديدة لتحديث صورة الطرف الآخر مع كسر الكاش
  getOtherUserImage(): string {
    if (!this.otherUserImage) {
      return this.defaultImage;
    }
    const separator = this.otherUserImage.includes('?') ? '&' : '?';
    return `${this.otherUserImage}${separator}v=${this.otherUserCacheBuster}`;
  }

  isMyMessage(msg: any): boolean {
    const senderId = msg.sender_id?._id || msg.sender_id || '';
    return senderId === this.currentUserId;
  }

  isDisabledInput(): boolean {
    return this.isJobSeeker && this.selectedApp?.status !== 'accepted';
  }

  goBack() {
    this.router.navigate(['/inbox']);
  }

  getChatName(app: any) {
    return this.isJobSeeker
      ? app.job_id?.shop_name || 'صاحب العمل'
      : app.seeker_id?.name || 'باحث عن عمل';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.defaultImage) {
      img.src = this.defaultImage;
    }
  }

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files?.length || !this.selectedApp) return;

    Array.from(files).forEach((file: File) => {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastMessage = `الملف ${file.name} كبير جدًا (الحد الأقصى 10 ميجا)`;
        setTimeout(() => this.toastMessage = null, 6000);
        return;
      }
      const fileObj = { file, status: 'uploading' as const };
      this.selectedFiles.push(fileObj);
      this.uploadFile(fileObj);
    });
  }

  private uploadFile(fileObj: { file: File; status: 'uploading' | 'success' | 'error' }) {
    if (!this.selectedApp) return;

    const type = fileObj.file.type.startsWith('image/') ? 'image' :
                 fileObj.file.type.startsWith('audio/') ? 'audio' : 'file';

    this.api.sendMedia(this.selectedApp._id, fileObj.file, type, fileObj.file.name).subscribe({
      next: (savedMsg: any) => {
        fileObj.status = 'success';
        this.messages.push(this.normalizeMessage(savedMsg));
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: () => {
        fileObj.status = 'error';
        this.toastMessage = 'فشل رفع الملف، حاول مرة أخرى';
        setTimeout(() => this.toastMessage = null, 6000);
      }
    });
  }

  toggleRecording() {
    this.isRecording ? this.stopRecording() : this.startRecording();
  }

  private startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.toastMessage = 'المتصفح لا يدعم التسجيل الصوتي';
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordedChunks = [];
        this.isRecording = true;

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) this.recordedChunks.push(event.data);
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          this.uploadAudioFile(blob);
          this.isRecording = false;
          stream.getTracks().forEach(track => track.stop());
        };

        this.mediaRecorder.start();
      })
      .catch(() => {
        this.toastMessage = 'خطأ في الوصول للميكروفون';
        this.isRecording = false;
      });
  }

  private uploadAudioFile(blob: Blob) {
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
    const fileObj = { file, status: 'uploading' as const };
    this.selectedFiles.push(fileObj);
    this.uploadFile(fileObj);
  }

  private stopRecording() {
    if (this.mediaRecorder) this.mediaRecorder.stop();
  }

  private normalizeMessage(msg: any) {
    const senderId = msg.sender_id?._id || msg.sender_id || '';
    const senderName = senderId === this.currentUserId ? 'أنت' : this.chatName;

    return {
      _id: msg._id || 'temp-' + Date.now(),
      sender_id: senderId,
      sender_name: senderName,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      message: msg.message || '',
      type: msg.type || 'text',
      url: msg.url || null,
      filename: msg.filename || null
    };
  }

  private markAsRead() {
    if (!this.selectedApp?._id) return;

    this.api.markMessagesAsRead(this.selectedApp._id).subscribe({
      next: () => {
        // بعد mark as read نجبر تحديث الصورة
        this.otherUserCacheBuster = Date.now();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('خطأ في mark as read:', err)
    });
  }

  loadMessages() {
    if (!this.selectedApp) return;

    this.api.getMessages(this.selectedApp._id).subscribe({
      next: (msgs: any[]) => {
        this.messages = msgs.map(msg => this.normalizeMessage(msg));
        this.loading = false;
        this.scrollToBottom();
      },
      error: () => this.loading = false
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedApp) return;

    const text = this.newMessage.trim();
    this.newMessage = '';

    const tempMsg = this.normalizeMessage({
      _id: 'temp-' + Date.now(),
      sender_id: this.currentUserId,
      message: text,
      type: 'text',
      timestamp: new Date()
    });

    this.messages.push(tempMsg);
    this.scrollToBottom();

    this.api.sendMessage({ application_id: this.selectedApp._id, message: text }).subscribe({
      next: (savedMsg: any) => {
        const index = this.messages.findIndex(m => m._id === tempMsg._id);
        if (index !== -1) {
          this.messages[index] = this.normalizeMessage(savedMsg);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.messages = this.messages.filter(m => m._id !== tempMsg._id);
        this.toastMessage = 'فشل إرسال الرسالة، حاول مرة أخرى';
        setTimeout(() => this.toastMessage = null, 6000);
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
