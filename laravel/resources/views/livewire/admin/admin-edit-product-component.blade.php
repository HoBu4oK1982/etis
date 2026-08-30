<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <h5 class="card-header">
                    <div class="row">
                        <div class="col-md-6 font-weight-bold h5">Редактирование товара #{{ $product->id }}</div>
                        <div class="col-md-6 d-flex justify-content-end" style="gap:8px;">
                            <a class="btn btn-warning"
                               href="{{ route('admin.duplicateproduct', ['source_id' => $product->id]) }}"
                               title="Создать новый товар на основе этого"
                               onclick="return confirm('Открыть форму создания нового товара на основе «{{ addslashes($product->title) }}»? Все поля будут предзаполнены. Несохранённые изменения в текущей форме будут потеряны.');">
                                <i class="fas fa-copy"></i> Скопировать
                            </a>
                            <a class="btn btn-info" href="{{ route('admin.products') }}">Все товары</a>
                        </div>
                    </div>
                </h5>

                <div class="card-body">
                    <form wire:submit.prevent="save">

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5 text-dark">Название</label>
                            <input type="text" class="form-control" wire:model="title">
                            @error('title') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5 text-dark">Транслит</label>
                            <input type="text" class="form-control" wire:model="slug" readonly>
                            @error('slug') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5 text-dark">SKU (артикул)</label>
                            <input type="text" class="form-control" wire:model="sku">
                            @error('sku') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="admin__label font-weight-bold h5 text-dark">Цена</label>
                                    <input type="number" step="0.01" class="form-control" wire:model="price">
                                    @error('price') <span class="text-danger">{{ $message }}</span> @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="admin__label font-weight-bold h5 text-dark">Цена распродажи</label>
                                    <input type="number" step="0.01" class="form-control" wire:model="selling_price">
                                    @error('selling_price') <span class="text-danger">{{ $message }}</span> @enderror
                                </div>
                            </div>
                        </div>


                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5 text-dark">Бренд</label>
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
                            <label class="admin__label font-weight-bold h5 text-dark">Описание</label>
                            <textarea id="description" class="form-control">{!! $description ?? "" !!}</textarea>
                            @error('description') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group" wire:ignore>
                            <label class="admin__label font-weight-bold h5 text-dark">Краткое описание</label>
                            <textarea id="short_description" class="form-control">{!! $short_description ?? "" !!}</textarea>
                            @error('short_description') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5 text-dark">Текущие изображения</label>
                            @if($product->images->count())
                                <div class="d-flex flex-wrap" style="gap:10px;">
                                    @foreach($product->images as $img)
                                        <div style="width:120px;">
                                            <div style="position:relative; background:#fff; border-radius:10px; border:1px solid var(--border,#e3e6f0); padding:4px; overflow:hidden;">
                                                <img src="{{ asset('assets/images/products/' . $img->file_name) }}" style="width:100%; border-radius:6px; display:block;" />
                                                <button type="button" style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(239,68,68,.85);color:#fff;cursor:pointer;font-size:.8rem;display:grid;place-items:center" wire:click="removeExistingImage({{ $img->id }})">×</button>
                                            </div>
                                            <div style="display:flex;gap:3px;margin-top:4px">
                                                <button type="button" class="btn btn-sm btn-dark" style="flex:1;font-size:.7rem" wire:click="moveExistingImageUp({{ $img->id }})">↑</button>
                                                <button type="button" class="btn btn-sm btn-dark" style="flex:1;font-size:.7rem" wire:click="moveExistingImageDown({{ $img->id }})">↓</button>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            @else
                                <div class="text-muted">—</div>
                            @endif
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5 text-dark">Добавить изображения</label>
                            <label style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:var(--rs,10px);border:1px dashed var(--blue,#3b82f6);background:rgba(59,130,246,.06);color:var(--blue,#3b82f6);cursor:pointer;font-weight:700;font-size:.84rem;transition:.2s">
                                <i class="fas fa-cloud-upload-alt"></i> Выбрать фото
                                <input type="file" wire:model="newImages" multiple style="display:none" accept="image/*">
                            </label>
                            @error('newImages.*') <span class="text-danger">{{ $message }}</span> @enderror

                            @if(!empty($newImages))
                                <div class="mt-2 d-flex flex-wrap" style="gap:10px;">
                                    @foreach($newImages as $i => $img)
                                        @if($img)
                                            <div style="width:120px;">
                                                <div style="position:relative; background:#fff; border-radius:10px; border:1px solid var(--border,#e3e6f0); padding:4px; overflow:hidden;">
                                                    <img src="{{ $img->temporaryUrl() }}" style="width:100%; border-radius:6px; display:block;" />
                                                    <button type="button" style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(239,68,68,.85);color:#fff;cursor:pointer;font-size:.8rem;display:grid;place-items:center" wire:click="removeNewImage({{ $i }})">×</button>
                                                </div>
                                                <div style="display:flex;gap:3px;margin-top:4px">
                                                    <button type="button" class="btn btn-sm btn-dark" style="flex:1;font-size:.7rem" wire:click="moveNewImageUp({{ $i }})">↑</button>
                                                    <button type="button" class="btn btn-sm btn-dark" style="flex:1;font-size:.7rem" wire:click="moveNewImageDown({{ $i }})">↓</button>
                                                </div>
                                            </div>
                                        @endif
                                    @endforeach
                                </div>
                            @endif
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5 text-dark">Текущие PDF файлы</label>
                            @error('existingFileTitles.*') <span class="text-danger">{{ $message }}</span> @enderror
                            @if($product->files->count())
                                <ul class="list-unstyled">
                                    @foreach($product->files as $f)
                                        <li class="d-flex align-items-center mb-2" style="gap:8px">
                                            <input type="text" class="form-control form-control-sm" style="max-width:340px" placeholder="Произвольное название" wire:model="existingFileTitles.{{ $f->id }}">
                                            <a href="{{ $f->path }}" target="_blank" class="small" style="color:var(--blue,#3b82f6)"><i class="fas fa-file-pdf"></i> {{ $f->original_name ?: basename($f->path) }}</a>
                                            <div style="display:flex;gap:3px;margin-left:auto">
                                                <button type="button" class="btn btn-sm btn-dark" wire:click="moveExistingFileUp({{ $f->id }})">↑</button>
                                                <button type="button" class="btn btn-sm btn-dark" wire:click="moveExistingFileDown({{ $f->id }})">↓</button>
                                                <button type="button" class="btn btn-sm btn-danger" wire:click="removeExistingFile({{ $f->id }})">×</button>
                                            </div>
                                        </li>
                                    @endforeach
                                </ul>
                            @else
                                <div class="text-muted">—</div>
                            @endif
                        </div>

                    <div class="form-group">
                            <label class="admin__label font-weight-bold h5 text-dark">Добавить PDF файлы</label>
                            <label style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:var(--rs,10px);border:1px dashed var(--orange,#f59e0b);background:rgba(245,158,11,.06);color:var(--orange,#f59e0b);cursor:pointer;font-weight:700;font-size:.84rem;transition:.2s">
                                <i class="fas fa-file-upload"></i> Выбрать PDF
                                <input type="file" wire:model="newFiles" multiple accept="application/pdf" style="display:none">
                            </label>
                            @error('newFiles.*') <span class="text-danger">{{ $message }}</span> @enderror
                            @error('newFileTitles.*') <span class="text-danger">{{ $message }}</span> @enderror

                            @if(!empty($newFiles))
                                <ul class="mt-2 list-unstyled">
                                    @foreach($newFiles as $i => $f)
                                        @if($f)
                                            <li class="d-flex align-items-center mb-2">
                                                <input type="text" class="form-control form-control-sm mr-2" style="max-width: 340px;" placeholder="Произвольное название" wire:model="newFileTitles.{{ $i }}">
                                                <span class="text-muted small mr-2">{{ $f->getClientOriginalName() }}</span>
                                                <div class="btn-group btn-group-sm ml-auto">
                                                    <button type="button" class="btn btn-light" wire:click="moveNewFileUp({{ $i }})" title="Вверх">↑</button>
                                                    <button type="button" class="btn btn-light" wire:click="moveNewFileDown({{ $i }})" title="Вниз">↓</button>
                                                    <button type="button" class="btn btn-danger" wire:click="removeNewFile({{ $i }})" title="Удалить">×</button>
                                                </div>
                                            </li>
                                        @endif
                                    @endforeach
                                </ul>
                            @endif
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5 text-dark">Характеристики</label>

                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th style="width: 160px;">Тип</th>
                                            <th style="width: 260px;">Значение</th>
                                            <th>Описание / Контент</th>
                                            <th style="width: 60px;"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($chars as $i => $row)
                                            @php($type = $row['type'] ?? 'pair')
                                            <tr>
                                                <td>
                                                    <select class="form-control" wire:model="chars.{{ $i }}.type">
                                                        <option value="pair">Значение – Описание</option>
                                                        <option value="html">Текст + картинки (HTML)</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input type="text" class="form-control" wire:model="chars.{{ $i }}.name" placeholder="Напр. Мощность горелки">
                                                </td>
                                                <td>
                                                    @if($type === 'pair')
                                                        <input type="text" class="form-control" wire:model="chars.{{ $i }}.value" placeholder="Напр. от 50 до 160 кВт">
                                                    @else
                                                        <div wire:ignore>
                                                            <textarea
                                                                class="form-control js-char-summernote"
                                                                id="char_content_{{ $i }}"
                                                                data-char-index="{{ $i }}"
                                                            >{!! $row['content'] ?? '' !!}</textarea>
                                                        </div>
                                                        @error('chars.' . $i . '.content') <span class="text-danger">{{ $message }}</span> @enderror
                                                    @endif
                                                </td>
                                                <td>
                                                    <button type="button" class="btn btn-sm btn-danger" wire:click="removeCharRow({{ $i }})">×</button>
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>

                            <button type="button" class="btn btn-sm btn-secondary" wire:click="addCharRow">+ Добавить строку</button>
                        </div>

                        <div class="row">
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label class="admin__label font-weight-bold h5 text-dark">Тип товара</label>
                                    <select class="form-control" wire:model="remark">
                                        <option value="">—</option>
                                        <option value="hit">hit</option>
                                        <option value="sale">sale</option>
                                        <option value="new">new</option>
                                    </select>
                                    @error('remark') <span class="text-danger">{{ $message }}</span> @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label class="admin__label font-weight-bold h5 text-dark">Статус</label>
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
    });
</script>
@endpush
