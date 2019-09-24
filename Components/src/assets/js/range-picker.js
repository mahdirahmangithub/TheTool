function RangePicker(selector, options) {
  var _this = this;

  this.parent =
    typeof selector === "string"
      ? document.querySelector(selector)
      : selector instanceof HTMLElement
      ? selector
      : selector instanceof jQuery
      ? selector[0]
      : null;

  if (!this.parent) return;

  var SETTINGS = { infimum: this.parent.classList.contains("has-infimum") };

  this.interval = this.parent.querySelector(".range-picker__interval");
  this.supHandle = this.interval.querySelector(".range-picker__sup-handle");
  this.track = this.interval.querySelector(".range-picker__track");
  this.stepsContainer = this.parent.querySelector(".range-picker__steps");
  this.input = this.parent.querySelector(".range-picker__input");
  this.infHandle = this.interval.querySelector(".range-picker__inf-handle");

  var _inputMin = parseInt(
    SETTINGS.infimum
      ? this.parent.getAttribute("data-min")
      : this.input.getAttribute("min")
  );
  var _inputMax = parseInt(
    SETTINGS.infimum
      ? this.parent.getAttribute("data-max")
      : this.input.getAttribute("max")
  );
  var _stepValue = parseInt(
    SETTINGS.infimum
      ? this.parent.getAttribute("data-step")
      : this.input.getAttribute("step")
  );

  var LAST_POSITION_X = 0;
  var TIME_OUT = -1;

  this.state = {
    value: SETTINGS.infimum
      ? 0
      : this.input.value
      ? parseInt(this.input.value)
      : parseInt(this.parent.getAttribute("data-value")),
    bound: {
      infimum: !SETTINGS.infimum
        ? _inputMin
        : this.parent.getAttribute("data-infimum")
        ? parseInt(this.parent.getAttribute("data-infimum"))
        : 0,
      supremum: !SETTINGS.infimum
        ? _inputMax
        : this.parent.getAttribute("data-supremum")
        ? parseInt(this.parent.getAttribute("data-supremum"))
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
    this.parent.offsetWidth / (this.state.step.numberOfSteps - 1);

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
    if (target.removeEventListener) target.removeEventListener(event, fn, opt);
    else if (target.detachEvent) target.detachEvent("on" + event, fn);
    else delete target["on" + event];
  }

  function _createSteps() {
    var _fragment = document.createDocumentFragment();

    for (var i = 0; i < _this.state.step.numberOfSteps; i++) {
      var _div = document.createElement("div");
      _div.classList.add("range-picker__step");
      _div.style.right = PIXEL_PER_STEP * i + "px";

      _fragment.appendChild(_div);
    }

    _this.stepsContainer.appendChild(_fragment);
  }

  function _getSteps() {
    var _steps = [];

    for (var i = 0; i < _this.stepsContainer.childNodes.length; i++) {
      var child = _this.stepsContainer.childNodes[i];

      if (child.nodeType === Node.ELEMENT_NODE) _steps.push(child);
    }

    return _steps;
  }

  function _getPreviousStep() {
    var stepIndex = _this.state.step.currentStep - 1;

    if (stepIndex < 0) return null;
    return _getSteps()[stepIndex];
  }

  function _getCurrentStep() {
    return _getSteps()[_this.state.step.currentStep];
  }

  function _getNextStep() {
    var stepIndex = _this.state.step.currentStep + 1;

    if (stepIndex > _this.state.step.numberOfSteps) return null;
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
    _updateStyle(_this.track, movingProperty, "".concat(distance).concat("px"));
  }

  function _getCurrentHandleElement() {
    return _this.state.drag.currentHandle === "sup"
      ? _this.supHandle
      : _this.infHandle;
  }

  function _getOtherHandleElement() {
    return _this.state.drag.currentHandle === "sup"
      ? _this.infHandle
      : _this.supHandle;
  }

  function _getClosestHandleElementTo(x) {
    if (SETTINGS.infimum) {
      var LIMIT = _this.parent.offsetWidth;

      var supFromRight = _getLengthCSSValue(_this.supHandle, "right");
      var infFromRight = LIMIT - _getLengthCSSValue(_this.infHandle, "left");

      var deltaSup = Math.abs(supFromRight - x);
      var deltaInf = Math.abs(infFromRight - x);

      return deltaSup > deltaInf
        ? { handle: _this.infHandle, positionProperty: "left", name: "inf" }
        : deltaSup < deltaInf
        ? { handle: _this.supHandle, positionProperty: "right", name: "sup" }
        : {
            handle: _getCurrentHandleElement(),
            positionProperty:
              _this.state.drag.currentHandle === "sup" ? "right" : "left",
            name: _this.state.drag.currentHandle
          };
    } else
      return {
        handle: _this.supHandle,
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
    if (!SETTINGS.infimum) {
      _this.parent.setAttribute("data-value", _this.state.value);
      _this.input.value = _this.state.value;
    } else {
      _this.parent.setAttribute("data-infimum", _this.state.bound.infimum);
      _this.parent.setAttribute("data-supremum", _this.state.bound.supremum);
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

    var DRAG = _this.state.drag;

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
    _this.parent.classList.remove("jumping");
    _getCurrentHandleElement().classList.add("active");
    _getCurrentHandleElement().style.zIndex = 2;
    if (_getOtherHandleElement()) _getOtherHandleElement().style.zIndex = 1;
  }

  function _dragEnd() {
    var DRAG = _this.state.drag;
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

    var LIMIT = _this.parent.offsetWidth;

    var DRAG = _this.state.drag;
    var BOUND = _this.state.bound;

    if (!DRAG[_this.state.drag.currentHandle].active) {
      if (
        !_isPathAvailable(e.target, _getCurrentHandleElement(), _this.parent)
      ) {
        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;

        var _currentX = _map(
          clientX - _this.parent.offsetLeft,
          0,
          LIMIT,
          LIMIT,
          0,
          true
        );

        var _closest = _getClosestHandleElementTo(_currentX);
        var _otherHandlePosition =
          _closest.name === "sup"
            ? SETTINGS.infimum
              ? _getLengthCSSValue(_this.infHandle, "left")
              : 0
            : _getLengthCSSValue(_this.supHandle, "right");

        var _relationalCurrentX =
          _closest.name === "sup" ? _currentX : LIMIT - _currentX;
        var _constrainedRelationalCurrentX = _constrain(
          _relationalCurrentX,
          0,
          LIMIT - _otherHandlePosition
        );

        window.clearTimeout(TIME_OUT);
        _this.parent.classList.add("jumping");
        TIME_OUT = window.setTimeout(function() {
          _this.parent.classList.remove("jumping");
        }, 400);

        if (_this.state.step.numberOfSteps) {
          var stepNumber = Math.round(
            _map(
              _constrainedRelationalCurrentX / _this.state.step.stepValue,
              0,
              LIMIT / _this.state.step.stepValue,
              1,
              _this.state.step.numberOfSteps
            )
          );

          stepNumber =
            _closest.name === "sup"
              ? stepNumber
              : _constrain(
                  _this.state.step.numberOfSteps - stepNumber + 1,
                  1,
                  _this.state.step.numberOfSteps
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
            (_closest.name === "sup" ? -1 : 1) * _constrainedRelationalCurrentX;
          DRAG[_closest.name].offsetX = DRAG[_closest.name].currentX;
          _move(
            _closest.positionProperty,
            _constrainedRelationalCurrentX,
            _closest.handle
          );
        }

        if (SETTINGS.infimum) {
          BOUND.supremum = _map(
            _getLengthCSSValue(_this.track, "right"),
            LIMIT,
            0,
            _inputMin,
            _inputMax
          );

          BOUND.infimum = _map(
            _getLengthCSSValue(_this.track, "left"),
            0,
            LIMIT,
            _inputMin,
            _inputMax
          );
        } else {
          _this.state.value = _map(
            _this.track.offsetWidth,
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
    var currentHandle = _this.state.drag.currentHandle;
    var otherHandle = currentHandle === "sup" ? "inf" : "sup";
    var _CSSCurrentTransitionProperty =
      currentHandle === "sup" ? "right" : "left";
    var _CSSOtherTransitionProperty =
      currentHandle === "sup" ? "left" : "right";

    var LIMIT = _this.parent.offsetWidth;

    var DRAG = _this.state.drag;
    var BOUND = _this.state.bound;

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

      if (_this.state.step.numberOfSteps) {
        var stepNumber = Math.round(
          _map(
            Math.abs(_doubleConstrainedCurrentX / _this.state.step.stepValue),
            0,
            LIMIT / _this.state.step.stepValue,
            1,
            _this.state.step.numberOfSteps
          )
        );

        stepNumber =
          currentHandle === "sup"
            ? stepNumber
            : _constrain(
                _this.state.step.numberOfSteps - stepNumber + 1,
                1,
                _this.state.step.numberOfSteps
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

      if (SETTINGS.infimum) {
        BOUND.supremum = _map(
          _getLengthCSSValue(_this.track, "right"),
          LIMIT,
          0,
          _inputMin,
          _inputMax
        );

        BOUND.infimum = _map(
          _getLengthCSSValue(_this.track, "left"),
          0,
          LIMIT,
          _inputMin,
          _inputMax
        );
      } else {
        _this.state.value = _map(
          _this.track.offsetWidth,
          0,
          LIMIT,
          _inputMin,
          _inputMax
        );
      }

      _updateElementValue();
    }
  }

  if (this.state.step.numberOfSteps) _createSteps();

  // Preventing page scroll on drag
  _addEventListener(this.parent, "mousedown", _disableScroll);
  _addEventListener(this.parent, "touchstart", _disableScroll);
  _addEventListener(this.parent, "mousemove", _disableScroll);
  _addEventListener(this.parent, "touchmove", _disableScroll);
  _addEventListener(this.parent, "mouseup", _enableScroll);
  _addEventListener(this.parent, "touchend", _enableScroll);

  _addEventListener(this.parent, "click", _jump);

  _addEventListener(
    this.supHandle,
    "touchstart",
    _dragStart,
    isPassiveSupported() ? { passive: false } : false
  );
  _addEventListener(
    this.supHandle,
    "mousedown",
    _dragStart,
    isPassiveSupported() ? { passive: false } : false
  );

  if (SETTINGS.infimum) {
    _addEventListener(
      this.infHandle,
      "touchstart",
      _dragStart,
      isPassiveSupported() ? { passive: false } : false
    );
    _addEventListener(
      this.infHandle,
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

  if (!SETTINGS.infimum) {
    var DRAG = this.state.drag;
    var LIMIT = this.parent.offsetWidth;

    if (this.state.step.numberOfSteps) {
      var constrainedInitValue = _constrain(
        _this.state.value,
        _inputMin,
        _inputMax
      );
      var stepNumber = Math.round(
        _map(
          constrainedInitValue / _this.state.step.stepValue,
          0,
          _inputMax / _this.state.step.stepValue,
          1,
          _this.state.step.numberOfSteps
        )
      );
      stepNumber = _constrain(
        _this.state.step.numberOfSteps - stepNumber + 1,
        1,
        _this.state.step.numberOfSteps
      );

      var stepPosition = _getLengthCSSValue(_getStep(stepNumber - 1), "right");

      DRAG["sup"].currentX = -1 * stepPosition;
      DRAG["sup"].offsetX = DRAG["sup"].currentX;
      _move("right", Math.abs(stepPosition));
    }
  }
}

$(".range-picker").each(function() {
  new RangePicker($(this));
});
