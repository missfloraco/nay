<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NotDisposableEmail implements ValidationRule
{
    /**
     * A list of common disposable email providers.
     * This list can be expanded or moved to a database/config file.
     */
    protected $disposableDomains = [
        'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'throwawaymail.com',
        'mailinator.com', 'yopmail.com', 'getnada.com', 'dispostable.com',
        'temp-mail.org', 'temp-mail.ru', 'sharklasers.com', 'grr.la',
        'maildrop.cc', 'shortmail.com', 'inbox.lt', 'emailondeck.com',
        'mytemp.email', 'tempmail.net', 'byom.de', 'dayrep.com',
        'teleworm.us', 'jourrapide.com', 'rhyta.com', 'superrito.com',
        'armyspy.com', 'cuvox.de', 'einrot.com', 'fleckens.hu',
        'gustr.com', 'hushmail.com', 'maildrop.cc', 'mailnes.com',
        'mailpoof.com', 'meltmail.com', 'mohmal.com', 'my10minutemail.com',
        'no-spam.ws', 'noclickemail.com', 'nospam.today', 'onewaymail.com',
        's0ny.net', 'spambox.us', 'spamgourmet.com', 'spamhole.com',
        'spaml.com', 'spammotel.com', 'temp-mail.org', 'tempemail.net',
        'tempinbox.com', 'trashmail.com', 'trashmail.net', 'verticalaxis.com',
        'yopmail.fr', 'yopmail.net', 'zehnminutenmail.de'
    ];

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $domain = substr(strrchr($value, "@"), 1);

        if (in_array(strtolower($domain), $this->disposableDomains)) {
            $fail('عذراً، لا نسمح باستخدام بريد إلكتروني مؤقت. يرجى استخدام بريد عمل أو شخصي دائم.');
        }
    }
}
