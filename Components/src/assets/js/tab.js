jQuery(function($) {
  var _tabItemLeftOffset = 48;
  var _scrollAnimationSpeed = $.browser.safari || $.browser.mobile ? 500 : 10;
  var _scrollAnimationEasing = "swing";

  // append "fixer" to hide horizontal scrollbar
  $(".tab-row").append('<div class="fixer"></div>');

  // remove side paddings of trio full-width tabs
  $(".tab-row.stable").each(function() {
    if ($(this).find(".tab-list__tab").length === 3) {
      $(this)
        .find(".tab-list")
        .css({ "padding-right": "0", "padding-left": "0" });
    }
  });

  $(".tab-list__tab").on("click", function() {
    var $_this = $(this);
    var $parent = $_this.parent(".tab-list");
    var $_that = $parent.find(".active");

    var widthRatio = $_that.outerWidth() / $_this.outerWidth();
    var deltaX = $_that.offset().left - $_this.offset().left;

    $_that.removeClass("active");

    $_this.find(".tab-list__tab__indicator-fill").css({
      "-o-transform": "translateX(" + deltaX + "px) scaleX(" + widthRatio + ")",
      "-ms-transform":
        "translateX(" + deltaX + "px) scaleX(" + widthRatio + ")",
      "-webkit-transform":
        "translateX(" + deltaX + "px) scaleX(" + widthRatio + ")",
      transform: "translateX(" + deltaX + "px) scaleX(" + widthRatio + ")"
    });

    window.setTimeout(function() {
      $_this.addClass("active");
      $_this.find(".tab-list__tab__indicator-fill").css({
        "-o-transform": "",
        "-ms-transform": "",
        "-webkit-transform": "",
        transform: ""
      });
    }, 10);

    if ($_this.position().left < 0) {
      var dx = Math.abs($_this.position().left);

      $parent.animate(
        {
          scrollLeft:
            $parent.scrollLeft() -
            (dx + convertRemToPixels(2) + _tabItemLeftOffset)
        },
        _scrollAnimationSpeed,
        _scrollAnimationEasing
      );
    } else if (
      $_this.position().left + $_this.outerWidth() >
      $parent.outerWidth() - convertRemToPixels(2)
    ) {
      var dx = Math.abs(
        $_this.position().left + $_this.outerWidth() - $parent.outerWidth()
      );

      $parent.animate(
        {
          scrollLeft:
            $parent.scrollLeft() +
            (dx + convertRemToPixels(2) + _tabItemLeftOffset)
        },
        _scrollAnimationSpeed,
        _scrollAnimationEasing
      );
    }
  });

  function convertRemToPixels(rem) {
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  }
});
