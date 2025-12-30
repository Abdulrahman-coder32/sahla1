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
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:py-16 lg:py-24">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-8 shadow-inner">
            <i class="fas fa-comments text-4xl text-blue-600"></i>
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">الدردشات</h1>
          <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            تواصل مع {{ isOwner ? 'المتقدمين لوظائفك' : 'أصحاب العمل' }} بسهولة وأمان
          </p>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-32">
          <div class="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600"></div>
          <p class="mt-8 text-2xl text-gray-700 font-medium">جاري تحميل الدردشات...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && chats.length === 0" class="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 sm:p-20 text-center">
          <div class="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
            <i class="fas fa-comments text-6xl text-gray-400"></i>
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">لا توجد دردشات حاليًا</h2>
          <p class="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {{ isOwner ? 'عندما يتقدم أحد على وظائفك وتقبله، ستظهر الدردشة هنا.' : 'عندما يقبل صاحب العمل تقديمك، ستتمكن من بدء المحادثة.' }}
          </p>
        </div>

        <!-- Chats List -->
        <div *ngIf="!loading && chats.length > 0" class="space-y-6">
          <div *ngFor="let chat of chats"
               class="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer"
               [routerLink]="['/inbox', chat._id]">
           
            <!-- Unread Badge -->
            <div *ngIf="chat.unreadCount > 0"
                 class="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl z-10 flex items-center justify-center min-w-[32px] animate-pulse">
              {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
            </div>

            <!-- Chat Card -->
            <div class="p-6 sm:p-8 flex items-center gap-6">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <img
                  [src]="getChatAvatar(chat)"
                  alt="صورة {{ chat.name }}"
                  class="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-white shadow-xl"
                  loading="lazy"
                >
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <h3 class="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {{ chat.name }}
                </h3>
                <p class="text-base sm:text-lg text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                  {{ chat.lastMessage || 'ابدأ المحادثة الآن' }}
                </p>
              </div>

              <!-- Timestamp -->
              <div class="text-right">
                <p class="text-sm font-medium text-gray-700">
                  {{ chat.lastUpdated | date:'shortTime' }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ chat.lastUpdated | date:'mediumDate' }}
                </p>
              </div>
            </div>

            <!-- Hover Line -->
            <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class InboxListComponent implements OnInit, OnDestroy {
  chats: any[] = [];
  loading = true;
  isOwner = false;
  currentUserId: string | null = null;

  private readonly DEFAULT_IMAGE = 'https://res.cloudinary.com/dv48puhaq/image/upload/v1767035882/photo_2025-12-29_21-17-37_irc9se.jpg';

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
    this.socketService.onChatListUpdate((data: {
      application_id: string;
      lastMessage: string;
      lastTimestamp: Date;
      unreadCount: number;
    }) => {
      const chat = this.chats.find(c => c._id === data.application_id);
      if (chat) {
        chat.lastMessage = data.lastMessage || '[ملف مرفق]';
        chat.lastUpdated = new Date(data.lastTimestamp);
        chat.unreadCount = data.unreadCount;
      } else {
        this.loadAcceptedChats();
        return;
      }
      // إعادة ترتيب الدردشات عشان الجديدة تبقى فوق
      this.chats = this.chats.filter(c => c._id !== data.application_id);
      this.chats.unshift(chat);
      this.sortChats(); // احتياطي
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
    const apiCall = this.isOwner ? this.api.getApplicationsForOwner() : this.api.getMyApplications();
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

          const otherUserImage = this.isOwner
            ? app.seeker_id?.profileImage
            : app.job_id?.owner_id?.profileImage;

          return {
            _id: app._id,
            name: this.isOwner
              ? (app.seeker_id?.name || 'باحث عن عمل')
              : (app.job_id?.shop_name || 'صاحب العمل'),
            lastMessage: app.lastMessage || 'ابدأ المحادثة',
            lastUpdated: app.lastTimestamp || app.updatedAt || app.createdAt || new Date(),
            unreadCount: unreadCount,
            profileImage: otherUserImage  // ممكن null → هيعرض الديفولت
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

  private sortChats() {
    this.chats.sort((a, b) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  // دالة محسنة: تضيف cache buster جديد كل مرة
  getChatAvatar(chat: any): string {
    if (chat.profileImage && typeof chat.profileImage === 'string') {
      // لو الرابط فيه ?t= بالفعل (من ApiService)، هنضيف واحد جديد
      const baseUrl = chat.profileImage.split('?')[0];
      return `${baseUrl}?t=${Date.now()}`;
    }
    return this.DEFAULT_IMAGE;
  }
}
