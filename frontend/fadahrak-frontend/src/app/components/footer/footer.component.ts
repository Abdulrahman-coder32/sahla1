import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <!-- قسم اللوجو والوصف -->
        <div class="footer-section">
          <div class="logo-wrapper">
            <img src="assets/logo.png" alt="سَهلة Logo" class="logo">
          </div>
          <p class="footer-description">منصة التوظيف المحلي الأولى في مصر</p>
        </div>

        <!-- قسم الروابط السريعة -->
        <div class="footer-section">
          <h3 class="section-title">روابط سريعة</h3>
          <ul class="footer-links">
            <li><a routerLink="/" class="footer-link">الرئيسية</a></li>
            <li><a routerLink="/jobs" class="footer-link">الوظائف</a></li>
            <li><a routerLink="/about" class="footer-link">عننا</a></li>
            <li><a routerLink="/faq" class="footer-link">الأسئلة الشائعة</a></li>
          </ul>
        </div>

        <!-- قسم السياسات -->
        <div class="footer-section">
          <h3 class="section-title">السياسات</h3>
          <ul class="footer-links">
            <li><a routerLink="/terms" class="footer-link">شروط الاستخدام</a></li>
            <li><a routerLink="/privacy" class="footer-link">سياسة الخصوصية</a></li>
          </ul>
        </div>

        <!-- قسم التواصل -->
        <div class="footer-section">
          <h3 class="section-title">تواصل معنا</h3>
          <ul class="contact-list">
            <li>info@sahlaa.com</li>
            <li>+20 1060757463</li>
          </ul>
          <div class="social-links">
            <a href="https://facebook.com" target="_blank" class="social-link">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" class="social-link">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" class="social-link">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" class="social-link">
              <i class="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="copyright">
        © 2025 سَهلة - جميع الحقوق محفوظة
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(to right, #F3F4F6, #E5E7EB);
      color: #374151;
      padding: 3rem 1rem 1.5rem;
      margin-top: auto;
      direction: rtl;
      font-family: 'Tajawal', system-ui, sans-serif;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .footer-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .footer-container {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .footer-section {
      display: flex;
      flex-direction: column;
    }

    .logo-wrapper {
      margin-bottom: 1rem;
    }

    .logo {
      height: 2.5rem;
      width: auto;
    }

    .footer-description {
      color: #6B7280;
      font-size: 1rem;
      line-height: 1.6;
    }

    .section-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 1.5rem;
    }

    .footer-links, .contact-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .footer-link {
      color: #6B7280;
      font-size: 1rem;
      transition: all 0.3s ease;
      display: inline-block;
    }

    .footer-link:hover {
      color: #0EA5E9;
      transform: translateX(-4px);
    }

    .contact-list li {
      color: #6B7280;
      font-size: 1rem;
    }

    .social-links {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .social-link {
      color: #6B7280;
      font-size: 1.5rem;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      color: #0EA5E9;
      transform: translateY(-4px);
    }

    .copyright {
      text-align: center;
      padding-top: 2rem;
      margin-top: 2rem;
      border-top: 1px solid #D1D5DB;
      color: #9CA3AF;
      font-size: 0.9375rem;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .footer { padding: 2rem 1rem 1rem; }
      .section-title { font-size: 1.25rem; margin-bottom: 1rem; }
      .footer-links, .contact-list { gap: 0.5rem; }
      .social-links { gap: 0.75rem; }
      .social-link { font-size: 1.375rem; }
    }
  `]
})
export class FooterComponent {}
