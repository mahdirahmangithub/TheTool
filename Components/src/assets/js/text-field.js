jQuery(function($) {
  $(".text-field").each(function() {
    if ($(this).find(".text-field__hints__input-length-limit").length)
      $(this)
        .find("input")
        .on("input", function() {
          var _limit = parseInt($(this).attr("maxlength"));
          var _valLength = $(this).val().length;

          if (_valLength <= _limit) {
            $(".text-field__hints__input-length-limit")
              .find(".current")
              .text(_valLength);
          } else return false;
        });
  });
});
