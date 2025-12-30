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
        $validator = \Illuminate\Support\Facades\Validator::make(
            [$attribute => $value],
            [$attribute => 'indisposable']
        );

        if ($validator->fails()) {
            $fail('عذراً، لا نسمح باستخدام بريد إلكتروني مؤقت. يرجى استخدام بريد عمل أو شخصي دائم.');
        }
    }
}
