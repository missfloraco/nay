<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        body {
            font-family: 'Cairo', sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            direction: rtl;
            text-align: right;
            -webkit-font-smoothing: antialiased;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 20px;
            text-align: center;
        }

        .logo-text {
            color: #ffffff;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -0.025em;
            margin: 0;
        }

        .content {
            padding: 40px 30px;
            text-align: center;
        }

        .welcome-text {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 15px;
        }

        .instruction-text {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .otp-box {
            background-color: #f3f4f6;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            padding: 20px;
            margin: 0 auto 30px;
            width: fit-content;
            min-width: 200px;
        }

        .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #10b981;
            letter-spacing: 8px;
            font-family: monospace;
            /* Ensure numbers are clean */
            display: block;
            text-align: center;
            direction: ltr;
            /* Ensure code is LTR for numbers */
        }

        .footer-note {
            font-size: 13px;
            color: #9ca3af;
            margin-bottom: 5px;
        }

        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }

        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        }

        .social-link {
            text-decoration: none;
            color: #6b7280;
            font-weight: 600;
            margin: 0 5px;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo-text">{{ $appName }}</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <h2 class="welcome-text">مرحباً بك!</h2>
            <p class="instruction-text">
                شكراً لتسجيلك معنا. لإكمال عملية التحقق من حسابك وتفعيله، يرجى استخدام رمز التحقق (OTP) أدناه:
            </p>

            <div class="otp-box">
                <span class="otp-code">{{ $code }}</span>
            </div>

            <p class="footer-note">هذا الرمز صالح لمدة 10 دقائق.</p>
            <p class="footer-note">إذا لم تقم بطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $appName }}. جميع الحقوق محفوظة.</p>
            <p style="margin-top: 10px;">
                تم إرسال هذا البريد تلقائياً، يرجى عدم الرد.
            </p>
        </div>
    </div>
</body>

</html>