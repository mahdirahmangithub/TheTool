// function _addEventListener(target, event, fn, opt) {
//   if (target.addEventListener) target.addEventListener(event, fn, opt);
//   else if (target.attachEvent) target.attachEvent("on" + event, fn);
//   else target["on" + event] = fn;
// }

// function _removeEventListener(target, event, fn, opt) {
//   if (target.removeEventListener) target.removeEventListener(event, fn, opt);
//   else if (target.detachEvent) target.detachEvent("on" + event, fn);
//   else delete target["on" + event];
// }

// var trans = "height 360ms ease";

// function toggle(evt) {
//   var e = evt || window.event;
//   var target = this;
//   var content = document.querySelector(target.getAttribute("data-target"));

//   if (e.preventDefault) e.preventDefault();
//   else e.returnValue = null;

//   function collapse(target, content) {
//     var contentHeight = content.scrollHeight;

//     var contentTransition = content.style.transition;
//     content.style.transition = "";

//     requestAnimationFrame(function() {
//       content.style.height = contentHeight + "px";
//       content.style.transition = contentTransition;

//       requestAnimationFrame(function() {
//         content.style.height = 0 + "px";
//         content.classList.remove("show");
//       });
//     });
//   }

//   function expand(target, content) {
//     var contentHeight = content.scrollHeight;

//     content.style.height = contentHeight + "px";

//     setTimeout(function() {
//       content.style.height = "";
//     }, 360);

//     content.classList.add("show");
//   }

//   if (content.classList.contains("show")) {
//     collapse(target, content);
//   } else {
//     expand(target, content);
//   }
// }

// (function() {
//   document.querySelectorAll(".collapsable").forEach(function(element) {
//     _addEventListener(element, "click", toggle);
//   });
// })();

jQuery(function($) {
  $(".collapsable").on("click", function(evt) {
    evt.preventDefault();

    var $target = $($(this).attr("data-target"));

    // var computedDisplay = $target.attr("data-display");

    // if (!computedDisplay) {
    //   var clone = $target
    //     .clone()
    //     .attr("id", "xxyyzz")
    //     .removeClass("collapse")
    //     .css({ position: "absolute", visibility: "hidden" })[0];
    //   $("body").append(clone);

    //   computedDisplay = getComputedStyle(clone).display;
    //   $("#xxyyzz").remove();
    //   $target.attr("data-display", computedDisplay);
    // }

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
