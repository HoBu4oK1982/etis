<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'admin',
            'email' => 'olegdata82disk@gmail.com',
            'password' => Hash::make('123321123'),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        Role::create([
            'name' => 'admin',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $admin->assignRole('admin');
    }
}
