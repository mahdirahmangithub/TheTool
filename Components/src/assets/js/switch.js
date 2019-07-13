jQuery(function($) {
  // Ripple Animations
  $(
    ".switch-toggle__cell, .radio-control__cell, .checkbox-control__cell"
  ).mousedown(function(e) {
    var $ripple = $(this).find(".ripple");
    $ripple.removeClass("switch-control__ripple-animation");
    window.setTimeout(function() {
      $ripple.addClass("switch-control__ripple-animation");
    }, 1);
  });

  // Toggling '.checked' Class
  $(".radio-control__input").on("click", function() {
    var switchName = $(this).prop("name");
    $(".radio-control__input").each(function() {
      if ($(this).prop("name") == switchName) {
        $(this)
          .parent()
          .parent()
          .removeClass("checked");
      }
    });
    $(this)
      .parent()
      .parent()
      .addClass("checked");
  });

  $(".checkbox-control__input").on("click", function() {
    var switchName = $(this).prop("name");
    $(this)
      .parent()
      .parent()
      .toggleClass("checked");
  });

  $(".radio-control__label").on("click", function() {
    var switchName = $(this)
      .parent()
      .find("input")
      .prop("name");
    $(".radio-control__input").each(function() {
      if ($(this).prop("name") == switchName) {
        $(this)
          .parent()
          .parent()
          .removeClass("checked");
      }
    });
    $(this)
      .parent()
      .addClass("checked");
  });
});
