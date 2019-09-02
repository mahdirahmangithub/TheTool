jQuery(function($) {
  $.fn.rangePicker = function(options) {
    return this.each(function() {
      if (!$(this).is(".range-picker")) return;

      var _this = $(this),
        _settings = $.extend(
          {
            infimum: _this.hasClass("has-infimum")
          },
          $.fn.rangePicker.defaults,
          options
        );

      var $_input = !_settings.infimum
        ? _this.find(".range-picker__input")
        : null;
      var $_interval = _this.find(".range-picker__interval");
      var $_inf = _settings.infimum
        ? $_interval.find(".range-picker__inf-handle")
        : null;
      var $_sup = $_interval.find(".range-picker__sup-handle");
      var $_infToSup = $_interval.find(".range-picker__inf-to-sup");
      var $_steps = _this.find(".range-picker__steps");

      var _inputMin = !_settings.infimum
        ? parseInt($_input.attr("min"))
        : parseInt(_this.attr("data-min"));
      var _inputMax = !_settings.infimum
        ? parseInt($_input.attr("max"))
        : parseInt(_this.attr("data-max"));
      var _stepValue = !_settings.infimum
        ? parseInt($_input.attr("step"))
        : parseInt(_this.attr("data-step"));

      var _valueState = {
        infimum: _inputMin ? _inputMin : 0,
        supremum: _inputMax ? _inputMax : 100,
        value: !_settings.infimum ? parseInt($_input.val()) : 0
      };

      var _stepState = {
        currentStep: 0,
        stepValue: _stepValue ? _stepValue : 0,
        numberOfSteps: _stepValue ? (_inputMax + _inputMin) / _stepValue + 1 : 0
      };

      var _dragState = $.extend(
        {
          sup: {
            active: false,
            currentX: 0,
            initialX: 0,
            offsetX: 0
          },
          currentHandle: "sup"
        },
        _settings.infimum
          ? {
              inf: {
                active: false,
                currentX: 0,
                initialX: 0,
                offsetX: 0
              }
            }
          : {}
      );

      function _calcHandleCircleWidth() {
        return $_sup.children("button").outerWidth();
      }

      function _convertRemToPixels(rem) {
        return (
          rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
        );
      }

      function _createSteps() {
        var _fragment = "";

        for (var i = 0; i < _stepState.numberOfSteps; i++)
          _fragment += '<div class="range-picker__step"></div>';

        $_steps.append(_fragment);
      }

      function _getPreviousStep() {
        var stepIndex = _stepState.currentStep - 1;

        if (stepIndex < 0) return null;
        return $($_steps.children()[stepIndex]);
      }

      function _getCurrentStep() {
        return $($_steps.children()[_stepState.currentStep]);
      }

      function _getNextStep() {
        var stepIndex = _stepState.currentStep + 1;

        if (stepIndex > _stepState.numberOfSteps) return null;
        return $($_steps.children()[stepIndex]);
      }

      function _map(n, a, b, c, d, withinBounds) {
        // mapping value n from range [a, b] onto [c, d]
        // assuming that a != b
        // it's linear mapping so f(a) = c, f(b) = d

        var mappedVal = ((n - a) * (d - c)) / (b - a) + c;
        if (!withinBounds) return mappedVal;
        else if (d > c) return _constrain(mappedVal, c, d);
        else return _constrain(mappedVal, d, c);
      }

      function _constrain(x, a, b) {
        // if x >= b then return b
        // if a < x < b then return x
        // if x <= a then return a

        return Math.max(Math.min(x, b), a);
      }

      function _getCurrentHandleElement() {
        return _dragState.currentHandle === "sup" ? $_sup : $_inf;
      }

      function _updateElementValue() {
        if (!_settings.infimum) {
          _this.attr("data-value", _valueState.value);
          $_input.val(_valueState.value);
        } else {
          _this.attr("data-infimum", _valueState.infimum);
          _this.attr("data-supremum", _valueState.supremum);
        }
      }

      function _calcTangentLimit() {
        return _settings.infimum
          ? _this.outerWidth() -
              (2 * $_sup.outerWidth() - _convertRemToPixels(2))
          : _this.outerWidth() - $_sup.outerWidth() + _convertRemToPixels(1);
      }

      function _getCSSValue(el, property) {
        return parseInt(
          $(el)
            .css(property)
            .replace("px", "")
        );
      }

      function _dragStart(evt) {
        var e = evt || window.event;
        var clientX =
          e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
        var currentHandle = _dragState.currentHandle;

        $(document).on("touchmove", _drag);
        $(document).on("mousemove", _drag);

        _dragState[currentHandle].initialX =
          clientX - _dragState[currentHandle].offsetX;

        _dragState[currentHandle].active = true;
        _getCurrentHandleElement().addClass("active");
      }

      function _dragEnd() {
        var currentHandle = _dragState.currentHandle;

        $(document).off("touchmove");
        $(document).off("mousemove");

        _dragState[currentHandle].initialX = _dragState[currentHandle].currentX;
        _dragState[currentHandle].active = false;
        _getCurrentHandleElement().removeClass("active");
      }

      function _drag(evt) {
        var e = evt || window.event;
        var clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;

        var currentHandle = _dragState.currentHandle;
        var otherHandle = currentHandle === "sup" ? "inf" : "sup";

        var _CSSCurrentTransitionProperty =
          currentHandle === "sup" ? "right" : "left";
        var _CSSOtherTransitionProperty =
          currentHandle === "sup" ? "left" : "right";

        var _left = _getCSSValue($_interval, "left");
        var _right = _getCSSValue($_interval, "right");

        if (_dragState[currentHandle].active) {
          e.type !== "touchmove" && e.preventDefault();

          if (
            currentHandle === "sup"
              ? clientX - _dragState.sup.initialX <= 0
              : clientX - _dragState.inf.initialX >= 0
          ) {
            _dragState[currentHandle].currentX =
              clientX - _dragState[currentHandle].initialX;

            _dragState[currentHandle].offsetX =
              _dragState[currentHandle].currentX;

            var dx =
              currentHandle === "sup"
                ? -1 * _dragState[currentHandle].currentX
                : _dragState[currentHandle].currentX;

            if (
              (_settings.infimum &&
                dx + _getCSSValue($_interval, _CSSOtherTransitionProperty) <=
                  _calcTangentLimit()) ||
              (!_settings.infimum && dx <= _calcTangentLimit())
            ) {
              $_interval.css(_CSSCurrentTransitionProperty, dx);
            } else if (_settings.infimum) {
              if (currentHandle === "sup") {
                _dragState[currentHandle].currentX =
                  _dragState[otherHandle].currentX - _calcTangentLimit();
                _dragState[currentHandle].offsetX =
                  _dragState[otherHandle].offsetX - _calcTangentLimit();
              } else {
                _dragState[currentHandle].currentX =
                  _calcTangentLimit() + _dragState[otherHandle].currentX;
                _dragState[currentHandle].offsetX =
                  _calcTangentLimit() + _dragState[otherHandle].offsetX;
              }

              var _delta =
                _calcTangentLimit() -
                (_getCSSValue($_interval, _CSSOtherTransitionProperty) +
                  _getCSSValue($_interval, _CSSCurrentTransitionProperty));

              $_interval.css(
                _CSSCurrentTransitionProperty,
                _getCSSValue($_interval, _CSSCurrentTransitionProperty) + _delta
              );
            } else {
              _dragState[currentHandle].currentX = -_calcTangentLimit();
              _dragState[currentHandle].offsetX = -_calcTangentLimit();
              $_interval.css(
                _CSSCurrentTransitionProperty,
                _calcTangentLimit()
              );
            }
          } else {
            _dragState[currentHandle].currentX = 0;
            _dragState[currentHandle].offsetX = 0;
            $_interval.css(_CSSCurrentTransitionProperty, 0);
          }

          if (!_settings.infimum) {
            _valueState.value = _map(
              $_infToSup.outerWidth(),
              0,
              _this.outerWidth() - _calcHandleCircleWidth(),
              _inputMin,
              _inputMax
            );
            _updateElementValue();
          } else {
            _valueState.supremum = _map(
              _right,
              0,
              _calcTangentLimit(),
              _inputMax,
              _inputMin
            );
            _valueState.infimum = _map(
              _left,
              0,
              _calcTangentLimit(),
              _inputMin,
              _inputMax
            );
            _updateElementValue();
          }
        }
      }

      if (_stepState.numberOfSteps) _createSteps();

      $_sup.on("touchstart mousedown", function() {
        _dragState.currentHandle = "sup";
        _dragStart();
      });

      _settings.infimum &&
        $_inf.on("touchstart mousedown", function() {
          _dragState.currentHandle = "inf";
          _dragStart();
        });

      $(document).on("touchend mouseup", _dragEnd);
    });
  };

  $.fn.rangePicker.defaults = {};
});
