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
  user: any = { name: '', email: '', phone: '', role: '', profileImage: '' };
  originalUser: any = {}; // للإلغاء
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
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.api.getProfile().subscribe({
      next: (data: any) => {
        this.user = { ...data };
        this.originalUser = { ...data };
        this.previewUrl = data.profileImage ? `${data.profileImage}?t=${this.cacheBuster}` : null;
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
    const file = event.target.files[0];
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
    formData.append('name', this.user.name.trim());
    if (this.user.phone) formData.append('phone', this.user.phone.trim());
    if (this.selectedFile) formData.append('profileImage', this.selectedFile);

    this.api.updateProfile(formData).subscribe({
      next: (updatedUser: any) => {
        this.authService.updateCurrentUser(updatedUser);
        this.user = { ...updatedUser };
        this.originalUser = { ...updatedUser };
        this.cacheBuster = Date.now();
        this.previewUrl = updatedUser.profileImage ? `${updatedUser.profileImage}?t=${this.cacheBuster}` : null;
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
    this.previewUrl = this.originalUser.profileImage ? `${this.originalUser.profileImage}?t=${this.cacheBuster}` : null;
    this.selectedFile = null;
    this.isEditing = false;
    this.message = null;
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = { text, type };
    setTimeout(() => this.message = null, 5000);
  }

  getTimestamp(): number {
    return this.cacheBuster;
  }
}
