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
      _dropdownSearch,
      _emptyStatement,
      _chipsContainer;

    var _placeholder = _parentElement.getAttribute("data-placeholder") || "";

    var _state = { value: "", selected: [], values: [] };
    var _nativeOptions = _getNativeOptions(),
      _mimicedOptions;

    var _settings = _extend(
      {
        isSearchable: _hasClass(_parentElement, "searchable"),
        isMultiple: _hasClass(_parentElement, "multiple")
      },
      opts,
      true
    );

    if (_settings.isMultiple)
      _chipsContainer = _fieldElement.querySelector(
        ".select__choose-field__chips"
      );

    function _createChip(text, optionVal) {
      var fragment = document.createDocumentFragment();
      var chip = document.createElement("div");
      chip.className = "select__choose-field__chips__chip chip removable";
      chip.setAttribute("data-option-value", optionVal);

      var chipText = document.createElement("span");
      chipText.className = "chip__text";
      chipText.appendChild(document.createTextNode(text));

      var chipRemoveButton = document.createElement("button");
      chipRemoveButton.className = "chip__remove";
      chipRemoveButton.innerHTML =
        '<div class="chip__remove__icon">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
        '<path class="fill" d="M9,8l1.93-1.93a.68.68,0,1,0-1-1L8,7,6.07,5.11a.68.68,0,1,0-1,1L7,8,5.11,9.93a.67.67,0,0,0,0,1,.68.68,0,0,0,1,0L8,9l1.93,1.93a.68.68,0,0,0,1,0,.67.67,0,0,0,0-1Z" style="fill-rule:evenodd"/>' +
        "</svg></div>";

      chip.appendChild(chipText);
      chip.appendChild(chipRemoveButton);
      fragment.appendChild(chip);

      return fragment;
    }

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

        var emptyStatement = document.createElement("div");
        emptyStatement.className =
          "select__dropdown__options__empty-statement select-empty-statement hide";
        emptyStatement.appendChild(
          document.createTextNode("هیچ موردی یافت نشد!")
        );

        dropdownOptions.appendChild(emptyStatement);

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
              optionGroup.className =
                "select__dropdown__options__option-group select-optgroup";

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

    function _removeValue(value) {
      if (_state.values.length) {
        _state.values.forEach(function(v, index) {
          if (v === value) {
            _state.values.splice(index, 1);
            var nativeOption = _nativeOptions.options.byId[value];
            if (nativeOption) nativeOption.selected = false;
          }
        });
      }

      _dispatchEvent(_inputElement, "change");
    }

    function _updateValue(value) {
      if (!_settings.isMultiple) {
        _state.value = value;
        _parentElement.setAttribute("data-value", _state.value);

        var nativeOption = _nativeOptions.options.byId[value];
        if (nativeOption) {
          value
            ? (nativeOption.selected = true)
            : (nativeOption.selected = false);
        }
      } else {
        if (_isArray(value)) {
          _state.values = value;

          _nativeOptions.options.allIds.forEach(function(vID) {
            var nativeOption = _nativeOptions.options.byId[vID];
            if (nativeOption)
              value === vID
                ? (nativeOption.selected = true)
                : (nativeOption.selected = false);
          });
        } else {
          var values = [];

          _state.selected.forEach(function(item) {
            values.push(item.getAttribute("data-value"));

            var nativeOption = _nativeOptions.options.byId[value];
            if (nativeOption) nativeOption.selected = true;
          });

          _state.values = values;
        }
      }

      _dispatchEvent(_inputElement, "change");
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
              var id = node.value || node.getAttribute("value") || "empty";

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
                        "empty";

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

    function _getSelectedOptionInfo(optionVal) {
      var info = null;
      var mimicedOptions = _mimicedOptions.byId[optionVal];

      if (_state.selected.length) {
        _state.selected.forEach(function(option, index) {
          if (option === mimicedOptions)
            info = { element: option, index: index };
        });
      }

      return info;
    }

    function _getChip(optionVal) {
      var requestedChip = null;

      _chipsContainer
        .querySelectorAll(".select__choose-field__chips__chip")
        .forEach(function(chip) {
          if (chip.getAttribute("data-option-value") === optionVal)
            requestedChip = chip;
        });

      return requestedChip;
    }

    function _optionClickListener() {
      var optionText = this.querySelector(".option-text").textContent;
      var optionValue = this.getAttribute("data-value");

      var selectOption = function(option) {
        var nextOptionIndex = _state.selected.length;

        _state.selected.push(option);
        _updateValue(optionValue);
        _addClass(option, "selected");
        _addClass(_fieldElement, "selected");
        if (!_settings.isMultiple) {
          _textElement.textContent = optionText;
        } else {
          var chip = _createChip(optionText, optionValue);

          _addClass(_textElement, "hide");
          _attachEvent(
            chip.querySelector(".chip__remove"),
            "click",
            _chipRemoveListener
          );
          _removeClass(_chipsContainer, "hide");
          _chipsContainer.appendChild(chip);
        }
      };

      var deselect = function(option, index) {
        _state.selected.splice(index, 1);
        _removeClass(option, "selected");

        var optionValue = option.getAttribute("data-value");
        var chip = _getChip(optionValue);
        _chipsContainer.removeChild(chip);
        _removeValue(optionValue);

        if (!_state.selected.length) {
          _removeClass(_fieldElement, "selected");
          _textElement.textContent = _placeholder;
          _removeClass(_textElement, "hide");
          if (_settings.isMultiple) _addClass(_chipsContainer, "hide");
          else _updateValue("");
        }
      };

      var indexOfObject = _state.selected.indexOf(this);
      if (!_settings.isMultiple) {
        if (indexOfObject < 0) {
          if (!_state.selected.length) selectOption(this);
          else {
            _removeClass(_state.selected.splice(0)[0], "selected");
            selectOption(this);
          }
        }
      } else {
        if (indexOfObject < 0) selectOption(this);
        else deselect(this, indexOfObject);
      }
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

      _mimicedOptions.allIds.forEach(function(id) {
        _removeClass(_mimicedOptions.byId[id], "selected");
      });

      _updateValue("");
      _removeClass(_fieldElement, "selected");
      _textElement.textContent = _placeholder;
    }

    function _showEmptyStatement() {
      _removeClass(_emptyStatement, "hide");
    }

    function _hideEmptyStatement() {
      _addClass(_emptyStatement, "hide");
    }

    function _searchChildrens(query, parent) {
      var foundOption = false;

      if (parent.childNodes && parent.childNodes.length) {
        var nodes = parent.childNodes;

        nodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (_hasClass(node, "select-option")) {
              var optionText = node.querySelector(".option-text").textContent;
              if (optionText.indexOf(query) > -1) {
                _removeClass(node, "hide");
                foundOption = true;
              } else _addClass(node, "hide");
            } else if (_hasClass(node, "select-optgroup"))
              foundOption = _searchChildrens(query, node) || foundOption;
          }
        });
      }

      if (foundOption && _hasClass(parent, "select-optgroup"))
        _removeClass(parent, "hide");
      else if (!foundOption && _hasClass(parent, "select-optgroup"))
        _addClass(parent, "hide");

      return foundOption;
    }

    function _chipRemoveListener(evt) {
      var e = evt || window.event;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      var chip = this.parentNode;
      var optionValue = chip.getAttribute("data-option-value");
      var optionInfo = _getSelectedOptionInfo(optionValue);

      var splicedOption = _state.selected.splice(optionInfo.index, 1)[0];
      _removeClass(splicedOption, "selected");

      if (!_state.selected.length) {
        _removeClass(_fieldElement, "selected");
        _textElement.textContent = _placeholder;
        _removeClass(_textElement, "hide");
        _addClass(_chipsContainer, "hide");
      }

      _removeValue(optionValue);
      _detachEvent(this, "click", _chipRemoveListener);
      _chipsContainer.removeChild(chip);
    }

    function _searchInputListener(evt) {
      var e = evt || window.event;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      var foundOption = _searchChildrens(
        this.value,
        _dropdownElement.querySelector(".select__dropdown__options")
      );

      if (foundOption) _hideEmptyStatement();
      else _showEmptyStatement();
    }

    function _toggleDropdown(evt) {
      var isNotClearButton = function(element) {
        return !_closest(element, ".select__choose-field__clear");
      };

      var isNotChipRemoveButton = function(element) {
        return !_closest(element, ".chip__remove");
      };

      var e = evt || window.event;
      var eventTarget = e.target || e.srcElement;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      if (isNotClearButton(eventTarget) && isNotChipRemoveButton(eventTarget)) {
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

    function _isArray(object) {
      if (!Array.isArray) {
        Array.isArray = function(object) {
          return Object.prototype.toString.call(object) === "[object Array]";
        };
      }

      return Array.isArray(object);
    }

    function _removeChilds(parent) {
      if (parent.childNodes && parent.childNodes.length) {
        var child = parent.firstChild;

        while (child) {
          parent.removeChild(child);
          child = parent.firstChild;
        }
      }
    }

    // Initialization
    (function() {
      _textElement.textContent = _placeholder;

      _parentElement.appendChild(_createDropdown());

      var _unitText = _parentElement.getAttribute("data-unit");
      if (_unitText) _fieldElement.appendChild(_createUnit(_unitText));

      _dropdownElement = _parentElement.querySelector(".select__dropdown");
      _optionElements = _dropdownElement.querySelectorAll(".select-option");
      _emptyStatement = _dropdownElement.querySelector(
        ".select-empty-statement"
      );

      _optionElements.forEach(function(option) {
        _attachEvent(option, "click", _optionClickListener);
      });

      _attachEvent(_fieldElement, "click", _toggleDropdown);

      if (!_settings.isMultiple)
        _attachEvent(_clearFieldElement, "click", _clearClickListener);

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
        return _settings.isMultiple ? _state.values : _state.value;
      },
      setValue: function(value) {
        if (!_isArray(value)) {
          if (
            !_mimicedOptions.byId[value] &&
            _nativeOptions.options.byId[value]
          ) {
            _state.selected.forEach(function(item) {
              _removeClass(item, "selected");
            });
            _state.selected = [];
            _removeClass(_fieldElement, "selected");
            _textElement.textContent = _placeholder;

            if (_settings.isMultiple) {
              _removeClass(_textElement, "hide");
              _addClass(_chipsContainer, "hide");
              _removeChilds(_chipsContainer);
            }

            if (_settings.isMultiple) _updateValue([]);
            else _updateValue("");
          } else {
            var option = _mimicedOptions.byId[value];
            var optionText = option.querySelector(".option-text").textContent;
            var optionValue = option.getAttribute("data-value");

            _state.selected.forEach(function(item) {
              _removeClass(item, "selected");
            });
            _state.selected = [];
            _removeChilds(_chipsContainer);

            var chip = _createChip(optionText, optionValue);
            _attachEvent(
              chip.querySelector(".chip__remove"),
              "click",
              _chipRemoveListener
            );
            _chipsContainer.appendChild(chip);

            _state.selected.push(option);
            _updateValue(value);
            _addClass(option, "selected");
            _addClass(_fieldElement, "selected");
            if (_settings.isMultiple) {
              _addClass(_textElement, "hide");
              _removeClass(_chipsContainer, "hide");
            } else _textElement.textContent = optionText;
          }
        } else if (_settings.isMultiple) {
          _state.selected.forEach(function(item) {
            _removeClass(item, "selected");
          });
          _state.selected = [];
          _updateValue(value);
          _addClass(_fieldElement, "selected");
          _addClass(_textElement, "hide");
          _removeClass(_chipsContainer, "hide");
          _removeChilds(_chipsContainer);

          value.forEach(function(v) {
            var option = _mimicedOptions.byId[v];
            var optionText = option.querySelector(".option-text").textContent;
            var chip = _createChip(optionText, v);

            _state.selected.push(option);
            _addClass(option, "selected");
            _attachEvent(
              chip.querySelector(".chip__remove"),
              "click",
              _chipRemoveListener
            );
            _chipsContainer.appendChild(chip);
          });
        } else {
          throw Error("The entered value is invalid!");
        }
      }
    };
  };
});
