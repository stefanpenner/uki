include('../view.js');

/**
 * @class
 */
uki.view.Observable = /** @lends uki.view.Observable.prototype */ {
    // dom: function() {
    //     return null; // should implement
    // },
    
    bind: function(name, callback) {
        uki.each(name.split(' '), function(i, name) {
            if (!this._bound(name)) this._bindToDom(name);
            this._observersFor(name).push(callback);
        }, this);
        return this;
    },
    
    unbind: function(name, callback) {
        uki.each(name.split(' '), function(i, name) {
            this._observers[name] = uki.grep(this._observers[name], function(observer) {
                return observer != callback;
            });
            if (this._observers[name].length == 0) {
                this._unbindFromDom(name);
            }
        }, this);
        return this;
    },
    
    trigger: function(name/*, data1, data2*/) {
        var attrs = Array.prototype.slice.call(arguments, 1);
        uki.each(this._observersFor(name, true), function(i, callback) {
            callback.apply(this, attrs);
        }, this);
        return this;
    },
    
    _unbindFromDom: function(name, target) {
        if (!this._domHander || !this._eventTargets[name]) return;
        uki.dom.unbind(this._eventTargets[name], name, this._domHander);
    },
    
    _bindToDom: function(name, target) {
        if (!target && !this.dom) return;
        this._domHander = this._domHander || uki.proxy(function(e) {
            this.trigger(e.type, {domEvent: e, source: this});
        }, this);
        this._eventTargets = this._eventTargets || {};
        this._eventTargets[name] = target || this.dom();
        uki.dom.bind(this._eventTargets[name], name, this._domHander);
        return true;
    },
    
    _bound: function(name) {
        return this._observers && this._observers[name];
    },
    
    _observersFor: function(name, skipCreate) {
        if (skipCreate && (!this._observers || !this._observers[name])) return [];
        if (!this._observers) this._observers = {};
        if (!this._observers[name]) this._observers[name] = [];
        return this._observers[name];
    }
};