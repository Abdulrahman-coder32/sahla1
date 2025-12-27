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
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:py-16 lg:py-20">
      <div class="max-w-6xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <i class="fas fa-comments text-white text-2xl"></i>
          </div>
          <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">الدردشات</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            تواصل مع المتقدمين أو أصحاب العمل في دردشات آمنة ومنظمة.
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-6"></div>
          <p class="text-xl text-gray-700 font-medium">جاري تحميل الدردشات...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && chats.length === 0" class="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-8">
            <i class="fas fa-comments text-6xl text-gray-400"></i>
          </div>
          <h2 class="text-3xl font-bold text-gray-800 mb-4">لا توجد دردشات حاليًا</h2>
          <p class="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
            {{ isOwner ? 'ابدأ بقبول المتقدمين للوظائف لبدء التواصل.' : 'قدم على وظيفة وانتظر القبول لبدء المحادثة.' }}
          </p>
        </div>

        <!-- Chats List -->
        <div *ngIf="!loading && chats.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          <a *ngFor="let chat of chats"
             [routerLink]="['/inbox', chat._id]"
             class="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-gray-100 overflow-hidden
                     {{ chat.unreadCount > 0 ? 'ring-2 ring-blue-500/50 bg-blue-50/50' : 'hover:bg-gray-50' }}">

            <!-- Unread Badge -->
            <div *ngIf="chat.unreadCount > 0"
                 class="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-xl z-10 min-w-[24px] h-7 flex items-center justify-center animate-pulse">
              {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
            </div>

            <!-- Chat Content -->
            <div class="flex items-center space-x-4 rtl:space-x-reverse">
              <!-- Avatar Placeholder -->
              <div class="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <i class="fas fa-user text-white text-lg"></i>
              </div>

              <!-- Chat Details -->
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {{ chat.name }}
                </h3>
                <p class="text-gray-600 text-sm mt-1 line-clamp-2 leading-relaxed">
                  {{ chat.lastMessage || 'ابدأ المحادثة' }}
                </p>
              </div>

              <!-- Timestamp -->
              <div class="flex-shrink-0 text-right">
                <p class="text-xs text-gray-500 font-medium">
                  {{ chat.lastUpdated | date:'shortTime' }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ chat.lastUpdated | date:'shortDate' }}
                </p>
              </div>
            </div>

            <!-- Hover Effect Line -->
            <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </a>
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
  `]
})
export class InboxListComponent implements OnInit, OnDestroy {
  chats: any[] = [];
  loading = true;
  isOwner = false;
  currentUserId: string | null = null;

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
    this.socketService.connect(); // نتأكد إن السوكت متصل
    this.loadAcceptedChats();
    this.setupSocketListeners();
  }

  ngOnDestroy() {
    // تنظيف الـ listeners عشان ما يتكررش
    this.socketService.onChatListUpdate(() => {});
    this.socketService.onUnreadUpdate(() => {});
  }

  private setupSocketListeners() {
    // الحدث الجديد والأهم: تحديث قائمة الدردشات كاملة real-time
    this.socketService.onChatListUpdate((data: {
      application_id: string;
      lastMessage: string;
      lastTimestamp: Date;
      unreadCount: number;
    }) => {
      console.log('chatListUpdate وصل:', data); // ← للتأكد من القيمة اللي جاية من الـ backend

      const chat = this.chats.find(c => c._id === data.application_id);

      if (chat) {
        chat.lastMessage = data.lastMessage || '[ملف مرفق]';
        chat.lastUpdated = new Date(data.lastTimestamp);

        // نستخدم القيمة اللي جاية من الـ backend مباشرة
        // لأن الـ backend بيرسل unreadCount الصحيح لكل مستخدم (0 للمرسل، +1 للمستقبل)
        chat.unreadCount = data.unreadCount;

        console.log('تم تحديث الدردشة محليًا:', {
          id: chat._id,
          name: chat.name,
          unreadCount_الجديد: chat.unreadCount,
          isOwner: this.isOwner
        });
      } else {
        console.log('دردشة جديدة وصلت via socket، بنعمل reload');
        this.loadAcceptedChats();
        return;
      }

      // نقل الدردشة للأعلى دائمًا
      this.chats = this.chats.filter(c => c._id !== data.application_id);
      this.chats.unshift(chat);
    });

    // احتياطي: تحديث العداد فقط (من mark-read أو حالات أخرى)
    this.socketService.onUnreadUpdate((data: { application_id: string; unreadCount: number }) => {
      const chat = this.chats.find(c => c._id === data.application_id);
      if (chat) {
        chat.unreadCount = data.unreadCount;
        console.log('unreadUpdate وصل:', data);
      }
    });

    // حالات القبول الجديدة
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
          // ← التعديل النهائي: عرض unreadCount الخاص بالمستخدم الحالي فقط
          let unreadCount = 0;
          if (this.isOwner) {
            unreadCount = app.unreadCounts?.owner || 0;  // صاحب العمل يشوف unread بتاعه (owner)
          } else {
            unreadCount = app.unreadCounts?.seeker || 0; // المتقدم يشوف unread بتاعه (seeker)
          }

          return {
            _id: app._id,
            name: this.isOwner
              ? (app.seeker_id?.name || 'باحث عن عمل')
              : (app.job_id?.shop_name || 'صاحب العمل'),
            lastMessage: app.lastMessage || 'ابدأ المحادثة',
            lastUpdated: app.lastTimestamp || app.updatedAt || app.createdAt || new Date(),
            unreadCount: unreadCount
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
}
