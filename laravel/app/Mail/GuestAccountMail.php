<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuestAccountMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $customerName,
        public string $email,
        public string $temporaryPassword,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Ваш личный кабинет ETIS.KZ');
    }

    public function content(): Content
    {
        return new Content(view: 'mails.guest-account');
    }

    public function attachments(): array
    {
        return [];
    }
}
