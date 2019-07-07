$(function() {
  var $view = $(".resizable-view");
  var $handle = $(".resizable-view__draggable-handle");
  var $breakpoints = $(".resizable-view-row__breakpoints");
  var $parent = $view.parent();

  var minWidth = $view.attr("data-min-width");
  var breakpointLeftOffset = 562;
  var indicatorSVGRealWidth = 17;

  $view.resizable({
    handles: {
      e: $handle
    },
    maxWidth: getSuitableWidth(),
    minWidth: 500
  });

  $handle.on("mousedown", function() {
    $(this).addClass("active");
  });

  $(document).on("mouseup", function() {
    $handle.removeClass("active");
  });

  function getSuitableWidth() {
    if ($parent.width() < $view.width()) $view.width($parent.width());
    return $parent.width();
  }

  function updateTypeInfo() {
    $(".resizable-typography-row").each(function() {
      var _fs = parseInt(
        $(this)
          .find(".responsive-typography")
          .css("font-size")
          .replace("px", "")
      );

      var _lh = parseInt(
        $(this)
          .find(".responsive-typography")
          .css("line-height")
          .replace("px", "")
      );

      var _fw = "";
      switch (
        parseInt(
          $(this)
            .find(".responsive-typography")
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
            .find(".responsive-typography")
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
        .text(parseFloat(_fs / 16).toFixed(1) + "rem");
      $(this)
        .find(".lh")
        .text(parseFloat(_lh / _fs).toFixed(1));
    });
  }

  if (!!$breakpoints.length) {
    new ResizeSensor($view, function() {
      var boxWidth = $view.width();

      updateTypeInfo();

      if (boxWidth >= 612) {
        $(".resizable-typography-row").removeClass("response");
        $breakpoints.removeClass("response");
      } else {
        $(".resizable-typography-row").addClass("response");
        $breakpoints.addClass("response");
        $breakpoints.css(
          "right",
          $parent.width() - $view.width() + indicatorSVGRealWidth + "px"
        );
      }
    });
  }

  new ResizeSensor($parent, function() {
    $view.resizable("option", "maxWidth", getSuitableWidth());
  });
});
