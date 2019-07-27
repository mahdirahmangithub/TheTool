jQuery(function($) {
  $(".collapsable").on("click", function(evt) {
    evt.preventDefault();
    // you can also replace hide() with slideUp() and show() with slideDown()

    var $target = $($(this).attr("data-target"));
    var _animation = $(this).attr("data-animation");

    $(this).toggleClass("active");

    if ($target.hasClass("show")) {
      _animation === "slide-horizontal"
        ? $target.hide(360)
        : $target.slideUp(240);
      $target.removeClass("show collapse").addClass("collapsing");
      $target.removeClass("collapsing").addClass("collapse");
    } else {
      _animation === "slide-horizontal"
        ? $target.show(360)
        : $target.slideDown(240);
      $target.removeClass("collapse").addClass("collapsing");
      $target.removeClass("collapsing").addClass("collapse show");
    }
  });
});
