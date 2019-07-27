jQuery(function($) {
  var _SCROLLING_ = false;

  var $anchorScrollBehavior = $('[data-scroll-behavior="anchor"]');
  var $anchorLinks = $anchorScrollBehavior.find(
    'a[href*="#"]:not([href="#"]):not([href="#0"])'
  );

  $anchorScrollBehavior.find("li").on("click", function(evt) {
    evt.preventDefault();

    var $anchor = $(
      $(this)
        .find("a")
        .attr("href")
    );

    if ($anchor.length) {
      if (!_SCROLLING_) {
        _SCROLLING_ = true;

        $("html, body").animate(
          { scrollTop: $anchor.offset().top - $("#header").height() },
          360,
          function() {
            _SCROLLING_ = false;
          }
        );
        $(this)
          .siblings(".active")
          .removeClass("active");
        $(this).addClass("active");
      }
    }
  });

  $(window).on("scroll", function() {
    if (!_SCROLLING_) {
      if ($anchorLinks.length) {
        $anchorLinks.each(function() {
          var $_anchor = $($(this).attr("href"));

          if ($_anchor.length) {
            if (
              $_anchor.offset().top + $_anchor.outerHeight() >
                $(window).scrollTop() + $("#header").height() &&
              $(window).scrollTop() + $("#header").height() >
                $_anchor.offset().top
            ) {
              var $_parent = $(this).parent();

              $_parent.siblings(".active").removeClass("active");
              $_parent.addClass("active");
            }
          }
        });
      }
    }
  });
});
