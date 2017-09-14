class LRUList{
	constructor(){
		this.head = 'HEAD'
		this.tail = 'TAIL'
		this.dict = {
			'HEAD': {
				prev: null,
				next: 'TAIL',
			},
			'TAIL': {
				prev: 'HEAD',
				next: null,
			},
		}
	}

	// moveToHead is exist, else prepend
	update(k){
		if (this.dict[k]){
			this.moveToHead(k)
		}
		else {
			this.prepend(k)
		}
	}

	prepend(k){
		if (this.dict[k]) {
			return
		}
		this.dict[k] = {
			prev: this.head,
			next: this.dict[this.head].next
		}
		this.dict[this.dict[this.head].next].prev = k
		this.dict[this.head].next = k
	}

	remove(k){
		if (!this.dict[k]){
			return
		}
		var prevKey = this.dict[k].prev
		var nextKey = this.dict[k].next
		this.dict[prevKey].next = nextKey
		this.dict[nextKey].prev = prevKey
		delete this.dict[k]
	}

	moveToHead(k){
		if (!this.dict[k]) {
			return
		}
		this.remove(k)
		this.prepend(k)
	}

	tailKey(){
		return this.dict[this.tail].prev
	}

	toString(){
		return JSON.stringify(this.dict, null, 4)
	}

	toJSON() {
		var d = {
			head: this.head,
			tail: this.tail,
			dict: this.dict,
		}
		return JSON.stringify(d, null, 4)
	}

	static fromJSON(json){
		var _ = new DList()
		var o = JSON.parse(json)
		_.head = o["head"]
		_.tail = o["tail"]
		_.dict = o["dict"]
		return _
	}

}


class LRUCache {
	constructor(cacheable) {
		this.memoCache = {}
		this.diskCache = cacheable
		this._setup()
	}

	_setup() {
		var v = this.diskCache.get('kLRUKeyListG8HJ5')
		this.list = v ? LRUList.fromJSON(v) : new LRUList()
	}

	_saveList() {
		this.diskCache.set('kLRUKeyListG8HJ5', this.list.toJSON())
	}

	set(k, v){
		try {
			this.diskCache.set(k, v)
			this.memoCache[k] = v
			this.list.update(k)
			this._saveList()
		}
		catch(e){
			var k = this.list.tailKey()
			this.diskCache.remove(k)
			this.memoCache[k] = null
			this.list.remove(k)
			this._saveList()
			this.set(k, v)
		}
	}

	get(k){
		var v = this.memoCache[k]
		if (v){
			return v
		}
		else {
			var vv = this.diskCache.get(k)
			if (vv){
				this.list.update(k)
				this._saveList()
				this.memoCache[k] = vv
				return vv
			}
			return null
		}
	}

	toString(){
		return JSON.stringify(this.cache, null, 4)
	}
}

class LocalStorageCacheable {
	constructor() {
		this.localStorage = window.localStorage
	}

	get(k) {
		return this.localStorage.getItem(k)
	}

	set(k, v) {
		this.localStorage.setItem(k, v)
	}

	remove(k) {
		this.localStorage.removeItem(k)
	}
}

class LocalStorageCache extends LRUCache {
	constructor() {
		super(new LocalStorageCacheable())
	}
}

var LSCache = new LocalStorageCache()
