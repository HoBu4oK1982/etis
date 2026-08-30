<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <h5 class="card-header">
                    <div class="row">
                        <div class="col-md-6">Редактирование слайда</div>
                        <div class="col-md-6">
                            <a class="btn btn-info float-right" href="{{ route('admin.slides') }}">Все слайды</a>
                        </div>
                    </div>
                </h5>
                <div class="card-body">
                    <form wire:submit.prevent="update">

                        {{-- ============ Тексты слайда ============ --}}

                        <div class="form-group">
                            <label class="font-weight-bold">Плашка сверху</label>
                            <input type="text" class="form-control" wire:model="eyebrow"
                                   placeholder="ОБОРУДОВАНИЕ. ИНЖИНИРИНГ. НАДЁЖНОСТЬ." />
                            <small class="text-muted">Короткая надпись мелким шрифтом над заголовком</small>
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold">Заголовок</label>
                            <input type="text" class="form-control" wire:model="title" />
                            <small class="text-muted">Крупный заголовок слайда. Разрыв строки — символом \n</small>
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold">Подзаголовок</label>
                            <textarea class="form-control" rows="3" wire:model="subtitle"></textarea>
                            <small class="text-muted">Описание под заголовком (до 500 символов)</small>
                        </div>

                        {{-- ============ Прочее ============ --}}

                        <div class="form-group">
                            <label class="font-weight-bold">Ссылка кнопки "Перейти в каталог"</label>
                            <input type="text" class="form-control" wire:model="link" />
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold">Изображение слайда</label>
                            <input type="file" class="form-control-file" wire:model="newimage" />
                            <span class="green__info">1440×600 (или больше), формат JPEG/PNG/WEBP</span>
                            <div class="mt-2">
                                @if ($newimage)
                                    <img src="{{ $newimage->temporaryUrl() }}" width="240" alt="preview" />
                                @elseif ($image)
                                    <img src="{{ asset('assets/images/sliders/' . $image) }}" width="240" alt="current" />
                                @endif
                            </div>
                            @error('newimage') <span class="text-danger d-block mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label class="font-weight-bold">Порядок сортировки</label>
                                <input type="number" min="0" class="form-control" wire:model="position" />
                            </div>
                            <div class="form-group col-md-6">
                                <label class="font-weight-bold">Статус</label>
                                <select class="form-control" wire:model="status">
                                    <option value="0">Включен</option>
                                    <option value="1">Выключен</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-success">Обновить</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
