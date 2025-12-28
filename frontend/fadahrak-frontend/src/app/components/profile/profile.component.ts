import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any = {
    name: '',
    email: '',
    phone: '',
    role: '',
    profileImage: ''
  };
  
  isEditing = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = true;
  saving = false;

  // لكسر الكاش - هنستخدم timestamp مختلف لكل صورة
  private imageCacheBuster = Date.now();

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.api.getProfile().subscribe({
      next: (data: any) => {
        this.user = data;
        this.updatePreviewUrl(data.profileImage);
        this.loading = false;
      },
      error: (err) => {
        console.error('فشل تحميل البروفايل', err);
        this.notification.showError('فشل تحميل البيانات، حاول مرة أخرى');
        this.loading = false;
      }
    });
  }

  private updatePreviewUrl(imageUrl: string | undefined) {
    if (!imageUrl) {
      this.previewUrl = null;
      return;
    }
    // نضيف timestamp لكسر الكاش
    this.previewUrl = `${imageUrl}?t=${this.imageCacheBuster}`;
    this.imageCacheBuster = Date.now(); // نحدثه للمرة الجاية
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.notification.showWarning('حجم الصورة كبير جدًا، الحد الأقصى 5 ميجا');
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveProfile() {
    if (this.saving) return;
    this.saving = true;

    const formData = new FormData();
    formData.append('name', this.user.name.trim());
    if (this.user.phone) {
      formData.append('phone', this.user.phone.trim());
    }
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.api.updateProfile(formData).subscribe({
      next: (updatedUser: any) => {
        // تحديث الـ auth service أولاً
        this.authService.updateCurrentUser(updatedUser);
        
        // ثم تحديث الواجهة
        this.user = updatedUser;
        this.updatePreviewUrl(updatedUser.profileImage);
        
        this.selectedFile = null;
        this.isEditing = false;
        this.saving = false;
        
        this.notification.showSuccess('تم تحديث الملف الشخصي بنجاح');
      },
      error: (err) => {
        console.error('فشل تحديث البروفايل', err);
        this.notification.showError('فشل حفظ التغييرات، حاول مرة أخرى');
        this.saving = false;
      }
    });
  }

  cancelEdit() {
    this.loadProfile();
    this.selectedFile = null;
    // الـ previewUrl هيتحدث تلقائياً لما يجيب البروفايل من جديد
    this.isEditing = false;
  }

  // دالة مساعدة للـ template لو عايز تستخدمها بدل this.previewUrl مباشرة
  getProfileImageUrl(): string {
    return this.previewUrl || 'assets/images/default-avatar.png'; // ضيف مسار الصورة الافتراضية هنا
  }
}
