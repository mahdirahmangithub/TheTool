jQuery(function($) {
  function CodeDemo(selector) {
    var _this = this;

    this.demo = $(selector);
    this.copyButton = this.demo.find(".copy-button");
    this.themeToggle = this.demo.find(".theme-toggle");

    this.mainContent = this.demo.find(".code-demo__content");
    this.codeContainers = this.mainContent.find(".code-demo__content__tab");
    this.currentCodeContainer = this.codeContainers.siblings(".active");

    this.tabContainer = this.demo.find(".code-demo__head__tabs");
    this.tabs = this.tabContainer.find(".tab-list__tab");
    this.currentTab = this.tabs.siblings(".active");
    this.currentLang = this.currentTab.attr("data-lang");

    this.clipboard = new ClipboardJS(this.copyButton[0], {
      target: function() {
        return _this.currentCodeContainer[0];
      }
    });

    this.clipboard.on("success", function() {
      _this.copyButton.tooltip({ open: true });
      setTimeout(function() {
        _this.copyButton.tooltip({ open: false });
      }, 1000);
    });

    this.tabs.on("click", function() {
      if (!$(this).hasClass("active")) {
        _this.currentCodeContainer.removeClass("active");
        _this.currentTab.removeClass("active");

        $(this).addClass("active");
        _this.currentTab = $(this);

        var _lang = $(this).attr("data-lang");

        var _codeContainer = _this.codeContainers.siblings(
          '[data-lang="' + _lang + '"]'
        );

        _codeContainer.addClass("active");
        _this.currentCodeContainer = _codeContainer;
      }
    });

    this.themeToggle.find("input").on("change", function() {
      _this.demo.toggleClass("dark-theme");
    });
  }

  $(".code-demo").each(function() {
    new CodeDemo($(this));
  });
});
