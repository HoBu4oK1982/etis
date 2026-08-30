<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <h5 class="card-header">
                    <div class="row">
                        <div class="col-md-6">Новый слайд</div>
                        <div class="col-md-6">
                            <a class="btn btn-info float-right" href="{{ route('admin.slides') }}">Все слайды</a>
                        </div>
                    </div>
                </h5>
                <div class="card-body">
                    <form wire:submit.prevent="save">

                        {{-- ============ Тексты слайда ============ --}}

                        <div class="form-group">
                            <label class="font-weight-bold">Плашка сверху</label>
                            <input type="text" class="form-control" wire:model="eyebrow"
                                   placeholder="ОБОРУДОВАНИЕ. ИНЖИНИРИНГ. НАДЁЖНОСТЬ." />
                            <small class="text-muted">Короткая надпись мелким шрифтом над заголовком</small>
                            @error('eyebrow') <span class="text-danger d-block mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold">Заголовок</label>
                            <input type="text" class="form-control" wire:model="title"
                                   placeholder="Инженерные системы нового уровня" />
                            <small class="text-muted">Крупный заголовок слайда. Разрыв строки — символом \n или через &lt;br&gt;</small>
                            @error('title') <span class="text-danger d-block mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold">Подзаголовок</label>
                            <textarea class="form-control" rows="3" wire:model="subtitle"
                                      placeholder="Отопление, кондиционирование, холодоснабжение и водоснабжение для объектов любой сложности."></textarea>
                            <small class="text-muted">Описание под заголовком (до 500 символов)</small>
                            @error('subtitle') <span class="text-danger d-block mt-1">{{ $message }}</span> @enderror
                        </div>

                        {{-- ============ Прочее ============ --}}

                        <div class="form-group">
                            <label class="font-weight-bold">Ссылка кнопки "Перейти в каталог"</label>
                            <input type="text" class="form-control" wire:model="link"
                                   placeholder="/shop  или  /category/otoplenie" />
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold">Изображение слайда</label>
                            <input type="file" class="form-control-file" required wire:model="image" />
                            <span class="green__info">1440×600 (или больше), формат JPEG/PNG/WEBP</span>
                            @if ($image)
                                <div class="mt-2">
                                    <img src="{{ $image->temporaryUrl() }}" width="240" alt="preview">
                                </div>
                            @endif
                            @error('image') <span class="text-danger d-block mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label class="font-weight-bold">Порядок сортировки</label>
                                <input type="number" min="0" class="form-control" wire:model="position" />
                                <small class="text-muted">Слайды сортируются по возрастанию</small>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="font-weight-bold">Статус</label>
                                <select class="form-control" wire:model="status">
                                    <option value="0">Включен</option>
                                    <option value="1">Выключен</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-success">Сохранить</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
