import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-gradient-to-r from-gray-900 to-indigo-900 text-white py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- قسم اللوجو والوصف -->
        <div>
          <div class="flex items-center mb-4">
            <img src="assets/logo.png" alt="سَهلة Logo" class="h-10 w-auto mr-3">
          </div>
          <p class="text-gray-400">منصة التوظيف المحلي الأولى في مصر</p>
        </div>

        <!-- قسم الروابط السريعة -->
        <div>
          <h3 class="text-xl font-bold mb-4">
            روابط سريعة
          </h3>
          <ul class="space-y-2 text-gray-400">
            <li><a routerLink="/" class="hover:text-white transition hover:scale-105">
              الرئيسية
            </a></li>
            <li><a routerLink="/jobs" class="hover:text-white transition hover:scale-105">
              الوظائف
            </a></li>
            <li><a routerLink="/about" class="hover:text-white transition hover:scale-105">
              عننا
            </a></li>
            <li><a routerLink="/faq" class="hover:text-white transition hover:scale-105">
              الأسئلة الشائعة
            </a></li>
          </ul>
        </div>

        <!-- قسم السياسات -->
        <div>
          <h3 class="text-xl font-bold mb-4">
            السياسات
          </h3>
          <ul class="space-y-2 text-gray-400">
            <li><a routerLink="/terms" class="hover:text-white transition hover:scale-105">
              شروط الاستخدام
            </a></li>
            <li><a routerLink="/privacy" class="hover:text-white transition hover:scale-105">
              سياسة الخصوصية
            </a></li>
          </ul>
        </div>

        <!-- قسم التواصل -->
        <div>
          <h3 class="text-xl font-bold mb-4">
            تواصل معنا
          </h3>
          <ul class="space-y-2 text-gray-400">
            <li>info&#64;sahlaa.com</li>
            <li>+20 1060757463</li>
          </ul>
          <div class="mt-4 flex gap-6">
            <a href="https://facebook.com" target="_blank" class="hover:text-white transition">
              فيسبوك
            </a>
            <a href="https://twitter.com" target="_blank" class="hover:text-white transition">
              تويتر
            </a>
            <a href="https://instagram.com" target="_blank" class="hover:text-white transition">
              إنستغرام
            </a>
            <a href="https://linkedin.com" target="_blank" class="hover:text-white transition">
              لينكدإن
            </a>
          </div>
        </div>
      </div>
      <div class="text-center mt-8 border-t border-gray-700 pt-4 text-gray-400">
        © 2025 سَهلة - جميع الحقوق محفوظة
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {}
