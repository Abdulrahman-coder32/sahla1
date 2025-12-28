import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

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
              <!-- الأفاتار بالصورة الشخصية -->
              <div class="flex-shrink-0">
                <img
                  [src]="getProfileImageUrl(chat.profileImage, chat.name)"
                  alt="{{ chat.name }}"
                  class="w-14 h-14 rounded-full object-cover ring-2 ring-gray-300 shadow-md">
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
  
  private cacheBuster = Date.now();
  private userSubscription: Subscription;

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

    // متابعة تحديث المستخدم الحالي (لو هو اللي غيّر صورته)
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.cacheBuster = Date.now(); // كسر الكاش لما يتغير المستخدم
        // لو عايز تحديث فوري للقائمة كلها ممكن تضيف this.loadAcceptedChats() هنا
      }
    });
  }

  ngOnDestroy() {
    this.socketService.onChatListUpdate(() => {});
    this.socketService.onUnreadUpdate(() => {});
    this.userSubscription?.unsubscribe();
  }

  private getProfileImageUrl(profileImage: string | undefined, name: string): string {
    if (!profileImage) {
      return `https://via.placeholder.com/56?text=${name?.charAt(0) || 'م'}`;
    }
    // نضيف timestamp لكسر الكاش
    return `${profileImage}?t=${this.cacheBuster}`;
  }

  // باقي الدوال بدون تغيير
  private setupSocketListeners() {
    // ... نفس الكود القديم ...
  }

  private loadAcceptedChats() {
    // ... نفس الكود القديم ...
  }

  private sortChats() {
    // ... نفس الكود القديم ...
  }
}
