import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
// Font Awesome imports
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
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule
  ],
  template: `
  <div class="min-h-screen bg-gray-100 p-2 sm:p-4">
    <div class="max-w-4xl mx-auto h-[95vh] flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
      <!-- Header -->
      <div class="bg-blue-600 text-white p-3 sm:p-4 flex justify-between items-center flex-shrink-0">
        <div class="text-right flex-1 min-w-0 pr-2">
          <h1 class="text-lg sm:text-xl font-bold truncate">{{ chatName }}</h1>
          <p class="text-xs sm:text-sm opacity-80 mt-1">
            {{ selectedApp?.status === 'accepted' ? 'الدردشة مفتوحة' : 'في انتظار القبول' }}
          </p>
        </div>
        <button (click)="goBack()"
                class="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all shadow-md flex items-center gap-1">
          <fa-icon icon="arrow-left" size="sm"></fa-icon>
          رجوع
        </button>
      </div>

      <!-- Messages container -->
      <div #messagesContainer class="flex-1 flex flex-col overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent">
        <!-- Loading -->
        <div *ngIf="loading" class="flex-1 flex items-center justify-center">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <!-- No messages -->
        <div *ngIf="!loading && messages.length === 0" class="flex-1 flex items-center justify-center text-center p-6">
          <div class="text-gray-400">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p class="text-lg font-medium text-gray-500">لا توجد رسائل بعد</p>
            <p class="text-sm text-gray-400 mt-1">ابدأ المحادثة بإرسال رسالة</p>
          </div>
        </div>
        <!-- Messages -->
        <div *ngFor="let msg of messages"
             class="flex items-start gap-2 sm:gap-3 max-w-full group"
             [ngClass]="{'justify-end': isMyMessage(msg), 'justify-start': !isMyMessage(msg)}">
          <!-- أفاتار المستخدم الحالي (أنت) -->
          <div *ngIf="isMyMessage(msg)" class="flex-shrink-0 pt-1">
            <img
              [src]="getCurrentUserImage()"
              alt="أنت"
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-blue-500 shadow-md">
          </div>
          <!-- محتوى الرسالة -->
          <div class="flex flex-col max-w-[85%] sm:max-w-[75%]">
            <div *ngIf="msg.type === 'text'"
                 class="px-3 py-2 rounded-xl shadow-sm group-hover:shadow-md transition-all"
                 [ngClass]="{
                   'bg-blue-600 text-white rounded-tr-lg rounded-tl-lg rounded-br-lg ml-1': isMyMessage(msg),
                   'bg-gray-200 text-gray-900 rounded-tr-lg rounded-tl-lg rounded-bl-lg mr-1': !isMyMessage(msg)
                 }">
              <p class="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">{{ msg.message }}</p>
            </div>
            <div *ngIf="msg.type !== 'text'" class="p-2 bg-gray-200 rounded-xl text-center shadow-sm">
              <p class="text-sm text-gray-700">
                [{{ msg.type === 'image' ? 'صورة' : msg.type === 'audio' ? 'تسجيل صوتي' : 'ملف' }}]
              </p>
              <p class="text-xs text-gray-500 mt-1">
                <a *ngIf="msg.url" [href]="msg.url" target="_blank" class="text-blue-600 hover:underline">
                  {{ msg.filename || 'تحميل' }}
                </a>
                <span *ngIf="!msg.url">{{ msg.filename || 'غير معروف' }}</span>
              </p>
            </div>
            <span class="text-xs text-gray-500 mt-1 px-1 opacity-80 self-end"
                  [ngClass]="{'text-right': !isMyMessage(msg), 'text-left': isMyMessage(msg)}">
              {{ msg.timestamp | date:'shortTime' }}
            </span>
          </div>
          <!-- أفاتار الطرف التاني -->
          <div *ngIf="!isMyMessage(msg)" class="flex-shrink-0 pt-1">
            <img
              [src]="getOtherUserImageUrl()"
              alt="{{ msg.sender_name }}"
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-gray-400 shadow-md">
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="flex-shrink-0 border-t border-gray-200 p-2 sm:p-3 bg-white">
        <div class="flex items-end gap-1 sm:gap-2 h-auto sm:h-12">
          <!-- File Input -->
          <input #fileInput type="file" multiple accept="image/*,.pdf,.doc,.docx,.mp3,.wav"
                 (change)="onFilesSelected($event)" class="hidden" [disabled]="isDisabledInput()">
          <!-- Attachments Button -->
          <button type="button" (click)="fileInput.click()" [disabled]="isDisabledInput()"
                  class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-all disabled:opacity-50 shadow-sm">
            <fa-icon icon="paperclip" class="text-lg"></fa-icon>
          </button>
          <!-- Voice Record Button -->
          <button type="button" (click)="toggleRecording()" [disabled]="isDisabledInput()"
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-sm"
                  [ngClass]="{
                    'bg-gray-100 hover:bg-gray-200 text-gray-700': !isRecording,
                    'bg-red-100 text-red-600 animate-pulse': isRecording
                  }">
            <fa-icon [icon]="isRecording ? 'stop' : 'microphone'" class="text-lg"></fa-icon>
          </button>
          <!-- Message Input -->
          <input [(ngModel)]="newMessage" (keyup.enter)="sendMessage()"
                 placeholder="اكتب رسالتك هنا..." class="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none text-base bg-white"
                 [disabled]="isDisabledInput()" maxlength="1000">
          <!-- Send Button -->
          <button (click)="sendMessage()" [disabled]="!newMessage.trim() || isDisabledInput()"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-1">
            <fa-icon icon="paper-plane" size="sm"></fa-icon>
            إرسال
          </button>
        </div>
        <!-- Uploaded Files Status -->
        <div *ngIf="selectedFiles.length" class="mt-2 flex flex-wrap gap-2 text-xs">
          <div *ngFor="let f of selectedFiles"
               class="px-2 py-1 rounded bg-gray-100 flex items-center gap-1"
               [ngClass]="{
                 'bg-blue-100': f.status === 'uploading',
                 'bg-green-100': f.status === 'success',
                 'bg-red-100': f.status === 'error'
               }">
            {{ f.file.name | slice:0:18 }}{{ f.file.name.length > 18 ? '...' : '' }}
            <span *ngIf="f.status === 'uploading'">جاري...</span>
            <span *ngIf="f.status === 'success'">✓</span>
            <span *ngIf="f.status === 'error'">×</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .scrollbar-thin::-webkit-scrollbar { width: 4px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #2563eb; }
    input[type="text"] {
      font-size: 16px !important;
      -webkit-text-size-adjust: 100%;
    }
    .min-h-screen {
      min-height: 100vh;
      min-height: -webkit-fill-available;
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
  selectedFiles: { file: File; status: 'uploading' | 'success' | 'error'; }[] = [];
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  private ngZone = inject(NgZone);
  private cacheBuster = Date.now();
  private userSubscription!: Subscription;

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
    // متابعة تحديث المستخدم الحالي (مهم لتحديث الصورة لو غيرتها)
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.cacheBuster = Date.now(); // كسر الكاش للصور
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
          alert('الدردشة غير متاحة');
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
            if (!this.messages.some(m => m._id === normalized._id)) {
              this.ngZone.run(() => {
                this.messages.push(normalized);
                this.scrollToBottom();
              });
              if (normalized.sender_id !== this.currentUserId) {
                this.notificationService.markChatNotificationsAsRead(this.selectedApp._id);
                this.markAsRead();
              }
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
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }

  // ── دوال عرض الصور مع كسر الكاش ──
  getCurrentUserImage(): string {
    if (!this.currentUser?.profileImage) {
      return `https://via.placeholder.com/40?text=${this.currentUser?.name?.charAt(0) || 'أ'}`;
    }
    return `${this.currentUser.profileImage}?t=${this.cacheBuster}`;
  }

  getOtherUserImageUrl(): string {
    const img = this.getOtherUserImage();
    if (!img) {
      return `https://via.placeholder.com/40?text=${this.getAvatarInitial(this.chatName || 'م')}`;
    }
    return `${img}?t=${this.cacheBuster}`;
  }

  // باقي الدوال بدون تغيير كبير
  private getOtherUserImage(): string | null {
    if (!this.selectedApp) return null;
    const otherUser = this.isJobSeeker
      ? this.selectedApp.job_id?.owner_id
      : this.selectedApp.seeker_id;
    return otherUser?.profileImage || null;
  }

  // ... باقي الدوال كما هي (markAsRead, goBack, isMyMessage, loadMessages, sendMessage, onFilesSelected, uploadFile, toggleRecording, etc.)
  // يمكنك نسخها من الكود القديم مباشرة

  getAvatarInitial(name: string): string {
    return name.charAt(0).toUpperCase() || 'م';
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  getChatName(app: any) {
    return this.isJobSeeker
      ? app.job_id?.shop_name || 'صاحب العمل'
      : app.seeker_id?.name || 'باحث عن عمل';
  }

  // ... باقي الدوال ...
}
