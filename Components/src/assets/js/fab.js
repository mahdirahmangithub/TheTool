jQuery(function($) {
  $(document).on(
    "mousedown",
    ".fab.ripple-element:not(.disabled):not([disabled])",
    function(e) {
      if (!$(this).find(".ripple").length)
        $(this).append(
          '<div class="fab__rippler rippler"><div class="fab__rippler__ripple ripple"></div></div>'
        );

      var ripple = $(this).find(".ripple");
      ripple.removeClass("fab__ripple-animation");

      var x = parseInt(e.pageX - $(this).offset().left) - ripple.width() / 2;
      var y = parseInt(e.pageY - $(this).offset().top) - ripple.height() / 2;

      ripple
        .css({
          top: y,
          left: x
        })
        .addClass("fab__ripple-animation");
    }
  );
});
