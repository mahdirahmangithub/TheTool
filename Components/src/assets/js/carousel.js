(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else root.carousel = factory();
})(typeof self !== "undefined" ? self : this, function() {
  return function(selector, opts) {
    if (!selector)
      throw Error(
        "You have to pass 'selector' as an argument to the function!"
      );

    // Private Fields and Methods
    var _parentElement =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector instanceof HTMLElement
        ? selector
        : selector instanceof jQuery
        ? selector[0]
        : null;

    if (!_parentElement) return;

    var _frameElement = _parentElement.querySelector(".carousel__frame"),
      _images = _frameElement.querySelectorAll(".carousel__image"),
      _indicatorsContainer = _parentElement.querySelector(
        ".carousel__indicators__container"
      ),
      _indicators = _indicatorsContainer.querySelectorAll(
        ".carousel__indicators__indicator"
      ),
      _fillIndicator = _indicatorsContainer.querySelector(
        ".carousel__indicators__fill"
      );

    var IMAGE_WIDTH = -1,
      IMAGE_HEIGHT = -1;

    var _utils = {
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
        // WARNING: Don't remove 'prettier-ignore' comment!
        // prettier-ignore
        var regx = new RegExp('(?:^|\s*)' + cName );
        element.className = element.className.replace(regx, "");
      },
      hasClass: function(element, cName) {
        return element.className.indexOf(cName) > -1;
      },
      attachEvent: function(element, event, callback, opt) {
        if (element.addEventListener)
          element.addEventListener(event, callback, opt);
        else if (element.attachEvent)
          element.attachEvent("on" + event, callback);
        else element["on" + event] = callback;
      },
      detachEvent: function(element, event, callback, opt) {
        if (element.removeEventListener)
          element.removeEventListener(event, callback, opt);
        else if (element.detachEvent)
          element.detachEvent("on" + event, callback);
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
      }
    };

    var _state = { index: 0, activeIndicator: null, dx: 0 };
    var _settings = _utils.extend({ isLoopable: false }, opts, true);

    function _computeImageDimensions() {
      var image = _frameElement.querySelector(".carousel__image");

      return {
        width: parseInt(
          _utils.getComputedCssValue(image, "width").replace("px", "")
        ),
        height: parseInt(
          _utils.getComputedCssValue(image, "height").replace("px", "")
        )
      };
    }

    function _translateFrame(deltaIndex) {
      var tVal = deltaIndex * IMAGE_WIDTH;
      var direction = deltaIndex > 0 ? "left" : "right";

      if (direction === "left") {
        if (_utils.hasClass(_fillIndicator, "right"))
          _utils.removeClass(_fillIndicator, "right");
        _utils.addClass(_fillIndicator, "left");
      } else {
        if (_utils.hasClass(_fillIndicator, "left"))
          _utils.removeClass(_fillIndicator, "left");
        _utils.addClass(_fillIndicator, "right");
      }

      _utils.setCssValue(
        _frameElement,
        "transform",
        "translateX(" + (_state.dx + tVal) + "px)"
      );

      _updateFillPosition();
      _state.dx += tVal;
    }

    function _indicatorClickHandler(evt) {
      var e = evt || window.event;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      var currentTarget = e.currentTarget;
      var targetIndex = currentTarget.getAttribute("data-index");

      var prevIndex = _state.index;
      _state.index = targetIndex;

      if (!_utils.hasClass(currentTarget, "active")) {
        _utils.removeClass(_state.activeIndicator, "active");
        _utils.addClass(currentTarget, "active");
        _state.activeIndicator = currentTarget;
      }

      _translateFrame(prevIndex - targetIndex);
    }

    function _updateFillPosition() {
      _utils.setCssValue(
        _fillIndicator,
        "left",
        _state.activeIndicator.getAttribute("data-left") + "px"
      );

      _utils.setCssValue(
        _fillIndicator,
        "right",
        _state.activeIndicator.getAttribute("data-right") + "px"
      );
    }

    // Initialization
    (function() {
      var computedImageDimensions = _computeImageDimensions();

      IMAGE_WIDTH = computedImageDimensions.width;
      IMAGE_HEIGHT = computedImageDimensions.height;

      _utils.setCssValue(
        _frameElement,
        "width",
        _images.length * IMAGE_WIDTH + "px"
      );

      _indicators.forEach(function(indicator) {
        var indicatorBRect = indicator.getBoundingClientRect();
        var indicatorCountainerBRect = _indicatorsContainer.getBoundingClientRect();

        indicator.setAttribute(
          "data-left",
          indicatorBRect.left - indicatorCountainerBRect.left + 8
        );
        indicator.setAttribute(
          "data-right",
          indicatorCountainerBRect.right - indicatorBRect.right + 8
        );

        if (_utils.hasClass(indicator, "active")) {
          _state.activeIndicator = indicator;
        }

        _utils.attachEvent(indicator, "click", _indicatorClickHandler);
      });

      _updateFillPosition();
    })();

    // Public Fields and Methods
    return {};
  };
});
