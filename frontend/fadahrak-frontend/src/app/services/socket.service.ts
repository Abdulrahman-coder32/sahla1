import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  constructor(private authService: AuthService) {}

  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('لا يوجد توكن، مش هيتصل بالسوكت');
      return;
    }

    if (this.socket && this.socket.connected) {
      console.log('السوكت متصل بالفعل');
      return;
    }

    const socketUrl = environment.production
      ? window.location.origin
      : 'http://localhost:5000';

    console.log('جاري الاتصال بالسوكت على:', socketUrl);

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('✅ متصل بالسوكت بنجاح على', socketUrl);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('انفصل عن السوكت، السبب:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ خطأ في الاتصال بالسوكت:', err.message);
    });

    // ──────────────────────────────────────────────────────────────
    // جديد: استقبال تحديث صورة البروفايل real-time
    // ──────────────────────────────────────────────────────────────
    this.socket.on('profileUpdated', (data: { userId: string; profileImage: string; cacheBuster: number }) => {
      console.log('تحديث صورة بروفايل وصل عبر السوكت:', data);
      this.authService.handleProfileUpdate(data);
    });

    // باقي الـ listeners زي ما هي
    // (مش هنعدل فيهم، هما تمام)
  }

  joinChat(applicationId: string) {
    if (this.socket) {
      this.socket.emit('joinChat', applicationId);
    }
  }

  sendMessage(applicationId: string, message: string) {
    if (this.socket && message.trim()) {
      this.socket.emit('sendMessage', { application_id: applicationId, message });
    }
  }

  onNewMessage(callback: (msg: any) => void) {
    if (this.socket) {
      this.socket.off('newMessage');
      this.socket.on('newMessage', callback);
    }
  }

  onNewNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.off('newNotification');
      this.socket.on('newNotification', callback);
    }
  }

  onNewApplication(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('newApplication');
      this.socket.on('newApplication', callback);
    }
  }

  onApplicationUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('applicationStatusUpdate');
      this.socket.on('applicationStatusUpdate', callback);
    }
  }

  onNewMessageNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('newMessageNotification');
      this.socket.on('newMessageNotification', callback);
    }
  }

  onUnreadUpdate(callback: (data: { application_id: string; unreadCount: number }) => void) {
    if (this.socket) {
      this.socket.off('unreadUpdate');
      this.socket.on('unreadUpdate', callback);
    }
  }

  onChatListUpdate(callback: (data: {
    application_id: string;
    lastMessage: string;
    lastTimestamp: Date;
    unreadCount: number;
  }) => void) {
    if (this.socket) {
      this.socket.off('chatListUpdate');
      this.socket.on('chatListUpdate', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}
