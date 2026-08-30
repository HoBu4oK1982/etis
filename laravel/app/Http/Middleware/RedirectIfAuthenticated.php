<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Если юзер уже вошёл — сразу в админку (магазин теперь на Next.js).
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();

                if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
                    return redirect()->route('admin.dashboard');
                }

                // Не админ на web-side — выкидываем на логин обратно
                Auth::guard($guard)->logout();
                $request->session()?->invalidate();
                $request->session()?->regenerateToken();

                return redirect()->route('login')
                    ->withErrors(['email' => 'Доступ разрешён только администраторам.']);
            }
        }

        return $next($request);
    }
}
