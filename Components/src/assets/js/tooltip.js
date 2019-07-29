jQuery(function($) {
  $.fn.tooltip = function(options) {
    return this.each(function() {
      var _this = $(this),
        _settings = $.extend(
          {},
          $.fn.tooltip.defaults,
          {
            placement: _this.attr("data-placement"),
            isHTMLContent: !!_this.attr("data-is-html-content")
              ? _this.attr("data-is-html-content") === "true"
              : false,
            title: _this.attr("data-title"),
            hasTail: !!_this.attr("data-has-tail")
              ? _this.attr("data-has-tail") === "true"
              : true,
            theme: _this.attr("data-theme"),
            triggerOn: _this.attr("data-trigger-on"),
            appendTo: _this.attr("data-append-to")
          },
          options
        );

      function _createTooltip() {
        var _id = new Date().getTime();
        var _classes =
          " " + _settings.placement + (!!_settings.hasTail ? " tailed" : "");
        var _tail = _settings.hasTail ? '<div class="tooltip-tail"></div>' : "";
        var _html =
          '<div id="' +
          _id +
          '" class="tooltip' +
          _classes +
          '">' +
          '<div class="tooltip-box">' +
          '<span class="tooltip-text">' +
          _settings.title +
          "</span>" +
          "</div>" +
          _tail +
          "</div>";

        return { html: _html, id: _id };
      }

      function _removeTooltip(id) {
        var $_tooltip = $("#" + id);

        $_tooltip.removeClass("show");
        setTimeout(function() {
          $_tooltip.remove();
        }, 360);
      }

      function _getPosition($tooltip, placement) {
        switch (placement) {
          case "left":
            return {
              top:
                _this.offset().top +
                _this.outerHeight() / 2 -
                $tooltip.outerHeight() / 2,
              left: _this.offset().left - $tooltip.outerWidth()
            };
          case "right":
            return {
              top:
                _this.offset().top +
                _this.outerHeight() / 2 -
                $tooltip.outerHeight() / 2,
              left: _this.offset().left + _this.outerWidth()
            };
          case "bottom":
            return {
              top: _this.offset().top + _this.outerHeight(),
              left:
                _this.offset().left +
                _this.outerWidth() / 2 -
                $tooltip.outerWidth() / 2
            };
          case "top":
          default:
            return {
              top: _this.offset().top - $tooltip.outerHeight(),
              left:
                _this.offset().left +
                _this.outerWidth() / 2 -
                $tooltip.outerWidth() / 2
            };
        }
      }

      function _showTooltip() {
        var _tooltip = _createTooltip();
        _this.attr("data-tooltip-id", _tooltip.id);
        $(_settings.appendTo).append(_tooltip.html);

        var $_tooltip = $("#" + _tooltip.id);

        $_tooltip
          .css(_getPosition($_tooltip, _settings.placement))
          .addClass("show");
      }

      function _hideTooltip() {
        var _attr = _this.attr("data-tooltip-id");
        _this.attr("data-tooltip-id", "");

        _removeTooltip(_attr);
      }

      if (_this.is('[data-toggle="tooltip"]')) {
        switch (_settings.triggerOn) {
          case "manual":
            if (_settings.open !== undefined) {
              if (_settings.open === true) {
                if (_this.attr("data-tooltip-id")) _hideTooltip();
                _showTooltip();
              } else if (_settings.open === false) _hideTooltip();
              else if (_settings.open === "toggle") {
                if (!_this.attr("data-tooltip-id")) _showTooltip();
                else _hideTooltip();
              }
            }
            break;
          case "click":
            _this.on("click", function(evt) {
              if (!_this.attr("data-tooltip-id")) {
                _showTooltip();

                $(document).on("mousedown.tooltip", function() {
                  _hideTooltip();

                  $(document).off("mousedown.tooltip");
                });
              } else _hideTooltip();
            });
            break;
          case "hover":
          default:
            _this.hover(_showTooltip, _hideTooltip);
            break;
        }
      }
    });
  };

  $.fn.tooltip.defaults = {
    placement: "top",
    isHTMLContent: false,
    hasTail: true,
    triggerOn: "hover",
    appendTo: "body"
  };

  $('[data-toggle="tooltip"]').tooltip();

  $('#manual[data-toggle="tooltip"]').on("click", function() {
    $(this).tooltip({ open: "toggle" });
  });
});

// RESPONSIVE_PLACEMENT - MOUSE_FOLLOWING
