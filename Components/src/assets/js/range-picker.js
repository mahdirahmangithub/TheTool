(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else root.rangePicker = factory();
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

    var _settings = {
      infimum: _parentElement.classList.contains("has-infimum")
    };

    var _intervalElement = _parentElement.querySelector(
        ".range-picker__interval"
      ),
      _supHandleElement = _intervalElement.querySelector(
        ".range-picker__sup-handle"
      ),
      _trackElement = _intervalElement.querySelector(".range-picker__track"),
      _stepsContainer = _parentElement.querySelector(".range-picker__steps"),
      _inputElement = _parentElement.querySelector(".range-picker__input"),
      _infHandleElement = _intervalElement.querySelector(
        ".range-picker__inf-handle"
      );

    var _inputMin = parseInt(
      _settings.infimum
        ? _parentElement.getAttribute("data-min")
        : _inputElement.getAttribute("min")
    );
    var _inputMax = parseInt(
      _settings.infimum
        ? _parentElement.getAttribute("data-max")
        : _inputElement.getAttribute("max")
    );
    var _stepValue = parseInt(
      _settings.infimum
        ? _parentElement.getAttribute("data-step")
        : _inputElement.getAttribute("step")
    );

    var LAST_POSITION_X = 0;
    var TIME_OUT = -1;

    var _state = {
      value: _settings.infimum
        ? 0
        : _inputElement.value
        ? parseInt(_inputElement.value)
        : parseInt(_parentElement.getAttribute("data-value")),
      bound: {
        infimum: !_settings.infimum
          ? _inputMin
          : _parentElement.getAttribute("data-infimum")
          ? parseInt(_parentElement.getAttribute("data-infimum"))
          : 0,
        supremum: !_settings.infimum
          ? _inputMax
          : _parentElement.getAttribute("data-supremum")
          ? parseInt(_parentElement.getAttribute("data-supremum"))
          : 0
      },
      step: {
        currentStep: 1,
        stepValue: _stepValue ? _stepValue : 0,
        numberOfSteps: parseInt(
          _stepValue ? (_inputMax - _inputMin) / _stepValue + 1 : 0
        )
      },
      drag: {
        sup: { active: false, currentX: 0, initialX: 0, offsetX: 0 },
        inf: { active: false, currentX: 0, initialX: 0, offsetX: 0 },
        currentHandle: "sup"
      }
    };

    var PIXEL_PER_STEP =
      _parentElement.offsetWidth / (_state.step.numberOfSteps - 1);

    function isPassiveSupported() {
      var passiveSupported = false,
        fn = function() {};

      try {
        var opt = Object.defineProperty({}, "passive", {
          get: function() {
            passiveSupported = true;
          }
        });
        window.addEventListener("test", fn, opt);
        window.removeEventListener("test", fn, opt);
      } catch (e) {}

      return passiveSupported;
    }

    function _preventDefault(evt) {
      try {
        var e = evt || window.event;
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
      } catch (error) {}
    }

    function _disableScroll() {
      // window
      _addEventListener(
        this,
        "DOMMouseScroll",
        _preventDefault,
        isPassiveSupported() ? { passive: false } : false
      );
      // document
      _addEventListener(
        this,
        "wheel",
        _preventDefault,
        isPassiveSupported() ? { passive: false } : false
      );
      // window
      _addEventListener(
        this,
        "wheel",
        _preventDefault,
        isPassiveSupported() ? { passive: false } : false
      );
      // window
      _addEventListener(
        this,
        "touchmove",
        _preventDefault,
        isPassiveSupported() ? { passive: false } : false
      );
    }

    function _enableScroll() {
      // window
      _removeEventListener(
        this,
        "DOMMouseScroll",
        _preventDefault,
        isPassiveSupported() ? { passive: false } : false
      );
      // document
      _removeEventListener(
        this,
        "wheel",
        _preventDefault,
        isPassiveSupported() ? { passive: false } : false
      );
      // window
      _removeEventListener(
        this,
        "wheel",
        _preventDefault,
        isPassiveSupported() ? { passive: false } : false
      );
      // window
      _removeEventListener(
        this,
        "touchmove",
        _preventDefault,
        isPassiveSupported() ? { passive: false } : false
      );
    }

    function _getMouseDirection(evt) {
      var _direction = "";

      var deltaX = LAST_POSITION_X - evt.clientX;

      if (deltaX > 0) {
        _direction = "left";
      } else {
        _direction = "right";
      }

      LAST_POSITION_X = evt.clientX;

      return _direction;
    }

    function _addEventListener(target, event, fn, opt) {
      if (target.addEventListener) target.addEventListener(event, fn, opt);
      else if (target.attachEvent) target.attachEvent("on" + event, fn);
      else target["on" + event] = fn;
    }

    function _removeEventListener(target, event, fn, opt) {
      if (target.removeEventListener)
        target.removeEventListener(event, fn, opt);
      else if (target.detachEvent) target.detachEvent("on" + event, fn);
      else delete target["on" + event];
    }

    function _createSteps() {
      var _fragment = document.createDocumentFragment();

      for (var i = 0; i < _state.step.numberOfSteps; i++) {
        var _div = document.createElement("div");
        _div.classList.add("range-picker__step");
        _div.style.right = PIXEL_PER_STEP * i + "px";

        _fragment.appendChild(_div);
      }

      _stepsContainer.appendChild(_fragment);
    }

    function _getSteps() {
      var _steps = [];

      _stepsContainer.childNodes.forEach(function(child) {
        if (child.nodeType === Node.ELEMENT_NODE) _steps.push(child);
      });

      return _steps;
    }

    function _getPreviousStep() {
      var stepIndex = _state.step.currentStep - 1;

      if (stepIndex < 0) return null;
      return _getSteps()[stepIndex];
    }

    function _getCurrentStep() {
      return _getSteps()[_state.step.currentStep];
    }

    function _getNextStep() {
      var stepIndex = _state.step.currentStep + 1;

      if (stepIndex > _state.step.numberOfSteps) return null;
      return _getSteps()[stepIndex];
    }

    function _getStep(number) {
      return _getSteps()[number];
    }

    function _map(n, a, b, c, d, withinBounds) {
      var mappedVal = ((n - a) * (d - c)) / (b - a) + c;
      if (!withinBounds) return mappedVal;
      else if (d > c) return _constrain(mappedVal, c, d);
      else return _constrain(mappedVal, d, c);
    }

    function _constrain(x, a, b) {
      return Math.max(Math.min(x, b), a);
    }

    function _updateStyle(element, property, value) {
      element.style[property] = value;
    }

    function _move(movingProperty, distance, handle) {
      var _handle = handle || _getCurrentHandleElement();

      _updateStyle(_handle, movingProperty, "".concat(distance).concat("px"));
      _updateStyle(
        _trackElement,
        movingProperty,
        "".concat(distance).concat("px")
      );
    }

    function _getCurrentHandleElement() {
      return _state.drag.currentHandle === "sup"
        ? _supHandleElement
        : _infHandleElement;
    }

    function _getOtherHandleElement() {
      return _state.drag.currentHandle === "sup"
        ? _infHandleElement
        : _supHandleElement;
    }

    function _getClosestHandleElementTo(x) {
      if (_settings.infimum) {
        var LIMIT = _parentElement.offsetWidth;

        var supFromRight = _getLengthCSSValue(_supHandleElement, "right");
        var infFromRight =
          LIMIT - _getLengthCSSValue(_infHandleElement, "left");

        var deltaSup = Math.abs(supFromRight - x);
        var deltaInf = Math.abs(infFromRight - x);

        return deltaSup > deltaInf
          ? {
              handle: _infHandleElement,
              positionProperty: "left",
              name: "inf"
            }
          : deltaSup < deltaInf
          ? {
              handle: _supHandleElement,
              positionProperty: "right",
              name: "sup"
            }
          : {
              handle: _getCurrentHandleElement(),
              positionProperty:
                _state.drag.currentHandle === "sup" ? "right" : "left",
              name: _state.drag.currentHandle
            };
      } else
        return {
          handle: _supHandleElement,
          positionProperty: "right",
          name: "sup"
        };
    }

    function _getLengthCSSValue(el, lengthProperty) {
      return parseInt(
        window.getComputedStyle(el)[lengthProperty].replace("px", "")
      );
    }

    function _updateElementValue() {
      if (!_settings.infimum) {
        _parentElement.setAttribute("data-value", _state.value);
        _inputElement.value = _state.value;
      } else {
        _parentElement.setAttribute("data-infimum", _state.bound.infimum);
        _parentElement.setAttribute("data-supremum", _state.bound.supremum);
      }
    }

    function _isPathAvailable(origin, destination, terminator) {
      while (origin !== destination) {
        if (origin === terminator) return false;
        origin = origin.parentNode;
      }

      return true;
    }

    function _dragStart(evt) {
      var e = evt || window.event;

      var DRAG = _state.drag;

      e.currentTarget.classList.value.indexOf("sup") >= 0
        ? (DRAG.currentHandle = "sup")
        : (DRAG.currentHandle = "inf");

      var clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
      var currentHandle = DRAG.currentHandle;

      _addEventListener(
        document,
        "touchmove",
        _drag,
        isPassiveSupported() ? { passive: false } : false
      );
      _addEventListener(
        document,
        "mousemove",
        _drag,
        isPassiveSupported() ? { passive: false } : false
      );

      DRAG[currentHandle].initialX = clientX - DRAG[currentHandle].offsetX;

      DRAG[currentHandle].active = true;
      _parentElement.classList.remove("jumping");
      _getCurrentHandleElement().classList.add("active");
      _getCurrentHandleElement().style.zIndex = 2;
      if (_getOtherHandleElement()) _getOtherHandleElement().style.zIndex = 1;
    }

    function _dragEnd() {
      var DRAG = _state.drag;
      var currentHandle = DRAG.currentHandle;

      _removeEventListener(
        document,
        "touchmove",
        _drag,
        isPassiveSupported() ? { passive: false } : false
      );
      _removeEventListener(
        document,
        "mousemove",
        _drag,
        isPassiveSupported() ? { passive: false } : false
      );

      DRAG[currentHandle].initialX = DRAG[currentHandle].currentX;

      DRAG[currentHandle].active = false;
      _getCurrentHandleElement().classList.remove("active");
    }

    function _jump(evt) {
      var e = evt || window.event;
      var clientX = e.clientX;

      var LIMIT = _parentElement.offsetWidth;

      var DRAG = _state.drag;
      var BOUND = _state.bound;

      if (!DRAG[_state.drag.currentHandle].active) {
        if (
          !_isPathAvailable(
            e.target,
            _getCurrentHandleElement(),
            _parentElement
          )
        ) {
          if (e.preventDefault) e.preventDefault();
          else e.returnValue = false;

          var _currentX = _map(
            clientX - _parentElement.offsetLeft,
            0,
            LIMIT,
            LIMIT,
            0,
            true
          );

          var _closest = _getClosestHandleElementTo(_currentX);
          var _otherHandlePosition =
            _closest.name === "sup"
              ? _settings.infimum
                ? _getLengthCSSValue(_infHandleElement, "left")
                : 0
              : _getLengthCSSValue(_supHandleElement, "right");

          var _relationalCurrentX =
            _closest.name === "sup" ? _currentX : LIMIT - _currentX;
          var _constrainedRelationalCurrentX = _constrain(
            _relationalCurrentX,
            0,
            LIMIT - _otherHandlePosition
          );

          window.clearTimeout(TIME_OUT);
          _parentElement.classList.add("jumping");
          TIME_OUT = window.setTimeout(function() {
            _parentElement.classList.remove("jumping");
          }, 400);

          if (_state.step.numberOfSteps) {
            var stepNumber = Math.round(
              _map(
                _constrainedRelationalCurrentX / _state.step.stepValue,
                0,
                LIMIT / _state.step.stepValue,
                1,
                _state.step.numberOfSteps
              )
            );

            stepNumber =
              _closest.name === "sup"
                ? stepNumber
                : _constrain(
                    _state.step.numberOfSteps - stepNumber + 1,
                    1,
                    _state.step.numberOfSteps
                  );

            var stepPosition = _getLengthCSSValue(
              _getStep(stepNumber - 1),
              "right"
            );
            stepPosition =
              _closest.name === "sup" ? stepPosition : LIMIT - stepPosition;

            DRAG[_closest.name].currentX =
              (_closest.name === "sup" ? -1 : 1) * stepPosition;
            DRAG[_closest.name].offsetX = DRAG[_closest.name].currentX;
            _move(
              _closest.positionProperty,
              Math.abs(stepPosition),
              _closest.handle
            );
          } else {
            DRAG[_closest.name].currentX =
              (_closest.name === "sup" ? -1 : 1) *
              _constrainedRelationalCurrentX;
            DRAG[_closest.name].offsetX = DRAG[_closest.name].currentX;
            _move(
              _closest.positionProperty,
              _constrainedRelationalCurrentX,
              _closest.handle
            );
          }

          if (_settings.infimum) {
            BOUND.supremum = _map(
              _getLengthCSSValue(_trackElement, "right"),
              LIMIT,
              0,
              _inputMin,
              _inputMax
            );

            BOUND.infimum = _map(
              _getLengthCSSValue(_trackElement, "left"),
              0,
              LIMIT,
              _inputMin,
              _inputMax
            );
          } else {
            _state.value = _map(
              _trackElement.offsetWidth,
              0,
              LIMIT,
              _inputMin,
              _inputMax
            );
          }

          _updateElementValue();
        }
      }
    }

    function _drag(evt) {
      var e = evt || window.event;
      var clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      var currentHandle = _state.drag.currentHandle;
      var otherHandle = currentHandle === "sup" ? "inf" : "sup";
      var _CSSCurrentTransitionProperty =
        currentHandle === "sup" ? "right" : "left";
      var _CSSOtherTransitionProperty =
        currentHandle === "sup" ? "left" : "right";

      var LIMIT = _parentElement.offsetWidth;

      var DRAG = _state.drag;
      var BOUND = _state.bound;

      if (DRAG[currentHandle].active) {
        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;

        var _currentX = clientX - DRAG[currentHandle].initialX;
        var _constrainedCurrentX =
          currentHandle === "sup"
            ? _constrain(_currentX, -LIMIT, 0)
            : _constrain(_currentX, 0, LIMIT);

        var _otherHandlePosition = _getOtherHandleElement()
          ? _getLengthCSSValue(
              _getOtherHandleElement(),
              _CSSOtherTransitionProperty
            )
          : 0;

        var _doubleConstrainedCurrentX =
          currentHandle === "sup"
            ? _constrain(_constrainedCurrentX, _otherHandlePosition - LIMIT, 0)
            : _constrain(_constrainedCurrentX, 0, LIMIT - _otherHandlePosition);

        if (_state.step.numberOfSteps) {
          var stepNumber = Math.round(
            _map(
              Math.abs(_doubleConstrainedCurrentX / _state.step.stepValue),
              0,
              LIMIT / _state.step.stepValue,
              1,
              _state.step.numberOfSteps
            )
          );

          stepNumber =
            currentHandle === "sup"
              ? stepNumber
              : _constrain(
                  _state.step.numberOfSteps - stepNumber + 1,
                  1,
                  _state.step.numberOfSteps
                );

          var stepPosition = _getLengthCSSValue(
            _getStep(stepNumber - 1),
            "right"
          );
          stepPosition =
            currentHandle === "sup" ? stepPosition : LIMIT - stepPosition;

          DRAG[currentHandle].currentX =
            (currentHandle === "sup" ? -1 : 1) * stepPosition;
          DRAG[currentHandle].offsetX = DRAG[currentHandle].currentX;
          _move(_CSSCurrentTransitionProperty, Math.abs(stepPosition));
        } else {
          DRAG[currentHandle].currentX = _doubleConstrainedCurrentX;
          DRAG[currentHandle].offsetX = DRAG[currentHandle].currentX;
          _move(
            _CSSCurrentTransitionProperty,
            Math.abs(_doubleConstrainedCurrentX)
          );
        }

        if (_settings.infimum) {
          BOUND.supremum = _map(
            _getLengthCSSValue(_trackElement, "right"),
            LIMIT,
            0,
            _inputMin,
            _inputMax
          );

          BOUND.infimum = _map(
            _getLengthCSSValue(_trackElement, "left"),
            0,
            LIMIT,
            _inputMin,
            _inputMax
          );
        } else {
          _state.value = _map(
            _trackElement.offsetWidth,
            0,
            LIMIT,
            _inputMin,
            _inputMax
          );
        }

        _updateElementValue();
      }
    }

    if (_state.step.numberOfSteps) _createSteps();

    // Preventing page scroll on drag
    _addEventListener(_parentElement, "mousedown", _disableScroll);
    _addEventListener(_parentElement, "touchstart", _disableScroll);
    _addEventListener(_parentElement, "mousemove", _disableScroll);
    _addEventListener(_parentElement, "touchmove", _disableScroll);
    _addEventListener(_parentElement, "mouseup", _enableScroll);
    _addEventListener(_parentElement, "touchend", _enableScroll);

    _addEventListener(_parentElement, "click", _jump);

    _addEventListener(
      _supHandleElement,
      "touchstart",
      _dragStart,
      isPassiveSupported() ? { passive: false } : false
    );
    _addEventListener(
      _supHandleElement,
      "mousedown",
      _dragStart,
      isPassiveSupported() ? { passive: false } : false
    );

    if (_settings.infimum) {
      _addEventListener(
        _infHandleElement,
        "touchstart",
        _dragStart,
        isPassiveSupported() ? { passive: false } : false
      );
      _addEventListener(
        _infHandleElement,
        "mousedown",
        _dragStart,
        isPassiveSupported() ? { passive: false } : false
      );
    }

    _addEventListener(document, "touchend", _dragEnd),
      isPassiveSupported() ? { passive: false } : false;
    _addEventListener(
      document,
      "mouseup",
      _dragEnd,
      isPassiveSupported() ? { passive: false } : false
    );

    if (!_settings.infimum) {
      var DRAG = _state.drag;
      var LIMIT = _parentElement.offsetWidth;

      if (_state.step.numberOfSteps) {
        var constrainedInitValue = _constrain(
          _state.value,
          _inputMin,
          _inputMax
        );
        var stepNumber = Math.round(
          _map(
            constrainedInitValue / _state.step.stepValue,
            0,
            _inputMax / _state.step.stepValue,
            1,
            _state.step.numberOfSteps
          )
        );
        stepNumber = _constrain(
          _state.step.numberOfSteps - stepNumber + 1,
          1,
          _state.step.numberOfSteps
        );

        var stepPosition = _getLengthCSSValue(
          _getStep(stepNumber - 1),
          "right"
        );

        DRAG["sup"].currentX = -1 * stepPosition;
        DRAG["sup"].offsetX = DRAG["sup"].currentX;
        _move("right", Math.abs(stepPosition));
      }
    }

    // Public Fields and Methods
    return {};
  };
});
