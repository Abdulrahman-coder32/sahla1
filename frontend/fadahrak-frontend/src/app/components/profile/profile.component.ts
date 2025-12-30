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

    this.userSub = this.authService.user$.subscribe(currentUser => {
      console.log('AuthService user$ emitted:', currentUser);
      if (currentUser) {
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
    console.log('Loading profile from API...');
    this.api.getProfile().subscribe({
      next: (data: any) => {
        console.log('Data received from API:', data);
        this.user = { ...data, bio: data.bio || '' };
        this.originalUser = { ...this.user };
        this.previewUrl = this.user.profileImage || null;

        this.authService.updateCurrentUser(this.user);
        console.log('Updated AuthService user:', this.user);
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

    console.log('File selected:', file.name, file.size);

    if (file.size > 10 * 1024 * 1024) {
      this.showMessage('الصورة كبيرة جدًا، اختر أصغر من 10 ميجا', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result as string;

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
          canvas.toBlob((blob) => {
            if (blob) {
              this.selectedFile = new File([blob], file.name, { type: 'image/jpeg' });
              console.log('Resized file ready:', this.selectedFile.name);
            }
          }, 'image/jpeg', 0.8);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.message = null;
    console.log('Edit mode:', this.isEditing);
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

    console.log('Saving profile...', this.user);

    const formData = new FormData();
    formData.append('name', this.user.name.trim());
    if (this.user.phone?.trim()) formData.append('phone', this.user.phone.trim());
    if (this.user.bio?.trim()) formData.append('bio', this.user.bio.trim());

    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile, this.selectedFile.name);
    } else if (this.previewUrl === null) {
      formData.append('profileImage', '');
    }

    this.api.updateProfile(formData).subscribe({
      next: (updatedUser: any) => {
        console.log('Profile updated:', updatedUser);

        this.authService.updateCurrentUser(updatedUser);
        this.user = { ...updatedUser, bio: updatedUser.bio || '' };
        this.originalUser = { ...this.user };

        // تحديث previewUrl مع cache buster لتجنب مشاكل الكاش
        const ts = Date.now();
        this.previewUrl = updatedUser.profileImage ? updatedUser.profileImage.split('?')[0] + '?v=' + ts : null;

        this.selectedFile = null;
        this.isEditing = false;
        this.saving = false;

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
    console.log('Edit cancelled, reverted to original user');
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = { text, type };
    console.log('Message:', text, type);
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

  getProfileImageUrl(): string {
    // كل مرة يرجع رابط جديد لتفادي الكاش
    if (!this.previewUrl && !this.user.profileImage) return '';
    const baseUrl = this.previewUrl || this.user.profileImage;
    const ts = Date.now();
    return baseUrl.split('?')[0] + '?v=' + ts;
  }
}
