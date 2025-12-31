<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مودال تقديم على وظيفة</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .modal-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.4);
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            overflow-y: auto;
            animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
            background-color: white;
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 32rem;
            width: 100%;
            margin: 1rem;
            padding: 1.5rem;
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.4s ease-out;
        }

        @media (min-width: 640px) {
            .modal-content {
                padding: 2rem;
            }
        }

        /* Badge الإشعارات */
        .notification-badge {
            position: absolute;
            top: -0.75rem;
            right: -0.75rem;
            background-color: #FEE2E2;
            color: #DC2626;
            padding: 0.5rem 0.75rem;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.875rem;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 10;
        }

        .notification-badge .close-btn {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.125rem;
            cursor: pointer;
            margin-left: 0.25rem;
            padding: 0;
        }

        /* العنوان */
        .modal-title {
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 0.75rem;
            color: #111827;
        }

        @media (min-width: 640px) {
            .modal-title {
                font-size: 1.875rem;
            }
        }

        .modal-subtitle {
            text-align: center;
            color: #4B5563;
            margin-bottom: 1.5rem;
            font-size: 1rem;
        }

        @media (min-width: 640px) {
            .modal-subtitle {
                font-size: 1.125rem;
            }
        }

        /* Textarea */
        .textarea-label {
            display: block;
            color: #374151;
            font-weight: 500;
            margin-bottom: 0.75rem;
            font-size: 1rem;
        }

        @media (min-width: 640px) {
            .textarea-label {
                font-size: 1.125rem;
            }
        }

        .modal-textarea {
            width: 100%;
            padding: 1rem 1.25rem;
            border-radius: 1rem;
            border: 1px solid #D1D5DB;
            background-color: white;
            font-size: 1rem;
            line-height: 1.6;
            transition: all 0.3s ease;
            resize: none;
            font-family: inherit;
            box-sizing: border-box;
        }

        .modal-textarea:focus {
            outline: none;
            border-color: #0EA5E9;
            box-shadow: 0 0 0 3px #E0F2FE;
        }

        .modal-textarea::placeholder {
            color: #9CA3AF;
        }

        /* الأزرار */
        .button-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }

        @media (min-width: 640px) {
            .button-container {
                flex-direction: row;
            }
        }

        .modal-btn {
            padding: 0.875rem 2rem;
            border-radius: 1rem;
            font-size: 1.125rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
            min-width: 160px;
            cursor: pointer;
            border: none;
        }

        .modal-btn:hover {
            transform: translateY(-2px);
        }

        .modal-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .modal-btn-submit {
            background-color: #E0F2FE;
            color: #0EA5E9;
        }

        .modal-btn-submit:hover:not(:disabled) {
            background-color: #B2DDFA;
        }

        .modal-btn-cancel {
            background-color: #F3F4F6;
            color: #6B7280;
        }

        .modal-btn-cancel:hover:not(:disabled) {
            background-color: #E5E7EB;
        }

        @media (max-width: 640px) {
            .modal-btn {
                font-size: 1rem;
                padding: 0.75rem 1.5rem;
            }
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        /* Hidden initially */
        .hidden {
            display: none;
        }

        /* Loading spinner */
        .spinner {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="modal-overlay" class="modal-overlay">
        <div class="modal-content">
            <!-- عداد الإشعارات -->
            <div id="notification-badge" class="notification-badge hidden">
                <i class="fas fa-bell"></i>
                <span id="notification-count">0</span>
                <button onclick="clearNotifications()" class="close-btn">×</button>
            </div>

            <!-- العنوان -->
            <h2 class="modal-title">تقديم على وظيفة</h2>
            <p class="modal-subtitle" id="job-title">عنوان الوظيفة هنا</p>

            <!-- رسالة التقديم -->
            <div>
                <label class="textarea-label">رسالة التقديم (اختياري)</label>
                <textarea
                    id="message"
                    placeholder="اكتب رسالتك هنا... (خبراتك، سبب اهتمامك، إلخ)"
                    class="modal-textarea"
                    rows="6"></textarea>
            </div>

            <!-- الأزرار -->
            <div class="button-container">
                <button
                    id="submit-btn"
                    onclick="submitApplication()"
                    class="modal-btn modal-btn-submit">
                    <i class="fas fa-paper-plane"></i>
                    إرسال التقديم
                </button>
                <button
                    onclick="closeModal()"
                    class="modal-btn modal-btn-cancel">
                    إلغاء
                </button>
            </div>
        </div>
    </div>

    <script>
        let notificationCount = 0;
        let loading = false;

        function updateNotificationBadge() {
            const badge = document.getElementById('notification-badge');
            const countSpan = document.getElementById('notification-count');
            countSpan.textContent = notificationCount;
            if (notificationCount > 0) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        function clearNotifications() {
            notificationCount = 0;
            updateNotificationBadge();
        }

        function submitApplication() {
            const message = document.getElementById('message').value.trim();
            if (!message || loading) return;

            loading = true;
            const btn = document.getElementById('submit-btn');
            btn.innerHTML = '<i class="fas fa-spinner spinner"></i> جاري الإرسال...';
            btn.disabled = true;

            // محاكاة إرسال (استبدل بـ API حقيقي)
            setTimeout(() => {
                loading = false;
                notificationCount++;
                updateNotificationBadge();
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال التقديم';
                btn.disabled = false;
                closeModal();
            }, 1000);
        }

        function closeModal() {
            if (loading) return;
            document.getElementById('message').value = '';
            // في صفحة مستقلة، يمكن إغلاق أو إعادة توجيه
            alert('تم الإغلاق. في تطبيق حقيقي، أعد توجيه أو أغلق المودال.');
        }

        // تحديث عنوان الوظيفة إذا لزم الأمر
        document.getElementById('job-title').textContent = 'مطور ويب'; // مثال، يمكن تخصيصه

        // التركيز على textarea عند التحميل
        window.onload = () => {
            document.getElementById('message').focus();
        };
    </script>
</body>
</html>
