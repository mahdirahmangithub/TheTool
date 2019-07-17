jQuery(function($) {
  function InteractiveDemo(selector) {
    var _this = this;

    this.state = {};
    this.blacklist = {};

    this.demo = $(selector);
    this.configButton = this.demo.find(".config-button");
    this.cancelButton = this.demo.find(".cancel-button");

    this.demoTargetContainer = this.demo.find(
      ".interactive-demo__content__main"
    );
    this.configPanel = this.demo.find(
      ".interactive-demo__content__configuration"
    );
    this.tabContainer = this.demo.find(".interactive-demo__head__tabs");
    this.tabs = this.tabContainer.find(".tab-list__tab");
    this.target = this.demoTargetContainer.find(this.demo.attr("data-target"));

    _setState = _setState.bind(this);
    _getState = _getState.bind(this);
    _setAsBlack = _setAsBlack.bind(this);
    _setAsWhite = _setAsWhite.bind(this);
    _isInBlacklist = _isInBlacklist.bind(this);
    _render = _render.bind(this);
    _update = _update.bind(this);

    function _setState(property, value) {
      this.state[property] = value;
    }

    function _getState(property) {
      if (this.state[property] === undefined) {
        this.state[property] = false;
        return this.state[property];
      } else return this.state[property];
    }

    function _setAsBlack(property) {
      this.blacklist[property] = true;
    }

    function _setAsWhite(property) {
      this.blacklist[property] = false;
    }

    function _isInBlacklist(property) {
      if (this.blacklist[property] === undefined) {
        this.blacklist[property] = false;
        return false;
      } else return this.blacklist[property];
    }

    function _render() {
      var _blacklistKeys = Object.keys(this.blacklist);
      var _stateKeys = Object.keys(this.state);

      for (var i = 0; i < _blacklistKeys.length; i++) {
        var _key = _blacklistKeys[i];
        var _val = _isInBlacklist(_key);

        if (_val) {
          this.configPanel
            .find('[name="' + _key.replace(/-/g, "_") + '"]')
            .prop("checked", false)
            .parents(".checkbox-control")
            .removeClass("checked")
            .addClass("disabled");
        } else {
          this.configPanel
            .find('[name="' + _key.replace(/-/g, "_") + '"]')
            .parents(".checkbox-control")
            .removeClass("disabled");
        }
      }

      for (var i = 0; i < _stateKeys.length; i++) {
        var _key = _stateKeys[i];
        var _val = _getState(_key);

        if (_val) {
          if (!this.target.hasClass(_key.replace(/_/g, "-")))
            this.target.addClass(_key.replace(/_/g, "-"));
        } else {
          this.target.removeClass(_key.replace(/_/g, "-"));
        }
      }
    }

    function _update(classes, states, isTogglable) {
      isTogglable = isTogglable || false;
      var _splittedClasses = classes.split(" ");
      var _splittedStates = states.split(" ");

      for (var i = 0; i < _splittedClasses.length; i++) {
        var _class = _splittedClasses[i].substring(1);

        if (isTogglable) {
          $(this.target).toggleClass(_class);
          _setState(
            _class.replace(/-/g, "_"),
            !_getState(_class.replace(/-/g, "_"))
          );
        } else {
          if (_splittedClasses[i][0] === "-") {
            $(this.target).removeClass(_class);
            _setState(_class.replace(/-/g, "_"), false);
          } else if (_splittedClasses[i][0] === "+") {
            $(this.target).addClass(_class);
            _setState(_class.replace(/-/g, "_"), true);
          }
        }
      }

      for (var i = 0; i < _splittedStates.length; i++) {
        var _state = _splittedStates[i].substring(1);
        var _conflict = this.configPanel.find(
          '[data-states~="-' + _state + '"]'
        );

        if (_splittedStates[i][0] === "-") {
          if (isTogglable) {
            _setState(_state.replace(/-/g, "_"), false);
            if (_isInBlacklist(_state)) {
              if (!_conflict.prop("checked")) _setAsWhite(_state);
            } else {
              _setState(_state.replace(/-/g, "_"), false);
              _setAsBlack(_state);
            }
          } else {
            _setState(_state.replace(/-/g, "_"), false);
            _setAsBlack(_state);
          }
        } else if (_splittedStates[i][0] === "+") {
          if (isTogglable) {
            if (!_isInBlacklist(_state)) {
              _setState(_state.replace(/-/g, "_"), false);
              _setAsBlack(_state);
            } else {
              if (!_conflict.prop("checked")) _setAsWhite(_state);
            }
          } else {
            if (!_conflict.prop("checked")) _setAsWhite(_state);
          }
        }
      }
    }

    this.configButton.on("click", function() {
      $(this).trigger("blur");
      _this.demo.addClass("sidebar-opened");
    });

    this.cancelButton.on("click", function() {
      _this.demo.removeClass("sidebar-opened");
    });

    this.tabs.on("click", function() {
      var classesData = $(this).attr("data-classes");
      var statesData = $(this).attr("data-states");

      _update(classesData, statesData, false);
      _render();
    });

    this.configPanel.find(".checkbox-control").on("change", function() {
      var $input = $(this).find("input");
      var classesData = $input.attr("data-classes");
      var statesData = $input.attr("data-states");

      _update(classesData, statesData, true);
      _render();

      if ($input.attr("name") === "iconed") {
        if ($input.prop("checked"))
          _this.target.find(".button__icon").removeClass("display-none");
        else _this.target.find(".button__icon").addClass("display-none");
      } else if ($input.attr("name") === "icon_button") {
        if ($input.prop("checked"))
          _this.target.find(".button__icon").removeClass("display-none");
        else _this.target.find(".button__icon").addClass("display-none");
      }
    });
  }

  new InteractiveDemo("#button-demo");
});
