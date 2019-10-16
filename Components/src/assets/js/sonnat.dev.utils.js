(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else root._ = factory();
})(typeof self !== "undefined" ? self : this, function() {
  return {
    dispatchEvent: function(element, eventName) {
      if ("createEvent" in document) {
        var event = document.createEvent("HTMLEvents");

        event.initEvent(eventName, false, true);
        element.dispatchEvent(event);
      } else element.fireEvent("on" + eventName);
    },
    extend: function() {
      var extended = {};
      var deep = false;
      var i = 0;
      var argsLength = arguments.length;

      // Check if a deep merge
      if (typeof arguments[argsLength - 1] === "boolean") {
        deep = arguments[argsLength - 1];
        argsLength--;
      }

      // Merge the object into the extended object
      var merge = function(o) {
        for (var p in o) {
          if (Object.prototype.hasOwnProperty.call(o, p)) {
            if (deep && typeof o[p] === "object")
              extended[p] = _extend(extended[p], o[p], true);
            else extended[p] = o[p];
          }
        }
      };

      // Loop through each object and conduct a merge
      while (i < argsLength) merge(arguments[i++]);

      return extended;
    },
    map: function(n, a, b, c, d, withinBounds) {
      var mappedVal = ((n - a) * (d - c)) / (b - a) + c;
      if (!withinBounds) return mappedVal;
      else if (d > c) return this.constrain(mappedVal, c, d);
      else return this.constrain(mappedVal, d, c);
    },
    constrain: function(x, a, b) {
      return Math.max(Math.min(x, b), a);
    },
    closest: function(element, selectors) {
      if (Element.prototype.closest) return element.closest(selectors);
      else {
        // Polyfill for IE9+
        if (!Element.prototype.matches) {
          Element.prototype.matches =
            Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;
        }
        Element.prototype.closest = function(s) {
          var el = this;

          do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
          } while (el !== null && el.nodeType === 1);
          return null;
        };
      }
    },
    addClass: function(element, cName) {
      var _className = element.className;

      if (_className.indexOf(cName) > -1) return;

      _className = _className.trim();
      _className += " " + cName;
      element.className = _className;
    },
    removeClass: function(element, cName) {
      var regx = new RegExp("(?:^|\\s*)" + cName);
      element.className = element.className.replace(regx, "");
    },
    hasClass: function(element, cName) {
      return element.className.indexOf(cName) > -1;
    },
    attachEvent: function(element, event, callback, opt) {
      if (element.addEventListener)
        element.addEventListener(event, callback, opt);
      else if (element.attachEvent) element.attachEvent("on" + event, callback);
      else element["on" + event] = callback;
    },
    attachEventAll: function(elements, event, callback, opt) {
      var context = this;

      elements.forEach(function(element) {
        context.attachEvent(element, event, callback, opt);
      });
    },
    detachEventAll: function(elements, event, callback, opt) {
      var context = this;

      elements.forEach(function(element) {
        this.detachEvent(element, event, callback, opt);
      });
    },
    detachEvent: function(element, event, callback, opt) {
      if (element.removeEventListener)
        element.removeEventListener(event, callback, opt);
      else if (element.detachEvent) element.detachEvent("on" + event, callback);
      else delete element["on" + event];
    },
    isArray: function(object) {
      if (!Array.isArray) {
        Array.isArray = function(object) {
          return Object.prototype.toString.call(object) === "[object Array]";
        };
      }

      return Array.isArray(object);
    },
    removeChilds: function(parent) {
      if (parent.childNodes && parent.childNodes.length) {
        var child = parent.firstChild;

        while (child) {
          parent.removeChild(child);
          child = parent.firstChild;
        }
      }
    },
    getCssValue: function(element, property) {
      return element.style[property];
    },
    setCssValue: function(element, property, value) {
      element.style[property] = value;
    },
    getComputedCssValue: function(element, property) {
      return getComputedStyle(element)[property];
    },
    convertRemToPixels: function(rem) {
      return (
        rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
      );
    },
    memoize: function(fn) {
      var cache = {};

      function cacher(fn) {
        return function() {
          var key = JSON.stringify(arguments);

          if (cache[key]) return cache[key];
          else {
            var value = fn.apply(null, arguments);
            cache[key] = value;
            return value;
          }
        };
      }

      return cacher(fn);
    }
  };
});
