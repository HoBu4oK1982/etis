<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <h5 class="card-header">
                    <div class="row">
                        <div class="col-md-6">
                            @if($source_id)
                                Копирование товара
                            @else
                                Создание товара
                            @endif
                        </div>
                        <div class="col-md-6">
                            <a class="btn btn-info float-right" href="{{ route('admin.products') }}">Все товары</a>
                        </div>
                    </div>
                </h5>

                <div class="card-body">

                    @if($source_id)
                        <div class="alert alert-warning d-flex align-items-start" role="alert" style="border-left:4px solid #f59e0b;">
                            <i class="fas fa-copy mr-3 mt-1" style="font-size:1.3rem;"></i>
                            <div>
                                <strong>Копирование товара:</strong> <em>{{ $sourceTitle }}</em>
                                <div class="small mt-1" style="opacity:.85">
                                    Все поля, характеристики, изображения и PDF предзаполнены из исходного товара.
                                    Slug (транслит) сгенерирован автоматически — при повторе будет добавлен суффикс&nbsp;<code>-2</code>, <code>-3</code>&nbsp;и&nbsp;т.д.
                                    Внесите нужные правки и нажмите «Сохранить».
                                </div>
                            </div>
                        </div>
                    @endif

                    <form wire:submit.prevent="save">

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">Название</label>
                            <input type="text" class="form-control" wire:model="title">
                            @error('title') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">Транслит</label>
                            <input type="text" class="form-control" wire:model="slug" readonly>
                            @error('slug') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">SKU (артикул)</label>
                            <input type="text" class="form-control" wire:model="sku">
                            @error('sku') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="admin__label font-weight-bold h5">Цена</label>
                                    <input type="number" step="0.01" class="form-control" wire:model="price">
                                    @error('price') <span class="text-danger">{{ $message }}</span> @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="admin__label font-weight-bold h5">Цена распродажи</label>
                                    <input type="number" step="0.01" class="form-control" wire:model="selling_price">
                                    @error('selling_price') <span class="text-danger">{{ $message }}</span> @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">Бренд</label>
                            <select class="form-control" wire:model="brand_id">
                                <option value="">— не выбран —</option>
                                @foreach($brands as $b)
                                    <option value="{{ $b->id }}">{{ $b->title }}</option>
                                @endforeach
                            </select>
                            @error('brand_id') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group" wire:ignore>
                            @include('livewire.admin.partials.category-picker', [
                                'categories'  => $categories,
                                'fieldName'   => 'category_id',
                                'selectedId'  => $category_id ?? null,
                            ])
                        </div>

                        <div class="form-group" wire:ignore>
                            <label class="admin__label font-weight-bold h5">Описание</label>
                            <textarea id="description" class="form-control" wire:model="description"></textarea>
                            @error('description') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group" wire:ignore>
                            <label class="admin__label font-weight-bold h5">Краткое описание</label>
                            <textarea id="short_description" class="form-control" wire:model="short_description"></textarea>
                            @error('short_description') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        @if(!empty($inheritedImages))
                            <div class="form-group">
                                <label class="admin__label font-weight-bold h5">
                                    Изображения из исходного товара
                                    <span class="badge badge-warning" style="font-weight:500">будут скопированы</span>
                                </label>
                                <div class="small text-muted mb-2">
                                    Нажмите&nbsp;<strong>×</strong>&nbsp;чтобы не переносить конкретное изображение в копию.
                                </div>
                                <div class="d-flex flex-wrap" style="gap:10px;">
                                    @foreach($inheritedImages as $i => $inh)
                                        <div style="width:120px;" wire:key="inh-img-{{ $i }}">
                                            <div style="position:relative; background:#fff; border-radius:10px; border:1px solid var(--border,#e3e6f0); padding:4px; overflow:hidden;">
                                                <img src="{{ $inh['url'] }}" style="width:100%; border-radius:6px; display:block;" />
                                                <button type="button"
                                                        style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(239,68,68,.85);color:#fff;cursor:pointer;font-size:.8rem;display:grid;place-items:center"
                                                        wire:click="removeInheritedImage({{ $i }})"
                                                        title="Не переносить эту картинку">×</button>
                                            </div>
                                            <div class="text-center small text-muted mt-1" style="font-size:.7rem">
                                                {{ $inh['file_name'] }}
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        @endif

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">
                                @if(!empty($inheritedImages))
                                    Добавить ещё изображения
                                @else
                                    Изображения (несколько)
                                @endif
                            </label>
                            <label style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:var(--rs,10px);border:1px dashed var(--blue,#3b82f6);background:rgba(59,130,246,.06);color:var(--blue,#3b82f6);cursor:pointer;font-weight:700;font-size:.84rem">
                                <i class="fas fa-cloud-upload-alt"></i> Выбрать фото
                                <input type="file" wire:model="images" multiple style="display:none" accept="image/*">
                            </label>
                            @error('images.*') <span class="text-danger">{{ $message }}</span> @enderror

                            @if(!empty($images))
                                <div class="mt-2 d-flex flex-wrap" style="gap:10px;">
                                    @foreach($images as $i => $img)
                                        @if($img)
                                            <div style="width:120px;">
                                                <div style="position:relative; background:#fff; border-radius:10px; border:1px solid var(--border,#e3e6f0); padding:4px; overflow:hidden;">
                                                    <img src="{{ $img->temporaryUrl() }}" style="width:100%; border-radius:6px; display:block;" />
                                                    <button type="button" style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(239,68,68,.85);color:#fff;cursor:pointer;font-size:.8rem;display:grid;place-items:center" wire:click="removeImage({{ $i }})">×</button>
                                                </div>
                                                <div style="display:flex;gap:3px;margin-top:4px">
                                                    <button type="button" class="btn btn-sm btn-dark" style="flex:1;font-size:.7rem" wire:click="moveImageUp({{ $i }})">↑</button>
                                                    <button type="button" class="btn btn-sm btn-dark" style="flex:1;font-size:.7rem" wire:click="moveImageDown({{ $i }})">↓</button>
                                                </div>
                                            </div>
                                        @endif
                                    @endforeach
                                </div>
                            @endif
                        </div>

                        @if(!empty($inheritedFiles))
                            <div class="form-group">
                                <label class="admin__label font-weight-bold h5">
                                    PDF из исходного товара
                                    <span class="badge badge-warning" style="font-weight:500">будут скопированы</span>
                                </label>
                                <ul class="list-unstyled mb-0">
                                    @foreach($inheritedFiles as $i => $inh)
                                        <li class="d-flex align-items-center mb-2" wire:key="inh-file-{{ $i }}">
                                            <i class="fas fa-file-pdf text-danger mr-2"></i>
                                            <div class="mr-auto">
                                                <div><strong>{{ $inh['title'] ?: $inh['original_name'] }}</strong></div>
                                                <div class="text-muted small">{{ $inh['original_name'] }}</div>
                                            </div>
                                            <button type="button"
                                                    class="btn btn-sm btn-danger"
                                                    wire:click="removeInheritedFile({{ $i }})"
                                                    title="Не переносить этот файл">×</button>
                                        </li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">
                                @if(!empty($inheritedFiles))
                                    Добавить ещё PDF
                                @else
                                    PDF файлы (несколько)
                                @endif
                            </label>
                            <label style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:var(--rs,10px);border:1px dashed var(--orange,#f59e0b);background:rgba(245,158,11,.06);color:var(--orange,#f59e0b);cursor:pointer;font-weight:700;font-size:.84rem">
                                <i class="fas fa-file-upload"></i> Выбрать PDF
                                <input type="file" wire:model="files" multiple accept="application/pdf" style="display:none">
                            </label>
                            @error('files.*') <span class="text-danger">{{ $message }}</span> @enderror

                            @error('fileTitles.*') <span class="text-danger">{{ $message }}</span> @enderror

                            @if(!empty($files))
                                <ul class="mt-2 list-unstyled">
                                    @foreach($files as $i => $f)
                                        @if($f)
                                            <li class="d-flex align-items-center mb-2">
                                                <input type="text" class="form-control form-control-sm mr-2" style="max-width: 320px;" placeholder="Произвольное название" wire:model="fileTitles.{{ $i }}">
                                                <span class="text-muted small mr-2">{{ $f->getClientOriginalName() }}</span>
                                                <div class="btn-group btn-group-sm ml-auto">
                                                    <button type="button" class="btn btn-light" wire:click="moveFileUp({{ $i }})" title="Вверх">↑</button>
                                                    <button type="button" class="btn btn-light" wire:click="moveFileDown({{ $i }})" title="Вниз">↓</button>
                                                    <button type="button" class="btn btn-danger" wire:click="removeFile({{ $i }})" title="Удалить">×</button>
                                                </div>
                                            </li>
                                        @endif
                                    @endforeach
                                </ul>
                            @endif
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">Характеристики</label>

<div class="table-responsive">
    <table class="table table-bordered">
        <thead>
            <tr>
                <th style="width: 220px;">Тип</th>
                <th style="width: 320px;">Значение</th>
                <th>Описание / Контент</th>
                <th style="width: 60px;"></th>
            </tr>
        </thead>
        <tbody>
            @foreach($chars as $i => $row)
                @php($type = $row['type'] ?? 'pair')
                <tr wire:key="char-row-{{ $i }}">
                    <td>
                        <div class="custom-control custom-radio mb-1">
                            <input type="radio"
                                   id="char_type_pair_{{ $i }}"
                                   class="custom-control-input"
                                   value="pair"
                                   wire:model="chars.{{ $i }}.type">
                            <label class="custom-control-label" for="char_type_pair_{{ $i }}">
                                Значение / Описание
                            </label>
                        </div>
                        <div class="custom-control custom-radio">
                            <input type="radio"
                                   id="char_type_html_{{ $i }}"
                                   class="custom-control-input"
                                   value="html"
                                   wire:model="chars.{{ $i }}.type">
                            <label class="custom-control-label" for="char_type_html_{{ $i }}">
                                HTML (текст + картинки)
                            </label>
                        </div>
                    </td>

                    @if($type === 'pair')
                        <td>
                            <input type="text"
                                   class="form-control"
                                   wire:model="chars.{{ $i }}.name"
                                   placeholder="Напр. Мощность горелки">
                            @error('chars.' . $i . '.name') <span class="text-danger">{{ $message }}</span> @enderror
                        </td>
                        <td>
                            <input type="text"
                                   class="form-control"
                                   wire:model="chars.{{ $i }}.value"
                                   placeholder="Напр. от 50 до 160 кВт">
                            @error('chars.' . $i . '.value') <span class="text-danger">{{ $message }}</span> @enderror
                        </td>
                    @else
                        <td colspan="2">
                            <div wire:ignore>
                                <textarea
                                    class="form-control js-char-summernote"
                                    id="char_content_{{ $i }}"
                                    data-char-index="{{ $i }}"
                                >{!! $row['content'] ?? '' !!}</textarea>
                            </div>
                            @error('chars.' . $i . '.content') <span class="text-danger">{{ $message }}</span> @enderror
                        </td>
                    @endif

                    <td>
                        <button type="button" class="btn btn-sm btn-danger" wire:click="removeCharRow({{ $i }})">×</button>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>

<button type="button" class="btn btn-sm btn-secondary" wire:click="addCharRow">+ Добавить строку</button>


                        <div class="row">
                            <div class="col-md-4 mt-4">
                                <div class="form-group">
                                    <label class="admin__label font-weight-bold h5">Тип товара</label>
                                    <select class="form-control" wire:model="remark">
                                        <option value="">—</option>
                                        <option value="hit">Хит продаж</option>
                                        <option value="sale">Акция</option>
                                        <option value="new">Новинка</option>
                                    </select>
                                    @error('remark') <span class="text-danger">{{ $message }}</span> @enderror
                                </div>
                            </div>
                            <div class="col-md-4 mt-4">
                                <div class="form-group">
                                    <label class="admin__label font-weight-bold h5">Статус</label>
                                    <select class="form-control" wire:model="status">
                                        <option value="0">Включен</option>
                                        <option value="1">Выключен</option>
                                    </select>
                                    @error('status') <span class="text-danger">{{ $message }}</span> @enderror
                                </div>
                            </div>
                        </div>

                        @if($errors->any())
                            <div class="alert alert-danger">
                                <ul>
                                    @foreach($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <button type="submit" class="btn btn-success">Сохранить</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@push('script')
<script>
    document.addEventListener('livewire:init', () => {
        const toolbar = [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ];

        function initSummernote(selector, field, height) {
            const $el = $(selector);
            if (!$el.length) return;
            if ($el.data('summernote')) return;

            $el.summernote({
                height: height,
                toolbar: toolbar,
                callbacks: {
                    onChange: function (contents) {
                        @this.set(field, contents);
                    }
                }
            });
        }

        function initCharEditors() {
            $('.js-char-summernote').each(function () {
                const $el = $(this);
                if ($el.data('summernote')) return;
                const idx = this.dataset.charIndex;

                $el.summernote({
                    height: 180,
                    toolbar: toolbar,
                    callbacks: {
                        onChange: function (contents) {
                            @this.set('chars.' + idx + '.content', contents);
                        }
                    }
                });
            });
        }

        function initAll() {
            initSummernote('#description', 'description', 300);
            initSummernote('#short_description', 'short_description', 180);
            initCharEditors();
        }

        initAll();

        Livewire.hook('commit', ({ respond }) => {
            respond(() => {
                initAll();
            });
        });

        Livewire.on('reinit-editors', () => {
            initAll();
        });
    });
</script>
@endpush
