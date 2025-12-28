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
  styleUrls: ['./profile.component.css']
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
    private notification: NotificationService
  ) {}

  ngOnInit() {
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
        this.notification.show('فشل تحميل البيانات');
        this.loading = false;
        this.router.navigate(['/inbox']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.notification.show('حجم الصورة لا يتجاوز 5 ميجا');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveProfile() {
    if (this.saving) return;

    this.saving = true;

    const formData = new FormData();
    formData.append('name', this.user.name);
    formData.append('phone', this.user.phone || '');

    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.api.updateProfile(formData).subscribe({
      next: (updatedUser: any) => {
        // تحديث الـ currentUser في AuthService
        this.authService.updateCurrentUser(updatedUser);

        this.user = updatedUser;
        this.previewUrl = updatedUser.profileImage || null;
        this.isEditing = false;
        this.selectedFile = null;
        this.saving = false;

        this.notification.show('تم تحديث البروفايل بنجاح');
      },
      error: (err) => {
        console.error('فشل تحديث البروفايل', err);
        this.notification.show('فشل حفظ التغييرات');
        this.saving = false;
      }
    });
  }

  cancelEdit() {
    this.loadProfile();
    this.isEditing = false;
    this.selectedFile = null;
    this.previewUrl = this.user.profileImage || null;
  }
}
