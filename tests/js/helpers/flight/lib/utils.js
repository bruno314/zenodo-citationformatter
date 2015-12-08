/* Copyright 2013 Twitter, Inc. Licensed under The MIT License. http://opensource.org/licenses/MIT */

define(

  ['./debug'],

  function(debug) {
    'use strict';

    var DEFAULT_INTERVAL = 100;

    function canWriteProtect() {
      var writeProtectSupported = debug.enabled && !Object.propertyIsEnumerable('getOwnPropertyDescriptor');
      if (writeProtectSupported) {
        //IE8 getOwnPropertyDescriptor is built-in but throws exeption on non DOM objects
        try {
          Object.getOwnPropertyDescriptor(Object, 'keys');
        } catch (e) {
         return false;
        }
      }

      return writeProtectSupported;
    }

    function ToObject(val) {
      if (val == null) {
        throw new TypeError('Object.assign cannot be called with null or undefined');
      }

      return Object(val);
    }

    Object.assign = Object.assign || function (target /*, sources...*/) {
      var from;
      var keys;
      var to = ToObject(target);

      for (var s = 1; s < arguments.length; s++) {
        from = arguments[s];
        keys = Object.keys(Object(from));

        for (var i = 0; i < keys.length; i++) {
          to[keys[i]] = from[keys[i]];
        }
      }

      return to;
    };

    var utils = {

      isDomObj: function(obj) {
        return !!(obj.nodeType || (obj === window));
      },

      toArray: function(obj, from) {
        from = from || 0;
        var len = obj.length, arr = new Array(len - from);
        for (var i = from; i < len; i++) {
          arr[i - from] = obj[i];
        }
        return arr;
      },

      // returns new object representing multiple objects merged together
      // optional final argument is boolean which specifies if merge is recursive
      // original objects are unmodified
      //
      // usage:
      //   var base = {a:2, b:6};
      //   var extra = {b:3, c:4};
      //   merge(base, extra); //{a:2, b:3, c:4}
      //   base; //{a:2, b:6}
      //
      //   var base = {a:2, b:6};
      //   var extra = {b:3, c:4};
      //   var extraExtra = {a:4, d:9};
      //   merge(base, extra, extraExtra); //{a:4, b:3, c:4. d: 9}
      //   base; //{a:2, b:6}
      //
      //   var base = {a:2, b:{bb:4, cc:5}};
      //   var extra = {a:4, b:{cc:7, dd:1}};
      //   merge(base, extra, true); //{a:4, b:{bb:4, cc:7, dd:1}}
      //   base; //{a:2, b:{bb:4, cc:5}};

      merge: function merge(/*obj1, obj2,....deepCopy*/) {
        var len = arguments.length;

        if (len === 0) {
          return {};
        }

        var args = [].slice.call(arguments);

        var deep = false;
        if (args[args.length - 1] === true) {
          args.pop();
          deep = true;
        }

        return args.reduce(function (target, source) {
          return Object.keys(source || {}).reduce(function (target, k) {
            if (typeof source[k] === 'object' && deep) {
              target[k] = merge(target[k] || {}, source[k]);
            } else {
              target[k] = source[k];
            }
            return target;
          }, target)
        }, {});
      },

      // updates base in place by copying properties of extra to it
      // optionally clobber protected
      // usage:
      //   var base = {a:2, b:6};
      //   var extra = {c:4};
      //   push(base, extra); //{a:2, b:6, c:4}
      //   base; //{a:2, b:6, c:4}
      //
      //   var base = {a:2, b:6};
      //   var extra = {b: 4 c:4};
      //   push(base, extra, true); //Error ("utils.push attempted to overwrite 'b' while running in protected mode")
      //   base; //{a:2, b:6}
      //
      // objects with the same key will merge recursively when protect is false
      // eg:
      // var base = {a:16, b:{bb:4, cc:10}};
      // var extra = {b:{cc:25, dd:19}, c:5};
      // push(base, extra); //{a:16, {bb:4, cc:25, dd:19}, c:5}
      //
      push: function(base, extra, protect) {
        if (base) {
          Object.keys(extra || {}).forEach(function(key) {
            if (base[key] && protect) {
              throw new Error('utils.push attempted to overwrite "' + key + '" while running in protected mode');
            }

            if (typeof base[key] == 'object' && typeof extra[key] == 'object') {
              // recurse
              this.push(base[key], extra[key]);
            } else {
              // no protect, so extra wins
              base[key] = extra[key];
            }
          }, this);
        }

        return base;
      },

      // If obj.key points to an enumerable property, return its value
      // If obj.key points to a non-enumerable property, return undefined
      getEnumerableProperty: function(obj, key) {
        return obj.propertyIsEnumerable(key) ? obj[key] : undefined;
      },

      // build a function from other function(s)
      // utils.compose(a,b,c) -> a(b(c()));
      // implementation lifted from underscore.js (c) 2009-2012 Jeremy Ashkenas
      compose: function() {
        var funcs = arguments;

        return function() {
          var args = arguments;

          for (var i = funcs.length - 1; i >= 0; i--) {
            args = [funcs[i].apply(this, args)];
          }

          return args[0];
        };
      },

      // Can only unique arrays of homogeneous primitives, e.g. an array of only strings, an array of only booleans, or an array of only numerics
      uniqueArray: function(array) {
        var u = {}, a = [];

        for (var i = 0, l = array.length; i < l; ++i) {
          if (u.hasOwnProperty(array[i])) {
            continue;
          }

          a.push(array[i]);
          u[array[i]] = 1;
        }

        return a;
      },

      debounce: function(func, wait, immediate) {
        if (typeof wait != 'number') {
          wait = DEFAULT_INTERVAL;
        }

        var timeout, result;

        return function() {
          var context = this, args = arguments;
          var later = function() {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;

          timeout && clearTimeout(timeout);
          timeout = setTimeout(later, wait);

          if (callNow) {
            result = func.apply(context, args);
          }

          return result;
        };
      },

      throttle: function(func, wait) {
        if (typeof wait != 'number') {
          wait = DEFAULT_INTERVAL;
        }

        var context, args, timeout, throttling, more, result;
        var whenDone = this.debounce(function() {
          more = throttling = false;
        }, wait);

        return function() {
          context = this; args = arguments;
          var later = function() {
            timeout = null;
            if (more) {
              result = func.apply(context, args);
            }
            whenDone();
          };

          if (!timeout) {
            timeout = setTimeout(later, wait);
          }

          if (throttling) {
            more = true;
          } else {
            throttling = true;
            result = func.apply(context, args);
          }

          whenDone();
          return result;
        };
      },

      countThen: function(num, base) {
        return function() {
          if (!--num) { return base.apply(this, arguments); }
        };
      },

      // Delegate event handling to a parent element using rules object
      //
      // Arguments:
      //   contextElement is the element that the events will reach
      //   rules is an object with selector keys and callback function values
      //   dom is the DOM library adapter to use
      delegate: function(contextElement, rules, dom) {
        return function(event, data) {
          // Where was the event actually fired?
          var target = event.target;

          Object.keys(rules).forEach(function(selector) {
            // Is the target within an element that matches the selector, up to the contextElement.
            // TODO: How slow is this?
            var parent = dom.closest(contextElement, target, selector);
            if (!event.isPropagationStopped() && parent) {
              data = data || {};
              event.currentTarget = (data.el = parent);
              return rules[selector].apply(this, [event, data]);
            }
          }, this);
        };
      },

      // ensures that a function will only be called once.
      // usage:
      // will only create the application once
      //   var initialize = utils.once(createApplication)
      //     initialize();
      //     initialize();
      //
      // will call the inner function once
      //   this.on('click', utils.once(function () {
      //     // ...
      //   }));
      //
      once: function(func) {
        var ran, result;

        return function() {
          if (ran) {
            return result;
          }

          ran = true;
          result = func.apply(this, arguments);

          return result;
        };
      },

      propertyWritability: function(obj, prop, writable) {
        if (canWriteProtect() && obj.hasOwnProperty(prop)) {
          Object.defineProperty(obj, prop, { writable: writable });
        }
      },

      // Property locking/unlocking
      mutateProperty: function(obj, prop, op) {
        if (!canWriteProtect() || !obj.hasOwnProperty(prop)) {
          op.call(obj);
          return;
        }

        var writable = Object.getOwnPropertyDescriptor(obj, prop).writable;

        Object.defineProperty(obj, prop, { writable: true });
        op.call(obj);
        Object.defineProperty(obj, prop, { writable: writable });
      }

    };

    return utils;
  }
);
