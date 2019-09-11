(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.select = factory();
  }
})(typeof self !== "undefined" ? self : this, function() {
  return function(selector, opts) {
    // Private Fields and Methods
    var _parentElement =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector instanceof HTMLElement
        ? selector
        : selector instanceof jQuery
        ? selector[0]
        : null;

    if (!_parentElement) return;

    var _inputElement = _parentElement.querySelector(".select__input"),
      _fieldElement = _parentElement.querySelector(".select__choose-field"),
      _clearFieldElement = _parentElement.querySelector(
        ".select__choose-field__clear"
      ),
      _textElement = _parentElement.querySelector(
        ".select__choose-field__text"
      ),
      _optionElements,
      _dropdownElement,
      _dropdownSearch;

    var _placeholder = _parentElement.getAttribute("data-placeholder") || "";

    var _state = { value: "", selectedOptions: [] };
    var _nativeOptions = _getNativeOptions(),
      _mimicedOptions;

    var _settings = _extend(
      { isSearchable: _hasClass(_parentElement, "searchable") },
      opts
    );

    function _createUnit(unitText) {
      var fragment = document.createDocumentFragment();

      var div = document.createElement("div");
      div.className = "select__choose-field__unit";
      div.appendChild(document.createTextNode(unitText));

      fragment.appendChild(div);

      return fragment;
    }

    function _createDropdown() {
      var mimicedOptions = { byId: {}, allIds: [] };

      var _createDropdownSearch = function() {
        var fragment = document.createDocumentFragment();

        var dropdownSearch = document.createElement("div");
        dropdownSearch.className = "select__dropdown__search";

        var textField = document.createElement("div");
        textField.className = "text-field minimal iconed iconed--leading";

        textField.innerHTML =
          '<input class="text-field__input" type="text" placeholder="جستجو" />' +
          '<div class="text-field__icons">' +
          '<div class="text-field__icons__leading">' +
          '<div class="text-field__icon">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
          '<path class="fill" d="M19.1,17.69l-2.77-2.78a6.42,6.42,0,0,0,1.26-3.83,6.52,6.52,0,1,0-2.68,5.25l2.78,2.78a1,1,0,0,0,.71.29,1,1,0,0,0,.7-.29A1,1,0,0,0,19.1,17.69ZM6.59,11.08a4.5,4.5,0,1,1,4.5,4.5A4.5,4.5,0,0,1,6.59,11.08Z"></path>' +
          "</svg></div></div></div>";

        dropdownSearch.appendChild(textField);
        fragment.appendChild(dropdownSearch);

        return fragment;
      };

      var _createDropdownOptions = function() {
        var fragment = document.createDocumentFragment();
        var fetchedOptions = _nativeOptions.childsOfSelect;

        var dropdownOptions = document.createElement("div");
        dropdownOptions.className = "select__dropdown__options";

        if (fetchedOptions.length) {
          for (var i = 0; i < fetchedOptions.length; i++) {
            var opt = fetchedOptions[i];

            if (opt.nodeName.toLowerCase() === "option") {
              var optVal = opt.value || opt.getAttribute("value");

              if (!optVal) continue;

              var option = document.createElement("div");
              option.className =
                "select__dropdown__options__option select-option";
              option.setAttribute("data-value", optVal);

              var span = document.createElement("span");
              span.className =
                "select__dropdown__options__option__text option-text";
              span.appendChild(document.createTextNode(opt.textContent));

              option.appendChild(span);
              dropdownOptions.appendChild(option);

              mimicedOptions.byId[optVal] = option;
              mimicedOptions.allIds.push(optVal);
            } else if (opt.nodeName.toLowerCase() === "optgroup") {
              var optionGroup = document.createElement("div");
              optionGroup.className = "select__dropdown__options__option-group";

              var optionGroupTitle = document.createElement("strong");
              optionGroupTitle.className =
                "select__dropdown__options__option-group__title";
              optionGroupTitle.appendChild(
                document.createTextNode(opt.getAttribute("label") || "")
              );
              optionGroup.appendChild(optionGroupTitle);

              if (opt.childNodes && opt.childNodes.length) {
                for (var j = 0; j < opt.childNodes.length; j++) {
                  if (opt.childNodes[j].nodeType === Node.ELEMENT_NODE) {
                    var innerOpt = opt.childNodes[j];
                    var innerOptVal =
                      innerOpt.value || innerOpt.getAttribute("value");

                    if (!innerOptVal) continue;

                    var option = document.createElement("div");
                    option.className =
                      "select__dropdown__options__option-group__option select-option";
                    option.setAttribute(
                      "data-value",
                      innerOpt.getAttribute("value")
                    );

                    var span = document.createElement("span");
                    span.className =
                      "select__dropdown__options__option-group__option__text option-text";
                    span.appendChild(
                      document.createTextNode(innerOpt.textContent)
                    );

                    option.appendChild(span);
                    optionGroup.appendChild(option);

                    mimicedOptions.byId[innerOptVal] = option;
                    mimicedOptions.allIds.push(innerOptVal);
                  }
                }
              }

              dropdownOptions.appendChild(optionGroup);
            }
          }
        }

        fragment.appendChild(dropdownOptions);
        _mimicedOptions = mimicedOptions;

        return fragment;
      };

      var fragment = document.createDocumentFragment();

      var dropdown = document.createElement("div");
      dropdown.className = "select__dropdown";

      var dropdownContainer = document.createElement("div");
      dropdownContainer.className = "select__dropdown__container";

      if (_settings.isSearchable)
        dropdownContainer.appendChild(_createDropdownSearch());
      dropdownContainer.appendChild(_createDropdownOptions());
      dropdown.appendChild(dropdownContainer);
      fragment.appendChild(dropdown);

      return fragment;
    }

    function _dispatchEvent(element, eventName) {
      if ("createEvent" in document) {
        var event = document.createEvent("HTMLEvents");

        event.initEvent(eventName, false, true);
        element.dispatchEvent(event);
      } else element.fireEvent("on" + eventName);
    }

    function _updateValue(value) {
      _state.value = value;
      _parentElement.setAttribute("data-value", _state.value);

      var nativeOption = _nativeOptions.options.byId[value];
      if (nativeOption) {
        nativeOption.value = value;
        value
          ? (nativeOption.selected = true)
          : (nativeOption.selected = false);

        _dispatchEvent(_inputElement, "change");
      }
    }

    function _getNativeOptions() {
      var childsInOrder = [];
      var nativeOptions = { byId: {}, allIds: [] };

      if (_inputElement.childNodes && _inputElement.childNodes.length) {
        var nodes = _inputElement.childNodes;

        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];

          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.nodeName.toLowerCase() === "option") {
              var id = node.value || node.getAttribute("value") || "default";

              nativeOptions.byId[id] = node;
              nativeOptions.allIds.push(id);
              childsInOrder.push(node);
            } else if (node.nodeName.toLowerCase() === "optgroup") {
              childsInOrder.push(node);

              if (node.childNodes && node.childNodes.length) {
                var innerNodes = node.childNodes;

                for (var j = 0; j < innerNodes.length; j++) {
                  var innerNode = innerNodes[j];

                  if (innerNode.nodeType === Node.ELEMENT_NODE) {
                    if (innerNode.nodeName.toLowerCase() === "option") {
                      var id =
                        innerNode.value ||
                        innerNode.getAttribute("value") ||
                        "default";

                      nativeOptions.byId[id] = innerNode;
                      nativeOptions.allIds.push(id);
                    }
                  }
                }
              }
            }
          }
        }
      }

      return { options: nativeOptions, childsOfSelect: childsInOrder };
    }

    function _optionClickListener(evt) {
      var e = evt || window.event;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      var optionText = this.querySelector(".option-text").textContent;
      var optionValue = this.getAttribute("data-value");

      if (_state.selectedOptions.length) {
        for (var i = 0; i < _state.selectedOptions.length; i++) {
          _removeClass(_state.selectedOptions[i], "selected");
          _state.selectedOptions.shift();
        }
      }

      _state.selectedOptions.push(this);

      _updateValue(optionValue);
      _addClass(this, "selected");
      _addClass(_fieldElement, "selected");
      _textElement.textContent = optionText;
    }

    function _outsideClickListener(evt) {
      function isVisible(element) {
        return (
          !!element &&
          !!(
            element.offsetWidth ||
            element.offsetHeight ||
            element.getClientRects().length
          )
        );
      }

      var e = evt || window.event;
      var eventTarget = e.target || e.srcElement;

      if (
        !_closest(eventTarget, ".select__dropdown") &&
        isVisible(_dropdownElement)
      ) {
        _removeClass(_dropdownElement, "show");
        _detachEvent(document, "click", _outsideClickListener);
      }
    }

    function _clearClickListener(evt) {
      var e = evt || window.event;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      if (_state.selectedOptions.length) {
        for (var i = 0; i < _state.selectedOptions.length; i++) {
          _removeClass(_state.selectedOptions[i], "selected");
        }
      }

      _updateValue("");
      _removeClass(_fieldElement, "selected");
      _textElement.textContent = _placeholder;
    }

    function _searchInputListener(evt) {
      var e = evt || window.event;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      var inputVal = this.value;

      for (var i = 0; i < _optionElements.length; i++) {
        var option = _optionElements[i];
        var optionText = option.querySelector(".option-text").textContent;

        if (optionText.indexOf(inputVal) > -1) _removeClass(option, "hide");
        else _addClass(option, "hide");
      }
    }

    function _toggleDropdown(evt) {
      function isNotClearButton(element) {
        return !_closest(element, ".select__choose-field__clear");
      }

      var e = evt || window.event;
      var eventTarget = e.target || e.srcElement;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      if (isNotClearButton(eventTarget)) {
        if (_hasClass(_dropdownElement, "show")) {
          _detachEvent(document, "click", _outsideClickListener);
          setTimeout(function() {
            _removeClass(_dropdownElement, "show");
          }, 0);
        } else {
          _attachEvent(document, "click", _outsideClickListener);
          setTimeout(function() {
            _addClass(_dropdownElement, "show");
          }, 0);
        }
      }
    }

    function _extend() {
      var extended = {};
      var deep = false;
      var i = 0;
      var argsLength = arguments.length;

      // Check if a deep merge
      if (typeof arguments[argsLength - 1] === "boolean") {
        deep = arguments[argsLength - 1];
        argsLength--;
      }

      // Merge the object into the extended object
      var merge = function(o) {
        for (var p in o) {
          if (Object.prototype.hasOwnProperty.call(o, p)) {
            if (deep && typeof o[p] === "object")
              extended[p] = _extend(extended[p], o[p], true);
            else extended[p] = o[p];
          }
        }
      };

      // Loop through each object and conduct a merge
      while (i < argsLength) merge(arguments[i++]);

      return extended;
    }

    function _closest(element, selectors) {
      if (Element.prototype.closest) return element.closest(selectors);
      else {
        // Polyfill for IE9+

        if (!Element.prototype.matches) {
          Element.prototype.matches =
            Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;
        }
        Element.prototype.closest = function(s) {
          var el = this;

          do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
          } while (el !== null && el.nodeType === 1);
          return null;
        };
      }
    }

    function _addClass(element, cName) {
      var _className = element.className;

      if (_className.indexOf(cName) > -1) return;

      _className = _className.trim();
      _className += " " + cName;
      element.className = _className;
    }

    function _removeClass(element, cName) {
      // WARNING: Don't remove 'prettier-ignore' comment!
      // prettier-ignore
      var regx = new RegExp('(?:^|\s*)' + cName );
      element.className = element.className.replace(regx, "");
    }

    function _hasClass(element, cName) {
      return element.className.indexOf(cName) > -1;
    }

    function _attachEvent(element, event, callback, opt) {
      if (element.addEventListener)
        element.addEventListener(event, callback, opt);
      else if (element.attachEvent) element.attachEvent("on" + event, callback);
      else element["on" + event] = callback;
    }

    function _detachEvent(element, event, callback, opt) {
      if (element.removeEventListener)
        element.removeEventListener(event, callback, opt);
      else if (element.detachEvent) element.detachEvent("on" + event, callback);
      else delete element["on" + event];
    }

    // Initialization
    (function() {
      _textElement.textContent = _placeholder;

      _parentElement.appendChild(_createDropdown());

      var _unitText = _parentElement.getAttribute("data-unit");
      if (_unitText) _fieldElement.appendChild(_createUnit(_unitText));

      _dropdownElement = _parentElement.querySelector(".select__dropdown");
      _optionElements = _dropdownElement.querySelectorAll(".select-option");

      for (var i = 0; i < _optionElements.length; i++) {
        var _optionElement = _optionElements[i];

        _attachEvent(_optionElement, "click", _optionClickListener);
      }

      _attachEvent(_clearFieldElement, "click", _clearClickListener);
      _attachEvent(_fieldElement, "click", _toggleDropdown);

      if (_settings.onchange)
        _attachEvent(_inputElement, "change", opts.onchange);

      if (_settings.isSearchable) {
        _dropdownSearch = _dropdownElement.querySelector(".text-field__input");
        _attachEvent(_dropdownSearch, "input", _searchInputListener);
      }
    })();

    // Public Field and Methods
    return {
      getValue: function() {
        return _state.value;
      },
      setValue: function(value) {
        try {
          if (
            !_mimicedOptions.byId[value] &&
            _nativeOptions.options.byId[value]
          ) {
            if (_state.selectedOptions.length) {
              for (var i = 0; i < _state.selectedOptions.length; i++) {
                _removeClass(_state.selectedOptions[i], "selected");
              }
            }

            _updateValue("");
            _removeClass(_fieldElement, "selected");
            _textElement.textContent = _placeholder;
          } else {
            var option = _mimicedOptions.byId[value];
            var optionText = option.querySelector(".option-text").textContent;
            var optionValue = option.getAttribute("data-value");
            if (_state.selectedOptions.length) {
              for (var i = 0; i < _state.selectedOptions.length; i++) {
                _removeClass(_state.selectedOptions[i], "selected");
                _state.selectedOptions.shift();
              }
            }

            _state.selectedOptions.push(option);
            _updateValue(value);
            _addClass(option, "selected");
            _addClass(_fieldElement, "selected");
            _textElement.textContent = optionText;
          }
        } catch (err) {
          throw Error("The entered value is not valid!");
        }
      }
    };
  };
});
