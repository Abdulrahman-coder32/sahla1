import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
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
  private userSub?: Subscription;

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('ProfileComponent initialized');
    this.loadProfile();

    // ← مهم: الاشتراك في user$ بس بعد loadProfile عشان متعملش override
    this.userSub = this.authService.user$.subscribe(currentUser => {
      if (currentUser && !this.saving) { // ← منع التحديث أثناء الحفظ
        console.log('AuthService user$ emitted:', currentUser);
        this.user = { ...currentUser, bio: currentUser.bio || '' };
        this.previewUrl = this.user.profileImage || null;
        this.originalUser = { ...this.user };
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  loadProfile() {
    this.loading = true;
    this.api.getProfile().subscribe({
      next: (data: any) => {
        console.log('Data received from API:', data);
        this.user = { ...data, bio: data.bio || '' };
        this.originalUser = { ...this.user };
        this.previewUrl = this.user.profileImage || null;
        this.authService.updateCurrentUser(this.user);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
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

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const originalDataUrl = e.target.result as string;
      this.previewUrl = originalDataUrl;

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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          this.previewUrl = canvas.toDataURL('image/jpeg', 0.8);
          console.log('Resized base64 ready for upload');
        }
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
    this.selectedFile = null;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.message = null;
  }

  private validateRequiredFields(): boolean {
    if (!this.user.name?.trim()) {
      this.showMessage('الاسم مطلوب ولا يمكن أن يكون فارغًا', 'error');
      return false;
    }
    return true;
  }

  saveProfile() {
    if (this.saving || !this.validateRequiredFields()) return;

    this.saving = true;
    this.message = null;

    const formData = new FormData();
    formData.append('name', this.user.name.trim());
    if (this.user.phone?.trim()) formData.append('phone', this.user.phone.trim());
    if (this.user.bio?.trim()) formData.append('bio', this.user.bio.trim());

    if (this.previewUrl && this.previewUrl.startsWith('data:image')) {
      formData.append('profileImage', this.previewUrl);
    } else if (this.previewUrl === null) {
      formData.append('profileImage', '');
    }

    this.api.updateProfile(formData).subscribe({
      next: (updatedUser: any) => {
        console.log('Profile updated from backend:', updatedUser);

        // ← تحديث محلي كامل من الـ response
        this.user = { ...updatedUser, bio: updatedUser.bio || this.user.bio || '' };
        this.originalUser = { ...this.user };
        this.previewUrl = updatedUser.profileImage || null;
        this.selectedFile = null;
        this.isEditing = false;
        this.saving = false;

        // ← تحديث AuthService بالـ user الجديد كامل
        this.authService.updateCurrentUser(updatedUser); // نرسل updatedUser مباشرة مش this.user

        this.showMessage('تم تحديث الملف الشخصي بنجاح!', 'success');
      },
      error: (err) => {
        console.error('Failed to save profile:', err);
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
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = { text, type };
    setTimeout(() => this.message = null, 4000);
  }

  getInitials(name: string | undefined): string {
    if (!name || !name.trim()) return '؟؟';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
