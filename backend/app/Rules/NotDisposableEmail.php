<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NotDisposableEmail implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // 1. Manual Blacklist for temp-mail.org (robust defense)
        $domain = strtolower(substr(strrchr($value, "@"), 1));
        $blockedDomains = [
            'temp-mail.org',
            'maillinda.com',
            'vintomater.com',
            'eluvit.com',
            'pzwm.com',
            'galenit.com',
            'mbeon.com',
            'freetempmail.com',
            'tempmail.com',
            'disposable-email.com',
            'veonit.com',
            'uorak.com',
            'tenua.com',
            'zioru.com',
            'yomail.info',
            'awince.com',
            'nuesis.com',
            'dandem.com',
            'fuzre.com',
            'vireon.com',
            'pachit.com',
            'lasmiz.com',
            'xensy.com',
            'lufre.com',
            'menre.com'
        ];

        if (in_array($domain, $blockedDomains)) {
            $fail('عذراً، لا نسمح باستخدام بريد إلكتروني مؤقت من هذا المزود. يرجى استخدام بريد عمل أو شخصي دائم.');
            return;
        }

        // 2. Package-based detection for other providers
        $validator = \Illuminate\Support\Facades\Validator::make(
            [$attribute => $value],
            [$attribute => 'indisposable']
        );

        if ($validator->fails()) {
            $fail('عذراً، لا نسمح باستخدام بريد إلكتروني مؤقت. يرجى استخدام بريد عمل أو شخصي دائم.');
        }
    }
}
