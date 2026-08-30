<div class="container table-container">
    <h2 class="text-center mb-4">Заказы интернет магазина Etis.kz</h2>
    <div class="table-responsive">
        @if (Session::has('order_message'))
            <div class="alert alert-success">{{Session::get('order_message')}}</div>
        @endif
        <table class="table table-striped table-hover text-center align-middle">
            <thead class="table-dark">
                <tr>
                    <th>Номер</th>
                    <th>Итого</th>
                    <th>Имя</th>
                    <th>Телефон</th>
                    <th>Адрес</th>
                    <th>Город</th>
                    <th>Cтатус</th>
                    <th colspan="2">Действие</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($orders as $order)
                    <tr>
                        <td>{{$order->id}}</td>
                        <td>{{$order->total}}</td>
                        <td>{{$order->user_name}}</td>
                        <td>{{$order->mobile}}</td>
                        <td>{{$order->address}}</td>
                        <td>{{$order->city}}</td>
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
                        <td>
                            <a href="{{route('admin.orderdetails', ['order_id' => $order->id])}}" class="btn btn-info btn-sm">Подробнее</a>
                        </td>
                        <td>
                            <div class="dropdown">
                                <button class="btn btn-success btn-sm dropdown-toggle" type="button" data-toggle="dropdown">Статус
                                    <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a href="#" wire:click.prevent="updateOrderStatus({{$order->id}}, 'ordered')">Новый</a></li>
                                    <li><a href="#" wire:click.prevent="updateOrderStatus({{$order->id}}, 'delivered')">Выдан</a></li>
                                    <li><a href="#" wire:click.prevent="updateOrderStatus({{$order->id}}, 'canceled')">Отменен</a></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                @endforeach                
            </tbody>
        </table>
        {{$orders->links('pagination-links')}}          
    </div>
    <div class="loadingSpinner" wire:loading>
        <svg width="200" height="200" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_OSmW{transform-origin:center;animation:spinner_T6mA .75s step-end infinite}@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style><g class="spinner_OSmW"><rect x="11" y="1" width="2" height="5" opacity=".14"/><rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/><rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity="1"/><rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".9"/><rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/><rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/></g></svg>
    </div>
</div>