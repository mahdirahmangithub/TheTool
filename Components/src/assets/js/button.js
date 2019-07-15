jQuery(function($) {
  $(document).on(
    "mousedown",
    ".button.ripple-element:not(.disabled):not([disabled])",
    function(e) {
      if (!$(this).find(".ripple").length)
        $(this).append(
          '<div class="button__rippler rippler"><div class="button__rippler__ripple ripple"></div></div>'
        );

      var ripple = $(this).find(".ripple");
      ripple.removeClass("button__ripple-animation");

      var x = parseInt(e.pageX - $(this).offset().left) - ripple.width() / 2;
      var y = parseInt(e.pageY - $(this).offset().top) - ripple.height() / 2;

      ripple
        .css({
          top: y,
          left: x
        })
        .addClass("button__ripple-animation");
    }
  );
});
