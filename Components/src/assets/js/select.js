(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./sonnat.dev.utils"));
  } else root.select = factory(root._);
})(typeof self !== "undefined" ? self : this, function(_) {
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

    var _settings = _.extend(
      {
        isSearchable: _.hasClass(_parentElement, "searchable"),
        isMultiple: _.hasClass(_parentElement, "multiple")
      },
      opts,
      true
    );

    if (_settings.isMultiple)
      _chipsContainer = _fieldElement.querySelector(
        ".select__choose-field__chips"
      );

    function _initialSelection() {
      var shouldBeSelected, prevSelected;
      _nativeOptions.options.allIds.forEach(function(vID) {
        var nativeOption = _nativeOptions.options.byId[vID];
        if (nativeOption.selected && !_settings.isMultiple) {
          if (prevSelected) prevSelected.selected = false;
          prevSelected = nativeOption;
          shouldBeSelected = vID;
        } else if (nativeOption.selected && _settings.isMultiple) {
          if (!shouldBeSelected) shouldBeSelected = [];
          shouldBeSelected.push(vID);
        }
      });

      if (shouldBeSelected) _setValue(shouldBeSelected);
    }

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
        '<div class="chip__remove__icon sonnat-icon sonnat-icon-remove-o"></div>';

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
          '<div class="text-field__icon sonnat-icon sonnat-icon-search-o"></div></div></div>';

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

              if (opt.disabled) option.className += " disabled";

              var span = document.createElement("span");
              span.className =
                "select__dropdown__options__option__text option-text";
              span.appendChild(document.createTextNode(opt.textContent));

              if (_settings.isMultiple) {
                var optionIcon = document.createElement("div");
                optionIcon.className =
                  "select__dropdown__options__option__icon option-icon sonnat-icon sonnat-icon-check-o";
                option.appendChild(optionIcon);
              }

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

                    if (innerOpt.disabled) option.className += " disabled";

                    var span = document.createElement("span");
                    span.className =
                      "select__dropdown__options__option-group__option__text option-text";
                    span.appendChild(
                      document.createTextNode(innerOpt.textContent)
                    );

                    if (_settings.isMultiple) {
                      var optionIcon = document.createElement("div");
                      optionIcon.className =
                        "select__dropdown__options__option__icon option-icon";
                      optionIcon.innerHTML =
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
                        '<path class="fill" d="M10.72,16a1,1,0,0,1-.71-.29l-2.9-2.9a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0l2.2,2.19,5-5a1,1,0,0,1,1.41,0,1,1,0,0,1,0,1.41l-5.76,5.77A1,1,0,0,1,10.72,16Z" /></svg>';
                      option.appendChild(optionIcon);
                    }

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

      _.dispatchEvent(_inputElement, "change");
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
        if (_.isArray(value)) {
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

      _.dispatchEvent(_inputElement, "change");
    }

    function _getNativeOptions() {
      var childsInOrder = [];
      var nativeOptions = { byId: {}, allIds: [] };

      if (_inputElement.childNodes && _inputElement.childNodes.length) {
        var nodes = _inputElement.childNodes;

        nodes.forEach(function(node) {
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

                innerNodes.forEach(function(innerNode) {
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
                });
              }
            }
          }
        });
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
        _.addClass(option, "selected");
        _.addClass(_fieldElement, "selected");
        if (!_settings.isMultiple) {
          _textElement.textContent = optionText;
          _hideDropdown();
        } else {
          var chip = _createChip(optionText, optionValue);

          _.addClass(_textElement, "hide");
          _.attachEvent(
            chip.querySelector(".chip__remove"),
            "click",
            _chipRemoveListener
          );
          _.removeClass(_chipsContainer, "hide");
          _chipsContainer.appendChild(chip);
        }
      };

      var deselect = function(option, index) {
        _state.selected.splice(index, 1);
        _.removeClass(option, "selected");

        var optionValue = option.getAttribute("data-value");
        var chip = _getChip(optionValue);
        _chipsContainer.removeChild(chip);
        _removeValue(optionValue);

        if (!_state.selected.length) {
          _.removeClass(_fieldElement, "selected");
          _textElement.textContent = _placeholder;
          _.removeClass(_textElement, "hide");
          if (_settings.isMultiple) _.addClass(_chipsContainer, "hide");
          else _updateValue("");
        }
      };

      var indexOfObject = _state.selected.indexOf(this);
      if (!_settings.isMultiple) {
        if (indexOfObject < 0) {
          if (!_state.selected.length) selectOption(this);
          else {
            _.removeClass(_state.selected.splice(0)[0], "selected");
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
        !_.closest(eventTarget, ".select__dropdown") &&
        isVisible(_dropdownElement)
      )
        _hideDropdown();
    }

    function _clearClickListener(evt) {
      var e = evt || window.event;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      _mimicedOptions.allIds.forEach(function(id) {
        _.removeClass(_mimicedOptions.byId[id], "selected");
      });

      _updateValue("");
      _.removeClass(_fieldElement, "selected");
      _textElement.textContent = _placeholder;
    }

    function _showEmptyStatement() {
      _.removeClass(_emptyStatement, "hide");
    }

    function _hideEmptyStatement() {
      _.addClass(_emptyStatement, "hide");
    }

    function _searchChildrens(query, parent) {
      var foundOption = false;

      if (parent.childNodes && parent.childNodes.length) {
        var nodes = parent.childNodes;

        nodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (_.hasClass(node, "select-option")) {
              var optionText = node.querySelector(".option-text").textContent;
              if (optionText.indexOf(query) > -1) {
                _.removeClass(node, "hide");
                foundOption = true;
              } else _.addClass(node, "hide");
            } else if (_.hasClass(node, "select-optgroup"))
              foundOption = _searchChildrens(query, node) || foundOption;
          }
        });
      }

      if (foundOption && _.hasClass(parent, "select-optgroup"))
        _.removeClass(parent, "hide");
      else if (!foundOption && _.hasClass(parent, "select-optgroup"))
        _.addClass(parent, "hide");

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
      _.removeClass(splicedOption, "selected");

      if (!_state.selected.length) {
        _.removeClass(_fieldElement, "selected");
        _textElement.textContent = _placeholder;
        _.removeClass(_textElement, "hide");
        _.addClass(_chipsContainer, "hide");
      }

      _removeValue(optionValue);
      _.detachEvent(this, "click", _chipRemoveListener);
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
        return !_.closest(element, ".select__choose-field__clear");
      };

      var isNotChipRemoveButton = function(element) {
        return !_.closest(element, ".chip__remove");
      };

      var e = evt || window.event;
      var eventTarget = e.target || e.srcElement;

      if (e.preventDefault) e.preventDefault();
      else e.returnValue = null;

      if (isNotClearButton(eventTarget) && isNotChipRemoveButton(eventTarget)) {
        if (_.hasClass(_dropdownElement, "show")) _hideDropdown();
        else _showDropdown();
      }
    }

    function _showDropdown() {
      _.attachEvent(document, "click", _outsideClickListener);
      setTimeout(function() {
        _.addClass(_dropdownElement, "show");
        _.addClass(_parentElement, "dropdown--open");
      }, 0);
    }

    function _hideDropdown() {
      _.detachEvent(document, "click", _outsideClickListener);
      setTimeout(function() {
        _.removeClass(_dropdownElement, "show");
        _.removeClass(_parentElement, "dropdown--open");
      }, 0);
    }

    function _getValue() {
      return _settings.isMultiple ? _state.values : _state.value;
    }

    function _setValue(value) {
      if (!_.isArray(value)) {
        if (
          !_mimicedOptions.byId[value] &&
          _nativeOptions.options.byId[value]
        ) {
          _state.selected.forEach(function(item) {
            _.removeClass(item, "selected");
          });
          _state.selected = [];
          _.removeClass(_fieldElement, "selected");
          _textElement.textContent = _placeholder;

          if (_settings.isMultiple) {
            _.removeClass(_textElement, "hide");
            _.addClass(_chipsContainer, "hide");
            _.removeChilds(_chipsContainer);
          }

          if (_settings.isMultiple) _updateValue([]);
          else _updateValue("");
        } else {
          var option = _mimicedOptions.byId[value];
          var optionText = option.querySelector(".option-text").textContent;
          var optionValue = option.getAttribute("data-value");

          _state.selected.forEach(function(item) {
            _.removeClass(item, "selected");
          });
          _state.selected = [];
          if (_settings.isMultiple) {
            _.removeChilds(_chipsContainer);

            var chip = _createChip(optionText, optionValue);
            _.attachEvent(
              chip.querySelector(".chip__remove"),
              "click",
              _chipRemoveListener
            );
            _chipsContainer.appendChild(chip);
          }

          _state.selected.push(option);
          _updateValue(value);
          _.addClass(option, "selected");
          _.addClass(_fieldElement, "selected");
          if (_settings.isMultiple) {
            _.addClass(_textElement, "hide");
            _.removeClass(_chipsContainer, "hide");
          } else _textElement.textContent = optionText;
        }
      } else if (_settings.isMultiple) {
        _state.selected.forEach(function(item) {
          _.removeClass(item, "selected");
        });
        _state.selected = [];
        _updateValue(value);
        _.addClass(_fieldElement, "selected");
        _.addClass(_textElement, "hide");
        _.removeClass(_chipsContainer, "hide");
        _.removeChilds(_chipsContainer);

        value.forEach(function(v) {
          var option = _mimicedOptions.byId[v];
          var optionText = option.querySelector(".option-text").textContent;
          var chip = _createChip(optionText, v);

          _state.selected.push(option);
          _.addClass(option, "selected");
          _.attachEvent(
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

      _initialSelection();

      _optionElements.forEach(function(option) {
        _.attachEvent(option, "click", _optionClickListener);
      });

      _.attachEvent(_fieldElement, "click", _toggleDropdown);

      if (!_settings.isMultiple)
        _.attachEvent(_clearFieldElement, "click", _clearClickListener);

      if (_settings.onchange)
        _.attachEvent(_inputElement, "change", opts.onchange);

      if (_settings.isSearchable) {
        _dropdownSearch = _dropdownElement.querySelector(".text-field__input");
        _.attachEvent(_dropdownSearch, "input", _searchInputListener);
      }
    })();

    // Public Fields and Methods
    return {
      getValue: _getValue,
      setValue: _setValue
    };
  };
});
