jQuery(function($) {
  var BREAKPOINT_LEFT_OFFSET = 577;
  var INDICATOR_SVG_REAL_WIDTH = 17;

  function ResizableView(selector) {
    var _this = this;

    this.view = $(selector);
    this.handle = this.view.find(".resizable-view__draggable-handle");
    this.parent = this.view.parent();
    this.breakpoints = this.parent.find(".resizable-view-row__breakpoints");

    _getSuitableWidth = _getSuitableWidth.bind(this);

    this.view.resizable({
      handles: { e: this.handle },
      maxWidth: _getSuitableWidth(),
      minWidth: 500
    });

    this.handle.on("mousedown", function() {
      $(this).addClass("active");
    });

    $(document).on("mouseup", function() {
      _this.handle.removeClass("active");
    });

    function _getSuitableWidth() {
      if (this.parent.width() < this.view.width())
        this.view.width(this.parent.width());
      return this.parent.width();
    }

    function _trimZeros(num) {
      return parseFloat(num);
    }

    function _updateTypeInfo() {
      _this.view.find(".resizable-typography-row").each(function() {
        var _fs = parseInt(
          $(this)
            .find(".typography-transition")
            .css("font-size")
            .replace("px", "")
        );

        var _lh = parseInt(
          $(this)
            .find(".typography-transition")
            .css("line-height")
            .replace("px", "")
        );

        var _fw = "";
        switch (
          parseInt(
            $(this)
              .find(".typography-transition")
              .css("font-weight")
          )
        ) {
          case 300:
            _fw = "Light";
            break;
          case 400:
            _fw = "Regular";
            break;
          case 500:
            _fw = "Medium";
            break;
          default:
            _fw = $(this)
              .find(".typography-transition")
              .css("font-weight");
            break;
        }

        $(this)
          .find(".fw")
          .text(_fw);
        $(this)
          .find(".fs-px")
          .text(_fs);
        $(this)
          .find(".fs-rem")
          .text(_trimZeros(parseFloat(_fs / 16).toFixed(3)) + "rem");
        $(this)
          .find(".lh")
          .text(_trimZeros(parseFloat(_lh / _fs).toFixed(1)));
      });
    }

    if (!!this.breakpoints.length) {
      new ResizeSensor(_this.view, function() {
        var boxWidth = _this.view.width();

        _updateTypeInfo();

        if (boxWidth >= BREAKPOINT_LEFT_OFFSET + 42) {
          _this.view.find(".resizable-typography-row").removeClass("response");
          _this.breakpoints.removeClass("response");
        } else {
          _this.view.find(".resizable-typography-row").addClass("response");
          _this.breakpoints.addClass("response");
          _this.breakpoints.css(
            "right",
            _this.parent.width() -
              _this.view.width() +
              INDICATOR_SVG_REAL_WIDTH * 0.5 +
              "px"
          );
        }
      });
    }

    new ResizeSensor(_this.parent, function() {
      _this.view.resizable("option", "maxWidth", _getSuitableWidth());
    });
  }

  $(".resizable-view").each(function() {
    new ResizableView($(this));
  });
});
