<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $items = collect($this->input('items', []))
            ->filter(fn ($item) => is_array($item))
            ->map(fn (array $item) => [
                'product_id' => (int) ($item['product_id'] ?? 0),
                'qty' => (int) ($item['qty'] ?? 0),
            ])
            ->values()
            ->all();

        $address = trim((string) $this->input('address', ''));
        $comment = trim((string) $this->input('comment', ''));

        $this->merge([
            'checkout_token' => trim((string) $this->input('checkout_token', '')),
            'customer_name' => trim((string) $this->input('customer_name', '')),
            'customer_email' => strtolower(trim((string) $this->input('customer_email', ''))),
            'customer_phone' => preg_replace('/\D+/', '', (string) $this->input('customer_phone', '')),
            'city' => trim((string) $this->input('city', '')),
            'delivery_type' => trim((string) $this->input('delivery_type', '')),
            'address' => $address !== '' ? $address : null,
            'comment' => $comment !== '' ? $comment : null,
            'items' => $items,
        ]);
    }

    public function rules(): array
    {
        return [
            'checkout_token' => ['required', 'uuid'],
            'customer_name' => ['required', 'string', 'min:2', 'max:120'],
            'customer_email' => ['required', 'email:filter', 'max:190'],
            'customer_phone' => ['required', 'regex:/^\d{10,15}$/'],
            'city' => ['required', 'string', 'min:2', 'max:120'],
            'delivery_type' => ['required', 'in:delivery,pickup'],
            'address' => ['nullable', 'required_if:delivery_type,delivery', 'string', 'min:3', 'max:255'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['required', 'integer', 'min:1', 'distinct'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:999'],
        ];
    }

    public function messages(): array
    {
        return [
            'checkout_token.required' => 'Не удалось создать идентификатор заказа. Обновите страницу и повторите попытку.',
            'checkout_token.uuid' => 'Некорректный идентификатор заказа. Обновите страницу и повторите попытку.',
            'customer_name.required' => 'Укажите имя.',
            'customer_name.min' => 'Имя должно содержать минимум 2 символа.',
            'customer_email.required' => 'Укажите e-mail.',
            'customer_email.email' => 'Укажите корректный e-mail.',
            'customer_phone.required' => 'Укажите телефон.',
            'customer_phone.regex' => 'Укажите корректный номер телефона.',
            'city.required' => 'Укажите город.',
            'address.required_if' => 'Укажите адрес доставки.',
            'address.min' => 'Адрес доставки указан слишком коротко.',
            'items.required' => 'Корзина пуста.',
            'items.min' => 'Корзина пуста.',
            'items.max' => 'В одном заказе может быть не более 100 разных товаров.',
            'items.*.product_id.distinct' => 'Один товар не должен повторяться в заказе.',
            'items.*.qty.min' => 'Количество товара должно быть не меньше 1.',
            'items.*.qty.max' => 'Слишком большое количество товара.',
        ];
    }
}
