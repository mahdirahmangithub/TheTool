jQuery(function($) {
  $(".button.ripple-element").append(
    '<div class="button__rippler rippler"><div class="button__rippler__ripple ripple"></div></div>'
  );

  $(document).on(
    "mousedown",
    ".button.ripple-element:not(.disabled):not([disabled])",
    function(e) {
      var ripple = $(this).find(".ripple");
      ripple.removeClass("ripple-animation");

      var x = parseInt(e.pageX - $(this).offset().left) - ripple.width() / 2;
      var y = parseInt(e.pageY - $(this).offset().top) - ripple.height() / 2;

      ripple
        .css({
          top: y,
          left: x
        })
        .addClass("ripple-animation");
    }
  );
});
