<div>
    <div class="container" style="padding: 30px 0;">
        <div class="row">
            <div class="col-md-12">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <div class="row">
                            <h3 class="col-md-6 panel-heading">
                                Детали заказа
                            </h3>
                            <div class="col-md-6 text-right">
                                <a href="{{ route('admin.orders') }}" class="btn btn-success">Все заказы</a>
                            </div>
                        </div>
                    </div>
                    <div class="panel-body">
                        <table class="table table-striped table-hover text-center align-middle">
                            <tr>
                                <th>Номер заказа:</th>
                                <td>{{ $order->id }}</td>
                                <th>Дата заказа:</th>
                                <td>{{ $order->created_at }}</td>
                                <th>Статус заказа:</th>
                                <td>
                                     @if ($order->status === 'ordered')
                                <span class="order__ordered">Новый</span>
                            @elseif ($order->status === 'processing')
                                <span class="order__processing">В обработке</span>
                            @elseif ($order->status === 'delivered')
                                <span class="order__delivered">Выдан</span>
                            @elseif ($order->status === 'canceled')
                                <span class="order__canceled"> Отменен</span>
                            @endif
                                </td>
                                @if($order->status == 'delivered')
                                    <th>Дата доставки:</th>
                                    <td>{{ $order->delivered_date }}</td>
                                    @elseif($order->status == 'canceled')
                                    <th>Дата отмены:</th>
                                    <td>{{ $order->canceled_date }}</td>
                                @endif
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <div class="row">
                            <div class="col-md-6">
                                <h3 class="panel-heading">Содержимое заказа</h3>
                            </div>
                        </div>
                    </div>
                    <div class="panel-body">
                        <div class="wrap-iten-in-cart">
                            <table class="table table-striped table-hover text-center align-middle">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Название товара</th>
                                        <th>Изображение товара</th>
                                        <th>Цена товара</th>
                                        <th>Количество</th>
                                        <th>Сумма</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    
                                        @foreach($order->orderItems as $item)
                                        <tr>
                                            <td><a class="link-to-product" href="{{ route('product.details', ['slug' => $item->product->slug]) }}">{!! $item->product->title !!}</a></td>
                                            <td><figure><img src="{{ asset('assets/images/products') }}/{{ $item->product->images }}" alt="{{ $item->product->name }}" style="max-width: 100px;"></figure></td>
                                            <td><p class="price">{{ $item->price }} 〒</p></td>
                                            <td>{{ $item->qty }}</td>
                                            <td><p class="price">{{ $item->price * $item->qty }} 〒</p></td>
                                        </tr>
                                        @endforeach
                                    
                                </tbody>
                            </table>
                        </div>
                        <div class="summary">
                            <div class="order-summary">
                                <h3 class="panel-heading">Итог заказа</h3>
                                <table class="table table-striped table-hover text-center align-middle">
                                    <thead class="table-dark">
                                        <tr>
                                            <th>Сумма:</th>
                                            <th>Итого:</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><b class="index">{{ $order->subtotal }} 〒</b></td>
                                            <td><b class="index">{{ $order->total }} 〒</b></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="panel panel-default">
                    <h3 class="panel-heading">
                        Данные заказа
                    </h3>
                    <table class="table table-striped table-hover text-center align-middle">
                        <thead class="table-dark">
                            <tr>
                                <th>Имя:</th>
                                <th>Телефон:</th>
                                <th>e-mail:</th>
                                <th>Адрес:</th>
                                <th>Город:</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b class="index">{{$order->user_name}}</b></td>
                                <td><b class="index">{{$order->mobile}}</b></td>
                                <td><b class="index">{{$order->email}}</b></td>
                                <td><b class="index">{{$order->address}}</b></td>
                                <td><b class="index">{{$order->city}}</b></td>
                            </tr>          
                        </tbody>
                    </table>
                </div>
            </div>
        </div>        
    </div>
</div>
