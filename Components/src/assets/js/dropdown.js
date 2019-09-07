jQuery(function($) {
  $.fn.dropdown = function() {
    return this.each(function() {
      var _this = $(this);
      var $target = _this.next();
      var $parent = _this.parent();

      function _outsideClickListener(evt) {
        var e = evt || window.event;
        var $eventTarget = $(e.target);

        if (!$eventTarget.closest($parent).length && $target.is(":visible")) {
          $target.removeClass("show");
          $(document).off("click", _outsideClickListener);
        }
      }

      _this.on("click", function(evt) {
        var e = evt || window.event;

        e.preventDefault ? e.preventDefault() : (e.returnValue = null);

        if ($target.hasClass("show")) {
          $(document).off("click", _outsideClickListener);
          $target.removeClass("show");
        } else {
          $(document).on("click", _outsideClickListener);
          $target.addClass("show");
        }
      });
    });
  };

  $('[data-toggle="dropdown"]').dropdown();
});
