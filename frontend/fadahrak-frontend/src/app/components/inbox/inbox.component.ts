import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, NgZone } from '@angular/core';
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
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-4xl mx-auto h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img
              [src]="getOtherUserImageUrl()"
              alt="{{ chatName }}"
              class="w-12 h-12 rounded-full object-cover ring-4 ring-white shadow-lg"
              loading="lazy"
            >
            <div>
              <h1 class="text-xl font-bold truncate max-w-[200px]">{{ chatName }}</h1>
              <p class="text-sm opacity-90">
                {{ selectedApp?.status === 'accepted' ? 'متصل الآن' : 'في انتظار القبول' }}
              </p>
            </div>
          </div>
          <button (click)="goBack()"
                  class="bg-white/20 hover:bg-white/30 px-5 py-3 rounded-2xl font-medium flex items-center gap-2 transition-all">
            <fa-icon [icon]="faArrowLeft"></fa-icon>
            رجوع
          </button>
        </div>
        <!-- Messages Area -->
        <div #messagesContainer class="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
          <!-- Loading -->
          <div *ngIf="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
          <!-- No Messages -->
          <div *ngIf="!loading && messages.length === 0" class="text-center py-20 text-gray-500">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <fa-icon [icon]="['fas', 'comments']" class="text-5xl text-gray-400"></fa-icon>
            </div>
            <p class="text-xl font-medium">لا توجد رسائل بعد</p>
            <p class="text-base mt-2">ابدأ المحادثة بإرسال رسالة</p>
          </div>
          <!-- Messages -->
          <div *ngFor="let msg of messages"
               class="flex items-start gap-4 max-w-full"
               [ngClass]="{'flex-row-reverse': isMyMessage(msg)}">
            <!-- Avatar -->
            <img
              [src]="isMyMessage(msg) ? getCurrentUserImage() : getOtherUserImageUrl()"
              alt="{{ isMyMessage(msg) ? 'أنت' : chatName }}"
              class="w-10 h-10 rounded-full object-cover ring-4 ring-white shadow-lg flex-shrink-0"
              loading="lazy"
            >
            <!-- Message Bubble -->
            <div class="flex flex-col max-w-[80%]">
              <div class="px-5 py-3 rounded-3xl shadow-md"
                   [ngClass]="{
                     'bg-blue-600 text-white rounded-br-none': isMyMessage(msg),
                     'bg-gray-200 text-gray-900 rounded-bl-none': !isMyMessage(msg)
                   }">
                <!-- Text Message -->
                <p *ngIf="msg.type === 'text'" class="text-base leading-relaxed break-words whitespace-pre-wrap">
                  {{ msg.message }}
                </p>
                <!-- Media Message -->
                <div *ngIf="msg.type !== 'text'" class="text-center">
                  <p class="text-sm font-medium">
                    {{ msg.type === 'image' ? '🖼 صورة' : msg.type === 'audio' ? '🎤 تسجيل صوتي' : '📎 ملف' }}
                  </p>
                  <a *ngIf="msg.url" [href]="msg.url" target="_blank"
                     class="text-sm text-blue-300 hover:underline mt-2 block">
                    {{ msg.filename || 'تحميل الملف' }}
                  </a>
                </div>
              </div>
              <!-- Timestamp -->
              <span class="text-xs text-gray-500 mt-2 px-2"
                    [ngClass]="{'text-left': isMyMessage(msg), 'text-right': !isMyMessage(msg)}">
                {{ msg.timestamp | date:'shortTime' }}
              </span>
            </div>
          </div>
        </div>
        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-200">
          <div class="flex items-end gap-3">
            <!-- Attach Files -->
            <input #fileInput type="file" multiple accept="image/*,audio/*,.pdf,.doc,.docx"
                   (change)="onFilesSelected($event)" class="hidden" [disabled]="isDisabledInput()">
            <button (click)="fileInput.click()" [disabled]="isDisabledInput()"
                    class="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all">
              <fa-icon [icon]="faPaperclip" class="text-xl text-gray-700"></fa-icon>
            </button>
            <!-- Voice Record -->
            <button (click)="toggleRecording()" [disabled]="isDisabledInput()"
                    class="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                    [ngClass]="isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'">
              <fa-icon [icon]="isRecording ? faStop : faMicrophone" class="text-xl"></fa-icon>
            </button>
            <!-- Message Input -->
            <input [(ngModel)]="newMessage" (keyup.enter)="sendMessage()"
                   placeholder="اكتب رسالتك هنا..."
                   class="flex-1 px-5 py-4 rounded-3xl border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 text-base bg-gray-50"
                   [disabled]="isDisabledInput()">
            <!-- Send Button -->
            <button (click)="sendMessage()" [disabled]="!newMessage.trim() || isDisabledInput()"
                    class="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
              <fa-icon [icon]="faPaperPlane" class="text-lg"></fa-icon>
            </button>
          </div>
          <!-- File Upload Status -->
          <div *ngIf="selectedFiles.length" class="mt-4 flex flex-wrap gap-3">
            <div *ngFor="let f of selectedFiles"
                 class="px-4 py-2 rounded-2xl text-sm flex items-center gap-2"
                 [ngClass]="{
                   'bg-blue-100 text-blue-700': f.status === 'uploading',
                   'bg-green-100 text-green-700': f.status === 'success',
                   'bg-red-100 text-red-700': f.status === 'error'
                 }">
              <span class="truncate max-w-[150px]">{{ f.file.name }}</span>
              <span *ngIf="f.status === 'uploading'">جاري الرفع...</span>
              <span *ngIf="f.status === 'success'">✓ تم</span>
              <span *ngIf="f.status === 'error'">✗ فشل</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Toast Message -->
      <div *ngIf="toastMessage"
           class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
        <div class="bg-white rounded-3xl shadow-2xl border border-gray-200 px-8 py-6 flex items-center gap-5 min-w-[320px]">
          <fa-icon [icon]="['fas', 'exclamation-triangle']" class="text-3xl text-red-500"></fa-icon>
          <div>
            <p class="font-bold text-gray-900 text-lg">فشل في الإرسال</p>
            <p class="text-gray-700 mt-1">{{ toastMessage }}</p>
          </div>
          <button (click)="toastMessage = null" class="ml-auto text-gray-400 hover:text-gray-600">
            <fa-icon [icon]="['fas', 'times']" class="text-2xl"></fa-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.5s ease-out;
    }
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
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
  isJobSeeker = false;
  selectedFiles: { file: File; status: 'uploading' | 'success' | 'error' }[] = [];
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  toastMessage: string | null = null;

  private ngZone = inject(NgZone);
  private cacheBuster = Date.now();
  private userSubscription!: Subscription;

  private readonly DEFAULT_IMAGE = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

  // تعريف الأيقونات كـ properties عشان الـ template يشوفها
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
      if (user) {
        this.currentUser = user;
        this.cacheBuster = Date.now();
      }
    });

    this.currentUser = this.authService.getUser();
    this.socketService.connect();

    const token = localStorage.getItem('token');
    if (!token) {
      this.goBack();
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId = payload.id || payload._id;
      this.isJobSeeker = payload.role === 'job_seeker';
    } catch (e) {
      console.error('خطأ في قراءة التوكن', e);
      this.goBack();
      return;
    }

    const appId = this.route.snapshot.paramMap.get('id');
    if (!appId) {
      this.goBack();
      return;
    }

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
        this.socketService.joinChat(this.selectedApp._id);
        this.markAsRead();
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
                });
              }
              return;
            }

            if (!this.messages.some(m => m._id === normalized._id)) {
              this.ngZone.run(() => {
                this.messages.push(normalized);
                this.scrollToBottom();
              });
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

  getCurrentUserImage(): string {
    if (!this.currentUser?.profileImage) return this.DEFAULT_IMAGE;
    return `${this.currentUser.profileImage}?t=${this.cacheBuster}`;
  }

  getOtherUserImageUrl(): string {
    if (!this.selectedApp) return this.DEFAULT_IMAGE;

    let otherUserImage: string | null = null;

    if (this.isJobSeeker) {
      otherUserImage = this.selectedApp.job_id?.owner_id?.profileImage || null;
    } else {
      otherUserImage = this.selectedApp.seeker_id?.profileImage || null;
    }

    if (!otherUserImage) return this.DEFAULT_IMAGE;

    return `${otherUserImage}?t=${this.cacheBuster}`;
  }

  getChatName(app: any) {
    return this.isJobSeeker
      ? app.job_id?.shop_name || 'صاحب العمل'
      : app.seeker_id?.name || 'باحث عن عمل';
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
