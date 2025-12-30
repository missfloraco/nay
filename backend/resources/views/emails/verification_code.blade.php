<!DOCTYPE html>
<html dir="rtl" lang="ar">

<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 20px;
        }

        .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #111827;
            background-color: #F3F4F6;
            padding: 15px 30px;
            border-radius: 8px;
            display: inline-block;
            margin: 20px 0;
        }

        .text {
            color: #4B5563;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #9CA3AF;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo">NAY Platform</div>

        <p class="text">مرحباً بك!</p>
        <p class="text">استخدم رمز التحقق التالي لتفعيل حسابك:</p>

        <div class="code">{{ $code }}</div>

        <p class="text">هذا الرمز صالح لمدة 10 دقائق.</p>
        <p class="text">إذا لم تقم بطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.</p>

        <div class="footer">
            &copy; {{ date('Y') }} Nay Platform. All rights reserved.
        </div>
    </div>
</body>

</html>