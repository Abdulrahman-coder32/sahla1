import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

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

    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('متصل بالسوكت بنجاح');
    });

    this.socket.on('disconnect', () => {
      console.log('انفصل عن السوكت');
    });

    this.socket.on('connect_error', (err) => {
      console.error('خطأ في الاتصال بالسوكت:', err.message);
    });
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

  // ──────────────────────────────────────────────────────────────
  // Listeners للأحداث المختلفة
  // ──────────────────────────────────────────────────────────────

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

  /** تحديث عدد الرسائل غير المقروءة لمحادثة معينة */
  onUnreadUpdate(callback: (data: { application_id: string; unreadCount: number }) => void) {
    if (this.socket) {
      this.socket.off('unreadUpdate');
      this.socket.on('unreadUpdate', callback);
    }
  }

  /**
   * جديد: حدث مهم جداً لتحديث قائمة الدردشات (inbox-list) في الوقت الفعلي
   * يحتوي على lastMessage + lastTimestamp + unreadCount الصحيح
   */
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
