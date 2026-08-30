<?php

namespace App\Livewire\Admin;

use App\Services\OneCSyncService;
use Livewire\Component;

class AdminUpdateComponent extends Component
{
    public function updateCategories(OneCSyncService $service)
    {
        $r = $service->syncCategories();

        if ($r['error']) {
            session()->flash('message_cat_error', 'Ошибка синхронизации: ' . $r['error']);
            return;
        }

        session()->flash(
            'message_cat',
            "Категории обновлены. Получено: {$r['fetched']}, обновлено: {$r['saved']}, скрыто: {$r['hidden']}, показано: {$r['shown']}, пропущено: {$r['skipped']}."
        );
    }

    public function updateProducts(OneCSyncService $service)
    {
        $r = $service->syncProducts();

        if ($r['error']) {
            session()->flash('message_pro_error', 'Ошибка синхронизации: ' . $r['error']);
            return;
        }

        $merged = $r['merged'] ?? 0;
        session()->flash(
            'message_pro',
            "Товары обновлены. Получено: {$r['fetched']}, склеено дублей: {$merged}, обновлено: {$r['saved']}, скрыто: {$r['hidden']}, пропущено: {$r['skipped']}."
        );
    }

    public function render()
    {
        return view('livewire.admin.admin-update-component')->layout('layouts.admin');
    }
}
