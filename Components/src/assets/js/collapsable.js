jQuery(function($) {
  $(".collapsable").on("click", function(evt) {
    evt.preventDefault();

    var $target = $($(this).attr("data-target"));
    var _animation = $(this).attr("data-animation");

    $(this).toggleClass("active");

    if ($target.hasClass("show")) {
      $target.stop().slideUp();
      $target.removeClass("show collapse").addClass("collapsing");
      $target.removeClass("collapsing").addClass("collapse");
    } else {
      $target.stop().slideDown();
      $target.removeClass("collapse").addClass("collapsing");
      $target.removeClass("collapsing").addClass("collapse show");
    }
  });
});
