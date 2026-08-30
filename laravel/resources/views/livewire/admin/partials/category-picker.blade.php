@php
    $fieldName  = $fieldName ?? 'category_id';
    $selectedId = $selectedId ?? null;
    $label      = $label ?? 'Категория';
    $byParent = $categories->groupBy(fn($c) => $c->parent_id ?? 'root');
    $flatList = [];
    $buildFlat = function($pid, $path = []) use (&$buildFlat, $byParent, &$flatList) {
        foreach ($byParent->get($pid, collect()) as $c) {
            $cur = array_merge($path, [$c->title]);
            $flatList[] = ['id'=>$c->id,'title'=>$c->title,'parent_id'=>$c->parent_id,'pathStr'=>implode(' → ',$cur)];
            $buildFlat($c->id, $cur);
        }
    };
    $buildFlat('root');
    $selPath=$selTitle='';
    foreach($flatList as $it){if((int)$it['id']===(int)$selectedId){$selPath=$it['pathStr'];$selTitle=$it['title'];break;}}
@endphp
<style>[x-cloak]{display:none!important}</style>
<div x-data="{
    open:false,search:'',
    selId:@js((int)$selectedId?:null),selTitle:@js($selTitle),selPath:@js($selPath),
    items:@js($flatList),exp:{},
    get filtered(){if(!this.search.trim())return null;let s=this.search.toLowerCase();return this.items.filter(i=>i.title.toLowerCase().includes(s)||i.pathStr.toLowerCase().includes(s))},
    roots(){return this.items.filter(i=>!i.parent_id||i.parent_id==='')},
    kids(p){return this.items.filter(i=>i.parent_id==p)},
    has(id){return this.items.some(i=>i.parent_id==id)},
    pick(i){this.selId=i.id;this.selTitle=i.title;this.selPath=i.pathStr;this.open=false;this.search='';$wire.set('{{$fieldName}}',i.id)},
    clear(){this.selId=null;this.selTitle='';this.selPath='';$wire.set('{{$fieldName}}',null)}
}" @click.outside="open=false" @keydown.escape.window="open=false" style="position:relative">
    <label class="admin__label font-weight-bold h5">{{ $label }}</label>
    <div @click="open=!open;$nextTick(()=>{if(open)$refs.si.focus()})" class="form-control" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;min-height:42px;padding:6px 12px">
        <div style="flex:1;min-width:0">
            <template x-if="selId"><div><b style="font-size:.88rem" x-text="selTitle"></b><br><small style="color:var(--muted,#858796)" x-text="selPath"></small></div></template>
            <template x-if="!selId"><span style="color:var(--muted,#858796)">Выберите категорию</span></template>
        </div>
        <div style="display:flex;align-items:center;gap:4px;margin-left:6px">
            <span x-show="selId" @click.stop="clear()" style="cursor:pointer;color:var(--red,#e74a3b);font-size:1.1rem;line-height:1">&times;</span>
            <span :style="open?'transform:rotate(180deg)':''" style="transition:transform .2s;font-size:.7rem;color:var(--muted,#858796)">▼</span>
        </div>
    </div>
    <div x-show="open" x-transition x-cloak style="position:absolute;top:calc(100% + 3px);left:0;right:0;z-index:50;background:var(--panel,#fff);border:1px solid var(--border,#e3e6f0);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);overflow:hidden">
        <div style="padding:8px;border-bottom:1px solid var(--border,#e3e6f0)">
            <input x-ref="si" x-model.debounce.200ms="search" type="text" placeholder="Поиск категории..." style="width:100%;border:1px solid var(--input-border,#e3e6f0);border-radius:8px;padding:7px 10px;font-size:.84rem;outline:none;background:var(--input-bg,#fff);color:var(--input-text,#333)">
        </div>
        <div style="max-height:300px;overflow-y:auto;padding:4px">
            <template x-if="search.trim()"><div>
                <template x-for="item in filtered" :key="item.id">
                    <div @click="pick(item)" :style="item.id===selId?'background:rgba(59,130,246,.12)':''" style="padding:7px 10px;border-radius:7px;cursor:pointer" @mouseenter="if(!$el.style.background.includes('59'))$el.style.background='rgba(59,130,246,.04)'" @mouseleave="if(!$el.style.background.includes('.12'))$el.style.background=''">
                        <b style="font-size:.84rem;display:block;color:var(--text,#333)" x-text="item.title"></b>
                        <small style="color:var(--muted,#858796)" x-text="item.pathStr"></small>
                    </div>
                </template>
                <div x-show="filtered&&filtered.length===0" style="padding:14px;text-align:center;color:var(--muted,#858796);font-size:.84rem">Ничего не найдено</div>
            </div></template>
            <template x-if="!search.trim()"><div>
                <template x-for="a in roots()" :key="a.id"><div>
                    <div style="display:flex;align-items:center;gap:2px;padding:4px 6px;border-radius:6px" :style="a.id===selId?'background:rgba(59,130,246,.12)':''">
                        <button type="button" x-show="has(a.id)" @click.stop="exp[a.id]=!exp[a.id]" :style="exp[a.id]?'transform:rotate(90deg)':''" style="width:18px;height:18px;border-radius:4px;border:1px solid var(--border,#d1d3e2);background:none;color:var(--muted,#858796);cursor:pointer;font-size:.6rem;display:grid;place-items:center;transition:transform .15s;flex-shrink:0">▸</button>
                        <span x-show="!has(a.id)" style="width:18px;flex-shrink:0"></span>
                        <span @click="pick(a)" style="cursor:pointer;font-size:.84rem;flex:1;color:var(--text,#333)" x-text="a.title"></span>
                    </div>
                    <template x-if="exp[a.id]"><div style="padding-left:14px;margin-left:9px;border-left:1px solid var(--border,#e3e6f0)">
                        <template x-for="b in kids(a.id)" :key="b.id"><div>
                            <div style="display:flex;align-items:center;gap:2px;padding:3px 6px;border-radius:6px" :style="b.id===selId?'background:rgba(59,130,246,.12)':''">
                                <button type="button" x-show="has(b.id)" @click.stop="exp[b.id]=!exp[b.id]" :style="exp[b.id]?'transform:rotate(90deg)':''" style="width:18px;height:18px;border-radius:4px;border:1px solid var(--border,#d1d3e2);background:none;color:var(--muted,#858796);cursor:pointer;font-size:.6rem;display:grid;place-items:center;transition:transform .15s;flex-shrink:0">▸</button>
                                <span x-show="!has(b.id)" style="width:18px;flex-shrink:0"></span>
                                <span @click="pick(b)" style="cursor:pointer;font-size:.84rem;flex:1;color:var(--text,#333)" x-text="b.title"></span>
                            </div>
                            <template x-if="exp[b.id]"><div style="padding-left:14px;margin-left:9px;border-left:1px solid var(--border,#e3e6f0)">
                                <template x-for="c in kids(b.id)" :key="c.id"><div>
                                    <div style="display:flex;align-items:center;gap:2px;padding:3px 6px;border-radius:6px" :style="c.id===selId?'background:rgba(59,130,246,.12)':''">
                                        <button type="button" x-show="has(c.id)" @click.stop="exp[c.id]=!exp[c.id]" :style="exp[c.id]?'transform:rotate(90deg)':''" style="width:18px;height:18px;border-radius:4px;border:1px solid var(--border,#d1d3e2);background:none;color:var(--muted,#858796);cursor:pointer;font-size:.6rem;display:grid;place-items:center;transition:transform .15s;flex-shrink:0">▸</button>
                                        <span x-show="!has(c.id)" style="width:18px;flex-shrink:0"></span>
                                        <span @click="pick(c)" style="cursor:pointer;font-size:.84rem;flex:1;color:var(--text,#333)" x-text="c.title"></span>
                                    </div>
                                    <template x-if="exp[c.id]"><div style="padding-left:14px;margin-left:9px;border-left:1px solid var(--border,#e3e6f0)">
                                        <template x-for="d in kids(c.id)" :key="d.id"><div>
                                            <div style="display:flex;align-items:center;gap:2px;padding:3px 6px;border-radius:6px" :style="d.id===selId?'background:rgba(59,130,246,.12)':''">
                                                <button type="button" x-show="has(d.id)" @click.stop="exp[d.id]=!exp[d.id]" :style="exp[d.id]?'transform:rotate(90deg)':''" style="width:18px;height:18px;border-radius:4px;border:1px solid var(--border,#d1d3e2);background:none;color:var(--muted,#858796);cursor:pointer;font-size:.6rem;display:grid;place-items:center;transition:transform .15s;flex-shrink:0">▸</button>
                                                <span x-show="!has(d.id)" style="width:18px;flex-shrink:0"></span>
                                                <span @click="pick(d)" style="cursor:pointer;font-size:.84rem;flex:1;color:var(--text,#333)" x-text="d.title"></span>
                                            </div>
                                            <template x-if="exp[d.id]"><div style="padding-left:14px;margin-left:9px;border-left:1px solid var(--border,#e3e6f0)">
                                                <template x-for="e in kids(d.id)" :key="e.id">
                                                    <div style="display:flex;align-items:center;gap:2px;padding:3px 6px;border-radius:6px" :style="e.id===selId?'background:rgba(59,130,246,.12)':''">
                                                        <span style="width:18px;flex-shrink:0"></span>
                                                        <span @click="pick(e)" style="cursor:pointer;font-size:.84rem;flex:1;color:var(--text,#333)" x-text="e.title"></span>
                                                    </div>
                                                </template>
                                            </div></template>
                                        </div></template>
                                    </div></template>
                                </div></template>
                            </div></template>
                        </div></template>
                    </div></template>
                </div></template>
            </div></template>
        </div>
    </div>
    @error($fieldName) <span class="text-danger">{{ $message }}</span> @enderror
</div>
