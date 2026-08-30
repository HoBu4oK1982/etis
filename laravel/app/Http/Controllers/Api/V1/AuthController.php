<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Аутентификация покупателей фронта (Next.js).
 *
 * Sanctum, personal access tokens. Токен выдаётся в теле ответа —
 * фронт кладёт его в localStorage и подставляет в заголовок
 * Authorization: Bearer <token> на защищённых запросах.
 *
 * Админка (Livewire) продолжает жить на web-guard, эту цепочку
 * не трогаем — токенов не выдаёт.
 */
class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/register
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'min:2', 'max:120'],
            'email'                 => ['required', 'email:filter', 'max:190', Rule::unique('users', 'email')],
            'phone'                 => ['required', 'string', 'min:10', 'max:20'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'email.unique' => 'Такой e-mail уже зарегистрирован.',
            'password.confirmed' => 'Пароли не совпадают.',
            'password.min' => 'Пароль должен быть не короче 8 символов.',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => strtolower($data['email']),
            'phone'    => preg_replace('/\D+/', '', $data['phone']),
            'password' => Hash::make($data['password']),
        ]);

        return $this->tokenResponse($user);
    }

    /**
     * POST /api/v1/auth/login
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email:filter'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($data['email']))->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Неверный e-mail или пароль.'],
            ]);
        }

        return $this->tokenResponse($user);
    }

    /**
     * POST /api/v1/auth/logout — отзывает текущий Bearer-токен.
     */
    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();
        if ($token) {
            $token->delete();
        }
        return response()->json(['ok' => true]);
    }

    /**
     * GET /api/v1/auth/me — данные текущего пользователя.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json(['data' => $this->userPayload($user)]);
    }

    /* ---------- helpers ---------- */

    private function tokenResponse(User $user)
    {
        // Токены живут неделю. Если фронт заметил истечение — просто
        // повторный вход. Refresh-логика при необходимости позже.
        $ttlMinutes = 60 * 24 * 7;
        $expiresAt  = now()->addMinutes($ttlMinutes);

        $tokenResult = $user->createToken('etis-web', ['*'], $expiresAt);

        return response()->json([
            'data' => [
                'user'         => $this->userPayload($user),
                'access_token' => $tokenResult->plainTextToken,
                'token_type'   => 'Bearer',
                'expires_in'   => $ttlMinutes * 60,
            ],
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'city'  => $user->city,
        ];
    }
}
