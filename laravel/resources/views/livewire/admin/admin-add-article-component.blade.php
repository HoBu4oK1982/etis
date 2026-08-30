<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <h5 class="card-header">
                    <div class="row">
                        <div class="col-md-6">
                            Создание поста
                        </div>
                        <div class="col-md-6">
                            <a class="btn btn-info float-right" href="{{route('admin.articles')}}">Все посты</a>
                        </div>
                    </div>
                </h5>
                <div class="card-body">
                    <form wire:submit.prevent="save">
                        <div class="form-group">
                            <label for="title" class="admin__label">Название</label>
                            <input type="text" id="title" wire:model="title" class="form-control">
                            @error('title') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label for="slug" class="admin__label">Транслит</label>
                            <input type="text" id="slug" wire:model="slug" class="form-control" readonly>
                            @error('slug') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group" wire:ignore>
                            <label for="description" class="admin__label">Описание</label>
                            <textarea id="description" wire:model="description" class="form-control"></textarea>
                            @error('description') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group" wire:ignore>
                            <label for="short_description" class="admin__label">Краткое описание</label>
                            <textarea id="short_description" wire:model="short_description" class="form-control"></textarea>
                            @error('short_description') <span class="text-danger">{{ $message }}</span> @enderror
                        </div>

                        <div class="form-group">
                            <label for="exampleFormControlFile">Изображение для новости</label>
                            <input type="file" class="form-control-file" required id="exampleFormControlFile" wire:model="image" />
                            <span class="green__info">600px на 300px - формат JPEG или JPG</span>
                            @if ($image)
                                <img src="{{$image->temporaryUrl()}}" width="120" alt="">
                            @endif
                        </div>

                        <div class="form-group">
                            <label for="exampleFormControlSelect">Статус</label>
                            <select class="form-control" id="exampleFormControlSelect" wire:model="status" >
                                <option value="0">Включен</option>
                                <option value="1">Выключен</option>
                            </select>
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
        $(function(){
            $('#description').summernote({
                height: 300,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'underline', 'clear']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['table', ['table']],
                    ['insert', ['link', 'picture', 'video']],
                    ['view', ['fullscreen', 'codeview', 'help']]
                ],
                callbacks: {
                    onChange: function(contents, $editable) {
                        @this.set('description', contents);
                    }
                }
            });
        });
    </script>
@endpush
