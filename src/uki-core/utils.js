include('uki.js');

var toString = Object.prototype.toString;
var marked = '__uki_marked';
	
var utils = 
/**
 * Utility functions. Can be called both as uki.utils.function or uki.function
 * @namespace
 */
uki.utils = {
    
    /**
     * Sets or retrieves attribute on an object. 
     * <p>If target has function with attr it will be called target[attr](value=)
     * If no function present attribute will be set/get directly: target[attr] = value or return target[attr]</p>
     *
     * @example
     *   uki.attr(view, 'name', 'funny') // sets name to funny on view
     *   uki.attr(view, 'id') // gets id attribute of view
     *
     * @param {object} target
     * @param {string} attr Attribute name
     * @param {object=} value Value to set
     * @returns {object} target if value is being set, retrieved value otherwise
     */
    attr: function(target, attr, value) {
        if (value !== undefined) {
            // if (target[attr].apply) {
            if (utils.isFunction(target[attr])) {
                target[attr](value);
            } else {
                target[attr] = value;
            }
            return target;
        } else {
            // if (target[attr].apply) {
            if (utils.isFunction(target[attr])) {
                return target[attr]();
            } else {
                return target[attr];
            }
        }
    },
    
    /**
     * Runs a function in a given context
     *
     * @param {function()} fn
     * @param {object} context
     */
    proxy: function(fn, context) {
        return function() {
            return fn.apply(context, arguments);
        }
    },
    
    /**
     * Checks if obj is a function
     *
     * @param {object} object Object to check
     * @returns {boolean}
     */
	isFunction: function( obj ) {
		return toString.call(obj) === "[object Function]";
	},

    /**
     * Checks if obj is an Array
     *
     * @param {object} object Object to check
     * @returns {boolean}
     */
    isArray: function( obj ) {
        return toString.call(obj) === "[object Array]";
    },
    
    /**
     * Trims the string
     *
     * @param {string} text 
     * @returns {string} trimmed text
     */
    trim: function( text ) {
        return (text || "").replace( /^\s+|\s+$/g, "" );
    },
    
    /**
     * Converts unsafe symbols to entities
     *
     * @param {string} html 
     * @returns {string} escaped html
     */
    escapeHTML: function( html ) {
        var trans = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
        };
        return html.replace(/[&<>\"\']/g, function(c) { return trans[c]; });
    },
    
    /**
     * Iterates through all non empty values of object or an Array
     *
     * @param {object|Array} object Object to iterate through
     * @param {function(number, object):boolean} callback Called for every item, may return false to stop iteration
     * @param {object} context Context in which callback should called. If not specified context will be set to
     *                         current item
     * @returns {object}
     */
    each: function( object, callback, context ) {
        var name, i = 0, length = object.length;

        if ( length === undefined ) {
            for ( name in object ) {
                if ( !name || object[ name ] === undefined || !object.hasOwnProperty(name) ) continue;
                if ( callback.call( context || object[ name ], name, object[ name ] ) === false ) { break; }
            }
        } else {
            for ( var value = object[0]; i < length && callback.call( context || value, i, value ) !== false; value = object[++i] ){}
        }
        return object;
    },
    
    /**
     * Checks if elem is in array
     *
     * @param {object} elem
     * @param {object} array
     * @returns {boolean}
     */
    inArray: function( elem, array ) {
        for ( var i = 0, length = array.length; i < length; i++ ) {
            if ( array[ i ] === elem ) { return i; }
        }

        return -1;
    },

    /**
     * Returns unique elements in array
     *
     * @param {Array} array
     * @returns {Array}
     */
    unique: function( array ) {
        if (array.length && (typeof array[0] == 'object' || typeof array[0] == 'function')) {
    	    var result = [],
    	        i;

    	    for (i = 0; i < array.length; i++) { 
    	        if (!array[i][marked]) { result[result.length] = array[i]; }
    	        array[i][marked] = true;
    	    };
    	    for (i = 0; i < result.length; i++) { 
    	        delete result[i][marked] 
    	    };
    	    return result;
        	
        } else {
        
            var ret = [], 
                done = {};

            for ( var i = 0, length = array.length; i < length; i++ ) {
                var id = array[ i ];

                if ( !done[ id ] ) {
                    done[ id ] = true;
                    ret.push( array[ i ] );
                }
            }

            return ret;
        }
    },
    
    /**
     * Searches for all items matchign given criteria
     *
     * @param {Array} elems Element to search through
     * @param {function(object, number)} callback Returns true for every matched element
     * @returns {Array} matched elements
     */
    grep: function( elems, callback ) {
        var ret = [];

        for ( var i = 0, length = elems.length; i < length; i++ ) {
            if ( callback( elems[ i ], i ) ) { ret.push( elems[ i ] ); }
        }

        return ret;
    },
    
    /**
     * Maps elements passing them to callback
     * @example
     *   x = uki.map([1, 2, 3], function(item) { return -item }); 
     *
     * @param {Array} elems Elements to map
     * @param {function(object, number)} mapping function
     * @param {object} context Context in which callback should called. If not specified context will be set to
     *                         current item
     * @returns {Array} mapped values
     */
    map: function( elems, callback, context ) {
        var ret = [],
            mapper = utils.isFunction(callback) ? callback : 
                     function(e) { return utils.attr(e, callback); };

        for ( var i = 0, length = elems.length; i < length; i++ ) {
            var value = mapper.call( context || elems[ i ], elems[ i ], i );

            if ( value != null ) { ret[ ret.length ] = value; }
        }

        return ret;
    },
    
    /**
     * Reduces array
     * @example
     *   x = uki.reduce(1, [1, 2, 3], function(p, x) { return p * x}) // calculates product
     *
     * @param {object} initial Initial value
     * @param {Array} elems Elements to reduce
     * @param {function(object, number)} reduce function
     * @param {object} context Context in which callback should called. If not specified context will be set to
     *                         current item
     * @returns {object}
     */
    reduce: function( initial, elems, callback, context ) {
        for ( var i = 0, length = elems.length; i < length; i++ ) {
            initial = callback.call( context || elems[ i ], initial, elems[ i ], i );
        }
        return initial;
    },

    /**
     * Copies properties from one object to another
     * @example
     *   uki.extend(x, { width: 13, height: 14 }) // sets x.width = 13, x.height = 14
     *   options = uki.extend({}, defaultOptions, options)
     *
     * @param {object} target Object to copy properties into
     * @param {...object} sources Objects to take properties from
     * @returns Describe what it returns
     */
    extend: function() {
        var target = arguments[0] || {}, i = 1, length = arguments.length, options;

        for ( ; i < length; i++ ) {
            if ( (options = arguments[i]) != null ) {
                
                for ( var name in options ) {
                    var copy = options[ name ];

                    if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }

                }
            }
        }

        return target;      
    },
    
    /**
     * Creates a new class inherited from base classes. Init function is used as constructor
     * @example
     *   baseClass = uki.newClass({
     *      init: function() { this.x = 3 }
     *   });
     *
     *   childClass = uki.newClass(baseClass, {
     *      getSqrt: function() { return this.x*this.x }
     *   });
     *
     * @param {object=} superClass If superClass has prototype "real" protototype base inheritance is used,
     *                             otherwise superClass properties ar simply copied to newClass prototype
     * @param {Array.<object>=} mixins
     * @param {object} methods
     * @returns Describe what it returns
     */
    newClass: function(/* [[superClass], mixin1, mixin2, ..] */ methods) {
        var klass = function() {
                this.init.apply(this, arguments);
            };
            
        var inheritance, i, startFrom = 0, tmp, baseClasses = [];
            
        if (arguments.length > 1) {
            if (arguments[0].prototype) { // real inheritance
                /** @ignore */
                inheritance = function() {};
                inheritance.prototype = arguments[0].prototype;
                klass.prototype = new inheritance();
                startFrom = 1;
                baseClasses = [inheritance.prototype];
            }
        }
        for (i=startFrom; i < arguments.length; i++) {
            tmp = arguments[i];
            if (this.isFunction(tmp)) tmp = tmp.apply(tmp, baseClasses);
            baseClasses.push(tmp);
            utils.extend(klass.prototype, arguments[i]);
        };
        return klass;
    },
    
    /**
     * Creates default uki property function
     * <p>If value is given to this function it sets property to value
     * If no arguments given than function returns current property value</p>
     *
     * <p>Optional setter can be given. In this case setter will be called instead
     * of simple this[field] = value</p>
     *
     * <p>If used as setter function returns self</p>
     *   
     * @example
     *   x.width = uki.newProperty('_width');
     *   x.width(12); // x._width = 12
     *   x.width();   // return 12
     *
     * @param {string} field Field name
     * @param {function(object)=} setter
     * @returns {function(object=):object}
     */
    newProp: function(field, setter) {
        return function(value) {
            if (value === undefined) return this[field];
            if (setter) { setter.call(this, value); } else { this[field] = value; };
            return this;
        };
    },
    
    /**
     * Adds several properties (uki.newProp) to a given object.
     * <p>Field name equals to '_' + property name</p>
     *
     * @example
     *   uki.addProps(x, ['width', 'height'])
     *
     * @param {object} proto Object to add properties to
     * @param {Array.<string>} props Property names
     */
    addProps: function(proto, props) {
        utils.each(props, function() { proto[this] = utils.newProp('_' + this); });
    },
    
    toArray: function(arr) {
        return Array.prototype.slice.call(arr, 0);
    },
    
    delegateProp: function(proto, name, target) {
        var propName = '_' + name;
        proto[name] = function(value) {
            if (value === undefined) {
                if (this[target]) return utils.attr(this[target], name, value);
                return this[propName];
            }
            if (this[target]) {
                utils.attr(this[target], name, value);
            } else {
                this[propName] = value;
            }
            return this;
        };
    }
};

utils.extend(uki, utils);