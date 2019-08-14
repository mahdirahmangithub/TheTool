jQuery(function($) {
  $(".text-field")
    .find(".text-field__input")
    .on("input", function() {
      var $input = $(this);
      var $parent = $input.parent(".text-field");
      var $limiter = $parent.find(".text-field__hints__input-length-limit");

      if ($limiter.length) {
        var _limit = parseInt($input.attr("maxlength"));
        var _valLength = $input.val().length;

        if (_valLength <= _limit) $limiter.find(".current").text(_valLength);
      }

      $input.val().length > 0
        ? $input.addClass("has-value")
        : $input.removeClass("has-value");
    });

  $(".text-field.legend-label")
    .find(".text-field__input")
    .on("focus", function() {
      var $input = $(this);
      var $parent = $input.parent(".text-field");
      var $label = $parent.find(".text-field__label");
      var $labelText = $label.find(".text-field__label-text");

      var labelPaddingValue = $label.outerWidth() - $label.innerWidth();

      $label.width($labelText.outerWidth() * 0.75 + labelPaddingValue);
    });

  $(".text-field.legend-label")
    .find(".text-field__input")
    .on("blur", function() {
      var $input = $(this);

      if (!$input.val()) {
        var $parent = $input.parent(".text-field");
        var $label = $parent.find(".text-field__label");
        var $labelText = $label.find(".text-field__label-text");

        var labelPaddingValue = $label.outerWidth() - $label.innerWidth();

        $label.css("width", "auto");
      }
    });
});
