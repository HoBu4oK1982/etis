<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function envelope(): Envelope
    {
        $date = $this->order->created_at ?: now();
        $number = 'ET-'
            . $date->format('ym')
            . '-'
            . str_pad((string) $this->order->id, 6, '0', STR_PAD_LEFT);

        return new Envelope(
            subject: "Заказ ETIS.KZ {$number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mails.order-mail',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
