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

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService // سيبها موجودة، مش مشكلة
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.api.getProfile().subscribe({
      next: (data: any) => {
        this.user = data;
        this.previewUrl = data.profileImage || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('فشل تحميل البروفايل', err);
        alert('فشل تحميل البيانات، حاول مرة أخرى');
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // تحقق من الحجم (حد أقصى 5 ميجا)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جدًا، الحد الأقصى 5 ميجا');
      return;
    }

    this.selectedFile = file;

    // عرض معاينة فورية
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
        // تحديث البيانات المحلية في AuthService عشان الصورة تتغير في كل الأماكن فورًا
        this.authService.updateCurrentUser(updatedUser);

        this.user = updatedUser;
        this.previewUrl = updatedUser.profileImage || null;
        this.selectedFile = null;
        this.isEditing = false;
        this.saving = false;

        alert('تم تحديث الملف الشخصي بنجاح');
      },
      error: (err) => {
        console.error('فشل تحديث البروفايل', err);
        alert('فشل حفظ التغييرات، حاول مرة أخرى');
        this.saving = false;
      }
    });
  }

  cancelEdit() {
    this.loadProfile(); // إعادة تحميل البيانات الأصلية
    this.selectedFile = null;
    this.previewUrl = this.user.profileImage || null;
    this.isEditing = false;
  }
}
