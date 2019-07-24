jQuery(function($) {
  $(".collapsable").on("click", function(evt) {
    evt.preventDefault();
    // you can also replace hide() with slideUp() and show() with slideDown()

    var $target = $($(this).attr("data-target"));
    var _animation = $(this).attr("data-animation");

    if ($target.hasClass("show")) {
      _animation === "slide-lr" ? $target.hide(360) : $target.slideUp(360);
      $target.removeClass("show collapse").addClass("collapsing");
      $target.removeClass("collapsing").addClass("collapse");
    } else {
      _animation === "slide-lr" ? $target.show(360) : $target.slideDown(360);
      $target.removeClass("collapsing").addClass("collapse show");
      $target.removeClass("collapse").addClass("collapsing");
    }
  });
});
