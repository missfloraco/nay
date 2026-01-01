<?php

/**
 * API Bridge - Secure Laravel Entry Point
 * 
 * هذا الملف يعمل كجسر آمن بين الـ subdomain والباك-أند الفعلي
 * Laravel الحقيقي موجود في ../../backend/public/
 */

// تحديد مسار Laravel الحقيقي
define('LARAVEL_START', microtime(true));

// استدعاء Laravel من موقعه الآمن خارج public_html
require __DIR__ . '/../../backend/public/index.php';
