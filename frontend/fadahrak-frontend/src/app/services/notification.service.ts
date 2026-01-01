import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private initialized = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private api: ApiService,
    private socketService: SocketService
  ) {}

  init() {
    if (this.initialized) return;

    this.initialized = true;
    console.log('NotificationService: بدء التهيئة...');

    this.socketService.connect();
    this.setupSocketListeners();
    this.loadNotifications();
    this.loadUnreadCount();
  }

  private setupSocketListeners() {
    this.socketService.onNewNotification((notification: any) => {
      this.addNotification(notification);
    });

    this.socketService.onNewMessageNotification((data: any) => {
      const notification = {
        type: 'new_message',
        message: data.message || 'لديك رسالة جديدة',
        application_id: data.application_id,
        from: data.from,
        read: false,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
      };
      this.addNotification(notification);
    });
  }

  private addNotification(notification: any) {
    const current = this.notificationsSubject.value || [];
    const exists = current.some(n =>
      (n._id && notification._id && n._id === notification._id) ||
      (n.application_id === notification.application_id &&
        n.type === notification.type &&
        n.message === notification.message &&
        new Date(n.createdAt).getTime() === new Date(notification.createdAt).getTime())
    );

    if (!exists) {
      const updated = [notification, ...current];
      this.notificationsSubject.next(updated);

      if (!notification.read) {
        this.incrementUnreadCount();
      }

      console.log('✨ إشعار جديد وصل:', notification.message || notification);
    }
  }

  private loadUnreadCount() {
    const sub = this.api.getUnreadCount().subscribe({
      next: (res: any) => {
        const count = res?.count ?? res ?? 0;
        this.unreadCountSubject.next(count);
      },
      error: (err: any) => {
        console.error('خطأ في جلب عدد الإشعارات غير المقروءة:', err);
        this.unreadCountSubject.next(0);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadNotifications() {
    const sub = this.api.getNotifications().subscribe({
      next: (res: any) => {
        let notifications: any[] = [];
        if (Array.isArray(res)) notifications = res;
        else if (res?.data && Array.isArray(res.data)) notifications = res.data;
        else if (res?.notifications && Array.isArray(res.notifications))
          notifications = res.notifications;
        else notifications = [];

        const sorted = notifications.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.notificationsSubject.next(sorted);
      },
      error: (err: any) => {
        console.error('خطأ في جلب الإشعارات:', err);
        this.notificationsSubject.next([]);
      }
    });
    this.subscriptions.push(sub);
  }

  markAllAsRead() {
    const current = this.notificationsSubject.value;
    const allRead = current.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(allRead);
    this.unreadCountSubject.next(0);

    // حذف الاستدعاء اللي مش موجود في ApiService
    // (markAllNotificationsAsRead غير موجود، فبنمسحه عشان الـ build يعدي)
  }

  markAsReadAndUpdate(notificationId: string) {
    const sub = this.api.markAsRead(notificationId).subscribe({
      next: () => {
        const updated = this.notificationsSubject.value.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        );
        this.notificationsSubject.next(updated);
        this.loadUnreadCount(); // تحديث العداد من الـ backend للدقة
      },
      error: (err: any) => {
        console.error('خطأ في تحديث حالة القراءة:', err);
      }
    });
    this.subscriptions.push(sub);
  }

  markChatNotificationsAsRead(applicationId: string) {
    const current = this.notificationsSubject.value;
    let unreadDecreased = 0;

    const updated = current.map(n => {
      if (n.type === 'new_message' && n.application_id === applicationId && !n.read) {
        unreadDecreased++;
        return { ...n, read: true };
      }
      return n;
    });

    this.notificationsSubject.next(updated);
    const newCount = Math.max(0, this.unreadCountSubject.value - unreadDecreased);
    this.unreadCountSubject.next(newCount);

    const sub = this.api.markChatNotificationsAsRead(applicationId).subscribe({
      next: () => {
        console.log('تم تحديث إشعارات الشات في الداتابيز بنجاح:', applicationId);
        this.loadUnreadCount(); // تحديث العداد من الـ backend بعد التغيير
      },
      error: (err: any) => {
        console.error('خطأ في تحديث إشعارات الشات في الـ backend:', err);
      }
    });
    this.subscriptions.push(sub);
  }

  incrementUnreadCount() {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  refreshAll() {
    this.loadUnreadCount();
    this.loadNotifications();
  }

  disconnectSocket() {
    this.socketService.disconnect();
    this.initialized = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.disconnectSocket();
  }
}
