(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./sonnat.dev.utils"));
  } else root.carousel = factory(root._);
})(typeof self !== "undefined" ? self : this, function(_) {
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

    var _state = { index: 0, activeIndicator: null, dx: 0 };
    var _settings = _.extend({ isLoopable: false }, opts, true);

    function _computeImageDimensions() {
      var image = _frameElement.querySelector(".carousel__image");

      return {
        width: parseInt(
          _.getComputedCssValue(image, "width").replace("px", "")
        ),
        height: parseInt(
          _.getComputedCssValue(image, "height").replace("px", "")
        )
      };
    }

    function _translateFrame(deltaIndex) {
      var tVal = deltaIndex * IMAGE_WIDTH;
      var direction = deltaIndex > 0 ? "left" : "right";

      if (direction === "left") {
        if (_.hasClass(_fillIndicator, "right"))
          _.removeClass(_fillIndicator, "right");
        _.addClass(_fillIndicator, "left");
      } else {
        if (_.hasClass(_fillIndicator, "left"))
          _.removeClass(_fillIndicator, "left");
        _.addClass(_fillIndicator, "right");
      }

      _.setCssValue(
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

      if (!_.hasClass(currentTarget, "active")) {
        _.removeClass(_state.activeIndicator, "active");
        _.addClass(currentTarget, "active");
        _state.activeIndicator = currentTarget;
      }

      _translateFrame(prevIndex - targetIndex);
    }

    function _updateFillPosition() {
      _.setCssValue(
        _fillIndicator,
        "left",
        _state.activeIndicator.getAttribute("data-left") + "px"
      );

      _.setCssValue(
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

      _.setCssValue(
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

        if (_.hasClass(indicator, "active")) {
          _state.activeIndicator = indicator;
        }

        _.attachEvent(indicator, "click", _indicatorClickHandler);
      });

      _updateFillPosition();
    })();

    // Public Fields and Methods
    return {};
  };
});
