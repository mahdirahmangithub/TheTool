jQuery(function($) {
  var _tabItemLeftOffset = 8;
  var _scrollAnimationSpeed = $.browser.safari || $.browser.mobile ? 500 : 10;
  var _scrollAnimationEasing = "swing";

  // remove side paddings of trio full-width tabs
  $(".tab-row.stable").each(function() {
    if ($(this).find(".tab-list__tab").length === 3) {
      $(this)
        .find(".tab-list")
        .css({ "padding-right": "0", "padding-left": "0" });
    }
  });

  $(".tab-list__tab").on("click", function() {
    var $_this = $(this);
    var $parent = $_this.parent(".tab-list");
    var $_that = $parent.find(".active");

    var widthRatio = $_that.outerWidth() / $_this.outerWidth();
    var deltaX = $_that.offset().left - $_this.offset().left;

    $_that.removeClass("active");

    $_this.find(".tab-list__tab__indicator-fill").css({
      "-o-transform": "translateX(" + deltaX + "px) scaleX(" + widthRatio + ")",
      "-ms-transform":
        "translateX(" + deltaX + "px) scaleX(" + widthRatio + ")",
      "-webkit-transform":
        "translateX(" + deltaX + "px) scaleX(" + widthRatio + ")",
      transform: "translateX(" + deltaX + "px) scaleX(" + widthRatio + ")"
    });

    window.setTimeout(function() {
      $_this.addClass("active");
      $_this.find(".tab-list__tab__indicator-fill").css({
        "-o-transform": "",
        "-ms-transform": "",
        "-webkit-transform": "",
        transform: ""
      });
    }, 10);

    if ($_this.position().left < 0) {
      var dx = Math.abs($_this.position().left);

      $parent.animate(
        {
          scrollLeft:
            $parent.scrollLeft() -
            (dx + convertRemToPixels(2) + _tabItemLeftOffset)
        },
        _scrollAnimationSpeed,
        _scrollAnimationEasing
      );
    } else if (
      $_this.position().left + $_this.outerWidth() >
      $parent.outerWidth() - convertRemToPixels(2)
    ) {
      var dx = Math.abs(
        $_this.position().left + $_this.outerWidth() - $parent.outerWidth()
      );

      $parent.animate(
        {
          scrollLeft:
            $parent.scrollLeft() +
            (dx + convertRemToPixels(2) + _tabItemLeftOffset)
        },
        _scrollAnimationSpeed,
        _scrollAnimationEasing
      );
    }
  });

  function convertRemToPixels(rem) {
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  }
});

// (function(root, factory) {
//   if (typeof define === "function" && define.amd) {
//     define([], factory);
//   } else if (typeof module === "object" && module.exports) {
//     module.exports = factory(require("./sonnat.dev.utils"));
//   } else root.tabilize = factory(root._);
// })(typeof self !== "undefined" ? self : this, function(_) {
//   return function() {
//     // Private methods and fields
//     var _tabLists = document.querySelectorAll(".tab-list");
//     var _leftChevron = document.querySelector(".tab-row__chevron--left");
//     var _rightChevron = document.querySelector(".tab-row__chevron--right");

//     function tabClickListener(evt) {
//       var e = evt || window.event;

//       if (e.preventDefault) e.preventDefault();
//       else e.returnValue = null;
//     }

//     function tabListScrollListener(evt) {
//       var parent = this.parentNode;
//       var listRect = this.getBoundingClientRect();

//       var scrollLeft = this.scrollLeft;
//       var maxScroll = this.scrollWidth - listRect.width;
//     }

//     function goToLeft(tabList) {
//       tabList.scrollLeft = 0;
//     }
//     function goToRight(tabList) {
//       tabList.scrollLeft =
//         tabList.scrollWidth - tabList.getBoundingClientRect().width;
//     }

//     function chevronClickListener(evt) {
//       var e = evt || window.event;

//       if (e.preventDefault) e.preventDefault();
//       else e.returnValue = null;

//       var tabList = this.parentNode.querySelector(".tab-list");
//       if (this === _leftChevron) {
//         goToLeft(tabList);
//       } else if (this === _rightChevron) {
//         goToRight(tabList);
//       }
//     }

//     // Initialization
//     (function() {
//       _tabLists.forEach(function(tabList) {
//         _.attachEventAll(
//           tabList.querySelectorAll(".tab-list__tab"),
//           "click",
//           tabClickListener
//         );

//         var last = $(tabList)
//           .children()
//           .last();

//         // var ss = scrollWidth - tabList.offsetWidth;
//         // console.log(tabList.scrollWidth, tabList.offsetWidth, -ss);
//         jQuery(tabList).animate({
//           scrollLeft: last.position().left - 32
//         });

//         _.attachEvent(tabList, "scroll", tabListScrollListener);
//         _.attachEvent(_leftChevron, "click", chevronClickListener);
//         _.attachEvent(_rightChevron, "click", chevronClickListener);
//       });
//     })();

//     // public methods and fields
//     return {};
//   };
// });
