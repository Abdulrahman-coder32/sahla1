import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-inbox-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="inbox-container">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="inbox-header">
          <div class="header-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h1>الدردشات</h1>
          <p>
            تواصل مع {{ isOwner ? 'المتقدمين لوظائفك' : 'أصحاب العمل' }} بسهولة وأمان
          </p>
        </div>
        <!-- Loading -->
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل الدردشات...</p>
        </div>
        <!-- Empty State -->
        <div *ngIf="!loading && chats.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h2>لا توجد دردشات حاليًا</h2>
          <p>
            {{ isOwner
              ? 'عندما يتقدم أحد على وظائفك وتقبله، ستظهر الدردشة هنا.'
              : 'عندما يقبل صاحب العمل تقديمك، ستتمكن من بدء المحادثة.'
            }}
          </p>
        </div>
        <!-- Chats List -->
        <div *ngIf="!loading && chats.length > 0" class="chats-list">
          <div *ngFor="let chat of chats; let i = index"
               class="chat-card"
               [routerLink]="['/inbox', chat._id]"
               [@fadeIn]="i">
            <!-- Unread Badge (حي دايمًا + نبض) -->
            <div *ngIf="chat.unreadCount > 0" class="unread-badge">
              {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
            </div>
            <div class="chat-content">
              <!-- Avatar -->
              <div class="chat-avatar">
                <img
                  [src]="getChatAvatar(chat)"
                  [alt]="chat.name"
                  class="avatar-image"
                  loading="lazy"
                  (error)="onImageError($event)"
                >
              </div>
              <!-- Details -->
              <div class="chat-details">
                <h3 class="chat-name">{{ chat.name }}</h3>
                <p class="chat-last-message">
                  {{ chat.lastMessage || 'ابدأ المحادثة الآن' }}
                </p>
              </div>
              <!-- Timestamp -->
              <div class="chat-time">
                <span class="time">{{ chat.lastUpdated | date:'shortTime' }}</span>
                <span class="date">{{ chat.lastUpdated | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
styles: [`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  [@fadeIn] {
    animation: fadeIn 0.4s ease-out forwards;
  }
  .inbox-container {
    min-height: 100vh;
    padding: 3rem 1rem;
    direction: rtl;
    background: linear-gradient(to bottom, #F9FAFB, #E0F2FE);
    font-family: 'Tajawal', system-ui, sans-serif;
  }
  .inbox-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  .header-icon {
    width: 5rem;
    height: 5rem;
    background: #E0F2FE;
    color: #0EA5E9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2.5rem;
    box-shadow: 0 8px 20px rgba(14, 165, 233, 0.15);
  }
  .inbox-header h1 {
    font-size: 2.75rem;
    font-weight: 800;
    color: #1F2937;
    margin: 0 0 1rem;
  }
  .inbox-header p {
    font-size: 1.125rem;
    color: #6B7280;
    max-width: 42rem;
    margin: 0 auto;
    line-height: 1.7;
  }
  .loading-state, .empty-state {
    text-align: center;
    padding: 5rem 2rem;
  }
  .spinner {
    width: 4.5rem;
    height: 4.5rem;
    border: 4px solid #E0F2FE;
    border-top: 4px solid #0EA5E9;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 2rem;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .empty-icon {
    width: 6rem;
    height: 6rem;
    background: #F3F4F6;
    color: #9CA3AF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2rem;
    font-size: 3rem;
  }
  .empty-state h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #374151;
    margin-bottom: 1rem;
  }
  .empty-state p {
    font-size: 1.125rem;
    color: #6B7280;
    line-height: 1.7;
    max-width: 36rem;
    margin: 0 auto;
  }
  .chats-list {
    display: grid;
    gap: 1.5rem;
  }
  .chat-card {
    background: white;
    border-radius: 1.5rem;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border: 1px solid #E5E7EB;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .chat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.12);
  }
  .unread-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #DC2626;
    color: white;
    min-width: 2rem;
    height: 2rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5);
    z-index: 10;
    animation: pulse 1.8s infinite;
    pointer-events: none;
  }
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.9;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  .chat-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  .chat-avatar {
    flex-shrink: 0;
  }
  .avatar-image {
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #E0F2FE;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .chat-details {
    flex: 1;
    min-width: 0;
  }
  .chat-name {
    font-size: 1.375rem;
    font-weight: 700;
    color: #1F2937;
    margin: 0 0 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chat-last-message {
    font-size: 1rem;
    color: #6B7280;
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .chat-time {
    text-align: left;
    font-size: 0.875rem;
    color: #9CA3AF;
  }
  .chat-time .time {
    font-weight: 600;
    color: #374151;
  }
  .chat-time .date {
    display: block;
    margin-top: 0.25rem;
  }
  @media (max-width: 640px) {
    .inbox-container { padding: 2rem 1rem; }
    .inbox-header h1 { font-size: 2.25rem; }
    .inbox-header p { font-size: 1rem; }
    .chat-content { gap: 1rem; padding: 1rem; }
    .avatar-image { width: 4rem; height: 4rem; }
    .chat-name { font-size: 1.25rem; }
    .chat-last-message { font-size: 0.9375rem; }
    .unread-badge {
      top: 0.75rem;
      right: 0.75rem;
      min-width: 1.75rem;
      height: 1.75rem;
      font-size: 0.75rem;
      animation: pulse 1.8s infinite;
    }
  }
`]
})
export class InboxListComponent implements OnInit, OnDestroy {
  chats: any[] = [];
  loading = true;
  isOwner = false;
  currentUserId: string | null = null;
  readonly defaultImage = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private socketService: SocketService
  ) {
    const user = this.authService.getUser();
    this.isOwner = user?.role === 'shop_owner';
    this.currentUserId = user?.id || null;
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.socketService.connect();
    this.loadAcceptedChats();
    this.setupSocketListeners();
  }

  ngOnDestroy() {
    this.socketService.onChatListUpdate(() => {});
    this.socketService.onUnreadUpdate(() => {});
  }

  private setupSocketListeners() {
    this.socketService.onChatListUpdate((data: any) => {
      const chat = this.chats.find(c => c._id === data.application_id);
      if (chat) {
        chat.lastMessage = data.lastMessage || '[ملف مرفق]';
        chat.lastUpdated = new Date(data.lastTimestamp);
        chat.unreadCount = data.unreadCount || 0;

      if (data.otherUser) {
  // لو في صورة جديدة، نحدثها
  if (data.otherUser.profileImage) {
    chat.profileImage = data.otherUser.profileImage;
    chat.cacheBuster = data.otherUser.cacheBuster ?? Date.now();
  }
  // لو مفيش صورة جديدة، نجبر cache buster عشان الصورة القديمة تتحمل تاني (تكسر الكاش)
  else if (chat.profileImage) {
    chat.cacheBuster = Date.now(); // قسري عشان الصورة تتحدث
  }
}

        this.sortChats();
      } else {
        this.loadAcceptedChats();
      }
    });

    this.socketService.onUnreadUpdate((data: { application_id: string; unreadCount: number }) => {
      const chat = this.chats.find(c => c._id === data.application_id);
      if (chat) {
        chat.unreadCount = data.unreadCount;
      }
    });

    if (this.isOwner) {
      this.socketService.onNewApplication(() => this.loadAcceptedChats());
    }

    this.socketService.onApplicationUpdate((data: any) => {
      if (data.status === 'accepted') {
        this.loadAcceptedChats();
      }
    });
  }

  private loadAcceptedChats() {
    this.loading = true;
    const apiCall = this.isOwner
      ? this.api.getApplicationsForOwner()
      : this.api.getMyApplications();

    apiCall.subscribe({
      next: (applications: any[]) => {
        const accepted = applications.filter(app => app.status === 'accepted');

        this.chats = accepted.map(app => {
          let unreadCount = 0;
          if (this.isOwner) {
            unreadCount = app.unreadCounts?.owner || 0;
          } else {
            unreadCount = app.unreadCounts?.seeker || 0;
          }

          const otherUser = this.isOwner ? app.seeker_id : app.job_id?.owner_id;

          const baseProfileImage = otherUser?.profileImage || null;
          const cacheBuster = otherUser?.cacheBuster;

          return {
            _id: app._id,
            name: this.isOwner
              ? (otherUser?.name || 'باحث عن عمل')
              : (app.job_id?.shop_name || 'صاحب العمل'),
            lastMessage: app.lastMessage || 'ابدأ المحادثة',
            lastUpdated: app.lastTimestamp || app.updatedAt || app.createdAt || new Date(),
            unreadCount,
            profileImage: baseProfileImage,
            cacheBuster: cacheBuster
          };
        });

        this.sortChats();
        this.loading = false;
      },
      error: (err) => {
        console.error('خطأ في جلب التطبيقات:', err);
        this.loading = false;
      }
    });
  }

  getChatAvatar(chat: any): string {
    if (!chat.profileImage) {
      return this.defaultImage;
    }

    const separator = chat.profileImage.includes('?') ? '&' : '?';
    const cacheVersion = chat.cacheBuster > 0 ? chat.cacheBuster : Date.now();
    return `${chat.profileImage}${separator}v=${cacheVersion}`;
  }

  private sortChats() {
    this.chats.sort((a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.defaultImage) {
      img.src = this.defaultImage;
    }
  }
}
