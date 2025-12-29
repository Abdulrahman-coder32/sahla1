import { Component, OnInit } from '@angular/core';
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
  cacheBuster = Date.now();

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cacheBuster = Date.now();
    this.authService.forceRefreshCache(); // تجديد قسري
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.cacheBuster = Date.now();

    this.api.getProfile().subscribe({
      next: (data: any) => {
        console.log('Response from getProfile:', data); // ← للتصحيح: شوف profileImage جاي إيه

        // حماية قوية
        if (!data.profileImage && this.originalUser.profileImage) {
          data.profileImage = this.originalUser.profileImage;
        }

        this.user = {
          ...data,
          bio: data.bio || ''
        };
        this.originalUser = { ...this.user };

        if (this.user.profileImage) {
          const clean = this.user.profileImage.split('?')[0];
          this.previewUrl = `${clean}?t=${this.cacheBuster}`;
          console.log('previewUrl set to:', this.previewUrl);
        } else {
          this.previewUrl = null;
          console.log('previewUrl set to null - showing initials');
        }

        this.loading = false;
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
    if (file.size > 5 * 1024 * 1024) {
      this.showMessage('حجم الصورة كبير جدًا، الحد الأقصى 5 ميجا', 'error');
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
    this.message = null;
  }

  saveProfile() {
    if (this.saving) return;
    this.saving = true;
    this.message = null;

    const formData = new FormData();
    formData.append('name', this.user.name?.trim() || '');
    if (this.user.phone) formData.append('phone', this.user.phone.trim());
    if (this.user.bio) formData.append('bio', this.user.bio.trim());
    if (this.selectedFile) formData.append('profileImage', this.selectedFile);

    this.api.updateProfile(formData).subscribe({
      next: (updatedUser: any) => {
        console.log('Response from updateProfile:', updatedUser);

        if (!updatedUser.profileImage && this.originalUser.profileImage) {
          updatedUser.profileImage = this.originalUser.profileImage;
        }

        const updatedWithBio = { ...updatedUser, bio: updatedUser.bio || this.user.bio };
        this.authService.updateCurrentUser(updatedWithBio);
        this.user = { ...updatedWithBio };
        this.originalUser = { ...this.user };

        this.cacheBuster = Date.now();
        if (this.user.profileImage) {
          const clean = this.user.profileImage.split('?')[0];
          this.previewUrl = `${clean}?t=${this.cacheBuster}`;
        } else {
          this.previewUrl = null;
        }

        this.selectedFile = null;
        this.isEditing = false;
        this.saving = false;
        this.showMessage('تم تحديث الملف الشخصي بنجاح!', 'success');
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
    this.cacheBuster = Date.now();
    if (this.originalUser?.profileImage) {
      const clean = this.originalUser.profileImage.split('?')[0];
      this.previewUrl = `${clean}?t=${this.cacheBuster}`;
    } else {
      this.previewUrl = null;
    }
    this.selectedFile = null;
    this.isEditing = false;
    this.message = null;
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = { text, type };
    setTimeout(() => this.message = null, 4000);
  }

  getInitials(): string {
    if (!this.user?.name?.trim()) return 'م';
    const name = this.user.name.trim();
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getProfileImageUrl(): string {
    return this.previewUrl || '';
  }
}
