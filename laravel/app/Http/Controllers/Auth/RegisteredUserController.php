<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;
use Anhskohbo\NoCaptcha\Facades\NoCaptcha;
use Illuminate\Support\Facades\Http;



class RegisteredUserController extends Controller
{
    
    public function create(): View
    {
        return view('auth.register');
    }

   
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone' => ['required', 'string', 'max:20'], // Добавлено
            'city' => ['required'], // Добавлено
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'g-recaptcha-response' => ['required'],
        ]);

        $recaptcha = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => config('services.nocaptcha.secret'),
            'response' => $request->input('g-recaptcha-response'),
            'remoteip' => $request->ip(),
        ])->json();

        $success = (bool) data_get($recaptcha, 'success', false);
        $score   = data_get($recaptcha, 'score');
        $action  = data_get($recaptcha, 'action');

        // ✅ Поддержка и v2, и v3:
        // - v2 обычно возвращает только success=true/false
        // - v3 дополнительно возвращает score и action
        $isV3 = $score !== null || $action !== null;
        $score = (float) ($score ?? 0);
        $action = (string) ($action ?? '');

        if (!$success) {
            return back()->withErrors([
                'g-recaptcha-response' => 'Проверка reCAPTCHA не пройдена. Попробуйте ещё раз.',
            ])->withInput();
        }

        if ($isV3 && ($action !== 'register' || $score < 0.5)) {
            return back()->withErrors([
                'g-recaptcha-response' => 'Проверка reCAPTCHA не пройдена. Попробуйте ещё раз.',
            ])->withInput();
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'city' => $request->city,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole('user');

        event(new Registered($user));

        Auth::login($user);

        if(Auth::user()->hasRole('admin')){
            return redirect()->intended('/admin');
        } elseif (Auth::user()->hasRole('user')){
            return redirect()->intended('/user/dashboard');
        } else {
            return redirect()->intended('/');
        }
    }
}
