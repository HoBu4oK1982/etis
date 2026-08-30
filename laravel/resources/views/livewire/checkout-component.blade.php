@section('title', 'Оформление заказа')
<section class="checkout__wrap">
    <div class="container">
        <h1>Оформление заказа</h1>
        <x-breadcrumbs :items="[
            ['title' => 'Оформление заказа', 'url' => null],
        ]" />
        <div class=" main-content-area">
            <form wire:submit.prevent="placeOrder" class="billingForm" onsubmit="$('#processing').show()">
                <div class="billingFormLeft">
                    <div class="col-md-12">
                        <div class="wrap-address-billing">
                            <div class="billing-address loginForm">

                                <fieldset class="loginFieldset frmEmailWrap">
                                    <i class="fa-solid fa-user"></i>
                                    <label for="fname">Ваше имя <span class="red">*</span>:</label>
                                    <input type="text" name="fname" value="" class="inputCall" placeholder="Ваше имя" wire:model="firstname">
                                </fieldset>

                                <fieldset class="loginFieldset frmEmailWrap">
                                    <i class="fa-solid fa-phone-volume"></i>
                                    <label for="phone">Мобильный телефон <span class="red">*</span>:</label>
                                    <input type="text" name="phone" value="" class="inputCall art-stranger" placeholder="+7 (___) ___-__-__" wire:model="mobile">
                                </fieldset>
                                
                                <fieldset class="loginFieldset frmEmailWrap">
                                    <i class="fa-solid fa-envelope"></i>
                                    <label for="email">e-mail:</label>
                                    <input type="email" name="email" value="" class="inputCall" placeholder="Введите ваш email" wire:model="email">
                                </fieldset>

                                <fieldset class="loginFieldset frmEmailWrap">
                                    <i class="fa-solid fa-location-dot"></i>
                                    <label for="add">Адрес <span class="red">*</span>:</label>
                                    <input type="text" 
                                    name="add" 
                                    value="" 
                                    class="inputCall" 
                                    placeholder="Абая 200" 
                                    wire:model="address"
                                    @disabled($noaddress)>
                                </fieldset>

                                <fieldset class="loginFieldset frmEmailWrap">
                                    <i class="fa-solid fa-location-dot"></i>
                                    <label for="add">Город <span class="red">*</span>:</label>
                                    <input type="text" name="add" value="" class="inputCall" placeholder="Алматы" wire:model="city">
                                </fieldset>

                                <label class="text-danger">Все поля <span class="red">*</span> обязательны!</label>

                            </div>
                        </div>
                    </div>
                </div>
                <div class="summary summary-checkout">
                    <div class="summary-item payment-method">
                        {{-- <h4 class="title-box">Платежный метод</h4>
                        <div class="choose-payment-methods">
                            <label class="payment-method">
                                <input name="payment-method" value="cod" type="radio" checked="">
                                <span>Оплата при доставке</span>
                                <span class="payment-desc">Вы можете оплатить при достваке курьеру</span>
                            </label><br>
                        </div> --}}
                        @if(Session::has('checkout'))
                        <p class="summary-info grand-total"><b><span>Общая стоимость заказа: </span> <span class="grand-total-price">{{Session::get('checkout')['total']}} 〒</span></b></p>
                        @endif
                        @if ( $errors->isEmpty() )
                            <div style="font-size:20px; margin-bottom:20px;padding-left: 25px; color:green;display:none;" id="processing" wire:ignore>
                                <i class="fa fa-spinner fa-pulse fa-fw"></i>
                                <span>Отправка...</span>
                            </div>
                        @endif
                        @if($errors->any())
                            <div class="alert alert-danger">
                                <ul>
                                    @foreach($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        <button type="submit" class="btn-form">Оформить заказ</button>
                    </div>
                </div>
            </form>
            <img src="{{asset('assets/images/design/cart__img.jpg')}}" alt="" class="checkout__image" />
        </div>
    </div>
</section>
