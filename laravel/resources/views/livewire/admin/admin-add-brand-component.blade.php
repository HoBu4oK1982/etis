<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <h5 class="card-header">
                    <div class="row">
                        <div class="col-md-6">Создание бренда</div>
                        <div class="col-md-6">
                            <a class="btn btn-info float-right" href="{{ route('admin.brands') }}">Все бренды</a>
                        </div>
                    </div>
                </h5>

                <div class="card-body">
                    <form wire:submit.prevent="storeBrand">
                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">Название</label>
                            <input type="text" class="form-control" wire:model="title">
                            @error('title') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">Slug (транслит)</label>
                            <input type="text" class="form-control" wire:model="slug" readonly>
                            @error('slug') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">Позиция (сортировка)</label>
                            <input type="number" class="form-control" wire:model="position" min="0">
                            @error('position') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="admin__label font-weight-bold h5">Статус</label>
                            <select class="form-control" wire:model="status">
                                <option value="0">Включен</option>
                                <option value="1">Выключен</option>
                            </select>
                            @error('status') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group" wire:ignore>
                            <label class="admin__label font-weight-bold h5">Описание (можно вставлять картинки)</label>
                            <textarea id="description" class="form-control" wire:model="description"></textarea>
                            @error('description') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold h5">Изображение бренда</label>
                            <input type="file" class="form-control-file" wire:model="image" />
                            @error('image') <span class="text-danger">{{ $message }}</span> @enderror

                            @if ($image)
                                <div class="mt-2">
                                    <img src="{{ $image->temporaryUrl() }}" width="180" alt="">
                                </div>
                            @endif
                        </div>

                        @if($errors->any())
                            <div class="alert alert-danger">
                                <ul class="mb-0">
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
    $(function(){
        $('#description').summernote({
            height: 350,
            lang: 'ru-RU',
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']],
            ],
            callbacks: {
                onChange: function(contents) {
                    @this.set('description', contents);
                }
            }
        });
    });
</script>
@endpush
