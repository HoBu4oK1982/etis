<?php

namespace App\Livewire;

use Livewire\Component;

class ContactsComponent extends Component
{
    public function render()
    {
        return view('livewire.contacts-component')->layout('layouts.base');
    }
}
