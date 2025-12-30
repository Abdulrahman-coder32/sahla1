import { Component, OnInit, ChangeDetectorRef } from '@angular/core';  // ← أضف ChangeDetectorRef هنا
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {
    name: '',
    email: '',
    phone: '',
    role: '',
    profileImage: '',
    bio: ''
  };
  originalUser: any = {};
  isEditing = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = true;
  saving = false;
  message: { text: string; type: 'success' | 'error' } | null = null;

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ← أضف ده
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.api.getProfile().subscribe({
      next: (data: any) => {
        console.log('Response from getProfile:', data);
        if (!data.profileImage && this.originalUser?.profileImage) {
          data.profileImage = this.originalUser.profileImage;
        }
        this.user = {
          ...data,
          bio: data.bio || ''
        };
        this.originalUser = { ...this.user };
        this.previewUrl = this.user.profileImage || null;
        this.loading = false;
        this.cdr.detectChanges(); // تحديث الشاشة
      },
      error: (err) => {
        console.error('فشل تحميل البروفايل', err);
        this.showMessage('فشل تحميل البيانات، حاول مرة أخرى', 'error');
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.showMessage('الصورة كبيرة جدًا، اختر أصغر من 10 ميجا', 'error');
      return;
    }

    this.selectedFile = file;

    // عرض preview فوري قبل الضغط
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result as string;  // ← هنا بنحدث الـ preview فورًا
      this.cdr.detectChanges();  // ← نجبر Angular يحدث الدايرة فورًا

      // ضغط الصورة للحفظ (اختياري، بس عشان الحجم)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            this.selectedFile = new File([blob], file.name, { type: 'image/jpeg' });
            // لو عايز preview من الـ blob المضغوط، ممكن تحدثه هنا
          }
        }, 'image/jpeg', 0.75);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.message = null;
    this.cdr.detectChanges();
  }

  saveProfile() {
    if (this.saving) return;
    this.saving = true;
    this.message = null;

    const updateData: any = {
      name: this.user.name?.trim() || '',
      phone: this.user.phone?.trim() || '',
      bio: this.user.bio?.trim() || ''
    };

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        updateData.profileImage = reader.result as string;
        this.sendUpdate(updateData);
      };
      reader.onerror = () => {
        this.showMessage('خطأ في قراءة الصورة', 'error');
        this.saving = false;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.sendUpdate(updateData);
    }
  }

  private sendUpdate(updateData: any) {
    this.api.updateProfile(updateData).subscribe({
      next: (updatedUser: any) => {
        console.log('Response from updateProfile:', updatedUser);
        if (!updatedUser.profileImage && this.originalUser?.profileImage) {
          updatedUser.profileImage = this.originalUser.profileImage;
        }
        const finalUser = { ...updatedUser, bio: updatedUser.bio || this.user.bio };
        this.authService.updateCurrentUser(finalUser);
        this.user = { ...finalUser };
        this.originalUser = { ...this.user };
        this.previewUrl = finalUser.profileImage || null;
        this.selectedFile = null;
        this.isEditing = false;
        this.saving = false;
        this.showMessage('تم تحديث الملف الشخصي بنجاح!', 'success');
        this.authService.forceRefreshImage();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('فشل تحديث البروفايل', err);
        this.showMessage('فشل حفظ التغييرات، حاول مرة أخرى', 'error');
        this.saving = false;
      }
    });
  }

  cancelEdit() {
    this.user = { ...this.originalUser };
    this.previewUrl = this.originalUser.profileImage || null;
    this.selectedFile = null;
    this.isEditing = false;
    this.message = null;
    this.cdr.detectChanges();
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = { text, type };
    setTimeout(() => this.message = null, 4000);
  }
}
