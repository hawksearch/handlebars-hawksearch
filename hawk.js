// handlebars -f templatesCompile.js  templates/
//////////////////////////////////////HELPER METHODS///////////////////////////////////////

(function(factory) {
  if (typeof define === "function" && define.amd) {
      // AMD. Register as an anonymous module.
      define([], factory);
  } else if (typeof exports === "object") {
      // Node/CommonJS
      module.exports = factory();
  } else {
      // Browser globals
      window.noUiSlider = factory();
  }
})(function() {
  "use strict";

  var VERSION = "14.6.1";

  //region Helper Methods

  function isValidFormatter(entry) {
      return typeof entry === "object" && typeof entry.to === "function" && typeof entry.from === "function";
  }

  function removeElement(el) {
      el.parentElement.removeChild(el);
  }

  function isSet(value) {
      return value !== null && value !== undefined;
  }

  // Bindable version
  function preventDefault(e) {
      e.preventDefault();
  }

  // Removes duplicates from an array.
  function unique(array) {
      return array.filter(function(a) {
          return !this[a] ? (this[a] = true) : false;
      }, {});
  }

  // Round a value to the closest 'to'.
  function closest(value, to) {
      return Math.round(value / to) * to;
  }

  // Current position of an element relative to the document.
  function offset(elem, orientation) {
      var rect = elem.getBoundingClientRect();
      var doc = elem.ownerDocument;
      var docElem = doc.documentElement;
      var pageOffset = getPageOffset(doc);

      // getBoundingClientRect contains left scroll in Chrome on Android.
      // I haven't found a feature detection that proves this. Worst case
      // scenario on mis-match: the 'tap' feature on horizontal sliders breaks.
      if (/webkit.*Chrome.*Mobile/i.test(navigator.userAgent)) {
          pageOffset.x = 0;
      }

      return orientation
          ? rect.top + pageOffset.y - docElem.clientTop
          : rect.left + pageOffset.x - docElem.clientLeft;
  }

  // Checks whether a value is numerical.
  function isNumeric(a) {
      return typeof a === "number" && !isNaN(a) && isFinite(a);
  }

  // Sets a class and removes it after [duration] ms.
  function addClassFor(element, className, duration) {
      if (duration > 0) {
          addClass(element, className);
          setTimeout(function() {
              removeClass(element, className);
          }, duration);
      }
  }

  // Limits a value to 0 - 100
  function limit(a) {
      return Math.max(Math.min(a, 100), 0);
  }

  // Wraps a variable as an array, if it isn't one yet.
  // Note that an input array is returned by reference!
  function asArray(a) {
      return Array.isArray(a) ? a : [a];
  }

  // Counts decimals
  function countDecimals(numStr) {
      numStr = String(numStr);
      var pieces = numStr.split(".");
      return pieces.length > 1 ? pieces[1].length : 0;
  }

  // http://youmightnotneedjquery.com/#add_class
  function addClass(el, className) {
      if (el.classList && !/\s/.test(className)) {
          el.classList.add(className);
      } else {
          el.className += " " + className;
      }
  }

  // http://youmightnotneedjquery.com/#remove_class
  function removeClass(el, className) {
      if (el.classList && !/\s/.test(className)) {
          el.classList.remove(className);
      } else {
          el.className = el.className.replace(
              new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
              " "
          );
      }
  }

  // https://plainjs.com/javascript/attributes/adding-removing-and-testing-for-classes-9/
  function hasClass(el, className) {
      return el.classList
          ? el.classList.contains(className)
          : new RegExp("\\b" + className + "\\b").test(el.className);
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY#Notes
  function getPageOffset(doc) {
      var supportPageOffset = window.pageXOffset !== undefined;
      var isCSS1Compat = (doc.compatMode || "") === "CSS1Compat";
      var x = supportPageOffset
          ? window.pageXOffset
          : isCSS1Compat
              ? doc.documentElement.scrollLeft
              : doc.body.scrollLeft;
      var y = supportPageOffset
          ? window.pageYOffset
          : isCSS1Compat
              ? doc.documentElement.scrollTop
              : doc.body.scrollTop;

      return {
          x: x,
          y: y
      };
  }

  // we provide a function to compute constants instead
  // of accessing window.* as soon as the module needs it
  // so that we do not compute anything if not needed
  function getActions() {
      // Determine the events to bind. IE11 implements pointerEvents without
      // a prefix, which breaks compatibility with the IE10 implementation.
      return window.navigator.pointerEnabled
          ? {
                start: "pointerdown",
                move: "pointermove",
                end: "pointerup"
            }
          : window.navigator.msPointerEnabled
              ? {
                    start: "MSPointerDown",
                    move: "MSPointerMove",
                    end: "MSPointerUp"
                }
              : {
                    start: "mousedown touchstart",
                    move: "mousemove touchmove",
                    end: "mouseup touchend"
                };
  }

  // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
  // Issue #785
  function getSupportsPassive() {
      var supportsPassive = false;

      /* eslint-disable */
      try {
          var opts = Object.defineProperty({}, "passive", {
              get: function() {
                  supportsPassive = true;
              }
          });

          window.addEventListener("test", null, opts);
      } catch (e) {}
      /* eslint-enable */

      return supportsPassive;
  }

  function getSupportsTouchActionNone() {
      return window.CSS && CSS.supports && CSS.supports("touch-action", "none");
  }

  //endregion

  //region Range Calculation

  // Determine the size of a sub-range in relation to a full range.
  function subRangeRatio(pa, pb) {
      return 100 / (pb - pa);
  }

  // (percentage) How many percent is this value of this range?
  function fromPercentage(range, value, startRange) {
      return (value * 100) / (range[startRange + 1] - range[startRange]);
  }

  // (percentage) Where is this value on this range?
  function toPercentage(range, value) {
      return fromPercentage(range, range[0] < 0 ? value + Math.abs(range[0]) : value - range[0], 0);
  }

  // (value) How much is this percentage on this range?
  function isPercentage(range, value) {
      return (value * (range[1] - range[0])) / 100 + range[0];
  }

  function getJ(value, arr) {
      var j = 1;

      while (value >= arr[j]) {
          j += 1;
      }

      return j;
  }

  // (percentage) Input a value, find where, on a scale of 0-100, it applies.
  function toStepping(xVal, xPct, value) {
      if (value >= xVal.slice(-1)[0]) {
          return 100;
      }

      var j = getJ(value, xVal);
      var va = xVal[j - 1];
      var vb = xVal[j];
      var pa = xPct[j - 1];
      var pb = xPct[j];

      return pa + toPercentage([va, vb], value) / subRangeRatio(pa, pb);
  }

  // (value) Input a percentage, find where it is on the specified range.
  function fromStepping(xVal, xPct, value) {
      // There is no range group that fits 100
      if (value >= 100) {
          return xVal.slice(-1)[0];
      }

      var j = getJ(value, xPct);
      var va = xVal[j - 1];
      var vb = xVal[j];
      var pa = xPct[j - 1];
      var pb = xPct[j];

      return isPercentage([va, vb], (value - pa) * subRangeRatio(pa, pb));
  }

  // (percentage) Get the step that applies at a certain value.
  function getStep(xPct, xSteps, snap, value) {
      if (value === 100) {
          return value;
      }

      var j = getJ(value, xPct);
      var a = xPct[j - 1];
      var b = xPct[j];

      // If 'snap' is set, steps are used as fixed points on the slider.
      if (snap) {
          // Find the closest position, a or b.
          if (value - a > (b - a) / 2) {
              return b;
          }

          return a;
      }

      if (!xSteps[j - 1]) {
          return value;
      }

      return xPct[j - 1] + closest(value - xPct[j - 1], xSteps[j - 1]);
  }

  function handleEntryPoint(index, value, that) {
      var percentage;

      // Wrap numerical input in an array.
      if (typeof value === "number") {
          value = [value];
      }

      // Reject any invalid input, by testing whether value is an array.
      if (!Array.isArray(value)) {
          throw new Error("noUiSlider (" + VERSION + "): 'range' contains invalid value.");
      }

      // Covert min/max syntax to 0 and 100.
      if (index === "min") {
          percentage = 0;
      } else if (index === "max") {
          percentage = 100;
      } else {
          percentage = parseFloat(index);
      }

      // Check for correct input.
      if (!isNumeric(percentage) || !isNumeric(value[0])) {
          throw new Error("noUiSlider (" + VERSION + "): 'range' value isn't numeric.");
      }

      // Store values.
      that.xPct.push(percentage);
      that.xVal.push(value[0]);

      // NaN will evaluate to false too, but to keep
      // logging clear, set step explicitly. Make sure
      // not to override the 'step' setting with false.
      if (!percentage) {
          if (!isNaN(value[1])) {
              that.xSteps[0] = value[1];
          }
      } else {
          that.xSteps.push(isNaN(value[1]) ? false : value[1]);
      }

      that.xHighestCompleteStep.push(0);
  }

  function handleStepPoint(i, n, that) {
      // Ignore 'false' stepping.
      if (!n) {
          return;
      }

      // Step over zero-length ranges (#948);
      if (that.xVal[i] === that.xVal[i + 1]) {
          that.xSteps[i] = that.xHighestCompleteStep[i] = that.xVal[i];

          return;
      }

      // Factor to range ratio
      that.xSteps[i] =
          fromPercentage([that.xVal[i], that.xVal[i + 1]], n, 0) / subRangeRatio(that.xPct[i], that.xPct[i + 1]);

      var totalSteps = (that.xVal[i + 1] - that.xVal[i]) / that.xNumSteps[i];
      var highestStep = Math.ceil(Number(totalSteps.toFixed(3)) - 1);
      var step = that.xVal[i] + that.xNumSteps[i] * highestStep;

      that.xHighestCompleteStep[i] = step;
  }

  //endregion

  //region Spectrum

  function Spectrum(entry, snap, singleStep) {
      this.xPct = [];
      this.xVal = [];
      this.xSteps = [singleStep || false];
      this.xNumSteps = [false];
      this.xHighestCompleteStep = [];

      this.snap = snap;

      var index;
      var ordered = []; // [0, 'min'], [1, '50%'], [2, 'max']

      // Map the object keys to an array.
      for (index in entry) {
          if (entry.hasOwnProperty(index)) {
              ordered.push([entry[index], index]);
          }
      }

      // Sort all entries by value (numeric sort).
      if (ordered.length && typeof ordered[0][0] === "object") {
          ordered.sort(function(a, b) {
              return a[0][0] - b[0][0];
          });
      } else {
          ordered.sort(function(a, b) {
              return a[0] - b[0];
          });
      }

      // Convert all entries to subranges.
      for (index = 0; index < ordered.length; index++) {
          handleEntryPoint(ordered[index][1], ordered[index][0], this);
      }

      // Store the actual step values.
      // xSteps is sorted in the same order as xPct and xVal.
      this.xNumSteps = this.xSteps.slice(0);

      // Convert all numeric steps to the percentage of the subrange they represent.
      for (index = 0; index < this.xNumSteps.length; index++) {
          handleStepPoint(index, this.xNumSteps[index], this);
      }
  }

  Spectrum.prototype.getDistance = function(value) {
      var index;
      var distances = [];

      for (index = 0; index < this.xNumSteps.length - 1; index++) {
          // last "range" can't contain step size as it is purely an endpoint.
          var step = this.xNumSteps[index];

          if (step && (value / step) % 1 !== 0) {
              throw new Error(
                  "noUiSlider (" +
                      VERSION +
                      "): 'limit', 'margin' and 'padding' of " +
                      this.xPct[index] +
                      "% range must be divisible by step."
              );
          }

          // Calculate percentual distance in current range of limit, margin or padding
          distances[index] = fromPercentage(this.xVal, value, index);
      }

      return distances;
  };

  // Calculate the percentual distance over the whole scale of ranges.
  // direction: 0 = backwards / 1 = forwards
  Spectrum.prototype.getAbsoluteDistance = function(value, distances, direction) {
      var xPct_index = 0;

      // Calculate range where to start calculation
      if (value < this.xPct[this.xPct.length - 1]) {
          while (value > this.xPct[xPct_index + 1]) {
              xPct_index++;
          }
      } else if (value === this.xPct[this.xPct.length - 1]) {
          xPct_index = this.xPct.length - 2;
      }

      // If looking backwards and the value is exactly at a range separator then look one range further
      if (!direction && value === this.xPct[xPct_index + 1]) {
          xPct_index++;
      }

      var start_factor;
      var rest_factor = 1;

      var rest_rel_distance = distances[xPct_index];

      var range_pct = 0;

      var rel_range_distance = 0;
      var abs_distance_counter = 0;
      var range_counter = 0;

      // Calculate what part of the start range the value is
      if (direction) {
          start_factor = (value - this.xPct[xPct_index]) / (this.xPct[xPct_index + 1] - this.xPct[xPct_index]);
      } else {
          start_factor = (this.xPct[xPct_index + 1] - value) / (this.xPct[xPct_index + 1] - this.xPct[xPct_index]);
      }

      // Do until the complete distance across ranges is calculated
      while (rest_rel_distance > 0) {
          // Calculate the percentage of total range
          range_pct = this.xPct[xPct_index + 1 + range_counter] - this.xPct[xPct_index + range_counter];

          // Detect if the margin, padding or limit is larger then the current range and calculate
          if (distances[xPct_index + range_counter] * rest_factor + 100 - start_factor * 100 > 100) {
              // If larger then take the percentual distance of the whole range
              rel_range_distance = range_pct * start_factor;
              // Rest factor of relative percentual distance still to be calculated
              rest_factor = (rest_rel_distance - 100 * start_factor) / distances[xPct_index + range_counter];
              // Set start factor to 1 as for next range it does not apply.
              start_factor = 1;
          } else {
              // If smaller or equal then take the percentual distance of the calculate percentual part of that range
              rel_range_distance = ((distances[xPct_index + range_counter] * range_pct) / 100) * rest_factor;
              // No rest left as the rest fits in current range
              rest_factor = 0;
          }

          if (direction) {
              abs_distance_counter = abs_distance_counter - rel_range_distance;
              // Limit range to first range when distance becomes outside of minimum range
              if (this.xPct.length + range_counter >= 1) {
                  range_counter--;
              }
          } else {
              abs_distance_counter = abs_distance_counter + rel_range_distance;
              // Limit range to last range when distance becomes outside of maximum range
              if (this.xPct.length - range_counter >= 1) {
                  range_counter++;
              }
          }

          // Rest of relative percentual distance still to be calculated
          rest_rel_distance = distances[xPct_index + range_counter] * rest_factor;
      }

      return value + abs_distance_counter;
  };

  Spectrum.prototype.toStepping = function(value) {
      value = toStepping(this.xVal, this.xPct, value);

      return value;
  };

  Spectrum.prototype.fromStepping = function(value) {
      return fromStepping(this.xVal, this.xPct, value);
  };

  Spectrum.prototype.getStep = function(value) {
      value = getStep(this.xPct, this.xSteps, this.snap, value);

      return value;
  };

  Spectrum.prototype.getDefaultStep = function(value, isDown, size) {
      var j = getJ(value, this.xPct);

      // When at the top or stepping down, look at the previous sub-range
      if (value === 100 || (isDown && value === this.xPct[j - 1])) {
          j = Math.max(j - 1, 1);
      }

      return (this.xVal[j] - this.xVal[j - 1]) / size;
  };

  Spectrum.prototype.getNearbySteps = function(value) {
      var j = getJ(value, this.xPct);

      return {
          stepBefore: {
              startValue: this.xVal[j - 2],
              step: this.xNumSteps[j - 2],
              highestStep: this.xHighestCompleteStep[j - 2]
          },
          thisStep: {
              startValue: this.xVal[j - 1],
              step: this.xNumSteps[j - 1],
              highestStep: this.xHighestCompleteStep[j - 1]
          },
          stepAfter: {
              startValue: this.xVal[j],
              step: this.xNumSteps[j],
              highestStep: this.xHighestCompleteStep[j]
          }
      };
  };

  Spectrum.prototype.countStepDecimals = function() {
      var stepDecimals = this.xNumSteps.map(countDecimals);
      return Math.max.apply(null, stepDecimals);
  };

  // Outside testing
  Spectrum.prototype.convert = function(value) {
      return this.getStep(this.toStepping(value));
  };

  //endregion

  //region Options

  /*	Every input option is tested and parsed. This'll prevent
      endless validation in internal methods. These tests are
      structured with an item for every option available. An
      option can be marked as required by setting the 'r' flag.
      The testing function is provided with three arguments:
          - The provided value for the option;
          - A reference to the options object;
          - The name for the option;

      The testing function returns false when an error is detected,
      or true when everything is OK. It can also modify the option
      object, to make sure all values can be correctly looped elsewhere. */

  //region Defaults

  var defaultFormatter = {
      to: function(value) {
          return value !== undefined && value.toFixed(2);
      },
      from: Number
  };

  var cssClasses = {
      target: "target",
      base: "base",
      origin: "origin",
      handle: "handle",
      handleLower: "handle-lower",
      handleUpper: "handle-upper",
      touchArea: "touch-area",
      horizontal: "horizontal",
      vertical: "vertical",
      background: "background",
      connect: "connect",
      connects: "connects",
      ltr: "ltr",
      rtl: "rtl",
      textDirectionLtr: "txt-dir-ltr",
      textDirectionRtl: "txt-dir-rtl",
      draggable: "draggable",
      drag: "state-drag",
      tap: "state-tap",
      active: "active",
      tooltip: "tooltip",
      pips: "pips",
      pipsHorizontal: "pips-horizontal",
      pipsVertical: "pips-vertical",
      marker: "marker",
      markerHorizontal: "marker-horizontal",
      markerVertical: "marker-vertical",
      markerNormal: "marker-normal",
      markerLarge: "marker-large",
      markerSub: "marker-sub",
      value: "value",
      valueHorizontal: "value-horizontal",
      valueVertical: "value-vertical",
      valueNormal: "value-normal",
      valueLarge: "value-large",
      valueSub: "value-sub"
  };

  //endregion

  function validateFormat(entry) {
      // Any object with a to and from method is supported.
      if (isValidFormatter(entry)) {
          return true;
      }

      throw new Error("noUiSlider (" + VERSION + "): 'format' requires 'to' and 'from' methods.");
  }

  function testStep(parsed, entry) {
      if (!isNumeric(entry)) {
          throw new Error("noUiSlider (" + VERSION + "): 'step' is not numeric.");
      }

      // The step option can still be used to set stepping
      // for linear sliders. Overwritten if set in 'range'.
      parsed.singleStep = entry;
  }

  function testKeyboardPageMultiplier(parsed, entry) {
      if (!isNumeric(entry)) {
          throw new Error("noUiSlider (" + VERSION + "): 'keyboardPageMultiplier' is not numeric.");
      }

      parsed.keyboardPageMultiplier = entry;
  }

  function testKeyboardDefaultStep(parsed, entry) {
      if (!isNumeric(entry)) {
          throw new Error("noUiSlider (" + VERSION + "): 'keyboardDefaultStep' is not numeric.");
      }

      parsed.keyboardDefaultStep = entry;
  }

  function testRange(parsed, entry) {
      // Filter incorrect input.
      if (typeof entry !== "object" || Array.isArray(entry)) {
          throw new Error("noUiSlider (" + VERSION + "): 'range' is not an object.");
      }

      // Catch missing start or end.
      if (entry.min === undefined || entry.max === undefined) {
          throw new Error("noUiSlider (" + VERSION + "): Missing 'min' or 'max' in 'range'.");
      }

      // Catch equal start or end.
      // if (entry.min === entry.max) {
      //     throw new Error("noUiSlider (" + VERSION + "): 'range' 'min' and 'max' cannot be equal.");
      // }

      parsed.spectrum = new Spectrum(entry, parsed.snap, parsed.singleStep);
  }

  function testStart(parsed, entry) {
      entry = asArray(entry);

      // Validate input. Values aren't tested, as the public .val method
      // will always provide a valid location.
      if (!Array.isArray(entry) || !entry.length) {
          throw new Error("noUiSlider (" + VERSION + "): 'start' option is incorrect.");
      }

      // Store the number of handles.
      parsed.handles = entry.length;

      // When the slider is initialized, the .val method will
      // be called with the start options.
      parsed.start = entry;
  }

  function testSnap(parsed, entry) {
      // Enforce 100% stepping within subranges.
      parsed.snap = entry;

      if (typeof entry !== "boolean") {
          throw new Error("noUiSlider (" + VERSION + "): 'snap' option must be a boolean.");
      }
  }

  function testAnimate(parsed, entry) {
      // Enforce 100% stepping within subranges.
      parsed.animate = entry;

      if (typeof entry !== "boolean") {
          throw new Error("noUiSlider (" + VERSION + "): 'animate' option must be a boolean.");
      }
  }

  function testAnimationDuration(parsed, entry) {
      parsed.animationDuration = entry;

      if (typeof entry !== "number") {
          throw new Error("noUiSlider (" + VERSION + "): 'animationDuration' option must be a number.");
      }
  }

  function testConnect(parsed, entry) {
      var connect = [false];
      var i;

      // Map legacy options
      if (entry === "lower") {
          entry = [true, false];
      } else if (entry === "upper") {
          entry = [false, true];
      }

      // Handle boolean options
      if (entry === true || entry === false) {
          for (i = 1; i < parsed.handles; i++) {
              connect.push(entry);
          }

          connect.push(false);
      }

      // Reject invalid input
      else if (!Array.isArray(entry) || !entry.length || entry.length !== parsed.handles + 1) {
          throw new Error("noUiSlider (" + VERSION + "): 'connect' option doesn't match handle count.");
      } else {
          connect = entry;
      }

      parsed.connect = connect;
  }

  function testOrientation(parsed, entry) {
      // Set orientation to an a numerical value for easy
      // array selection.
      switch (entry) {
          case "horizontal":
              parsed.ort = 0;
              break;
          case "vertical":
              parsed.ort = 1;
              break;
          default:
              throw new Error("noUiSlider (" + VERSION + "): 'orientation' option is invalid.");
      }
  }

  function testMargin(parsed, entry) {
      if (!isNumeric(entry)) {
          throw new Error("noUiSlider (" + VERSION + "): 'margin' option must be numeric.");
      }

      // Issue #582
      if (entry === 0) {
          return;
      }

      parsed.margin = parsed.spectrum.getDistance(entry);
  }

  function testLimit(parsed, entry) {
      if (!isNumeric(entry)) {
          throw new Error("noUiSlider (" + VERSION + "): 'limit' option must be numeric.");
      }

      parsed.limit = parsed.spectrum.getDistance(entry);

      if (!parsed.limit || parsed.handles < 2) {
          throw new Error(
              "noUiSlider (" +
                  VERSION +
                  "): 'limit' option is only supported on linear sliders with 2 or more handles."
          );
      }
  }

  function testPadding(parsed, entry) {
      var index;

      if (!isNumeric(entry) && !Array.isArray(entry)) {
          throw new Error(
              "noUiSlider (" + VERSION + "): 'padding' option must be numeric or array of exactly 2 numbers."
          );
      }

      if (Array.isArray(entry) && !(entry.length === 2 || isNumeric(entry[0]) || isNumeric(entry[1]))) {
          throw new Error(
              "noUiSlider (" + VERSION + "): 'padding' option must be numeric or array of exactly 2 numbers."
          );
      }

      if (entry === 0) {
          return;
      }

      if (!Array.isArray(entry)) {
          entry = [entry, entry];
      }

      // 'getDistance' returns false for invalid values.
      parsed.padding = [parsed.spectrum.getDistance(entry[0]), parsed.spectrum.getDistance(entry[1])];

      for (index = 0; index < parsed.spectrum.xNumSteps.length - 1; index++) {
          // last "range" can't contain step size as it is purely an endpoint.
          if (parsed.padding[0][index] < 0 || parsed.padding[1][index] < 0) {
              throw new Error("noUiSlider (" + VERSION + "): 'padding' option must be a positive number(s).");
          }
      }

      var totalPadding = entry[0] + entry[1];
      var firstValue = parsed.spectrum.xVal[0];
      var lastValue = parsed.spectrum.xVal[parsed.spectrum.xVal.length - 1];

      if (totalPadding / (lastValue - firstValue) > 1) {
          throw new Error("noUiSlider (" + VERSION + "): 'padding' option must not exceed 100% of the range.");
      }
  }

  function testDirection(parsed, entry) {
      // Set direction as a numerical value for easy parsing.
      // Invert connection for RTL sliders, so that the proper
      // handles get the connect/background classes.
      switch (entry) {
          case "ltr":
              parsed.dir = 0;
              break;
          case "rtl":
              parsed.dir = 1;
              break;
          default:
              throw new Error("noUiSlider (" + VERSION + "): 'direction' option was not recognized.");
      }
  }

  function testBehaviour(parsed, entry) {
      // Make sure the input is a string.
      if (typeof entry !== "string") {
          throw new Error("noUiSlider (" + VERSION + "): 'behaviour' must be a string containing options.");
      }

      // Check if the string contains any keywords.
      // None are required.
      var tap = entry.indexOf("tap") >= 0;
      var drag = entry.indexOf("drag") >= 0;
      var fixed = entry.indexOf("fixed") >= 0;
      var snap = entry.indexOf("snap") >= 0;
      var hover = entry.indexOf("hover") >= 0;
      var unconstrained = entry.indexOf("unconstrained") >= 0;

      if (fixed) {
          if (parsed.handles !== 2) {
              throw new Error("noUiSlider (" + VERSION + "): 'fixed' behaviour must be used with 2 handles");
          }

          // Use margin to enforce fixed state
          testMargin(parsed, parsed.start[1] - parsed.start[0]);
      }

      if (unconstrained && (parsed.margin || parsed.limit)) {
          throw new Error(
              "noUiSlider (" + VERSION + "): 'unconstrained' behaviour cannot be used with margin or limit"
          );
      }

      parsed.events = {
          tap: tap || snap,
          drag: drag,
          fixed: fixed,
          snap: snap,
          hover: hover,
          unconstrained: unconstrained
      };
  }

  function testTooltips(parsed, entry) {
      if (entry === false) {
          return;
      }

      if (entry === true) {
          parsed.tooltips = [];

          for (var i = 0; i < parsed.handles; i++) {
              parsed.tooltips.push(true);
          }
      } else {
          parsed.tooltips = asArray(entry);

          if (parsed.tooltips.length !== parsed.handles) {
              throw new Error("noUiSlider (" + VERSION + "): must pass a formatter for all handles.");
          }

          parsed.tooltips.forEach(function(formatter) {
              if (
                  typeof formatter !== "boolean" &&
                  (typeof formatter !== "object" || typeof formatter.to !== "function")
              ) {
                  throw new Error("noUiSlider (" + VERSION + "): 'tooltips' must be passed a formatter or 'false'.");
              }
          });
      }
  }

  function testAriaFormat(parsed, entry) {
      parsed.ariaFormat = entry;
      validateFormat(entry);
  }

  function testFormat(parsed, entry) {
      parsed.format = entry;
      validateFormat(entry);
  }

  function testKeyboardSupport(parsed, entry) {
      parsed.keyboardSupport = entry;

      if (typeof entry !== "boolean") {
          throw new Error("noUiSlider (" + VERSION + "): 'keyboardSupport' option must be a boolean.");
      }
  }

  function testDocumentElement(parsed, entry) {
      // This is an advanced option. Passed values are used without validation.
      parsed.documentElement = entry;
  }

  function testCssPrefix(parsed, entry) {
      if (typeof entry !== "string" && entry !== false) {
          throw new Error("noUiSlider (" + VERSION + "): 'cssPrefix' must be a string or `false`.");
      }

      parsed.cssPrefix = entry;
  }

  function testCssClasses(parsed, entry) {
      if (typeof entry !== "object") {
          throw new Error("noUiSlider (" + VERSION + "): 'cssClasses' must be an object.");
      }

      if (typeof parsed.cssPrefix === "string") {
          parsed.cssClasses = {};

          for (var key in entry) {
              if (!entry.hasOwnProperty(key)) {
                  continue;
              }

              parsed.cssClasses[key] = parsed.cssPrefix + entry[key];
          }
      } else {
          parsed.cssClasses = entry;
      }
  }

  // Test all developer settings and parse to assumption-safe values.
  function testOptions(options) {
      // To prove a fix for #537, freeze options here.
      // If the object is modified, an error will be thrown.
      // Object.freeze(options);

      var parsed = {
          margin: 0,
          limit: 0,
          padding: 0,
          animate: true,
          animationDuration: 300,
          ariaFormat: defaultFormatter,
          format: defaultFormatter
      };

      // Tests are executed in the order they are presented here.
      var tests = {
          step: { r: false, t: testStep },
          keyboardPageMultiplier: { r: false, t: testKeyboardPageMultiplier },
          keyboardDefaultStep: { r: false, t: testKeyboardDefaultStep },
          start: { r: true, t: testStart },
          connect: { r: true, t: testConnect },
          direction: { r: true, t: testDirection },
          snap: { r: false, t: testSnap },
          animate: { r: false, t: testAnimate },
          animationDuration: { r: false, t: testAnimationDuration },
          range: { r: true, t: testRange },
          orientation: { r: false, t: testOrientation },
          margin: { r: false, t: testMargin },
          limit: { r: false, t: testLimit },
          padding: { r: false, t: testPadding },
          behaviour: { r: true, t: testBehaviour },
          ariaFormat: { r: false, t: testAriaFormat },
          format: { r: false, t: testFormat },
          tooltips: { r: false, t: testTooltips },
          keyboardSupport: { r: true, t: testKeyboardSupport },
          documentElement: { r: false, t: testDocumentElement },
          cssPrefix: { r: true, t: testCssPrefix },
          cssClasses: { r: true, t: testCssClasses }
      };

      var defaults = {
          connect: false,
          direction: "ltr",
          behaviour: "tap",
          orientation: "horizontal",
          keyboardSupport: true,
          cssPrefix: "noUi-",
          cssClasses: cssClasses,
          keyboardPageMultiplier: 5,
          keyboardDefaultStep: 10
      };

      // AriaFormat defaults to regular format, if any.
      if (options.format && !options.ariaFormat) {
          options.ariaFormat = options.format;
      }

      // Run all options through a testing mechanism to ensure correct
      // input. It should be noted that options might get modified to
      // be handled properly. E.g. wrapping integers in arrays.
      Object.keys(tests).forEach(function(name) {
          // If the option isn't set, but it is required, throw an error.
          if (!isSet(options[name]) && defaults[name] === undefined) {
              if (tests[name].r) {
                  throw new Error("noUiSlider (" + VERSION + "): '" + name + "' is required.");
              }

              return true;
          }

          tests[name].t(parsed, !isSet(options[name]) ? defaults[name] : options[name]);
      });

      // Forward pips options
      parsed.pips = options.pips;

      // All recent browsers accept unprefixed transform.
      // We need -ms- for IE9 and -webkit- for older Android;
      // Assume use of -webkit- if unprefixed and -ms- are not supported.
      // https://caniuse.com/#feat=transforms2d
      var d = document.createElement("div");
      var msPrefix = d.style.msTransform !== undefined;
      var noPrefix = d.style.transform !== undefined;

      parsed.transformRule = noPrefix ? "transform" : msPrefix ? "msTransform" : "webkitTransform";

      // Pips don't move, so we can place them using left/top.
      var styles = [["left", "top"], ["right", "bottom"]];

      parsed.style = styles[parsed.dir][parsed.ort];

      return parsed;
  }

  //endregion

  function scope(target, options, originalOptions) {
      var actions = getActions();
      var supportsTouchActionNone = getSupportsTouchActionNone();
      var supportsPassive = supportsTouchActionNone && getSupportsPassive();

      // All variables local to 'scope' are prefixed with 'scope_'

      // Slider DOM Nodes
      var scope_Target = target;
      var scope_Base;
      var scope_Handles;
      var scope_Connects;
      var scope_Pips;
      var scope_Tooltips;

      // Slider state values
      var scope_Spectrum = options.spectrum;
      var scope_Values = [];
      var scope_Locations = [];
      var scope_HandleNumbers = [];
      var scope_ActiveHandlesCount = 0;
      var scope_Events = {};

      // Exposed API
      var scope_Self;

      // Document Nodes
      var scope_Document = target.ownerDocument;
      var scope_DocumentElement = options.documentElement || scope_Document.documentElement;
      var scope_Body = scope_Document.body;

      // Pips constants
      var PIPS_NONE = -1;
      var PIPS_NO_VALUE = 0;
      var PIPS_LARGE_VALUE = 1;
      var PIPS_SMALL_VALUE = 2;

      // For horizontal sliders in standard ltr documents,
      // make .noUi-origin overflow to the left so the document doesn't scroll.
      var scope_DirOffset = scope_Document.dir === "rtl" || options.ort === 1 ? 0 : 100;

      // Creates a node, adds it to target, returns the new node.
      function addNodeTo(addTarget, className) {
          var div = scope_Document.createElement("div");

          if (className) {
              addClass(div, className);
          }

          addTarget.appendChild(div);

          return div;
      }

      // Append a origin to the base
      function addOrigin(base, handleNumber) {
          var origin = addNodeTo(base, options.cssClasses.origin);
          var handle = addNodeTo(origin, options.cssClasses.handle);

          addNodeTo(handle, options.cssClasses.touchArea);

          handle.setAttribute("data-handle", handleNumber);

          if (options.keyboardSupport) {
              // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
              // 0 = focusable and reachable
              handle.setAttribute("tabindex", "0");
              handle.addEventListener("keydown", function(event) {
                  return eventKeydown(event, handleNumber);
              });
          }

          handle.setAttribute("role", "slider");
          handle.setAttribute("aria-orientation", options.ort ? "vertical" : "horizontal");

          if (handleNumber === 0) {
              addClass(handle, options.cssClasses.handleLower);
          } else if (handleNumber === options.handles - 1) {
              addClass(handle, options.cssClasses.handleUpper);
          }

          return origin;
      }

      // Insert nodes for connect elements
      function addConnect(base, add) {
          if (!add) {
              return false;
          }

          return addNodeTo(base, options.cssClasses.connect);
      }

      // Add handles to the slider base.
      function addElements(connectOptions, base) {
          var connectBase = addNodeTo(base, options.cssClasses.connects);

          scope_Handles = [];
          scope_Connects = [];

          scope_Connects.push(addConnect(connectBase, connectOptions[0]));

          // [::::O====O====O====]
          // connectOptions = [0, 1, 1, 1]

          for (var i = 0; i < options.handles; i++) {
              // Keep a list of all added handles.
              scope_Handles.push(addOrigin(base, i));
              scope_HandleNumbers[i] = i;
              scope_Connects.push(addConnect(connectBase, connectOptions[i + 1]));
          }
      }

      // Initialize a single slider.
      function addSlider(addTarget) {
          // Apply classes and data to the target.
          addClass(addTarget, options.cssClasses.target);

          if (options.dir === 0) {
              addClass(addTarget, options.cssClasses.ltr);
          } else {
              addClass(addTarget, options.cssClasses.rtl);
          }

          if (options.ort === 0) {
              addClass(addTarget, options.cssClasses.horizontal);
          } else {
              addClass(addTarget, options.cssClasses.vertical);
          }

          var textDirection = getComputedStyle(addTarget).direction;

          if (textDirection === "rtl") {
              addClass(addTarget, options.cssClasses.textDirectionRtl);
          } else {
              addClass(addTarget, options.cssClasses.textDirectionLtr);
          }

          return addNodeTo(addTarget, options.cssClasses.base);
      }

      function addTooltip(handle, handleNumber) {
          if (!options.tooltips[handleNumber]) {
              return false;
          }

          return addNodeTo(handle.firstChild, options.cssClasses.tooltip);
      }

      function isSliderDisabled() {
          return scope_Target.hasAttribute("disabled");
      }

      // Disable the slider dragging if any handle is disabled
      function isHandleDisabled(handleNumber) {
          var handleOrigin = scope_Handles[handleNumber];
          return handleOrigin.hasAttribute("disabled");
      }

      function removeTooltips() {
          if (scope_Tooltips) {
              removeEvent("update.tooltips");
              scope_Tooltips.forEach(function(tooltip) {
                  if (tooltip) {
                      removeElement(tooltip);
                  }
              });
              scope_Tooltips = null;
          }
      }

      // The tooltips option is a shorthand for using the 'update' event.
      function tooltips() {
          removeTooltips();

          // Tooltips are added with options.tooltips in original order.
          scope_Tooltips = scope_Handles.map(addTooltip);

          bindEvent("update.tooltips", function(values, handleNumber, unencoded) {
              if (!scope_Tooltips[handleNumber]) {
                  return;
              }

              var formattedValue = values[handleNumber];

              if (options.tooltips[handleNumber] !== true) {
                  formattedValue = options.tooltips[handleNumber].to(unencoded[handleNumber]);
              }

              scope_Tooltips[handleNumber].innerHTML = formattedValue;
          });
      }

      function aria() {
          bindEvent("update", function(values, handleNumber, unencoded, tap, positions) {
              // Update Aria Values for all handles, as a change in one changes min and max values for the next.
              scope_HandleNumbers.forEach(function(index) {
                  var handle = scope_Handles[index];

                  var min = checkHandlePosition(scope_Locations, index, 0, true, true, true);
                  var max = checkHandlePosition(scope_Locations, index, 100, true, true, true);

                  var now = positions[index];

                  // Formatted value for display
                  var text = options.ariaFormat.to(unencoded[index]);

                  // Map to slider range values
                  min = scope_Spectrum.fromStepping(min).toFixed(1);
                  max = scope_Spectrum.fromStepping(max).toFixed(1);
                  now = scope_Spectrum.fromStepping(now).toFixed(1);

                  handle.children[0].setAttribute("aria-valuemin", min);
                  handle.children[0].setAttribute("aria-valuemax", max);
                  handle.children[0].setAttribute("aria-valuenow", now);
                  handle.children[0].setAttribute("aria-valuetext", text);
              });
          });
      }

      function getGroup(mode, values, stepped) {
          // Use the range.
          if (mode === "range" || mode === "steps") {
              return scope_Spectrum.xVal;
          }

          if (mode === "count") {
              if (values < 2) {
                  throw new Error("noUiSlider (" + VERSION + "): 'values' (>= 2) required for mode 'count'.");
              }

              // Divide 0 - 100 in 'count' parts.
              var interval = values - 1;
              var spread = 100 / interval;

              values = [];

              // List these parts and have them handled as 'positions'.
              while (interval--) {
                  values[interval] = interval * spread;
              }

              values.push(100);

              mode = "positions";
          }

          if (mode === "positions") {
              // Map all percentages to on-range values.
              return values.map(function(value) {
                  return scope_Spectrum.fromStepping(stepped ? scope_Spectrum.getStep(value) : value);
              });
          }

          if (mode === "values") {
              // If the value must be stepped, it needs to be converted to a percentage first.
              if (stepped) {
                  return values.map(function(value) {
                      // Convert to percentage, apply step, return to value.
                      return scope_Spectrum.fromStepping(scope_Spectrum.getStep(scope_Spectrum.toStepping(value)));
                  });
              }

              // Otherwise, we can simply use the values.
              return values;
          }
      }

      function generateSpread(density, mode, group) {
          function safeIncrement(value, increment) {
              // Avoid floating point variance by dropping the smallest decimal places.
              return (value + increment).toFixed(7) / 1;
          }

          var indexes = {};
          var firstInRange = scope_Spectrum.xVal[0];
          var lastInRange = scope_Spectrum.xVal[scope_Spectrum.xVal.length - 1];
          var ignoreFirst = false;
          var ignoreLast = false;
          var prevPct = 0;

          // Create a copy of the group, sort it and filter away all duplicates.
          group = unique(
              group.slice().sort(function(a, b) {
                  return a - b;
              })
          );

          // Make sure the range starts with the first element.
          if (group[0] !== firstInRange) {
              group.unshift(firstInRange);
              ignoreFirst = true;
          }

          // Likewise for the last one.
          if (group[group.length - 1] !== lastInRange) {
              group.push(lastInRange);
              ignoreLast = true;
          }

          group.forEach(function(current, index) {
              // Get the current step and the lower + upper positions.
              var step;
              var i;
              var q;
              var low = current;
              var high = group[index + 1];
              var newPct;
              var pctDifference;
              var pctPos;
              var type;
              var steps;
              var realSteps;
              var stepSize;
              var isSteps = mode === "steps";

              // When using 'steps' mode, use the provided steps.
              // Otherwise, we'll step on to the next subrange.
              if (isSteps) {
                  step = scope_Spectrum.xNumSteps[index];
              }

              // Default to a 'full' step.
              if (!step) {
                  step = high - low;
              }

              // Low can be 0, so test for false. Index 0 is already handled.
              if (low === false) {
                  return;
              }

              // If high is undefined we are at the last subrange. Make sure it iterates once (#1088)
              if (high === undefined) {
                  high = low;
              }

              // Make sure step isn't 0, which would cause an infinite loop (#654)
              step = Math.max(step, 0.0000001);

              // Find all steps in the subrange.
              for (i = low; i <= high; i = safeIncrement(i, step)) {
                  // Get the percentage value for the current step,
                  // calculate the size for the subrange.
                  newPct = scope_Spectrum.toStepping(i);
                  pctDifference = newPct - prevPct;

                  steps = pctDifference / density;
                  realSteps = Math.round(steps);

                  // This ratio represents the amount of percentage-space a point indicates.
                  // For a density 1 the points/percentage = 1. For density 2, that percentage needs to be re-divided.
                  // Round the percentage offset to an even number, then divide by two
                  // to spread the offset on both sides of the range.
                  stepSize = pctDifference / realSteps;

                  // Divide all points evenly, adding the correct number to this subrange.
                  // Run up to <= so that 100% gets a point, event if ignoreLast is set.
                  for (q = 1; q <= realSteps; q += 1) {
                      // The ratio between the rounded value and the actual size might be ~1% off.
                      // Correct the percentage offset by the number of points
                      // per subrange. density = 1 will result in 100 points on the
                      // full range, 2 for 50, 4 for 25, etc.
                      pctPos = prevPct + q * stepSize;
                      indexes[pctPos.toFixed(5)] = [scope_Spectrum.fromStepping(pctPos), 0];
                  }

                  // Determine the point type.
                  type = group.indexOf(i) > -1 ? PIPS_LARGE_VALUE : isSteps ? PIPS_SMALL_VALUE : PIPS_NO_VALUE;

                  // Enforce the 'ignoreFirst' option by overwriting the type for 0.
                  if (!index && ignoreFirst && i !== high) {
                      type = 0;
                  }

                  if (!(i === high && ignoreLast)) {
                      // Mark the 'type' of this point. 0 = plain, 1 = real value, 2 = step value.
                      indexes[newPct.toFixed(5)] = [i, type];
                  }

                  // Update the percentage count.
                  prevPct = newPct;
              }
          });

          return indexes;
      }

      function addMarking(spread, filterFunc, formatter) {
          var element = scope_Document.createElement("div");

          var valueSizeClasses = [];
          valueSizeClasses[PIPS_NO_VALUE] = options.cssClasses.valueNormal;
          valueSizeClasses[PIPS_LARGE_VALUE] = options.cssClasses.valueLarge;
          valueSizeClasses[PIPS_SMALL_VALUE] = options.cssClasses.valueSub;

          var markerSizeClasses = [];
          markerSizeClasses[PIPS_NO_VALUE] = options.cssClasses.markerNormal;
          markerSizeClasses[PIPS_LARGE_VALUE] = options.cssClasses.markerLarge;
          markerSizeClasses[PIPS_SMALL_VALUE] = options.cssClasses.markerSub;

          var valueOrientationClasses = [options.cssClasses.valueHorizontal, options.cssClasses.valueVertical];
          var markerOrientationClasses = [options.cssClasses.markerHorizontal, options.cssClasses.markerVertical];

          addClass(element, options.cssClasses.pips);
          addClass(element, options.ort === 0 ? options.cssClasses.pipsHorizontal : options.cssClasses.pipsVertical);

          function getClasses(type, source) {
              var a = source === options.cssClasses.value;
              var orientationClasses = a ? valueOrientationClasses : markerOrientationClasses;
              var sizeClasses = a ? valueSizeClasses : markerSizeClasses;

              return source + " " + orientationClasses[options.ort] + " " + sizeClasses[type];
          }

          function addSpread(offset, value, type) {
              // Apply the filter function, if it is set.
              type = filterFunc ? filterFunc(value, type) : type;

              if (type === PIPS_NONE) {
                  return;
              }

              // Add a marker for every point
              var node = addNodeTo(element, false);
              node.className = getClasses(type, options.cssClasses.marker);
              node.style[options.style] = offset + "%";

              // Values are only appended for points marked '1' or '2'.
              if (type > PIPS_NO_VALUE) {
                  node = addNodeTo(element, false);
                  node.className = getClasses(type, options.cssClasses.value);
                  node.setAttribute("data-value", value);
                  node.style[options.style] = offset + "%";
                  node.innerHTML = formatter.to(value);
              }
          }

          // Append all points.
          Object.keys(spread).forEach(function(offset) {
              addSpread(offset, spread[offset][0], spread[offset][1]);
          });

          return element;
      }

      function removePips() {
          if (scope_Pips) {
              removeElement(scope_Pips);
              scope_Pips = null;
          }
      }

      function pips(grid) {
          // Fix #669
          removePips();

          var mode = grid.mode;
          var density = grid.density || 1;
          var filter = grid.filter || false;
          var values = grid.values || false;
          var stepped = grid.stepped || false;
          var group = getGroup(mode, values, stepped);
          var spread = generateSpread(density, mode, group);
          var format = grid.format || {
              to: Math.round
          };

          scope_Pips = scope_Target.appendChild(addMarking(spread, filter, format));

          return scope_Pips;
      }

      // Shorthand for base dimensions.
      function baseSize() {
          var rect = scope_Base.getBoundingClientRect();
          var alt = "offset" + ["Width", "Height"][options.ort];
          return options.ort === 0 ? rect.width || scope_Base[alt] : rect.height || scope_Base[alt];
      }

      // Handler for attaching events trough a proxy.
      function attachEvent(events, element, callback, data) {
          // This function can be used to 'filter' events to the slider.
          // element is a node, not a nodeList

          var method = function(e) {
              e = fixEvent(e, data.pageOffset, data.target || element);

              // fixEvent returns false if this event has a different target
              // when handling (multi-) touch events;
              if (!e) {
                  return false;
              }

              // doNotReject is passed by all end events to make sure released touches
              // are not rejected, leaving the slider "stuck" to the cursor;
              if (isSliderDisabled() && !data.doNotReject) {
                  return false;
              }

              // Stop if an active 'tap' transition is taking place.
              if (hasClass(scope_Target, options.cssClasses.tap) && !data.doNotReject) {
                  return false;
              }

              // Ignore right or middle clicks on start #454
              if (events === actions.start && e.buttons !== undefined && e.buttons > 1) {
                  return false;
              }

              // Ignore right or middle clicks on start #454
              if (data.hover && e.buttons) {
                  return false;
              }

              // 'supportsPassive' is only true if a browser also supports touch-action: none in CSS.
              // iOS safari does not, so it doesn't get to benefit from passive scrolling. iOS does support
              // touch-action: manipulation, but that allows panning, which breaks
              // sliders after zooming/on non-responsive pages.
              // See: https://bugs.webkit.org/show_bug.cgi?id=133112
              if (!supportsPassive) {
                  e.preventDefault();
              }

              e.calcPoint = e.points[options.ort];

              // Call the event handler with the event [ and additional data ].
              callback(e, data);
          };

          var methods = [];

          // Bind a closure on the target for every event type.
          events.split(" ").forEach(function(eventName) {
              element.addEventListener(eventName, method, supportsPassive ? { passive: true } : false);
              methods.push([eventName, method]);
          });

          return methods;
      }

      // Provide a clean event with standardized offset values.
      function fixEvent(e, pageOffset, eventTarget) {
          // Filter the event to register the type, which can be
          // touch, mouse or pointer. Offset changes need to be
          // made on an event specific basis.
          var touch = e.type.indexOf("touch") === 0;
          var mouse = e.type.indexOf("mouse") === 0;
          var pointer = e.type.indexOf("pointer") === 0;

          var x;
          var y;

          // IE10 implemented pointer events with a prefix;
          if (e.type.indexOf("MSPointer") === 0) {
              pointer = true;
          }

          // The only thing one handle should be concerned about is the touches that originated on top of it.
          if (touch) {
              // Returns true if a touch originated on the target.
              var isTouchOnTarget = function(checkTouch) {
                  return (
                      checkTouch.target === eventTarget ||
                      eventTarget.contains(checkTouch.target) ||
                      (checkTouch.target.shadowRoot && checkTouch.target.shadowRoot.contains(eventTarget))
                  );
              };

              // In the case of touchstart events, we need to make sure there is still no more than one
              // touch on the target so we look amongst all touches.
              if (e.type === "touchstart") {
                  var targetTouches = Array.prototype.filter.call(e.touches, isTouchOnTarget);

                  // Do not support more than one touch per handle.
                  if (targetTouches.length > 1) {
                      return false;
                  }

                  x = targetTouches[0].pageX;
                  y = targetTouches[0].pageY;
              } else {
                  // In the other cases, find on changedTouches is enough.
                  var targetTouch = Array.prototype.find.call(e.changedTouches, isTouchOnTarget);

                  // Cancel if the target touch has not moved.
                  if (!targetTouch) {
                      return false;
                  }

                  x = targetTouch.pageX;
                  y = targetTouch.pageY;
              }
          }

          pageOffset = pageOffset || getPageOffset(scope_Document);

          if (mouse || pointer) {
              x = e.clientX + pageOffset.x;
              y = e.clientY + pageOffset.y;
          }

          e.pageOffset = pageOffset;
          e.points = [x, y];
          e.cursor = mouse || pointer; // Fix #435

          return e;
      }

      // Translate a coordinate in the document to a percentage on the slider
      function calcPointToPercentage(calcPoint) {
          var location = calcPoint - offset(scope_Base, options.ort);
          var proposal = (location * 100) / baseSize();

          // Clamp proposal between 0% and 100%
          // Out-of-bound coordinates may occur when .noUi-base pseudo-elements
          // are used (e.g. contained handles feature)
          proposal = limit(proposal);

          return options.dir ? 100 - proposal : proposal;
      }

      // Find handle closest to a certain percentage on the slider
      function getClosestHandle(clickedPosition) {
          var smallestDifference = 100;
          var handleNumber = false;

          scope_Handles.forEach(function(handle, index) {
              // Disabled handles are ignored
              if (isHandleDisabled(index)) {
                  return;
              }

              var handlePosition = scope_Locations[index];
              var differenceWithThisHandle = Math.abs(handlePosition - clickedPosition);

              // Initial state
              var clickAtEdge = differenceWithThisHandle === 100 && smallestDifference === 100;

              // Difference with this handle is smaller than the previously checked handle
              var isCloser = differenceWithThisHandle < smallestDifference;
              var isCloserAfter = differenceWithThisHandle <= smallestDifference && clickedPosition > handlePosition;

              if (isCloser || isCloserAfter || clickAtEdge) {
                  handleNumber = index;
                  smallestDifference = differenceWithThisHandle;
              }
          });

          return handleNumber;
      }

      // Fire 'end' when a mouse or pen leaves the document.
      function documentLeave(event, data) {
          if (event.type === "mouseout" && event.target.nodeName === "HTML" && event.relatedTarget === null) {
              eventEnd(event, data);
          }
      }

      // Handle movement on document for handle and range drag.
      function eventMove(event, data) {
          // Fix #498
          // Check value of .buttons in 'start' to work around a bug in IE10 mobile (data.buttonsProperty).
          // https://connect.microsoft.com/IE/feedback/details/927005/mobile-ie10-windows-phone-buttons-property-of-pointermove-event-always-zero
          // IE9 has .buttons and .which zero on mousemove.
          // Firefox breaks the spec MDN defines.
          if (navigator.appVersion.indexOf("MSIE 9") === -1 && event.buttons === 0 && data.buttonsProperty !== 0) {
              return eventEnd(event, data);
          }

          // Check if we are moving up or down
          var movement = (options.dir ? -1 : 1) * (event.calcPoint - data.startCalcPoint);

          // Convert the movement into a percentage of the slider width/height
          var proposal = (movement * 100) / data.baseSize;

          moveHandles(movement > 0, proposal, data.locations, data.handleNumbers);
      }

      // Unbind move events on document, call callbacks.
      function eventEnd(event, data) {
          // The handle is no longer active, so remove the class.
          if (data.handle) {
              removeClass(data.handle, options.cssClasses.active);
              scope_ActiveHandlesCount -= 1;
          }

          // Unbind the move and end events, which are added on 'start'.
          data.listeners.forEach(function(c) {
              scope_DocumentElement.removeEventListener(c[0], c[1]);
          });

          if (scope_ActiveHandlesCount === 0) {
              // Remove dragging class.
              removeClass(scope_Target, options.cssClasses.drag);
              setZindex();

              // Remove cursor styles and text-selection events bound to the body.
              if (event.cursor) {
                  scope_Body.style.cursor = "";
                  scope_Body.removeEventListener("selectstart", preventDefault);
              }
          }

          data.handleNumbers.forEach(function(handleNumber) {
              fireEvent("change", handleNumber);
              fireEvent("set", handleNumber);
              fireEvent("end", handleNumber);
          });
      }

      // Bind move events on document.
      function eventStart(event, data) {
          // Ignore event if any handle is disabled
          if (data.handleNumbers.some(isHandleDisabled)) {
              return false;
          }

          var handle;

          if (data.handleNumbers.length === 1) {
              var handleOrigin = scope_Handles[data.handleNumbers[0]];

              handle = handleOrigin.children[0];
              scope_ActiveHandlesCount += 1;

              // Mark the handle as 'active' so it can be styled.
              addClass(handle, options.cssClasses.active);
          }

          // A drag should never propagate up to the 'tap' event.
          event.stopPropagation();

          // Record the event listeners.
          var listeners = [];

          // Attach the move and end events.
          var moveEvent = attachEvent(actions.move, scope_DocumentElement, eventMove, {
              // The event target has changed so we need to propagate the original one so that we keep
              // relying on it to extract target touches.
              target: event.target,
              handle: handle,
              listeners: listeners,
              startCalcPoint: event.calcPoint,
              baseSize: baseSize(),
              pageOffset: event.pageOffset,
              handleNumbers: data.handleNumbers,
              buttonsProperty: event.buttons,
              locations: scope_Locations.slice()
          });

          var endEvent = attachEvent(actions.end, scope_DocumentElement, eventEnd, {
              target: event.target,
              handle: handle,
              listeners: listeners,
              doNotReject: true,
              handleNumbers: data.handleNumbers
          });

          var outEvent = attachEvent("mouseout", scope_DocumentElement, documentLeave, {
              target: event.target,
              handle: handle,
              listeners: listeners,
              doNotReject: true,
              handleNumbers: data.handleNumbers
          });

          // We want to make sure we pushed the listeners in the listener list rather than creating
          // a new one as it has already been passed to the event handlers.
          listeners.push.apply(listeners, moveEvent.concat(endEvent, outEvent));

          // Text selection isn't an issue on touch devices,
          // so adding cursor styles can be skipped.
          if (event.cursor) {
              // Prevent the 'I' cursor and extend the range-drag cursor.
              scope_Body.style.cursor = getComputedStyle(event.target).cursor;

              // Mark the target with a dragging state.
              if (scope_Handles.length > 1) {
                  addClass(scope_Target, options.cssClasses.drag);
              }

              // Prevent text selection when dragging the handles.
              // In noUiSlider <= 9.2.0, this was handled by calling preventDefault on mouse/touch start/move,
              // which is scroll blocking. The selectstart event is supported by FireFox starting from version 52,
              // meaning the only holdout is iOS Safari. This doesn't matter: text selection isn't triggered there.
              // The 'cursor' flag is false.
              // See: http://caniuse.com/#search=selectstart
              scope_Body.addEventListener("selectstart", preventDefault, false);
          }

          data.handleNumbers.forEach(function(handleNumber) {
              fireEvent("start", handleNumber);
          });
      }

      // Move closest handle to tapped location.
      function eventTap(event) {
          // Erroneous events seem to be passed in occasionally on iOS/iPadOS after user finishes interacting with
          // the slider. They appear to be of type MouseEvent, yet they don't have usual properties set. Ignore tap
          // events that have no touches or buttons associated with them.
          if (!event.buttons && !event.touches) {
              return false;
          }

          // The tap event shouldn't propagate up
          event.stopPropagation();

          var proposal = calcPointToPercentage(event.calcPoint);
          var handleNumber = getClosestHandle(proposal);

          // Tackle the case that all handles are 'disabled'.
          if (handleNumber === false) {
              return false;
          }

          // Flag the slider as it is now in a transitional state.
          // Transition takes a configurable amount of ms (default 300). Re-enable the slider after that.
          if (!options.events.snap) {
              addClassFor(scope_Target, options.cssClasses.tap, options.animationDuration);
          }

          setHandle(handleNumber, proposal, true, true);

          setZindex();

          fireEvent("slide", handleNumber, true);
          fireEvent("update", handleNumber, true);
          fireEvent("change", handleNumber, true);
          fireEvent("set", handleNumber, true);

          if (options.events.snap) {
              eventStart(event, { handleNumbers: [handleNumber] });
          }
      }

      // Fires a 'hover' event for a hovered mouse/pen position.
      function eventHover(event) {
          var proposal = calcPointToPercentage(event.calcPoint);

          var to = scope_Spectrum.getStep(proposal);
          var value = scope_Spectrum.fromStepping(to);

          Object.keys(scope_Events).forEach(function(targetEvent) {
              if ("hover" === targetEvent.split(".")[0]) {
                  scope_Events[targetEvent].forEach(function(callback) {
                      callback.call(scope_Self, value);
                  });
              }
          });
      }

      // Handles keydown on focused handles
      // Don't move the document when pressing arrow keys on focused handles
      function eventKeydown(event, handleNumber) {
          if (isSliderDisabled() || isHandleDisabled(handleNumber)) {
              return false;
          }

          var horizontalKeys = ["Left", "Right"];
          var verticalKeys = ["Down", "Up"];
          var largeStepKeys = ["PageDown", "PageUp"];
          var edgeKeys = ["Home", "End"];

          if (options.dir && !options.ort) {
              // On an right-to-left slider, the left and right keys act inverted
              horizontalKeys.reverse();
          } else if (options.ort && !options.dir) {
              // On a top-to-bottom slider, the up and down keys act inverted
              verticalKeys.reverse();
              largeStepKeys.reverse();
          }

          // Strip "Arrow" for IE compatibility. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
          var key = event.key.replace("Arrow", "");

          var isLargeDown = key === largeStepKeys[0];
          var isLargeUp = key === largeStepKeys[1];
          var isDown = key === verticalKeys[0] || key === horizontalKeys[0] || isLargeDown;
          var isUp = key === verticalKeys[1] || key === horizontalKeys[1] || isLargeUp;
          var isMin = key === edgeKeys[0];
          var isMax = key === edgeKeys[1];

          if (!isDown && !isUp && !isMin && !isMax) {
              return true;
          }

          event.preventDefault();

          var to;

          if (isUp || isDown) {
              var multiplier = options.keyboardPageMultiplier;
              var direction = isDown ? 0 : 1;
              var steps = getNextStepsForHandle(handleNumber);
              var step = steps[direction];

              // At the edge of a slider, do nothing
              if (step === null) {
                  return false;
              }

              // No step set, use the default of 10% of the sub-range
              if (step === false) {
                  step = scope_Spectrum.getDefaultStep(
                      scope_Locations[handleNumber],
                      isDown,
                      options.keyboardDefaultStep
                  );
              }

              if (isLargeUp || isLargeDown) {
                  step *= multiplier;
              }

              // Step over zero-length ranges (#948);
              step = Math.max(step, 0.0000001);

              // Decrement for down steps
              step = (isDown ? -1 : 1) * step;

              to = scope_Values[handleNumber] + step;
          } else if (isMax) {
              // End key
              to = options.spectrum.xVal[options.spectrum.xVal.length - 1];
          } else {
              // Home key
              to = options.spectrum.xVal[0];
          }

          setHandle(handleNumber, scope_Spectrum.toStepping(to), true, true);

          fireEvent("slide", handleNumber);
          fireEvent("update", handleNumber);
          fireEvent("change", handleNumber);
          fireEvent("set", handleNumber);

          return false;
      }

      // Attach events to several slider parts.
      function bindSliderEvents(behaviour) {
          // Attach the standard drag event to the handles.
          if (!behaviour.fixed) {
              scope_Handles.forEach(function(handle, index) {
                  // These events are only bound to the visual handle
                  // element, not the 'real' origin element.
                  attachEvent(actions.start, handle.children[0], eventStart, {
                      handleNumbers: [index]
                  });
              });
          }

          // Attach the tap event to the slider base.
          if (behaviour.tap) {
              attachEvent(actions.start, scope_Base, eventTap, {});
          }

          // Fire hover events
          if (behaviour.hover) {
              attachEvent(actions.move, scope_Base, eventHover, {
                  hover: true
              });
          }

          // Make the range draggable.
          if (behaviour.drag) {
              scope_Connects.forEach(function(connect, index) {
                  if (connect === false || index === 0 || index === scope_Connects.length - 1) {
                      return;
                  }

                  var handleBefore = scope_Handles[index - 1];
                  var handleAfter = scope_Handles[index];
                  var eventHolders = [connect];

                  addClass(connect, options.cssClasses.draggable);

                  // When the range is fixed, the entire range can
                  // be dragged by the handles. The handle in the first
                  // origin will propagate the start event upward,
                  // but it needs to be bound manually on the other.
                  if (behaviour.fixed) {
                      eventHolders.push(handleBefore.children[0]);
                      eventHolders.push(handleAfter.children[0]);
                  }

                  eventHolders.forEach(function(eventHolder) {
                      attachEvent(actions.start, eventHolder, eventStart, {
                          handles: [handleBefore, handleAfter],
                          handleNumbers: [index - 1, index]
                      });
                  });
              });
          }
      }

      // Attach an event to this slider, possibly including a namespace
      function bindEvent(namespacedEvent, callback) {
          scope_Events[namespacedEvent] = scope_Events[namespacedEvent] || [];
          scope_Events[namespacedEvent].push(callback);

          // If the event bound is 'update,' fire it immediately for all handles.
          if (namespacedEvent.split(".")[0] === "update") {
              scope_Handles.forEach(function(a, index) {
                  fireEvent("update", index);
              });
          }
      }

      // Undo attachment of event
      function removeEvent(namespacedEvent) {
          var event = namespacedEvent && namespacedEvent.split(".")[0];
          var namespace = event && namespacedEvent.substring(event.length);

          Object.keys(scope_Events).forEach(function(bind) {
              var tEvent = bind.split(".")[0];
              var tNamespace = bind.substring(tEvent.length);

              if ((!event || event === tEvent) && (!namespace || namespace === tNamespace)) {
                  delete scope_Events[bind];
              }
          });
      }

      // External event handling
      function fireEvent(eventName, handleNumber, tap) {
          Object.keys(scope_Events).forEach(function(targetEvent) {
              var eventType = targetEvent.split(".")[0];

              if (eventName === eventType) {
                  scope_Events[targetEvent].forEach(function(callback) {
                      callback.call(
                          // Use the slider public API as the scope ('this')
                          scope_Self,
                          // Return values as array, so arg_1[arg_2] is always valid.
                          scope_Values.map(options.format.to),
                          // Handle index, 0 or 1
                          handleNumber,
                          // Un-formatted slider values
                          scope_Values.slice(),
                          // Event is fired by tap, true or false
                          tap || false,
                          // Left offset of the handle, in relation to the slider
                          scope_Locations.slice(),
                          // add the slider public API to an accessible parameter when this is unavailable
                          scope_Self
                      );
                  });
              }
          });
      }

      // Split out the handle positioning logic so the Move event can use it, too
      function checkHandlePosition(reference, handleNumber, to, lookBackward, lookForward, getValue) {
          var distance;

          // For sliders with multiple handles, limit movement to the other handle.
          // Apply the margin option by adding it to the handle positions.
          if (scope_Handles.length > 1 && !options.events.unconstrained) {
              if (lookBackward && handleNumber > 0) {
                  distance = scope_Spectrum.getAbsoluteDistance(reference[handleNumber - 1], options.margin, 0);
                  to = Math.max(to, distance);
              }

              if (lookForward && handleNumber < scope_Handles.length - 1) {
                  distance = scope_Spectrum.getAbsoluteDistance(reference[handleNumber + 1], options.margin, 1);
                  to = Math.min(to, distance);
              }
          }

          // The limit option has the opposite effect, limiting handles to a
          // maximum distance from another. Limit must be > 0, as otherwise
          // handles would be unmovable.
          if (scope_Handles.length > 1 && options.limit) {
              if (lookBackward && handleNumber > 0) {
                  distance = scope_Spectrum.getAbsoluteDistance(reference[handleNumber - 1], options.limit, 0);
                  to = Math.min(to, distance);
              }

              if (lookForward && handleNumber < scope_Handles.length - 1) {
                  distance = scope_Spectrum.getAbsoluteDistance(reference[handleNumber + 1], options.limit, 1);
                  to = Math.max(to, distance);
              }
          }

          // The padding option keeps the handles a certain distance from the
          // edges of the slider. Padding must be > 0.
          if (options.padding) {
              if (handleNumber === 0) {
                  distance = scope_Spectrum.getAbsoluteDistance(0, options.padding[0], 0);
                  to = Math.max(to, distance);
              }

              if (handleNumber === scope_Handles.length - 1) {
                  distance = scope_Spectrum.getAbsoluteDistance(100, options.padding[1], 1);
                  to = Math.min(to, distance);
              }
          }

          to = scope_Spectrum.getStep(to);

          // Limit percentage to the 0 - 100 range
          to = limit(to);

          // Return false if handle can't move
          if (to === reference[handleNumber] && !getValue) {
              return false;
          }

          return to;
      }

      // Uses slider orientation to create CSS rules. a = base value;
      function inRuleOrder(v, a) {
          var o = options.ort;
          return (o ? a : v) + ", " + (o ? v : a);
      }

      // Moves handle(s) by a percentage
      // (bool, % to move, [% where handle started, ...], [index in scope_Handles, ...])
      function moveHandles(upward, proposal, locations, handleNumbers) {
          var proposals = locations.slice();

          var b = [!upward, upward];
          var f = [upward, !upward];

          // Copy handleNumbers so we don't change the dataset
          handleNumbers = handleNumbers.slice();

          // Check to see which handle is 'leading'.
          // If that one can't move the second can't either.
          if (upward) {
              handleNumbers.reverse();
          }

          // Step 1: get the maximum percentage that any of the handles can move
          if (handleNumbers.length > 1) {
              handleNumbers.forEach(function(handleNumber, o) {
                  var to = checkHandlePosition(
                      proposals,
                      handleNumber,
                      proposals[handleNumber] + proposal,
                      b[o],
                      f[o],
                      false
                  );

                  // Stop if one of the handles can't move.
                  if (to === false) {
                      proposal = 0;
                  } else {
                      proposal = to - proposals[handleNumber];
                      proposals[handleNumber] = to;
                  }
              });
          }

          // If using one handle, check backward AND forward
          else {
              b = f = [true];
          }

          var state = false;

          // Step 2: Try to set the handles with the found percentage
          handleNumbers.forEach(function(handleNumber, o) {
              state = setHandle(handleNumber, locations[handleNumber] + proposal, b[o], f[o]) || state;
          });

          // Step 3: If a handle moved, fire events
          if (state) {
              handleNumbers.forEach(function(handleNumber) {
                  fireEvent("update", handleNumber);
                  fireEvent("slide", handleNumber);
              });
          }
      }

      // Takes a base value and an offset. This offset is used for the connect bar size.
      // In the initial design for this feature, the origin element was 1% wide.
      // Unfortunately, a rounding bug in Chrome makes it impossible to implement this feature
      // in this manner: https://bugs.chromium.org/p/chromium/issues/detail?id=798223
      function transformDirection(a, b) {
          return options.dir ? 100 - a - b : a;
      }

      // Updates scope_Locations and scope_Values, updates visual state
      function updateHandlePosition(handleNumber, to) {
          // Update locations.
          scope_Locations[handleNumber] = to;

          // Convert the value to the slider stepping/range.
          scope_Values[handleNumber] = scope_Spectrum.fromStepping(to);

          var translation = 10 * (transformDirection(to, 0) - scope_DirOffset);
          var translateRule = "translate(" + inRuleOrder(translation + "%", "0") + ")";

          scope_Handles[handleNumber].style[options.transformRule] = translateRule;

          updateConnect(handleNumber);
          updateConnect(handleNumber + 1);
      }

      // Handles before the slider middle are stacked later = higher,
      // Handles after the middle later is lower
      // [[7] [8] .......... | .......... [5] [4]
      function setZindex() {
          scope_HandleNumbers.forEach(function(handleNumber) {
              var dir = scope_Locations[handleNumber] > 50 ? -1 : 1;
              var zIndex = 3 + (scope_Handles.length + dir * handleNumber);
              scope_Handles[handleNumber].style.zIndex = zIndex;
          });
      }

      // Test suggested values and apply margin, step.
      function setHandle(handleNumber, to, lookBackward, lookForward) {
          to = checkHandlePosition(scope_Locations, handleNumber, to, lookBackward, lookForward, false);

          if (to === false) {
              return false;
          }

          updateHandlePosition(handleNumber, to);

          return true;
      }

      // Updates style attribute for connect nodes
      function updateConnect(index) {
          // Skip connects set to false
          if (!scope_Connects[index]) {
              return;
          }

          var l = 0;
          var h = 100;

          if (index !== 0) {
              l = scope_Locations[index - 1];
          }

          if (index !== scope_Connects.length - 1) {
              h = scope_Locations[index];
          }

          // We use two rules:
          // 'translate' to change the left/top offset;
          // 'scale' to change the width of the element;
          // As the element has a width of 100%, a translation of 100% is equal to 100% of the parent (.noUi-base)
          var connectWidth = h - l;
          var translateRule = "translate(" + inRuleOrder(transformDirection(l, connectWidth) + "%", "0") + ")";
          var scaleRule = "scale(" + inRuleOrder(connectWidth / 100, "1") + ")";

          scope_Connects[index].style[options.transformRule] = translateRule + " " + scaleRule;
      }

      // Parses value passed to .set method. Returns current value if not parse-able.
      function resolveToValue(to, handleNumber) {
          // Setting with null indicates an 'ignore'.
          // Inputting 'false' is invalid.
          if (to === null || to === false || to === undefined) {
              return scope_Locations[handleNumber];
          }

          // If a formatted number was passed, attempt to decode it.
          if (typeof to === "number") {
              to = String(to);
          }

          to = options.format.from(to);
          to = scope_Spectrum.toStepping(to);

          // If parsing the number failed, use the current value.
          if (to === false || isNaN(to)) {
              return scope_Locations[handleNumber];
          }

          return to;
      }

      // Set the slider value.
      function valueSet(input, fireSetEvent) {
          var values = asArray(input);
          var isInit = scope_Locations[0] === undefined;

          // Event fires by default
          fireSetEvent = fireSetEvent === undefined ? true : !!fireSetEvent;

          // Animation is optional.
          // Make sure the initial values were set before using animated placement.
          if (options.animate && !isInit) {
              addClassFor(scope_Target, options.cssClasses.tap, options.animationDuration);
          }

          // First pass, without lookAhead but with lookBackward. Values are set from left to right.
          scope_HandleNumbers.forEach(function(handleNumber) {
              setHandle(handleNumber, resolveToValue(values[handleNumber], handleNumber), true, false);
          });

          var i = scope_HandleNumbers.length === 1 ? 0 : 1;

          // Secondary passes. Now that all base values are set, apply constraints.
          // Iterate all handles to ensure constraints are applied for the entire slider (Issue #1009)
          for (; i < scope_HandleNumbers.length; ++i) {
              scope_HandleNumbers.forEach(function(handleNumber) {
                  setHandle(handleNumber, scope_Locations[handleNumber], true, true);
              });
          }

          setZindex();

          scope_HandleNumbers.forEach(function(handleNumber) {
              fireEvent("update", handleNumber);

              // Fire the event only for handles that received a new value, as per #579
              if (values[handleNumber] !== null && fireSetEvent) {
                  fireEvent("set", handleNumber);
              }
          });
      }

      // Reset slider to initial values
      function valueReset(fireSetEvent) {
          valueSet(options.start, fireSetEvent);
      }

      // Set value for a single handle
      function valueSetHandle(handleNumber, value, fireSetEvent) {
          // Ensure numeric input
          handleNumber = Number(handleNumber);

          if (!(handleNumber >= 0 && handleNumber < scope_HandleNumbers.length)) {
              throw new Error("noUiSlider (" + VERSION + "): invalid handle number, got: " + handleNumber);
          }

          // Look both backward and forward, since we don't want this handle to "push" other handles (#960);
          setHandle(handleNumber, resolveToValue(value, handleNumber), true, true);

          fireEvent("update", handleNumber);

          if (fireSetEvent) {
              fireEvent("set", handleNumber);
          }
      }

      // Get the slider value.
      function valueGet() {
          var values = scope_Values.map(options.format.to);

          // If only one handle is used, return a single value.
          if (values.length === 1) {
              return values[0];
          }

          return values;
      }

      // Removes classes from the root and empties it.
      function destroy() {
          for (var key in options.cssClasses) {
              if (!options.cssClasses.hasOwnProperty(key)) {
                  continue;
              }
              removeClass(scope_Target, options.cssClasses[key]);
          }

          while (scope_Target.firstChild) {
              scope_Target.removeChild(scope_Target.firstChild);
          }

          delete scope_Target.noUiSlider;
      }

      function getNextStepsForHandle(handleNumber) {
          var location = scope_Locations[handleNumber];
          var nearbySteps = scope_Spectrum.getNearbySteps(location);
          var value = scope_Values[handleNumber];
          var increment = nearbySteps.thisStep.step;
          var decrement = null;

          // If snapped, directly use defined step value
          if (options.snap) {
              return [
                  value - nearbySteps.stepBefore.startValue || null,
                  nearbySteps.stepAfter.startValue - value || null
              ];
          }

          // If the next value in this step moves into the next step,
          // the increment is the start of the next step - the current value
          if (increment !== false) {
              if (value + increment > nearbySteps.stepAfter.startValue) {
                  increment = nearbySteps.stepAfter.startValue - value;
              }
          }

          // If the value is beyond the starting point
          if (value > nearbySteps.thisStep.startValue) {
              decrement = nearbySteps.thisStep.step;
          } else if (nearbySteps.stepBefore.step === false) {
              decrement = false;
          }

          // If a handle is at the start of a step, it always steps back into the previous step first
          else {
              decrement = value - nearbySteps.stepBefore.highestStep;
          }

          // Now, if at the slider edges, there is no in/decrement
          if (location === 100) {
              increment = null;
          } else if (location === 0) {
              decrement = null;
          }

          // As per #391, the comparison for the decrement step can have some rounding issues.
          var stepDecimals = scope_Spectrum.countStepDecimals();

          // Round per #391
          if (increment !== null && increment !== false) {
              increment = Number(increment.toFixed(stepDecimals));
          }

          if (decrement !== null && decrement !== false) {
              decrement = Number(decrement.toFixed(stepDecimals));
          }

          return [decrement, increment];
      }

      // Get the current step size for the slider.
      function getNextSteps() {
          return scope_HandleNumbers.map(getNextStepsForHandle);
      }

      // Updateable: margin, limit, padding, step, range, animate, snap
      function updateOptions(optionsToUpdate, fireSetEvent) {
          // Spectrum is created using the range, snap, direction and step options.
          // 'snap' and 'step' can be updated.
          // If 'snap' and 'step' are not passed, they should remain unchanged.
          var v = valueGet();

          var updateAble = [
              "margin",
              "limit",
              "padding",
              "range",
              "animate",
              "snap",
              "step",
              "format",
              "pips",
              "tooltips"
          ];

          // Only change options that we're actually passed to update.
          updateAble.forEach(function(name) {
              // Check for undefined. null removes the value.
              if (optionsToUpdate[name] !== undefined) {
                  originalOptions[name] = optionsToUpdate[name];
              }
          });

          var newOptions = testOptions(originalOptions);

          // Load new options into the slider state
          updateAble.forEach(function(name) {
              if (optionsToUpdate[name] !== undefined) {
                  options[name] = newOptions[name];
              }
          });

          scope_Spectrum = newOptions.spectrum;

          // Limit, margin and padding depend on the spectrum but are stored outside of it. (#677)
          options.margin = newOptions.margin;
          options.limit = newOptions.limit;
          options.padding = newOptions.padding;

          // Update pips, removes existing.
          if (options.pips) {
              pips(options.pips);
          } else {
              removePips();
          }

          // Update tooltips, removes existing.
          if (options.tooltips) {
              tooltips();
          } else {
              removeTooltips();
          }

          // Invalidate the current positioning so valueSet forces an update.
          scope_Locations = [];
          valueSet(optionsToUpdate.start || v, fireSetEvent);
      }

      // Initialization steps
      function setupSlider() {
          // Create the base element, initialize HTML and set classes.
          // Add handles and connect elements.
          scope_Base = addSlider(scope_Target);

          addElements(options.connect, scope_Base);

          // Attach user events.
          bindSliderEvents(options.events);

          // Use the public value method to set the start values.
          valueSet(options.start);

          if (options.pips) {
              pips(options.pips);
          }

          if (options.tooltips) {
              tooltips();
          }

          aria();
      }

      setupSlider();

      // noinspection JSUnusedGlobalSymbols
      scope_Self = {
          destroy: destroy,
          steps: getNextSteps,
          on: bindEvent,
          off: removeEvent,
          get: valueGet,
          set: valueSet,
          setHandle: valueSetHandle,
          reset: valueReset,
          // Exposed for unit testing, don't use this in your application.
          __moveHandles: function(a, b, c) {
              moveHandles(a, b, scope_Locations, c);
          },
          options: originalOptions, // Issue #600, #678
          updateOptions: updateOptions,
          target: scope_Target, // Issue #597
          removePips: removePips,
          removeTooltips: removeTooltips,
          getTooltips: function() {
              return scope_Tooltips;
          },
          getOrigins: function() {
              return scope_Handles;
          },
          pips: pips // Issue #594
      };

      return scope_Self;
  }

  // Run the standard initializer
  function initialize(target, originalOptions) {
      if (!target || !target.nodeName) {
          throw new Error("noUiSlider (" + VERSION + "): create requires a single element, got: " + target);
      }

      // Throw an error if the slider was already initialized.
      if (target.noUiSlider) {
          throw new Error("noUiSlider (" + VERSION + "): Slider was already initialized.");
      }

      // Test the options and create the slider environment;
      var options = testOptions(originalOptions, target);
      var api = scope(target, options, originalOptions);

      target.noUiSlider = api;

      return api;
  }

  // Use an object instead of a function for future expandability;
  return {
      // Exposed for unit testing, don't use this in your application.
      __spectrum: Spectrum,
      version: VERSION,
      // A reference to the default classes, allows global changes.
      // Use the cssClasses option for changes to one slider.
      cssClasses: cssClasses,
      create: initialize
  };
});



(function () {
  if (!window.Hawksearch) {
    window.Hawksearch = {
      Tracking: {},
    };
  }

  var hs = Hawksearch;
  hs.Tracking = {};
  var t = hs.Tracking;

  t.E_T = {
    pageLoad: 1,
    search: 2,
    click: 3,
    addToCart: 4,
    rate: 5,
    sale: 6,
    bannerClick: 7,
    bannerImpression: 8,
    recommendationClick: 10,
    autoCompleteClick: 11,
    add2CartMultiple: 14,
  };

  t.P_T = {
    item: 1,
    landing: 2,
    cart: 3,
    order: 4,
    custom: 5,
  };

  t.SuggestType = {
    PopularSearches: 1,
    TopCategories: 2,
    TopProductMatches: 3,
    TopContentMatches: 4,
  };

  t.SearchType = {
    Initial: 1,
    Refinement: 2,
  };

  t.track = function (eventName, args) {
    switch (eventName.toLowerCase()) {
      case "pageload":
        //Hawksearch.Context.add("uniqueid", "123456789");
        //Hawksearch.Tracking.track('pageload',{pageType: "item"});
        return t.writePageLoad(args.pageType);
      case "searchtracking":
        //Hawksearch.Tracking.track("searchtracking", {trackingId:"a9bd6e50-e434-45b9-9f66-489eca07ad0a", typeId: Hawksearch.Tracking.SearchType.Initial});
        //Hawksearch.Tracking.track("searchtracking", {trackingId:"a9bd6e50-e434-45b9-9f66-489eca07ad0a", typeId: Hawksearch.Tracking.SearchType.Refinement});
        return t.writeSearchTracking(args.trackingId, args.typeId); //CHANGED
      case "click":
        //Hawksearch.Tracking.track('click',{event: e, uniqueId: "33333", trackingId: "75a0801a-a93c-4bcb-81f1-f4b011f616e3"});
        return t.writeClick(args.event, args.uniqueId, args.trackingId); //CHANGED
      case "bannerclick":
        //Hawksearch.Tracking.track('bannerclick',{bannerId: 1, campaignId: 2, trackingId:"2d652a1e-2e05-4414-9d76-51979109f724"});
        return t.writeBannerClick(
          args.bannerId,
          args.campaignId,
          args.trackingId
        ); //CHANGED
      case "bannerimpression":
        //Hawksearch.Tracking.track('bannerimpression',{bannerId: "2", campaignId: "2", trackingId:"2d652a1e-2e05-4414-9d76-51979109f724"});
        return t.writeBannerImpression(
          args.bannerId,
          args.campaignId,
          args.trackingId
        ); //CHANGED
      case "sale":
        //Hawksearch.Tracking.track('sale', {orderNo: 'order_123',itemList: [{uniqueid: '123456789', itemPrice: 12.99, quantity: 2}], total: 25.98, subTotal: 22, tax: 3.98, currency: 'USD'});
        return t.writeSale(
          args.orderNo,
          args.itemList,
          args.total,
          args.subTotal,
          args.tax,
          args.currency
        );
      case "add2cart":
        //Hawksearch.Tracking.track('add2cart',{uniqueId: '123456789', price: 19.99, quantity: 3, currency: 'USD'});
        return t.writeAdd2Cart(
          args.uniqueId,
          args.price,
          args.quantity,
          args.currency
        );
      case "add2cartmultiple":
        //Hawksearch.Tracking.track('add2cartmultiple', [{uniqueId: '123456789',price: 15.97,quantity: 1,currency: 'USD'},{uniqueId: '987465321', price: 18.00, quantity: 1, currency: 'USD'}]);
        return t.writeAdd2CartMultiple(args);
      case "rate":
        //Hawksearch.Tracking.track('rate', {uniqueId: '123456789',value: 3.00});
        return t.writeRate(args.uniqueId, args.value);
      case "recommendationclick":
        //Hawksearch.Tracking.track('recommendationclick',{uniqueId: "223222", itemIndex: "222", widgetGuid:"2d652a1e-2e05-4414-9d76-51979109f724", requestId:"2d652a1e-2e05-4414-9d76-51979109f724"});
        return t.writeRecommendationClick(
          args.widgetGuid,
          args.uniqueId,
          args.itemIndex,
          args.requestId
        );
      case "autocompleteclick":
        //Hawksearch.Tracking.track('autocompleteclick',{keyword: "test", suggestType: Hawksearch.Tracking.SuggestType.PopularSearches, name:"tester", url:"/test"});
        return t.writeAutoCompleteClick(
          args.keyword,
          args.suggestType,
          args.name,
          args.url
        ); //CHANGED
    }
  };

  t.getVisitorExpiry = function () {
    var d = new Date();
    // 1 year
    d.setTime(d.getTime() + 360 * 24 * 60 * 60 * 1000);
    return d.toGMTString();
  };

  t.getVisitExpiry = function () {
    var d = new Date();
    // 4 hours
    d.setTime(d.getTime() + 4 * 60 * 60 * 1000);
    return d.toGMTString();
  };

  t.createGuid = function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  };

  t.getCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  t.setCookie = function (name, value, expiry) {
    var expires;
    if (expiry) {
      expires = "; expires=" + expiry;
    } else {
      expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  };

  t.writePageLoad = function (pageType) {
    var c = document.documentElement;
    var pl = {
      EventType: t.E_T.pageLoad,
      EventData: btoa(
        JSON.stringify({
          PageTypeId: t.P_T[pageType],
          RequestPath: window.location.pathname,
          Qs: window.location.search,
          ViewportHeight: c.clientHeight,
          ViewportWidth: c.clientWidth,
        })
      ),
    };
    t.mr(pl);
  };

  t.writeSearchTracking = function (trackingId, typeId) {
    if (typeId == Hawksearch.Tracking.SearchType.Initial) {
      t.setCookie("hawk_query_id", t.createGuid());
    }
    // var queryId = t.getCookie("hawk_query_id");
    var queryId = '06d3c7d6-a4e1-48df-a0eb-21bba4608dd8';
    var c = document.documentElement;
    var pl = {
      EventType: t.E_T.search,
      EventData: btoa(
        JSON.stringify({
          QueryId: queryId,
          TrackingId: trackingId,
          TypeId: typeId,
          QueryId: queryId,
          ViewportHeight: c.clientHeight,
          ViewportWidth: c.clientWidth,
        })
      ),
    };
    t.mr(pl);
  };

  t.writeClick = function (event, uniqueId, trackingId, url) {
    var c = document.documentElement;
    var pl = {
      EventType: t.E_T.click,
      EventData: btoa(
        JSON.stringify({
          Url: url,
          Qs: window.location.search,
          RequestPath: window.location.pathname,
          TrackingId: trackingId,
          UniqueId: uniqueId,
          ViewportHeight: c.clientHeight,
          ViewportWidth: c.clientWidth,
        })
      ),
    };
    t.mr(pl);
  };

  t.writeBannerClick = function (bannerId, campaignId, trackingId) {
    var pl = {
      EventType: t.E_T.bannerClick,
      EventData: btoa(
        JSON.stringify({
          CampaignId: campaignId,
          BannerId: bannerId,
          TrackingId: trackingId,
        })
      ),
    };
    t.mr(pl);
  };

  t.writeBannerImpression = function (bannerId, campaignId, trackingId) {
    var pl = {
      EventType: t.E_T.bannerImpression,
      EventData: btoa(
        JSON.stringify({
          CampaignId: campaignId,
          BannerId: bannerId,
          TrackingId: trackingId,
        })
      ),
    };
    t.mr(pl);
  };
  t.writeSale = function (orderNo, itemList, total, subTotal, tax, currency) {
    var pl = {
      EventType: t.E_T.sale,
      EventData: btoa(
        JSON.stringify({
          OrderNo: orderNo,
          ItemList: itemList,
          Total: total,
          Tax: tax,
          SubTotal: subTotal,
          Currency: currency,
        })
      ),
    };
    t.mr(pl);
  };
  t.writeAdd2Cart = function (uniqueId, price, quantity, currency) {
    var pl = {
      EventType: t.E_T.addToCart,
      EventData: btoa(
        JSON.stringify({
          UniqueId: uniqueId,
          Quantity: quantity,
          Price: price,
          Currency: currency,
        })
      ),
    };
    t.mr(pl);
  };

  t.writeAdd2CartMultiple = function (args) {
    var pl = {
      EventType: t.E_T.add2CartMultiple,
      EventData: btoa(
        JSON.stringify({
          ItemsList: args,
        })
      ),
    };
    t.mr(pl);
  };

  t.writeRate = function (uniqueId, value) {
    var pl = {
      EventType: t.E_T.rate,
      EventData: btoa(
        JSON.stringify({
          UniqueId: uniqueId,
          Value: value,
        })
      ),
    };
    t.mr(pl);
  };

  t.writeRecommendationClick = function (
    widgetGuid,
    uniqueId,
    itemIndex,
    requestId
  ) {
    var pl = {
      EventType: t.E_T.recommendationClick,
      EventData: btoa(
        JSON.stringify({
          ItemIndex: itemIndex,
          RequestId: requestId,
          UniqueId: uniqueId,
          WidgetGuid: widgetGuid,
        })
      ),
    };
    t.mr(pl);
  };

  t.writeAutoCompleteClick = function (keyword, suggestType, name, url) {
    var pl = {
      EventType: t.E_T.autoCompleteClick,
      EventData: btoa(
        JSON.stringify({
          Keyword: keyword,
          Name: name,
          SuggestType: suggestType,
          Url: url,
        })
      ),
    };
    t.mr(pl);
  };

  t.mr = function (data) {
    var visitId = t.getCookie("hawk_visit_id");
    var visitorId = t.getCookie("hawk_visitor_id");
    if (!visitId) {
      t.setCookie("hawk_visit_id", t.createGuid(), t.getVisitExpiry());
      //   visitId = t.getCookie("hawk_visit_id");
      visitId = "4d036ad3-098e-4336-891d-6f068f39c97a";
    }
    if (!visitorId) {
      t.setCookie("hawk_visitor_id", t.createGuid(), t.getVisitorExpiry());
    //   visitorId = t.getCookie("hawk_visitor_id");
      visitorId = "d6d83807-b4e1-499f-9582-6f391dbfa22c";
    }
    var pl = Object.assign(
      {
        ClientGuid: hs.ClientGuid,
        VisitId: visitId,
        VisitorId: visitorId,
        TrackingProperties: hs.Context,
        CustomDictionary: hs.Context.Custom,
      },
      data
    );
    fetch(hs.TrackingUrl + "/api/trackevent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pl),
    })
      .then(function (resp) {
        console.log("Success:", resp.status);
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  };

  t.Init = function () {
    if (hs.initCustomEvents !== undefined) {
      hs.initCustomEvents();
    }
  };

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(t.Init(), 1);
  } else {
    document.addEventListener("DOMContentLoaded", t.Init());
  }

  hs.Dictionary = (function () {
    function Dictionary() {
      if (!(this instanceof Dictionary)) return new Dictionary();
    }

    Dictionary.prototype.add = function (key, value) {
      this[key] = value;
    };

    Dictionary.prototype.clear = function () {
      var key, dummy;

      for (key in this) {
        if (this.hasOwnProperty(key)) dummy = delete this[key];
      }
    };

    Dictionary.prototype.remove = function (key) {
      var dummy;

      if (this.hasOwnProperty(key)) {
        dummy = delete this[key];
        return true;
      } else return false;
    };
    return Dictionary;
  })();

  hs.ContextObj = function () {};
  hs.ContextObj.prototype = new hs.Dictionary();
  hs.ContextObj.prototype.Custom = new hs.Dictionary();
  hs.Context = new hs.ContextObj();
})(window.Hawksearch);




Handlebars.registerHelper("parseHTML", function (_html) {
  return new Handlebars.SafeString(_html);
});

Handlebars.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 0; i < n; ++i) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === (n - 1);
      accum += block.fn(this);
  }
  return accum;
});

Handlebars.registerHelper("toJSON", function (obj) {
  return JSON.stringify(obj, null, 3);
});

Handlebars.registerHelper("formatPrice", function (price) {
  return new Handlebars.SafeString("Price: $" + parseFloat(price));
});

Handlebars.registerHelper("getIfCheckboxSelected", function (isChecked) {
  if (isChecked) {
    return new Handlebars.SafeString("checked");
  }
  return new Handlebars.SafeString("");
});

Handlebars.registerHelper("setInnerHTML", function (html) {
  return new Handlebars.SafeString(html);
});

Handlebars.registerHelper("generateId", function (label) {
  return new Handlebars.SafeString(label.split(" ").join("-"));
});

Handlebars.registerHelper("generateIdWithoutHyphen", function (label) {
  return new Handlebars.SafeString(label.split(" ").join("").toLowerCase());
});

Handlebars.registerHelper("formatItemURL", function (item) {
  return new Handlebars.SafeString("http://demo.hawksearch.net" + item);
});

Handlebars.registerHelper("formatDate", function (date) {
  var parseDate = new Date(date);
  const year = parseDate.getFullYear().toString();
  const month = (parseDate.getMonth() + 101).toString().substring(1);
  const day = (parseDate.getDate() + 100).toString().substring(1);
  return year + "-" + month + "-" + day;
});

Handlebars.registerHelper("equal", function (lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue === rvalue) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
  if (options === "i") {
    lvalue = parseInt(lvalue);
    rvalue = parseInt(rvalue);
  } else {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
  }

  return {
    "+": lvalue + rvalue,
    "-": lvalue - rvalue,
    "*": lvalue * rvalue,
    "/": lvalue / rvalue,
    "%": lvalue % rvalue,
  }[operator];
});

Handlebars.registerHelper("parseInteger", function (value) {
  return new Handlebars.SafeString(parseInt(value));
});

Handlebars.registerHelper("parseFloat", function (value) {
  return new Handlebars.SafeString(parseFloat(value));
});

Handlebars.registerHelper("preselectDropdown", function (value) {
  return value ? "selected" : "";
});

Handlebars.registerHelper("parentHasChildren", function (rule, type) {
  return rule.Parent && rule.Parent.Rules.length > 0 ? type : null;
});

Handlebars.registerHelper("getConnectorLabel", function (rule) {
  var RuleOperatorType = {
    All: 0,
    Any: 1,
    None: 2,
  };
  const connector = rule.Operator;
  let connectorLabel = "";
  switch (connector) {
    case RuleOperatorType.All: {
      connectorLabel = "and";
      break;
    }
    case RuleOperatorType.Any: {
      connectorLabel = "or";
      break;
    }
  }
  return connectorLabel;
});

Handlebars.registerHelper("getGlobalVariable", function (variableName) {
  if (Hawksearch[variableName]) {
    return Hawksearch[variableName];
  }
  return "";
});

Handlebars.registerHelper("getFacetColorCard", function (facetField, value) {
  var assetUrl = (
    (
      Hawksearch.store.searchResults.Facets.find((f) => f.Field === facetField)
        .SwatchData || []
    ).find((s) => s.Value.toLowerCase() === value.toLowerCase()) || {}
  ).AssetName;
  if (!assetUrl) {
    return `/assets/1168/${value.toLowerCase()}.jpg`;
  }
  return assetUrl;
});

Handlebars.registerHelper("compare", function (
  lvalue,
  operator,
  rvalue,
  options
) {
  var operators, result;
  if (arguments.length < 3) {
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
  }

  if (options === undefined) {
    options = rvalue;
    rvalue = operator;
    operator = "===";
  }

  operators = {
    "==": function (l, r) {
      return l == r;
    },
    "===": function (l, r) {
      return l === r;
    },
    "!=": function (l, r) {
      return l != r;
    },
    "!==": function (l, r) {
      return l !== r;
    },
    "<": function (l, r) {
      return l < r;
    },
    ">": function (l, r) {
      return l > r;
    },
    "<=": function (l, r) {
      return l <= r;
    },
    ">=": function (l, r) {
      return l >= r;
    },
    typeof: function (l, r) {
      return typeof l == r;
    },
  };

  if (!operators[operator]) {
    throw new Error(
      "Handlerbars Helper 'compare' doesn't know the operator " + operator
    );
  }

  result = operators[operator](lvalue, rvalue);
  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("getRatingImage", function (rating) {
  var dict = {
    0.5: 'hawk-rated05',
    1: 'hawk-rated1',
    1.5: 'hawk-rated15',
    2: 'hawk-rated2',
    2.5: 'hawk-rated25',
    3: 'hawk-rated3',
    3.5: 'hawk-rated35',
    4: 'hawk-rated4',
    4.5: 'hawk-rated45',
    5: 'hawk-rated5',
  };
  var ratingInt = Number(rating);
  return new Handlebars.SafeString("<img class='hawk-rating "+dict[ratingInt]+"'>")
});

//////////////////////////////////// TEMPLATE//////////////////////////////////
const HAWK_TAB_SELECTION_BAR_TEMPLATE = `
      <div class="clearfix">
        <div class="hawk-tab-selection-bar-container hawk-searchView">
          {{#each this.Values}}
          {{#compare Selected "==" true}}
            <span class="hawk-viewOption hawk-viewOptionOn" data-attr-facet-name="{{../Name}}" data-attr-facet-field="{{../Field}}" data-attr-facet-id="{{../FacetId}}" id="hawk-tab-selection-btn" data-attr-value="{{Value}}" data-attr-label="{{Label}}">
              <span class="hawk-viewOptionInner hawktab">
                {{Label}}
              </span>
            </span>
          {{/compare}}
          {{#compare Selected "==" false}}
            <span class="hawk-viewOption hawk-viewOptionOff" data-attr-facet-name="{{../Name}}" data-attr-facet-field="{{../Field}}" data-attr-facet-id="{{../FacetId}}" id="hawk-tab-selection-btn" data-attr-value="{{Value}}" data-attr-label="{{Label}}">
              <span class="hawk-viewOptionInner hawktab">
                {{Label}}
              </span>
            </span>
          {{/compare}}
          {{/each}}
        </div>
      </div>

`;

const HAWK_COMPARE_ITEM_BAR_TEMPLATE =
`
  <div class="hawk-subControls clearfix" style="display:block;">
    <div class="hawk-compareList" style="float: left;display: inline;">
      <div class="hawk-compareHeading s_hide sw_showBlock m_showBlock mw_showBlock l_showBlock">Compare <span>up to 5 items</span></div>
      <ul>
        {{#each items}}
          {{#with Document}}
            <li><img data-attr-id={{id}} alt={{imagealttag}} src={{image}} class="hawk-compareItemImage"></li>
          {{/with}}
        {{/each}}
        {{#times count}}
          <li></li>
        {{/times}}
      </ul>
      <div class="btnWrapper" style="margin: 0 0 0 6px;">
          <input type="button" id="hawk-compare-itembtn" class="btn btnCompareItems" value="Compare">
      </div>
    </div>
  </div>
`;

const HAWK_PAGINATION_BAR_TEMPLATE = `
    <div class="hawk-sortWrapper">
      <div class="sortList">
        <label for="hawk-sort-by">
          Sort By
        </label>
        <select id="hawk-sort-by" class="hawksortby">
          {{#each sorting.Items}}
            <option value={{Value}} {{preselectDropdown Selected}}>
              {{Label}}
            </option>
          {{/each}}
        </select>
      </div>
    </div>
    <div class="hawk-pagination__controls hawk-pagination clearfix">
      <div class="hawk-items-per-page hawk-viewNumber s_hide sw_showBlock m_showBlock mw_showBlock l_showBlock">
        <select id="hawk-items-per-page" class="hawkmpp">
          {{#each pagination.Items}}
            <option value={{PageSize}} {{preselectDropdown Selected}}>
              {{Label}}
            </option>
          {{/each}}
        </select>
      </div>
      <div class="hawk-paging">
        <a class="hawk-pagination__item hawk-arrowLeft hawk-pageLink" id="previous-page-btn">
          <span class="hawk-visuallyHidden">Previous</span>
        </a>
        {{#each pageNumbers}}
          {{#compare this "===" ../pagination.CurrentPage }}
            <span class="hawk-pageActive">{{this}}</span>
          {{/compare}}
          {{#compare this "!==" ../pagination.CurrentPage}}
            <span id="hawk-page-number" class="hawk-pageItem" page-number={{this}}><a class="hawk-pageLink" page={{this}}>{{this}}</a></span>
          {{/compare}}

        {{/each}}
        <a class="hawk-pagination__item hawk-arrowRight hawk-pageLink " id="next-page-btn">
          <span class="hawk-visuallyHidden">Next</span>
        </a>
      </div>
`;

const HAWK_SELECTED_FACETS_BAR_TEMPLATE = `
  <div class="hawk-navGroup hawk-selectedNav">
  <h4 class="hawk-groupHeading">
    You've Selected
  </h4>
  <div class="hawk-selected-facets-container hawk-navGroupContent">
    {{#each selection}}
      <div class="hawk-selected-facets-tiles hawk-selectedGroup">
        <div class="hawk-selectedHeading">
          <a>
            <span class="hawkIcon-close" id="hawk-selected-facet-remove-btn-group" data-attr-group-key="{{@key}}">
                <span class="hawk-visuallyHidden">Remove</span>
            </span>
            {{label}}
          </a>
        </div>
        <ul>
          {{#each items}}
            <li class="hawk-selected-facets hawkFacet-active">
              <a>
                <span class="hawkIcon-close" id="hawk-selected-facet-remove-btn" data-attr-group-key="{{@../key}}" data-attr-item-label="{{value}}">
                    <span class="hawk-visuallyHidden">Remove</span>
                </span>
                <span>
                  {{label}}
                </span>
              </a>
            </li>
          {{/each}}
        </ul>
      </div>
    {{/each}}
  </div>

  <div id="hawk-clear-all-facets-btn" class="hawk-clearSelected">
    <a>
      Clear All
    </a>
  </div>
  </div>
  `;

const HAWK_RESULT_ITEM_TEMPLATE = `
{{#each .}}
  {{#with Document}}
    {{#compare type "==" "Item"}}
      <div class="hawk-results__item grid_3 itemList__item">
        <div class="itemWrapper hawk-itemWrapper">
          <a class="hawk-results__item-image itemLink" href="{{formatItemURL url}}">
            <img
              src="{{image}}"
              alt={{imagealttag}}
              class="itemImage"
            />
          </a>
          <h3 class="hawk-results__item-name itemTitle">
            <em style="display: block;">{{brand}}</em>
            <a href="{{formatItemURL url}}">
              {{itemname}}
            </a>
          </h3>
          <p class="hawk-results__item-name itemPrice">{{formatPrice price}}</p>
          {{getRatingImage rating}}
          <div class="clearfix">
            <div class="itemButtons clearfix">
              <a href="{{formatItemURL url}}" class="btnWrapper"><span class="btn">View Details</span></a>
            </div>
            <div class="itemCompare">
              <div>
                <input class="hawk-compare-item" data-id={{id}} name={{id}} id={{id}} type="checkbox" name={{id}} id={{id}}>
                <label for={{id}}>Compare</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    {{/compare}}
    {{#compare type "==" "Content"}}
      <div class="hawk-results__item item hawk-contentItem">
        <div class="content hawk-contentWrapper">
          <h3><a href="{{
            getGlobalVariable "WebsiteUrl"
          }}{{url}}">{{itemname}}</a></h4>
        </div>
        </div>
    {{/compare}}
  {{/with}}
{{/each}}
`;

const HAWK_MERCHANDISING_TRIGGER_RULE_TEMPLATE = `
{{#compare this.Rules.length "!==" 0}}
        {{> RuleSummaryPartialTemplate this}}
      {{/compare}}
      {{#compare this.Field "!==" ""}}{{/compare}}
      {{#compare this.Condition "!==" ""}}
        <span className="hawk-preview__field">
          {{this.FieldName}}
        </span>
        <span className="hawk-preview__condition">
          {{this.Condition}}
        </span>
        <span className="hawk-preview__value">
          {{this.FieldValue}}
        </span>
      {{/compare}}
`;

const HAWK_MERCHANDISING_RULE_SUMMARY_TEMPLATE = `
      <div>
        {{parentHasChildren this "("}}

        {{#each this.Rules}}
          <span>
            {{> TriggerRulePartialTemplate this}}
            {{#compare (math ../this.Rules.length "-" 1) "!==" @index}}
              <span className="hawk-preview__connector">{{getConnectorLabel ../this}}</span>
            {{/compare}}
          </span>
        {{/each}}

        {{parentHasChildren this ")"}}
      </div>
`;

const HAWK_MERCHANDISING_TRIGGER_EXPLANATION_TEMPLATE = `
  <div className="hawk-banner-preview-info">
    <div class="custom-tooltip">
      <div class="hawk-questionmark">
        <span class="hawk-questionmark hawk-facet-tooltip hawkIcon-question bounded" data-original-title="" title="" aria-describedby="popover992363"></span>
      </div>
      <div class="right">
        <div>
          <div>
            <div>
              Triggered by
            </div>

            <div className="hawk-preview__trigger-name">
              <a
                target="_top"
                href="{{
                  getGlobalVariable "HawkDashboardUrl"
                }}/settings/ads/rules/edit.aspx?BannerGroupId={{
                  this.Trigger.BannerGroupId
                }}"
              >
                {{this.Trigger.Name}}
              </a>
            </div>

            <div className="hawk-preview__rule">
              {{> TriggerRulePartialTemplate this.Trigger.Rule}}
            </div>
          </div>
        </div>
        <i />
      </div>
    </div>
  </div>
`;

const HAWK_MERCHANDISING_BANNER_TEMPLATE = `
  {{#each this}}
    <!-- Widget -->
    {{#equal ContentType "widget"}}
      <div id="hawk-banner" class="hawk-banner-content-widget" data-banner-id={{BannerId}} data-campaign-id={{CampaignId}}>
        <div>
          {{parseHTML this.Output}}
        </div>
        {{> TriggerExplanationPartialTemplate this}}
      </div>
    {{/equal}}
    <!-- Image -->
    {{#equal ContentType "image"}}
      <div id="hawk-banner" class="hawk-banner-content-image" data-banner-id={{BannerId}} data-campaign-id={{CampaignId}}>
        <a href={{this.ForwardUrl}}>
          <img
            id="hawk-banner-img-load"
            src="{{this.ImageUrl}}"
            title={{this.Title}}
            alt={{this.AltTag}}
          />
        </a>
        {{> TriggerExplanationPartialTemplate this}}
      </div>
    {{/equal}}
    <!-- Custom -->
    {{#equal ContentType "custom"}}
      <div id="hawk-banner" class="hawk-banner-content-custom" data-banner-id={{BannerId}} data-campaign-id={{CampaignId}}>
        <div>
          {{parseHTML this.Output}}
        </div>
        {{> TriggerExplanationPartialTemplate this}}
      </div>
    {{/equal}}
    <!-- Featured -->
    {{#equal ContentType "featured"}}
      <div id="hawk-banner" className="hawk-preview__featured-items" data-banner-id={{BannerId}} data-campaign-id={{CampaignId}}>
        <h4>{{this.Title}}</h4>
        {{#each this.Items}}
        {{/each}}
        {{> TriggerExplanationPartialTemplate this}}
      </div>
    {{/equal}}
  {{/each}}
`;

const HAWK_AUTOCORRECT_KEYWORD_TEMPLATE = `
  <div>
    <h2>Did you mean?</h2>
    <ul class="hawk-autocorrect-suggestion">
      {{#each keywords}}
        <li class="hawk-autocorrect-selection" data-label={{this}}>{{this}}</li>
      {{/each}}
    </ul>
  </div>
`


const HAWK_FACETLIST_TEMPLATE = `
{{#each this}}
  {{#equal FacetType 'openRange' }}
    <div class="hawk-navGroup">
      <div class="">
        <div class="hawk-facet-slider hawk-facetfilters">
          <div id="hawk-facet-header">
            <h4 class="hawk-groupHeading">
              {{this.Name}}
            </h4>
          </div>
          <div id="hawk-facet-body" class="hawk-display-block" class="input-slider" data-facet-id={{FacetId}}>
            <div class=" hawk-slideFacet">
              <div class="hawk-sliderNumeric">
                <input id="hawk-lower-open-range" data-attr-facet-name="{{Name}}" data-attr-facet-field="{{ParamName}}" class="numeric-from hawk-open-range" type="text" data-facet-id="{{../FacetId}}">
                <input id="hawk-upper-open-range" data-attr-facet-name="{{Name}}" data-attr-facet-field="{{ParamName}}" class="numeric-to hawk-open-range" type="text" data-facet-id="{{../FacetId}}">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {{/equal}}
  {{#equal FacetType 'slider' }}
    {{#compare DataType "===" 'datetime' }}
      <h1>Facet not found!</h1>
    {{/compare}}
    {{#compare DataType "!==" 'datetime' }}
      <div class="hawk-navGroup">
        <div class="">
          <div class="hawk-facet-slider hawk-facetfilters">
            <div id="hawk-facet-header">
              <h4 class="hawk-groupHeading">
                {{this.Name}}
              </h4>
            </div>
            <div id="hawk-facet-body" class="hawk-display-block" class="input-slider" data-facet-id={{FacetId}}>
              {{#each Values}}
                <div class=" hawk-slideFacet">
                  <div class="hawk-sliderNumeric">
                    <input class="numeric-from" type="text" min="{{parseInteger RangeMin}}" max="{{parseInteger RangeMax}}" value="{{parseInteger RangeStart}}" data-facet-id="{{../FacetId}}">
                    <input class="numeric-to" type="text" min="{{parseInteger RangeMin}}" max="{{parseInteger RangeMax}}" value="{{parseInteger RangeEnd}}" data-facet-id="{{../FacetId}}">
                  </div>
                  <div
                    class="range-slider"
                    range-min="{{parseInteger RangeMin}}"
                    range-max="{{parseInteger RangeMax}}"
                    range-start="{{parseInteger RangeStart}}"
                    range-end="{{parseInteger RangeEnd}}"
                    data-facet-id="{{../FacetId}}"
                    data-attr-facet-name="{{../Name}}"
                    data-attr-facet-field="{{../ParamName}}"></div>
                </div>
              {{/each}}
            </div>
          </div>
        </div>
      </div>
    {{/compare}}
  {{/equal}}
  {{#equal FacetType 'checkbox' }}
    {{#compare FieldType "===" 'range' }}
      <div class="hawk-navGroup hawk-collapsible">
        <div class="hawk-facet-checkbox">
          <div id="hawk-facet-header">
            <h4 class="hawk-groupHeading">
              {{this.Name}}
              {{#if Tooltip}}
                <div class="custom-tooltip">
                  <span class="hawk-questionmark hawk-facet-tooltip hawkIcon-question bounded" data-original-title="" title="" aria-describedby="popover992363"></span>
                  <div class="right">
                    <div>
                      {{parseHTML Tooltip}}
                    </div>
                    <i></i>
                  </div>
                </div>
              {{/if}}
              <p id="hawk-collapsible"></p>
            </h4>
          </div>
          <div id="hawk-facet-body" class="hawk-display-block hawk-navGroupContent">
            <div class="hawk-checkbox-wrapper">
              <div class="clearfix hawk-facetFilters hawk-navTruncateList">
                {{#each Ranges}}
                    <div class="hawk-checkbox-element" data-attr-label="{{Label}}">
                    <input name="{{generateIdWithoutHyphen Label}}" class="hawk-checkbox" id="{{generateIdWithoutHyphen Label}}" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}"  data-attr-label="{{Label}}" data-attr-value="{{Value}}" type="checkbox" {{isNegateOrSelected ../this this 'isSelected'}} name="{{generateId Label}}" id="{{generateId Label}}" data-facet-id="{{../FacetId}}">
                      <label class="{{isNegateOrSelected ../this this 'isNegated'}}" for="{{generateIdWithoutHyphen Label}}">
                        <img class="hawk-rating-img" src="{{getGlobalVariable 'HawkDashboardUrl'}}{{this.AssetFullUrl}}" alt={{Label}}>
                        {{Label}}
                      </label>
                      <span class="hawk-negativeIcon" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}" data-attr-label="{{Label}}" data-attr-value="{{Value}}" id="hawk-negate-facet"><i class="hawkIcon-blocked"></i></span>
                    </div>
                {{/each}}
              </div>
              {{#compare this.Values.length ">" 10}}
                <span id="hawk-toggle-more-less" class="hawk-toggle-more-less">(+) Show More</span>
              {{/compare}}
            </div>
          </div>
        </div>
      </div>
    {{/compare}}
    {{#compare FieldType "!==" 'range' }}
      <div class="hawk-navGroup hawk-collapsible">
        <div class="hawk-facet-checkbox">
          <div id="hawk-facet-header">
            <h4 class="hawk-groupHeading">
              {{this.Name}}
              {{#if Tooltip}}
                <div class="custom-tooltip">
                  <span class="hawk-questionmark hawk-facet-tooltip hawkIcon-question bounded" data-original-title="" title="" aria-describedby="popover992363"></span>
                  <div class="right">
                    <div>
                      {{parseHTML Tooltip}}
                    </div>
                    <i></i>
                  </div>
                </div>
              {{/if}}
              <p id="hawk-collapsible"></p>
            </h4>
          </div>
          <div id="hawk-facet-body" class="hawk-display-block hawk-navGroupContent">
            <div class="hawk-quickSearch">
              <input placeholder="Quick Lookup" type="text" id="hawk-facet-quick-lookup"/>
            </div>
            <div class="hawk-checkbox-wrapper">
              <div class="clearfix hawk-facetFilters hawk-navTruncateList">
                {{#each Values}}
                  {{#compare @index "===" 10}}
                    <div id="hawk-show-more" class="hawk-display-none">
                  {{/compare}}
                      <div class="hawk-checkbox-element" data-attr-label="{{Label}}">
                        <input name="{{generateIdWithoutHyphen Label}}" class="hawk-checkbox" id="{{generateIdWithoutHyphen Label}}" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}"  data-attr-label="{{Label}}" data-attr-value="{{Value}}" type="checkbox" {{isNegateOrSelected ../this this 'isSelected'}} name="{{generateId Label}}" id="{{generateId Label}}" data-facet-id="{{../FacetId}}">
                        <label class="{{isNegateOrSelected ../this this 'isNegated'}}" for="{{generateIdWithoutHyphen Label}}">{{Label}} ({{Count}})</label>
                        <span class="hawk-negativeIcon" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}" data-attr-label="{{Label}}" data-attr-value="{{Value}}" id="hawk-negate-facet"><i class="hawkIcon-blocked"></i></span>
                      </div>
                  {{#compare @index "===" (math ../this.Values.length "-" 1)}}
                    </div>
                  {{/compare}}
                {{/each}}
              </div>
              {{#compare this.Values.length ">" 10}}
                <span id="hawk-toggle-more-less" class="hawk-toggle-more-less">(+) Show More</span>
              {{/compare}}
            </div>
          </div>
        </div>
      </div>

    {{/compare}}
  {{/equal}}
  {{#equal FacetType 'nestedcheckbox' }}
      <div class="hawk-navGroup hawk-collapsible">
        <div class="hawk-facet-checkbox">
          <div id="hawk-facet-header">
            <h4 class="hawk-groupHeading">
              {{this.Name}}
              {{#if Tooltip}}
                <div class="custom-tooltip">
                  <span class="hawk-questionmark hawk-facet-tooltip hawkIcon-question bounded" data-original-title="" title="" aria-describedby="popover992363"></span>
                  <div class="right">
                    <div>
                      {{parseHTML Tooltip}}
                    </div>
                    <i></i>
                  </div>
                </div>
              {{/if}}
              <p id="hawk-collapsible"></p>
            </h4>
          </div>
          <div id="hawk-facet-body" class="hawk-display-block hawk-navGroupContent">
            <div class="hawk-checkbox-wrapper">
              <div class="clearfix hawk-facetFilters hawk-navTruncateList">
                <ul id="parent-ul" data-attr-facet-name="{{Name}}" data-attr-facet-param-name="{{ParamName}}" data-attr-facet-field="{{Field}}" data-facet-id="{{FacetId}}">
                  {{#each Values}}
                    <li class="hawk-checkbox-element" data-attr-label="{{Label}}">
                      <div>
                        <input name="{{generateIdWithoutHyphen Label}}" class="hawk-checkbox" id="{{generateIdWithoutHyphen Label}}" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}" data-facet-id="{{../FacetId}}" data-attr-label="{{Label}}" data-attr-value="{{Value}}" type="checkbox" {{isNegateOrSelected ../this this 'isSelected'}} name="{{generateId Label}}" id="{{generateId Label}}">
                        <label class="{{isNegateOrSelected ../this this 'isNegated'}}" for="{{generateIdWithoutHyphen Label}}">{{Label}}</label>
                        {{#compare Children.length ">" 0}}
                          <span class="hawk-nested-checkboxtoggle">+</span>
                        {{/compare}}
                      </div>
                      {{#compare Children.length ">" 0}}
                        <ul class="clearfix hawk-facetgroup hawk-nestedfacet hawk-facetFilters hawk-navTruncateList hawkfacet-nestedcheckbox in hawk-display-none">
                          {{> NestedCheckbox Children}}
                        </ul>
                      {{/compare}}
                    </li>
                  {{/each}}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
  {{/equal}}
  {{#equal DataType "datetime" }}
    <div class="hawk-navGroup hawk-collapsible">
      <div class="hawk-facet-datetime">
        <div id="hawk-facet-header">
          <h4 class="hawk-groupHeading">
            {{Name}}
            <p id="hawk-collapsible"></p>
          </h4>
        </div>
        <div id="hawk-facet-body" class="hawk-display-block" data-facet-name="{{Name}}" data-facet-field="{{Field}}">
          {{#each Values}}
          <input class="hawk-date-range" id="hawk-range-start" type="date" value="{{formatDate RangeStart}}" min="{{formatDate RangeMin}}" max="{{formatDate RangeMax}}"/>
          <input class="hawk-date-range" id="hawk-range-end" type="date" value="{{formatDate RangeEnd}}" min="{{formatDate RangeMin}}" max="{{formatDate RangeMax}}"/>
          {{/each}}
        </div>
      </div>
    </div>
  {{/equal}}
  {{#equal FacetType "swatch" }}
    <div id="ctl00_SearchNav_ctl04_divFacet" class="hawk-navGroup" data-field="facet-color-property">
      <h4 class="hawk-groupHeading">
        {{Name}}
        <span>
            <span class="hawk-facet-tooltip hawkIcon-question" data-original-title="" title=""></span>
            <span class="hawk-facet-tooltip-content">
                test tooltip
            </span>
        </span>
      </h4>
      <div class="hawk-navGroupContent">
        <ul class="clearfix hawk-facetFilters hawk-navTruncateList hawkfacet-swatch ">
          {{#each Values}}
            {{#compare Selected "==" true}}
              <li id="hawkfacet-color-property" class="hawkFacet-active" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}"  data-attr-label="{{Label}}" data-attr-value="{{Value}}" data-facet-id="{{../FacetId}}">
            {{/compare}}
            {{#compare Selected "==" false}}
              <li id="hawkfacet-color-property" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}"  data-attr-label="{{Label}}" data-attr-value="{{Value}}" data-facet-id="{{../FacetId}}">
            {{/compare}}
                <a class="hawk-styleSwatch" rel="nofollow">
                  <span class="hawk-selectionInner">
                    <img src="{{ getGlobalVariable "HawkDashboardUrl" }}/{{getFacetColorCard ../Field Value}}" alt={{Value}} title={{Value}}>
                    <span class="value">Blue</span>
                  </span>
                  <span class="hawk-negativeIcon"><i class="hawkIcon-blocked"></i></span>
                </a>
            </li>
          {{/each}}
        </ul>
      </div>
    </div>
  {{/equal}}
  {{#equal FacetType "size" }}
    <div class="hawk-navGroup hawk-collapsible">
      <div class="hawk-facet-size">
        <div id="hawk-facet-header">
          <h4 class="hawk-groupHeading">
            {{Name}}
            <p id="hawk-collapsible"></p>
          </h4>
        </div>
        <div id="hawk-facet-body" class="hawk-display-block">
          <div class="hawk-size-container">
            {{#each Values}}
              {{#compare Selected "===" true}}
                <div id="hawk-size-facet" class="selected" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}"  data-attr-label="{{Label}}" data-attr-value="{{Value}}" data-facet-id="{{../FacetId}}">{{Value}}</div>
              {{/compare}}
              {{#compare Selected "===" false}}
              <div id="hawk-size-facet" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}"  data-attr-label="{{Label}}" data-attr-value="{{Value}}" data-facet-id="{{../FacetId}}">{{Value}}</div>
              {{/compare}}
            {{/each}}
          </div>
        </div>
      </div>
    </div>
  {{/equal}}
  {{#equal FacetType "link" }}
    <div class="hawk-navGroup hawk-collapsible">
      <div class="hawk-facet-size">
        <div id="hawk-facet-header">
          <h4 class="hawk-groupHeading">
            {{Name}}
            <p id="hawk-collapsible"></p>
          </h4>
        </div>
        <div id="hawk-facet-body" class="hawk-display-block">
          {{#each Values}}
            <span id="hawk-link-facet" class="hawk-link-facet" data-attr-facet-name="{{../Name}}" data-attr-facet-param-name="{{../ParamName}}" data-attr-facet-field="{{../Field}}"  data-attr-label="{{Label}}" data-attr-value="{{Value}}" data-facet-id="{{../FacetId}}">{{Label}}({{Count}})</span>
          {{/each}}
        </div>
      </div>
    </div>
  {{/equal}}
  {{#equal FacetType "search" }}
    <div class="hawk-navGroup">
      <div class="hawk-facet-searchwithin">
        <div class="hawk-navGroupContent hawk-resultsSearch">
          <div id="hawk-facet-header">
            <label>{{this.Name}}</label>
          </div>
          <div id="hawk-facet-body" class="hawk-display-block hawk-searchWithin">
            <input class="hawk-search-within" type="text" data-attr-facet-name="{{Name}}" data-attr-facet-field="{{Field}}" data-facet-id="{{FacetId}}">
            <div class="hawk-searchWithinButton">
                <span class="hawkIcon-search" aria-hidden="true"></span>
                <span class="hawk-visuallyHidden">Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  {{/equal}}
  {{/each}}
`;
const NESTED_CHECKBOX_TEMPLATE = `
{{#each this}}
  <li class="hawk-checkbox-element" data-attr-label="{{Label}}">
    <div>
      <input name="{{generateIdWithoutHyphen Label}}" class="hawk-checkbox" id="{{generateIdWithoutHyphen Label}}" data-attr-facet-name="{{../this.Name}}" data-attr-facet-param-name="{{../this.ParamName}}" data-attr-facet-field="{{../this.Field}}"  data-attr-label="{{Label}}" data-attr-value="{{Value}}" type="checkbox" {{isNegateOrSelected ../this this 'isSelected'}} name="{{generateId Label}}" id="{{generateId Label}}" data-facet-id="{{../this.FacetId}}">
      <label class="{{isNegateOrSelected ../this this 'isNegated'}}" for="{{generateIdWithoutHyphen Label}}">{{Label}}</label>
      {{#compare Children.length ">" 0}}
        <span class="hawk-nested-checkboxtoggle">+</span>
      {{/compare}}
    </div>
    {{#compare Children.length ">" 0}}
      <ul class="clearfix hawk-facetgroup hawk-nestedfacet hawk-facetFilters hawk-navTruncateList hawkfacet-nestedcheckbox in hawk-display-none">
        {{> NestedCheckbox Children}}
      </ul>
    {{/compare}}
  </li>
{{/each}}
`;

function closeModal() {
  document.getElementById('hawk-compare-modal').style.display = 'none';
  document.getElementById('hawk-modal-backdrop').style.display = 'none';
}

const HAWK_ITEMS_COMPARISION_MODAL_TEMPLATE = `
<div class="bootbox modal fade hawk-compare hawk-preview in" tabindex="-1" role="dialog" aria-hidden="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Compare Items</h4></div>
      <div class="modal-body">
        <div class="bootbox-body">
          <table class="hawk-compare">
            <tbody>
              <tr>
                <th class="hawk-compare-th">&nbsp;</th>
                {{#each items}}
                  {{#with Document}}
                    <td class="hawk-compare-header-td">
                      <ul class="products-grid row">
                        <div class="grid_3 itemList__item ">
                          <div class="itemWrapper hawk-itemWrapper">
                            <a href="{{formatItemURL url.value}}" id="ctl00_Compare_lvItems_ctrl0_item_lnk1" class="itemLink">
                              <img class="itemImage hawk-itemImage" src={{image.value}} alt={{itemname.value}}>
                            </a>
                            <h3 class="itemTitle">
                              <em style="display: block;">{{brand.value}}</em>
                              <a href="{{formatItemURL url.value}}" id="ctl00_Compare_lvItems_ctrl0_item_lnk2" onclick="return HawkSearch.link(event,'00000000-0000-0000-0000-000000000000',1,'Item_72267',0);">Boys' Boundary Triclimate Jacket</a>
                            </h3>
                            <span class="itemSku"></span>
                            <p class="itemDesc"></p>
                            <p class="itemPrice"> {{formatPrice price.value}} </p>
                            <div class="clearfix"> </div>
                            <div class="clearfix">
                              <div class="itemButtons clearfix"> <a href="{{formatItemURL url.value}}" id="ctl00_Compare_lvItems_ctrl0_item_lnk3" class="btnWrapper" onclick="return HawkSearch.link(event,'00000000-0000-0000-0000-000000000000',1,'Item_72267',0);"><span class="btn">View Details</span></a> <a href="controls/#" id="ctl00_Compare_lvItems_ctrl0_item_lnkMoreLikeThis" onclick="HawkSearch.loadMoreLikeThis(event,'Item_72267|1|00000000-0000-0000-0000-000000000000');return false;">More Like This</a>
                                <div class="itemCompare">
                                  <input type="checkbox" class="ckbItemCompare" id="chkItemCompareItem_72267" value="Item_72267">
                                  <label class="ckbItemCompare" for="chkItemCompareItem_72267">compare</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ul>
                    </td>
                  {{/with}}
                {{/each}}
              </tr>
            </tbody>
            <tbody>
            {{#each keys}}
              <tr>
                {{#each .}}
                  {{#compare @index "===" 0}}
                    <th class="hawk-compare-th">{{this}}</th>
                  {{/compare}}
                  {{#compare @index "!==" 0}}
                    <th class="hawk-compare-item-td">{{this}}</th>
                  {{/compare}}
                {{/each}}
              </tr>
            {{/each}}
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button onclick="closeModal()" id="hawk-close-compare-modal" data-bb-handler="main" type="button" class="btn btn-primary">Close</button>
      </div>
    </div>
  </div>
  </div>
`;
// Handlebars.registerPartial(
//   "TriggerRulePartialTemplate",
//   document.getElementById("hawk-merchandising-trigger-rule-template").innerHTML
// );
Handlebars.registerPartial(
  "TriggerRulePartialTemplate",
  HAWK_MERCHANDISING_TRIGGER_RULE_TEMPLATE
);

// Handlebars.registerPartial(
//   "RuleSummaryPartialTemplate",
//   document.getElementById("hawk-merchandising-rule-summary-template").innerHTML
// );
Handlebars.registerPartial(
  "RuleSummaryPartialTemplate",
  HAWK_MERCHANDISING_RULE_SUMMARY_TEMPLATE
);

Handlebars.registerPartial(
  "TriggerExplanationPartialTemplate",
  HAWK_MERCHANDISING_TRIGGER_EXPLANATION_TEMPLATE
);

Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

Handlebars.registerPartial("NestedCheckbox", NESTED_CHECKBOX_TEMPLATE);

// IIFE is responsible to load the page.
(function (Hawksearch) {
  // NOTE: Added helper over here so this helper can easily access the isFacetSelected method
  // which is defined in IIFE
  var FACET_FIELD = "";
  var PARAM_NAME = "";
  Handlebars.registerHelper("isNegateOrSelected", function (
    facet,
    facetValue,
    type
  ) {
    if(facet.Field || facet.ParamName) {
      FACET_FIELD = facet.Field;
      PARAM_NAME = facet.paramName;
    }
    var facetField = FACET_FIELD;
    var paramName = PARAM_NAME;
    var selectionField = paramName ? paramName : facetField;
    var selectionState = isFacetSelected(
      {
        Name: facet.Name,
        selectionField: selectionField,
      },
      facetValue.Value
    );
    if (selectionState.state === 1 && type === "isSelected") {
      return new Handlebars.SafeString("checked");
    } else if (selectionState.state === 2 && type === "isNegated") {
      return new Handlebars.SafeString("hawk-checkbox-line-through");
    } else {
      return new Handlebars.SafeString("");
    }
  });
  // Global variables declares here...
  // Store selected facets
  var selectedFacets = [];

  var BannerZone = {
    leftBottom: "LeftBottom",
    leftTop: "LeftTop",
    top: "Top",
    bottom: "Bottom",
    bottom2: "Bottom2",
  };

  // Represents # of pages
  var numberOfTotalPages = 0;

  // selected facets dictionary object
  Hawksearch.store = {
    pendingSearch: {
      FacetSelections: {},
      SearchWithin: "",
    },
    ClientGuid: "",
    ClientIndexes: [],
    CurrentIndex: "",
    IsInPreview: true,
    searchResults: {},
    itemsToCompare: [],
  };

  // Enum
  var FacetSelectionState = {
    /** The facet value is not selected. */
    NotSelected: 0,
    /** The facet value is selected. */
    Selected: 1,
    /** The facet value is selected, but negated. */
    Negated: 2,
  };

  // NOTE: Service to show/hide loader during API execution
  var loaderService = {
    showLoader: function() {
      var loader = document.getElementById('hawk-page-loader');
      loader.classList.remove('hawk-display-none');
      loader.classList.add('hawk-display-block');
    },
    hiderLoader: function() {
      var loader = document.getElementById('hawk-page-loader');
      loader.classList.remove('hawk-display-block');
      loader.classList.add('hawk-display-none');
    }

  }

  ////////////////////////////////////////////////////////////////////////////////

  function requestGenerator(url, payload, type = "POST") {
    return fetch(url, {
      method: type,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (resp) {
        if (resp.status !== 200) {
          return Promise.reject(resp);
        }
        return resp.json();
      })
      .catch(function (error) {
        return Promise.reject(error);
      });
  }

  Hawksearch.getComparedItems = function() {
    var payload = {
      ClientGuid: Hawksearch.ClientGuid,
      Ids: Hawksearch.store.itemsToCompare.map(item => item.DocId),
      IndexName: ""
    };
    // loaderService.showLoader();
    return requestGenerator(Hawksearch.CompareItemsAPIURL, payload, "POST")
      .then(function (res) {
        // loaderService.hiderLoader();
        // Hawksearch.store.searchResults = res;
        return Promise.resolve(res);
      })
      .catch(function (error) {
        // loaderService.hiderLoader();
        return Promise.reject(error);
      });
  }

  Hawksearch.getClientData = function () {
    return requestGenerator(
      "https://searchapi-dev.hawksearch.net/api/internal-preview/get-client-data",
      { SiteDirectory: "elasticdemo" },
      "POST"
    )
      .then(function (res) {
        // Store client guid, indexes and current index
        Hawksearch.store.ClientGuid = res.ClientGuid;
        Hawksearch.store.ClientIndexes = res.ClientIndexes;
        Hawksearch.store.CurrentIndex = res.CurrentIndex;
        return Promise.resolve(res);
      })
      .catch(function (error) {
        return Promise.reject(error);
      });
  };

  Hawksearch.getSearchedData = function () {
    var payload = {
      ClientGuid: Hawksearch.ClientGuid,
      IsInPreview: true,
      ...Hawksearch.store.pendingSearch,
      IndexName : Hawksearch.CurrentIndex,
    };
    
    loaderService.showLoader();
    return requestGenerator(Hawksearch.SearchAPIUrl, payload, "POST")
      .then(function (res) {
        loaderService.hiderLoader();
        Hawksearch.store.searchResults = res;
        return Promise.resolve(res);
      })
      .catch(function (error) {
        loaderService.hiderLoader();
        return Promise.reject(error);
      });
  };

  Hawksearch.getPreviewData = function () {
    return requestGenerator(
      "https://searchapi-dev.hawksearch.net/api/internal-preview/get-preview-data",
      { ClientGuid: Hawksearch.ClientGuid },
      "POST"
    )
      .then(function (res) {
        return Promise.resolve(res);
      })
      .catch(function (error) {
        return Promise.reject(error);
      });
  };

  function isFacetSelected(facet, facetValue) {
    var facetName = typeof facet === "string" ? facet : facet.Name;
    var facetField = typeof facet === "string" ? facet : facet.selectionField;

    var valueValue =
      typeof facetValue === "string" ? facetValue : facetValue.Value;
    var valueLabel =
      typeof facetValue === "string" ? facetValue : facetValue.Label;

    if (!valueValue) {
      console.error(
        `Facet ${facetName} (${facetField}) has no facet value for ${valueLabel}`
      );
      return { state: FacetSelectionState.NotSelected };
    }

    var facetSelections = Hawksearch.store.pendingSearch.FacetSelections;

    if (!facetSelections || !facetSelections[facetField]) {
      return { state: FacetSelectionState.NotSelected };
    }

    var selectionIdx = facetSelections[facetField].indexOf(valueValue);
    var negationIdx = facetSelections[facetField].indexOf(`-${valueValue}`);

    if (selectionIdx !== -1) {
      // if the exact facet value exists, then we're normally selected
      return {
        state: FacetSelectionState.Selected,
        selectedValue: valueValue,
        selectionIndex: selectionIdx,
      };
    } else if (negationIdx !== -1) {
      // if the facet value is selected but prefixed with a -, then we're negated
      return {
        state: FacetSelectionState.Negated,
        selectedValue: `-${valueValue}`,
        selectionIndex: negationIdx,
      };
    }
    return { state: FacetSelectionState.NotSelected };
  }

  Hawksearch.clearFacet = function (facet) {
    var facetField = typeof facet === "string" ? facet : facet.selectionField;

    var facetSelections = Hawksearch.store.pendingSearch.FacetSelections;

    // handle `searchWithin` facet, which isn't a facet selection but is instead a field on the
    // search request.
    if (facetField === "searchWithin") {
      // set searchWithin to undefined to clear it
      // Hawksearch.setSearchSelections(facetSelections, /* searchWithin */ undefined);
      Hawksearch.setSearchSelections({
        FacetSelections: facetSelections,
        SearchWithin: undefined,
      });

      return;
    }

    if (!facetSelections || !facetSelections[facetField]) {
      // if there are no facet selections or the facet isn't selected at all, there's nothing to clear
      return;
    }

    delete facetSelections[facetField];

    // Hawksearch.setSearchSelections(facetSelections, Hawksearch.store.pendingSearch.SearchWithin);
    Hawksearch.setSearchSelections({
      FacetSelections: facetSelections,
      SearchWithin: Hawksearch.store.pendingSearch.SearchWithin,
    });
  };

  function clearFacetValue(facet, facetValue) {
    var facetName = typeof facet === "string" ? facet : facet.Name;
    var facetField = typeof facet === "string" ? facet : facet.selectionField;

    var valueValue =
      typeof facetValue === "string" ? facetValue : facetValue.Value;
    var valueLabel =
      typeof facetValue === "string" ? facetValue : facetValue.Label;

    if (!valueValue) {
      console.error(
        `Facet ${facetName} (${facetField}) has no facet value for ${valueLabel}`
      );
      return;
    }

    // handle `searchWithin` facet, which isn't a facet selection but is instead a field on the
    // search request.
    if (facetField === "searchWithin") {
      // set searchWithin to undefined to clear it
      // Hawksearch.setSearchSelections(
      //   Hawksearch.store.pendingSearch.FacetSelections,
      //   /* searchWithin */ undefined
      // );
      Hawksearch.setSearchSelections({
        FacetSelections: facetSelections,
        SearchWithin: undefined,
      });

      return;
    }

    var { state: selState, selectionIndex } = isFacetSelected(
      facet,
      facetValue
    );

    if (selState === FacetSelectionState.NotSelected) {
      // if there are no facet selections or the facet isn't selected at all, there's nothing to clear
      return;
    }

    var facetSelections = Hawksearch.store.pendingSearch.FacetSelections;

    // remove it from the selections
    facetSelections[facetField].splice(selectionIndex, 1);

    if (facetSelections[facetField].length === 0) {
      // clean up any facets that no longer have any selected facet values
      delete facetSelections[facetField];
    }

    // Hawksearch.setSearchSelections(facetSelections, Hawksearch.store.pendingSearch.SearchWithin);
    Hawksearch.setSearchSelections({
      FacetSelections: facetSelections,
      SearchWithin: Hawksearch.store.pendingSearch.SearchWithin,
    });
  }

  Hawksearch.clearAllFacets = function () {
    Hawksearch.setSearchSelections({
      FacetSelections: undefined,
      SearchWithin: undefined,
    });
  };

  function setFacetValues(facet, facetValues) {
    var facetName = typeof facet === "string" ? facet : facet.Name;
    var facetField = typeof facet === "string" ? facet : facet.selectionField;

    var facetSelections = Hawksearch.store.pendingSearch.FacetSelections;

    if (!facetSelections) {
      facetSelections = {};
    }

    facetSelections[facetField] = [];

    for (var facetValue of facetValues) {
      var valueValue =
        typeof facetValue === "string" ? facetValue : facetValue.Value;
      var valueLabel =
        typeof facetValue === "string" ? facetValue : facetValue.Label;

      if (!valueValue) {
        console.error(
          `Facet ${facetName} (${facetField}) has no facet value for ${valueLabel}`
        );
        return;
      }

      facetSelections[facetField].push(valueValue);
    }
    Hawksearch.setSearchSelections({
      FacetSelections: facetSelections,
      SearchWithin: Hawksearch.store.pendingSearch.SearchWithin,
    });
  }

  function toggleFacetValue(facet, facetValue, negate) {
    if (negate === undefined) {
      negate = false;
    }

    var facetName = typeof facet === "string" ? facet : facet.Name;
    var facetField = typeof facet === "string" ? facet : facet.selectionField;

    var valueValue =
      typeof facetValue === "string" ? facetValue : facetValue.Value;
    var valueLabel =
      typeof facetValue === "string" ? facetValue : facetValue.Label;

    if (!valueValue) {
      console.error(
        `Facet ${facetName} (${facetField}) has no facet value for ${valueLabel}`
      );
      return;
    }

    let facetSelections = Hawksearch.store.pendingSearch.FacetSelections;

    // handle `searchWithin` facet, which isn't a facet selection but is instead a field on the
    // search request.
    if (facetField === "searchWithin") {
      // set the search within to the facet value provided
      // Hawksearch.setSearchSelections(facetSelections, /* searchWithin */ valueValue);
      Hawksearch.setSearchSelections({
        FacetSelections: facetSelections,
        SearchWithin: valueValue,
      });

      return;
    }

    if (!facetSelections) {
      facetSelections = {};
    }

    if (!facetSelections[facetField]) {
      facetSelections[facetField] = [];
    }

    var { state: selState, selectionIndex } = isFacetSelected(
      facet,
      facetValue
    );

    if (
      selState === FacetSelectionState.Selected ||
      selState === FacetSelectionState.Negated
    ) {
      // we're selecting this facet, and it's already selected

      // first, remove it from our selections
      facetSelections[facetField].splice(selectionIndex, 1);

      if (
        (selState === FacetSelectionState.Selected && negate) ||
        (selState === FacetSelectionState.Negated && !negate)
      ) {
        // if we're toggling from negation to non-negation or vice versa, then push the new selection
        facetSelections[facetField].push(
          negate ? `-${valueValue}` : valueValue
        );
      } else {
        // if we're not toggling the negation, nothing to do because we already removed the selection above
      }
    } else {
      // not selected, so we want to select it
      facetSelections[facetField].push(negate ? `-${valueValue}` : valueValue);
    }

    if (facetSelections[facetField].length === 0) {
      // clean up any facets that no longer have any selected facet values
      delete facetSelections[facetField];
    }
    // Hawksearch.setSearchSelections(facetSelections, Hawksearch.store.pendingSearch.SearchWithin);
    selectedFacets = facetSelections;
    Hawksearch.setSearchSelections({
      FacetSelections: facetSelections,
      SearchWithin: Hawksearch.store.pendingSearch.SearchWithin,
    });
  }

  function getSearchQueryString(searchRequest) {
    var searchQuery = {
      keyword: searchRequest.Keyword,

      sort: searchRequest.SortBy,
      pg: searchRequest.PageNo ? String(searchRequest.PageNo) : undefined,
      mpp: searchRequest.MaxPerPage
        ? String(searchRequest.MaxPerPage)
        : undefined,
      is100Coverage: searchRequest.Is100CoverageTurnedOn
        ? String(searchRequest.Is100CoverageTurnedOn)
        : undefined,
      searchWithin: searchRequest.SearchWithin,
      indexName: searchRequest.IndexName,

      ...searchRequest.FacetSelections,
    };

    return convertObjectToQueryString(searchQuery);
  }

  Hawksearch.setSearchSelections = function (pendingSearch) {
    Object.assign(Hawksearch.store.pendingSearch, pendingSearch);

    var queryString = getSearchQueryString(Hawksearch.store.pendingSearch);
    // window.location.search = queryString;
    if (history.pushState) {
      var newurl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        queryString;
      window.history.pushState({ path: newurl }, "", newurl);
      if (Hawksearch.store.searchResults.Keyword !== pendingSearch.Keyword) {
        // NOTE: Track Event
        Hawksearch.Tracking.track('searchtracking', {
          trackingId: Hawksearch.store.searchResults.TrackingId,
          typeId: 1,
        });
      } else {
        // NOTE: Track Event
        Hawksearch.Tracking.track('searchtracking', {
          trackingId: Hawksearch.store.searchResults.TrackingId,
          typeId: 2,
        });
      }
      Hawksearch.loadSearchedData();
    }
  };

  Hawksearch.store.facetSelections = function () {
    var {
      pendingSearch: { FacetSelections: clientSelections, SearchWithin },
      searchResults,
    } = this;
    var selections = {};

    if (!clientSelections && !SearchWithin) {
      return selections;
    }

    // if we've made selections on the client, transform these into more detailed selections.
    // the client-side selections are just facet fields and values without any labels - so we
    // need to combine this information with the list of facets received from the server in the
    // previous search in order to return a rich list of selections
    var facets = searchResults ? searchResults.Facets : null;

    if (!facets) {
      // but we can only do this if we've received facet information from the server. without this
      // info we can't determine what labels should be used
      return selections;
    }

    // manually handle the `searchWithin` selection, as this doesn't usually behave like a normal facet selection
    // but instead a field on the search request
    if (SearchWithin) {
      var facet = facets.find((f) => f.selectionField === "searchWithin");

      if (facet) {
        selections.searchWithin = {
          facet,
          label: facet.Name,
          items: [
            {
              label: SearchWithin,
              value: SearchWithin,
            },
          ],
        };
      }
    }

    if (!clientSelections) {
      return selections;
    }

    Object.keys(clientSelections).forEach((fieldName) => {
      var selectionValues = clientSelections[fieldName];

      if (!selectionValues) {
        // if this selection has no values, it's not really selected
        return;
      }

      var facet = facets.find((f) => {
        var selectionField = f.ParamName ? f.ParamName : f.Field;
        return selectionField === fieldName;
      });

      if (!facet) {
        // if there's no matching facet from the server, we can't show this since we'll have no labels
        return;
      }

      var items = [];

      if (facet.FieldType === "range") {
        // if the facet this selection is for is a range, there won't be a matching value and thus there won't be a label.
        // so because of this we'll just use the selection value as the label

        selectionValues.forEach((selectionValue) => {
          items.push({
            label: selectionValue,
            value: selectionValue,
          });
        });
      } else if (facet.FieldType === "tab") {
        // do not return the selection value for tab facet
        return;
      } else {
        // for other types of facets, try to find a matching value

        selectionValues.forEach((selectionValue) => {
          var matchingVal = this.findMatchingValue(
            selectionValue,
            facet.Values
          );

          if (!matchingVal || !matchingVal.Label) {
            // if there's no matching value from the server, we cannot display because there would
            // be no label - same if there's no label at all
            return;
          }

          items.push({
            label: matchingVal.Label,
            value: selectionValue,
          });
        });
      }

      selections[fieldName] = {
        facet,
        label: facet.Name,
        items,
      };
    });

    return selections;
  };

  Hawksearch.store.findMatchingValue = function (selectionValue, facetValues) {
    var matchingValue = null;
    if (!facetValues || facetValues.length === 0) {
      return null;
    }

    for (var facetValue of facetValues) {
      var isMatchingVal =
        facetValue.Value === selectionValue ||
        `-${facetValue.Value}` === selectionValue;
      // loop through children
      if (!isMatchingVal) {
        matchingValue = this.findMatchingValue(
          selectionValue,
          facetValue.Children
        );
      } else {
        matchingValue = facetValue;
      }

      if (matchingValue) {
        return matchingValue;
      }
    }

    return matchingValue;
  };

  function convertObjectToQueryString(queryObj) {
    var queryStringValues = [];

    for (var key in queryObj) {
      if (queryObj.hasOwnProperty(key)) {
        if (
          key === "keyword" ||
          key === "sort" ||
          key === "pg" ||
          key === "mpp" ||
          key === "searchWithin" ||
          key === "is100Coverage" ||
          key === "indexName"
        ) {
          var value = queryObj[key];

          if (value === undefined || value === null) {
            // if any of the special keys just aren't defined or are null, don't include them in
            // the query string
            continue;
          }

          if (typeof value !== "string") {
            throw new Error(`${key} must be a string`);
          }

          // certain strings are special and are never arrays
          queryStringValues.push(key + "=" + value);
        } else {
          var values = queryObj[key];

          // handle comma escaping - if any of the values contains a comma, they need to be escaped first
          var escapedValues = [];

          for (var unescapedValue of values) {
            escapedValues.push(unescapedValue.replace(",", "::"));
          }

          queryStringValues.push(key + "=" + escapedValues.join(","));
        }
      }
    }

    return "?" + queryStringValues.join("&");
  }

  function parseQueryStringToObject(search) {
    var params = new URLSearchParams(search);

    var parsed = {};

    params.forEach((value, key) => {
      if (
        key === "keyword" ||
        key === "sort" ||
        key === "pg" ||
        key === "lp" ||
        key === "PageId" ||
        key === "lpurl" ||
        key === "mpp" ||
        key === "searchWithin" ||
        key === "is100Coverage" ||
        key === "indexName"
      ) {
        // `keyword` is special and should never be turned into an array
        parsed[key] = encodeURIComponent(value);
      } else {
        // everything else should be turned into an array

        if (!value) {
          // no useful value for this query param, so skip it
          return;
        }

        // multiple selections are split by commas, so split into an array
        var multipleValues = value.split(",");

        // and now handle any comma escaping - any single value that contained a comma is escaped to '::'
        for (let x = 0; x < multipleValues.length; ++x) {
          multipleValues[x] = multipleValues[x].replace("::", ",");
        }

        parsed[key] = multipleValues;
      }
    });

    return parsed;
  }

  function parseSearchQueryString(search) {
    var queryObj = parseQueryStringToObject(search);

    // extract out components, including facet selections
    var {
      keyword,
      sort,
      pg,
      mpp,
      lp,
      PageId,
      lpurl,
      searchWithin,
      is100Coverage,
      indexName,
      ...facetSelections
    } = queryObj;

    // ignore landing pages if keyword is passed
    var pageId = lp || PageId;
    return {
      Keyword: lpurl || pageId ? "" : keyword,

      SortBy: sort,
      PageNo: pg ? Number(pg) : undefined,
      MaxPerPage: mpp ? Number(mpp) : undefined,
      PageId: pageId ? Number(pageId) : undefined,
      CustomUrl: lpurl,
      SearchWithin: searchWithin,
      Is100CoverageTurnedOn: is100Coverage ? Boolean(is100Coverage) : undefined,
      FacetSelections: facetSelections,
      IndexName: indexName,
    };
  }

  Hawksearch.goToPreviousPage = function () {
    var page = Hawksearch.store.pendingSearch.PageNo;
    Hawksearch.goToPage(page - 1);
  };

  Hawksearch.goToNextPage = function () {
    var page = Hawksearch.store.pendingSearch.PageNo;
    Hawksearch.goToPage(page + 1);
  };

  Hawksearch.goToPage = function (pageNo) {
    var totalPages = numberOfTotalPages;
    if (isNaN(pageNo)) {
      return;
    }

    if (pageNo < 1) {
      return;
    }

    if (pageNo > totalPages) {
      return;
    }

    // inform the consumer that we've changed pages
    Hawksearch.setSearchSelections({ PageNo: pageNo });
  };

  function onKeyDownPaginationInput(event) {
    if (event.key === "Enter") {
      var wantedPageNo = parseInt(event.target.value, 10);
      Hawksearch.goToPage(wantedPageNo);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////

  // Note: Bind events

  function bindSizeFacetEvent() {
    document.querySelectorAll("#hawk-size-facet").forEach((item) => {
      item.addEventListener("click", function (event) {
        event.preventDefault();
        var facetField = this.getAttribute("data-attr-facet-field");
        var facetName = this.getAttribute("data-attr-facet-name");
        var paramName = this.getAttribute("data-attr-facet-param-name");
        var selectionField = paramName ? paramName : facetField;
        var value = this.getAttribute("data-attr-value");
        var label = this.getAttribute("data-attr-label");
        // selectedFacets.push({
        //   field: selectionField,
        //   value: value,
        // });
        toggleFacetValue(
          {
            Name: facetName,
            selectionField: selectionField,
          },
          {
            Value: value,
            Label: label,
          }
        );
      });
    });
  }

  function bindSwatchFacetEvent() {
    document.querySelectorAll("#hawkfacet-color-property").forEach((item) => {
      item.addEventListener("click", function (event) {
        event.preventDefault();
        var facetField = this.getAttribute("data-attr-facet-field");
        var facetName = this.getAttribute("data-attr-facet-name");
        var paramName = this.getAttribute("data-attr-facet-param-name");
        var selectionField = paramName ? paramName : facetField;
        var isChecked = this.checked;
        var value = this.getAttribute("data-attr-value");
        var label = this.getAttribute("data-attr-label");
        // selectedFacets.push({
        //   field: selectionField,
        //   value: value,
        // });
        toggleFacetValue(
          {
            Name: facetName,
            selectionField: selectionField,
          },
          {
            Value: value.charAt(0).toUpperCase() + value.slice(1),
            Label: value.charAt(0).toUpperCase() + value.slice(1),
          }
        );
      });
    });
  }

  function bindFacetTypeLinkEvent() {
    document.querySelectorAll("#hawk-link-facet").forEach((item) => {
      item.addEventListener("click", function(event) {
        event.preventDefault();
        var facetField = event.target.getAttribute("data-attr-facet-field");
        var facetName = event.target.getAttribute("data-attr-facet-name");
        var paramName = event.target.getAttribute("data-attr-facet-param-name");
        var selectionField = paramName ? paramName : facetField;
        var value = event.target.getAttribute("data-attr-value");
        var label = event.target.getAttribute("data-attr-label");
        if(selectedFacets[selectionField] && selectedFacets[selectionField].indexOf(label) !== -1) {
          toggleFacetValue(
            {
              Name: facetName,
              selectionField: selectionField,
            },
            {
              Value: value,
              Label: label,
            }
          );
        } else {
          setFacetValues( {
            Name: facetName,
            selectionField: facetField,
          }, [{Value: value, Label: label}])
        }
      });
    });
  }

  function removeItemsFromCompareBar(event) {
    var id = event.target.getAttribute('data-attr-id');
    document.querySelector('input[data-id='+id+']').checked=false;
    var res = Hawksearch.store.itemsToCompare.filter(i => i.DocId !== id);
    Hawksearch.store.itemsToCompare = res;
    renderCompareItemsBar();
  }

  function renderCompareModal(data) {
    var keysArray = [];
    if (!data.length) {
      return;
    }
    var ids = Object.keys(data[0].Document).filter(key => data[0].Document[key].compare);
    ids.forEach(function(key) {
       var keys = [];
        for (var i = 0; i < data.length; i++) {
          keys.push(data[i].Document[key].value[0].trim() || '-');
        }
        keys.unshift(key.replace('-', ' ').toUpperCase())
        keysArray.push(keys);
     })
    var source = document.getElementById('hawk-compare-modal');
    var template = Handlebars.compile(HAWK_ITEMS_COMPARISION_MODAL_TEMPLATE);
    source.innerHTML = template({
      items: data,
      keys: keysArray
    });
    document.getElementById("hawk-compare-modal").style.display = "block";
    document.getElementById('hawk-modal-backdrop').style.display = 'block';
  }

  function bindToggleableCompareItem() {
    document.querySelectorAll('.hawk-compareItemImage').forEach(item => {
      item.removeEventListener('click', removeItemsFromCompareBar);
      item.addEventListener('click', removeItemsFromCompareBar);
    });

    document.getElementById('hawk-compare-itembtn').addEventListener('click', function()  {
      Hawksearch.getComparedItems().then(res => {
        renderCompareModal(res.Results);
      });
    });
  }

  function renderCompareItemsBar() {
    var source = document.getElementById('hawk-compare-items-bar');
    var template = Handlebars.compile(HAWK_COMPARE_ITEM_BAR_TEMPLATE);
    source.innerHTML = template({
      items: Hawksearch.store.itemsToCompare,
      count: Math.abs(Hawksearch.store.itemsToCompare.length - 5)
    });
    bindToggleableCompareItem();
  }

  function bindCompareItemEvent()  {
    document.querySelectorAll('.hawk-compare-item').forEach(item => {
      item.addEventListener('change', function(e) {
        var isChecked = e.target.checked;

        if(Hawksearch.store.itemsToCompare.length === 5 && isChecked) {
          alert('You can compare up to 5 items');
          e.target.checked = false;
          return;
        }
        // itemsToCompare
        var id = e.target.getAttribute('data-id');
        if (isChecked) {
          var res = Hawksearch.store.searchResults.Results.find(i => i.DocId === id);
          Hawksearch.store.itemsToCompare.push(res);
        } else {
          var res = Hawksearch.store.itemsToCompare.filter(i => i.DocId !== id);
          Hawksearch.store.itemsToCompare = res;
        }
        renderCompareItemsBar();
      });
    });

  }

  function bindFacetTypeCheckboxEvent() {
    document.querySelectorAll(".hawk-checkbox").forEach((item) => {
      item.addEventListener("change", function(event) {
        event.preventDefault();
        var facetField = event.target.getAttribute("data-attr-facet-field");
        var facetName = event.target.getAttribute("data-attr-facet-name");
        var paramName = event.target.getAttribute("data-attr-facet-param-name");
        if(!facetField) {
          var facetField = this.closest('#parent-ul').getAttribute("data-attr-facet-field");
          var facetName = this.closest('#parent-ul').getAttribute("data-attr-facet-name");
          var paramName = this.closest('#parent-ul').getAttribute("data-attr-facet-param-name");
        }
        var selectionField = paramName ? paramName : facetField;
        var isChecked = event.target.checked;
        var value = event.target.getAttribute("data-attr-value");
        var label = event.target.getAttribute("data-attr-label");
        if (isChecked) {
          // if(selectedFacets[selectionField]) {
          //   var selectedValues = selectedFacets[selectionField];
          //   selectedValues.push(value);
          //   selectedFacets = {
          //     [selectionField]: selectedValues
          //   }
          // } else {
          //   selectedFacets = {
          //     [selectionField]: [value]
          //   }
          // }
          // push
          // selectedFacets.push({
          //   field: selectionField,
          //   value: value,
          // });
        } else {
          // remove
          // var filtered = selectedFacets.filter((item) => item.value !== value);
          // selectedFacets = filtered;
        }

        // maintain dictionary/....
        toggleFacetValue(
          {
            Name: facetName,
            selectionField: selectionField,
          },
          {
            Value: value,
            Label: label,
          }
        );
      });
    });

    // Bind negate facet event
    document.querySelectorAll("#hawk-negate-facet").forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        var facetField = event.target.parentElement.getAttribute(
          "data-attr-facet-field"
        );
        var facetName = event.target.parentElement.getAttribute(
          "data-attr-facet-name"
        );
        var paramName = event.target.parentElement.getAttribute(
          "data-attr-facet-param-name"
        );
        var selectionField = paramName ? paramName : facetField;
        var value = event.target.parentElement.getAttribute("data-attr-value");
        toggleFacetValue(
          {
            Name: facetName,
            selectionField: selectionField,
          },
          value,
          true
        );
      });
    });

    // Bind nested facet checkbox
    document.querySelectorAll(".hawk-nested-checkboxtoggle").forEach(function(item) {
      item.addEventListener("click", function(event) {
        var element = this.parentElement.parentElement.querySelector('ul');
        if(element.classList.contains('hawk-display-none')) {
          element.classList.remove('hawk-display-none');
          element.classList.add('hawk-display-block');
        } else {
          element.classList.add('hawk-display-block');
          element.classList.add('hawk-display-none');
        }
      });
    });
  }

  function replaceHyphen(date) {
    if (!date) {
      return date;
    }
    return date.replace(/-/g, "/");
  }

  function bindDateRangeEvent() {
    document.querySelectorAll(".hawk-date-range").forEach((item) => {
      item.addEventListener("change", function (event) {
        var startDate = item.parentNode.querySelector("#hawk-range-start")
          .value;
        var endDate = item.parentNode.querySelector("#hawk-range-end").value;
        var facetField = item.parentNode.getAttribute("data-facet-field");
        var facetName = item.parentNode.getAttribute("data-facet-name");
        var selection = replaceHyphen(startDate) + "," + replaceHyphen(endDate);
        setFacetValues(
          {
            Name: facetName,
            selectionField: facetField,
          },
          [selection]
        );
        // toggleFacetValue(
        //   {
        //     Name: facetName,
        //     selectionField: facetField,
        //   },
        //   selection
        // );
      });
    });
  }

  function bindSearchWithinEvent() {
    document.querySelectorAll(".hawk-search-within").forEach((item) => {
      item.addEventListener("change", (event) => {
        event.preventDefault();
        var facetField = event.target.getAttribute("data-attr-facet-field");
        var facetName = event.target.getAttribute("data-attr-facet-name");
        var value = event.target.value;
        var searchWithinExist = selectedFacets.find(
          (item) => item.field === facetField
        );
        if (searchWithinExist) {
          // update
          var updatedFacets = selectedFacets.map((item) => {
            if (item.field === facetField) {
              return {
                field: facetField,
                value: value,
              };
            }
            return item;
          });
          selectedFacets = updatedFacets;
        } else {
          // push
          selectedFacets.push({
            field: facetField,
            value: value,
          });
        }
        // maintain dictionary/....
        toggleFacetValue(
          {
            Name: facetName,
            selectionField: facetField,
          },
          value
        );
      });
    });
  }

  // Bind Pagination Bar Events
  function bindPaginationBarEvents() {
    // Bind Sorty By events
    document.querySelectorAll("#hawk-sort-by").forEach((item) => {
      item.addEventListener("change", function (event) {
        Hawksearch.setSearchSelections({
          SortBy: event.target.value,
        });
      });
    });
    // Bind Items per page events
    document.querySelectorAll("#hawk-items-per-page").forEach((item) => {
      item.addEventListener("change", function (event) {
        Hawksearch.setSearchSelections({
          MaxPerPage: Number(event.target.value),
          PageNo: 1,
        });
      });
    });

    // Bind previous events
    document.querySelectorAll("#previous-page-btn").forEach((item) => {
      item.addEventListener("click", function (event) {
        Hawksearch.goToPreviousPage();
      });
    });

    // Bind next events
    document.querySelectorAll("#next-page-btn").forEach((item) => {
      item.addEventListener("click", function (event) {
        Hawksearch.goToNextPage();
      });
    });

    // Bind pagination input
    document.querySelectorAll("#hawk-pagination-input").forEach((item) => {
      item.addEventListener("keydown", onKeyDownPaginationInput);
    });

    // Bind page number selection
    document.querySelectorAll("#hawk-page-number").forEach((item) => {
      item.addEventListener("click", function (event) {
        var pageNumber = Number(this.getAttribute("page-number"));
        Hawksearch.goToPage(pageNumber);
      });
    });
  }

  function bindCollapsibleEvent() {
    document.querySelectorAll("#hawk-collapsible").forEach((item) => {
      item.addEventListener("click", function () {
        var element = this.parentNode.parentNode.parentNode.querySelector(
          "#hawk-facet-body"
        );
        if (element.classList.contains("hawk-display-none")) {
          element.classList.remove("hawk-display-none");
          element.classList.add("hawk-display-block");
        } else {
          element.classList.remove("hawk-display-block");
          element.classList.add("hawk-display-none");
        }
      });
    });
  }

  function bindOpenRangeFacetEvent() {
    document.querySelectorAll(".hawk-open-range").forEach((item) => {
      item.addEventListener("change", function (event) {
        var facetField = event.target.getAttribute("data-attr-facet-field");
        var facetName = event.target.getAttribute("data-attr-facet-name");
        var lowerValue = this.parentElement.querySelector('#hawk-lower-open-range').value;
        var upperValue = this.parentElement.querySelector('#hawk-upper-open-range').value;
        setFacetValues(
          {
            Name: facetName,
            selectionField: facetField,
          },
          [[lowerValue, upperValue].join(",")]
        );
      });
    });
    document.querySelectorAll("#hawk-upper-open-range").forEach((item) => {
      item.addEventListener("change", function () {
      });
    });

  }

  function bindShowMoreEvent() {
    document.querySelectorAll("#hawk-toggle-more-less").forEach((item) => {
      item.addEventListener("click", function () {
        var element = this.parentNode.querySelector("#hawk-show-more");
        if (element.classList.contains("hawk-display-none")) {
          element.classList.remove("hawk-display-none");
          element.classList.add("hawk-display-block");
          this.innerText = "(-) Show Less";
        } else {
          element.classList.remove("hawk-display-block");
          element.classList.add("hawk-display-none");
          this.innerText = "(+) Show More";
        }
      });
    });
  }

  function bindQuickLookupFacetEvent() {
    document.querySelectorAll("#hawk-facet-quick-lookup").forEach((item) => {
      item.addEventListener("keyup", function () {
        var elementList = this.parentElement.parentElement.querySelectorAll(
          ".hawk-checkbox-element"
        );
        elementList.forEach((elem) => {
          var text = elem.getAttribute("data-attr-label");
          if (
            text.toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1
          ) {
            // display block
            elem.classList.remove("hawk-display-none");
            elem.classList.add("hawk-display-block");
          } else {
            // display none
            elem.classList.remove("hawk-display-block");
            elem.classList.add("hawk-display-none");
          }
        });
      });
    });
  }

  // Bind Facets Events
  function bindFacetsEvents() {
    bindFacetTypeCheckboxEvent();
    bindFacetTypeLinkEvent();
    bindSearchWithinEvent();
    bindCollapsibleEvent();
    bindShowMoreEvent();
    bindQuickLookupFacetEvent();
    bindDateRangeEvent();
    bindSwatchFacetEvent();
    bindSizeFacetEvent();
    bindOpenRangeFacetEvent();
  }

  // NOTE: This Section will contain all the method which loads Component
  // It will load header
  function loadHeader() {
    var headerData = {
      url: "http://manage.hawksearch.com/sites/shared/images/logoHawk2.png",
      value: "Jacket",
    };
    // var source = document.getElementById("hawk-header-template").innerHTML;
    // var template = Handlebars.compile(source);
    // document.getElementById("hawk-header").innerHTML = template(headerData);
    document.getElementById("hawk-header").innerHTML = Handlebars.templates[
      "header/header"
    ](headerData);
  }

  function initilaizeNoUISlider() {
    var sliders = document.querySelectorAll(".range-slider");
    sliders.forEach((item) => {
      var rangeMin = Number(item.getAttribute("range-min"));
      var rangeMax = Number(item.getAttribute("range-max"));
      var rangeStart = Number(item.getAttribute("range-start"));
      var rangeEnd = Number(item.getAttribute("range-end"));
      var facetField = item.getAttribute("data-attr-facet-field");
      var facetName = item.getAttribute("data-attr-facet-name");
      noUiSlider.create(item, {
        start: [rangeStart, rangeEnd],
        connect: true,
        step: 1,
        range: {
          min: rangeMin,
          max: rangeMax,
        },
      });
      item.noUiSlider.on("change", function (values, handle) {
        setFacetValues(
          {
            Name: facetName,
            selectionField: facetField,
          },
          [values.join(",")]
        );
      });
    });
  }

  // NOTE: Load result items
  function loadResultItems(data) {
    // var source = document.getElementById("hawk-result-item-template").innerHTML;
    var source = document.getElementById("hawk-result-items-container");
    if (!source) {
      return;
    }
    var template = Handlebars.compile(HAWK_RESULT_ITEM_TEMPLATE);
    source.innerHTML = template(data);
    bindCompareItemEvent();
  }

  function paginate(numPages, currentPage) {
    // calculate total pages
    var start,
      end,
      pagesCutOff = 3,
      ceiling = Math.ceil(pagesCutOff / 2),
      floor = Math.floor(pagesCutOff / 2);

    if (numPages < pagesCutOff) {
      start = 0;
      end = numPages;
    } else if (currentPage >= 1 && currentPage <= ceiling) {
      start = 0;
      end = pagesCutOff;
    } else if (currentPage + floor >= numPages) {
      start = numPages - pagesCutOff;
      end = numPages;
    } else {
      start = currentPage - ceiling;
      end = currentPage + floor;
    }
    var arr = [];
    for (var i = start + 1; i <= end; i++) {
      arr.push(i);
    }
    return arr;
  }

  //-------------------- start  
  
  //Loading Content
  const Hawk_Loading = `<span>Loading...</span>`;
  var _HawkLoading_ = Handlebars.compile(Hawk_Loading);
  var hawkLoding = document.getElementById('hawk-page-loader').innerHTML = _HawkLoading_();
  //End Loading


  //header menu 
  const Hawk_Header_Menu = `<div id="header-menu"></div>`;
  var _HawkHeaderMenu_ = Handlebars.compile(Hawk_Header_Menu);
  var hawkMenu = document.getElementById('hawk-header').innerHTML = _HawkHeaderMenu_();
  //End header menu

  //start Header
  const Header_Menu = `
    <div class="container">
        <div class="grid_5">
            <a href="http://www.hawksearch.com" class="hawk-siteLogo"></a>
        </div>
        <div class="grid_7 sw_stack">
            <div class="hawk-site-search">
                <input
                id="keyword"
                class="text"
                onfocus="this.value='',this.style.color= '#000000'"
                title="enter keyword"
                value="Enter Keyword"
                type="text"
                name="keyword"
                />
                <input class="hawk-btnSearch" id="hawk_btnSearch" type="submit" value="Search" name="btnSearch">
            </div>
        </div>
    </div>
  `;
  
  var _templateHeader_ = Handlebars.compile(Header_Menu);
  var headerMenu = document.getElementById('header-menu').innerHTML = _templateHeader_();
  //end Header
  
  //start Left Hawk Facet 
  const HAWK_LEFT_FACET = `
  <div class="hawk-facet-rail">
    <div class="hawkRailNav">
      <div id="hawk-current-selection-bar" class="hawk-guidedNavWrapper"></div>
      <div id="hawk-facet-list" class="hawk-guidedNavWrapper"></div>
    </div>
  </div>
  `;
  var _templateHawkFacet_ = Handlebars.compile(HAWK_LEFT_FACET);
  var facet_hawk = document.getElementById('hawkfacets').innerHTML = _templateHawkFacet_();
  //End Hawk Facet

  const Hawk_Top_Banner = `<div id="hawk-auto-correct-keyword-list" class="hawk-auto-correct-keyword-container"></div>
                            <div id="hawk-top-banner"></div>`;
  var _HawkTopBanner_ = Handlebars.compile(Hawk_Top_Banner);
  var hawk_banner = document.getElementById('hawk-top-banner').innerHTML = _HawkTopBanner_();

  
  //top pagination
  const Hawk_Top_Pagination = `<div id="hawktoppager">
                                <div class="hawk-listingControls">
                                  <div class="hawk-mainControls clearfix">
                                      <div id="hawk-pagination-top-bar"></div>
                                  </div>
                                  <div class="hawk-subControls clearfix">
                                      <div id="hawk-compare-items-bar"></div>
                                  </div>
                                </div>
                              </div>`;
  var _HawkTopPagination_ = Handlebars.compile(Hawk_Top_Pagination);
  var hawkTopPagination = document.getElementById('hawk-top-pagination').innerHTML = _HawkTopPagination_();
  //end top pagination

  //start result
  const Hawk_Results = `<div id="hawk-result-items-container" class="hawk-results itemList productList clearfix s_1half sw_1third m_1third ui-sortable"></div>`;
  var _HawkResult_ = Handlebars.compile(Hawk_Results);
  var hawkResult = document.getElementById('hawk-result-items').innerHTML = _HawkResult_();
  //end Result

  //bottom Pagination
  const Hawk_Bottom_Paginaton = `<div class="hawk-listingControls">
                                    <div class="hawk-mainControls clearfix">
                                        <div id="hawk-pagination-bottom-bar"></div>
                                    </div>
                                  </div>`;
  var _HawkBottomPagination_ = Handlebars.compile(Hawk_Bottom_Paginaton);
  var hawkBottomPagination = document.getElementById('hawk-bottom-pagination').innerHTML = _HawkBottomPagination_();
  //end bottom Pagination

  //start Hawk Content Display
  const DISPLAY_CONTENT = `
      <div id="hawk-auto-correct-keyword-list" class="hawk-auto-correct-keyword-container"></div>
      <div id="hawk-top-banner"></div>
      <div id="hawk-tabs-bar"></div>
      <div id="hawktoppager">
          <div class="hawk-listingControls">
          <div class="hawk-mainControls clearfix">
              <div id="hawk-pagination-top-bar"></div>
          </div>
          <div class="hawk-subControls clearfix">
              <div id="hawk-compare-items-bar"></div>
          </div>
          </div>
      </div>
      <div id="hawk-bottom-banner"></div>
      <div id="hawk-bottom2-banner"></div>
      <div id="hawk-result-items-container"
          class="hawk-results itemList productList clearfix s_1half sw_1third m_1third ui-sortable"></div>
      <!-- <div id="hawk-pagination-bottom-bar"></div> -->
      <div>
          <div class="hawk-listingControls">
          <div class="hawk-mainControls clearfix">
              <div id="hawk-pagination-bottom-bar"></div>
          </div>
          </div>
      </div>
  `;
  // var _templateHawkDisplay_ = Handlebars.compile(DISPLAY_CONTENT);
  // var dipContent = document.getElementById('dis-cont').innerHTML = _templateHawkDisplay_();
  //end Hawk Content

  //----------------- end

  // NOTE: Load facet list 
  function loadFacetList(facets) {
    var source = document.getElementById("hawk-facet-list");
    if (!source) {
      return;
    }
    var template = Handlebars.compile(HAWK_FACETLIST_TEMPLATE);
    source.innerHTML = `<div class="hawk-railNavHeading">Narrow Results</div>
                        <div class="hawkRailNav">` + 
                          template(facets);         +
                        `</div>`; 
    // Bind Facet Events
    bindFacetsEvents();
    /** Slider */
    initilaizeNoUISlider();
  }
  // NOTE: Load pagination top and bottom bar
  function loadPaginationBar(pagination, sorting) {
    // var source = document.getElementById("pagination-bar-template").innerHTML;
    var topPaginatorSource = document.getElementById("hawk-pagination-top-bar");
    var bottomPaginatorSource = document.getElementById("hawk-pagination-bottom-bar");
    if(!topPaginatorSource && !bottomPaginatorSource) {
      return;
    }
    var template = Handlebars.compile(HAWK_PAGINATION_BAR_TEMPLATE);
    var parsedTemplate = template({
      pagination: pagination,
      sorting: sorting,
      pageNumbers: paginate(pagination.NofPages, pagination.CurrentPage),
    });
    // NOTE: Render top header
    if(topPaginatorSource) {
      topPaginatorSource.innerHTML = parsedTemplate;
    }
    // NOTE: Render bottom header
    if (bottomPaginatorSource) {
      bottomPaginatorSource.innerHTML = parsedTemplate;
    }
    bindPaginationBarEvents();
  }

  function bindAutocorrectKeywordEvent() {
    document
      .querySelectorAll(".hawk-autocorrect-selection")
      .forEach((item) => {
        item.addEventListener("click", function (event) {
          var label = event.target.getAttribute("data-label");
          Hawksearch.setSearchSelections({
            PageId: undefined,
            CustomUrl: undefined,
            Keyword: encodeURIComponent(label),
            FacetSelections: undefined,
            SearchWithin: undefined,
          });
        });
      });
  }

  function bindSelectedBarEvents() {
    document
      .querySelectorAll("#hawk-selected-facet-remove-btn")
      .forEach((item) => {
        item.addEventListener("click", function (event) {
          var facetField = event.target.getAttribute("data-attr-group-key");
          var facetLabel = event.target.getAttribute("data-attr-item-label");
          clearFacetValue(facetField, facetLabel);
        });
      });

    document
      .querySelectorAll("#hawk-selected-facet-remove-btn-group")
      .forEach((item) => {
        item.addEventListener("click", function (event) {
          var facetField = event.target.getAttribute("data-attr-group-key");
          Hawksearch.clearFacet(facetField);
        });
      });

    document
      .getElementById("hawk-clear-all-facets-btn")
      .addEventListener("click", function () {
        Hawksearch.clearAllFacets();
      });
  }

  function bindBannerEventsToTrack() {
    document.querySelectorAll("#hawk-banner").forEach((item) => {
      item.addEventListener("click", function (event) {

        Hawksearch.Tracking.track('bannerclick', {
          bannerId: this.getAttribute('data-banner-id'),
          campaignId: this.getAttribute('data-campaign-id'),
          trackingId: Hawksearch.store.searchResults.TrackingId,
        });
      });
    });

    // Track event when banner images loaded
    document.querySelectorAll("#hawk-banner-img-load").forEach(function(item) {
      item.addEventListener('load', function(e) {
        Hawksearch.Tracking.track('bannerimpression', {
          bannerId: e.target.closest('#hawk-banner').getAttribute('data-banner-id'),
          campaignId: e.target.closest('#hawk-banner').getAttribute('data-campaign-id'),
          trackingId: Hawksearch.store.searchResults.TrackingId,
        });
      })
    })
  }

  function bindTabBarsEvent() {
    document.querySelectorAll("#hawk-tab-selection-btn").forEach((item) => {
      item.addEventListener("click", function (event) {
        // this.classList.remove('hawk-viewOptionOff');
        // this.classList.add('hawk-viewOptionOn');
        var facetField = this.getAttribute("data-attr-facet-field");
        var facetName = this.getAttribute("data-attr-facet-name");
        var label = this.getAttribute("data-attr-label");
        var value = this.getAttribute("data-attr-value");
        setFacetValues(
          {
            Name: facetName,
            selectionField: facetField,
          },
          [
            {
              Label: label,
              Value: value,
            },
          ]
        );
      });
    });
  }

  // NOTE: Load Selection bar
  function loadSelectionBar(selectedFacets) {
    var selectedFacets = Hawksearch.store.pendingSearch.FacetSelections;
    var source = document.getElementById("hawk-current-selection-bar");
    if(!source) {
      return;
    }
    var detailedSelectedFacets = Hawksearch.store.facetSelections();
    if (Object.keys(detailedSelectedFacets).length < 1) {
      source.innerHTML = "";
      return;
    }
    var template = Handlebars.compile(HAWK_SELECTED_FACETS_BAR_TEMPLATE);
    source.innerHTML = template({selection: detailedSelectedFacets});
    // NOTE: Bind Events
    bindSelectedBarEvents();
  }

  // NOTE: Load Auto correct suggestion list

  function loadAutocorrectSuggestionList(autoCorrectKeywords) {
    var source = document.getElementById("hawk-auto-correct-keyword-list");
    if(!autoCorrectKeywords || !source) {
      if(!source) {
        return;
      }
      source.innerHTML = "";
      return;
    }
    var template = Handlebars.compile(HAWK_AUTOCORRECT_KEYWORD_TEMPLATE);
    source.innerHTML = template({
      keywords: autoCorrectKeywords,
    })
    bindAutocorrectKeywordEvent();
  }

  // NOTE: Load Banner Component
  function loadBannerComponent(zoneType, bannerId) {
    var source = document.getElementById(bannerId);
    if (!source) {
      return;
    }
    source.innerHTML = "";
    var matchedMerchandisingItems = Hawksearch.store.searchResults
      ? (Hawksearch.store.searchResults.Merchandising.Items || []).filter(
          (i) => i.Zone === zoneType
        )
      : [];

    matchedMerchandisingItems = matchedMerchandisingItems.concat(
      Hawksearch.store.searchResults
        ? (Hawksearch.store.searchResults.FeaturedItems.Items || []).filter(
            (i) => i.Zone === zoneType
          )
        : []
    );
    if (!matchedMerchandisingItems.length) {
      return;
    }
    var template = Handlebars.compile(HAWK_MERCHANDISING_BANNER_TEMPLATE);
    document.getElementById(bannerId).innerHTML = template(
      matchedMerchandisingItems
    );
  }

  // NOTE: Load Merchandising Banner
  function loadMerchandisingBanner() {
    // TODO: Empty all merchandising banner before rendering the new ones
    loadBannerComponent(BannerZone.leftTop, "hawk-top-left-banner");
    loadBannerComponent(BannerZone.leftBottom, "hawk-bottom-left-banner");
    loadBannerComponent(BannerZone.top, "hawk-top-banner");
    loadBannerComponent(BannerZone.bottom, "hawk-bottom-banner");
    loadBannerComponent(BannerZone.bottom2, "hawk-bottom2-banner");

    // Bind click event for tracking
    bindBannerEventsToTrack();
  }

  // NOTE: Load Tab selection bar i.e Products, content

  function loadTabSelectionBar(facets) {
    var container = document.getElementById("hawk-tabs-bar");
    if(!container) {
      return;
    }
    var tabs = facets.find((facet) => facet.FieldType === "tab");
    var template = Handlebars.compile(HAWK_TAB_SELECTION_BAR_TEMPLATE);
    container.innerHTML = template(tabs);
    bindTabBarsEvent();
  }

  function preselectValue(resp) {
    Object.assign(Hawksearch.store.pendingSearch, {
      PageNo: resp.Pagination.CurrentPage,
    });
    numberOfTotalPages = resp.Pagination.NofPages;
  }

  Hawksearch.loadSearchedData = function () {
    Hawksearch.getSearchedData().then(function (searchedDataResponse) {
      preselectValue(searchedDataResponse);
      loadFacetList(searchedDataResponse.Facets);
      loadResultItems(searchedDataResponse.Results);
      loadPaginationBar(
        searchedDataResponse.Pagination,
        searchedDataResponse.Sorting
      );
      // var selections = Hawksearch.store.facetSelections();
      loadSelectionBar(Hawksearch.store.pendingSearch.FacetSelections);
      loadMerchandisingBanner(Hawksearch.store.searchResults);
      loadTabSelectionBar(searchedDataResponse.Facets || []);
      loadAutocorrectSuggestionList(searchedDataResponse.DidYouMean);
      selectedFacets = Hawksearch.store.pendingSearch.FacetSelections;
    });
  };

  window.onload = function () {

    (function (Hawksearch, undefined) {
      Hawksearch.ClientGuid = "f51060e1c38446f0bacdf283390c37e8";
      // Hawksearch.SearchAPIUrl =
      //   "https://searchapi-dev.hawksearch.net/api/v2/search";
      Hawksearch.SearchAPIUrl = 'https://searchapi-dev.hawksearch.net/api/v2/search';
      Hawksearch.CompareItemsAPIURL = 'https://searchapi-dev.hawksearch.net/api/compare';
      Hawksearch.CurrentIndex = undefined;
      Hawksearch.WebsiteUrl = "http://demo.hawksearch.net";
      Hawksearch.HawkDashboardUrl = "http://dev.hawksearch.net";
      Hawksearch.TrackingUrl = "https://tracking-dev.hawksearch.net";
      Hawksearch.initAutoSuggest = function () {
        Hawksearch.suggestInit([
          {
            queryField: "#keyword",
            submitBtn: '#hawk_btnSearch',
            settings: {
              // lookupUrlPrefix:
              // "https://searchapi-dev.hawksearch.net/api/autocomplete",
              lookupUrlPrefix:
                "https://searchapi-dev.hawksearch.net/api/autocomplete",
              hiddenDivName: "hawk-main-queryDiv",
              isAutoWidth: true,
              isMobile: false,
            },
          }
        ]);
      };
    })((window.Hawksearch = window.Hawksearch || {}));

    Hawksearch.store.pendingSearch = parseSearchQueryString(location.search);
    // It will load header with logo and autocomplete input search
    // loadHeader();
    // Load Facets and results items
    Hawksearch.loadSearchedData();
    // renderCompareModal();
    if (Hawksearch.initAutoSuggest !== undefined) {
      Hawksearch.initAutoSuggest();
    }
    // NOTE: Track Event on pageload
    Hawksearch.Tracking.track('pageload', { pageType: 'custom' });
  };

  ///////////////////////////////////////////////////////////////////////////////////
  // Hawksearch Sugest Initialize.......

  Hawksearch.SuggesterGlobal = {};
  Hawksearch.SuggesterGlobal.items = [];
  Hawksearch.SuggesterGlobal.searching = false;
  Hawksearch.SuggesterGlobal.getSuggester = function (name, isMobile) {
    for (var i = 0, l = Hawksearch.SuggesterGlobal.items.length; i < l; i++) {
      if (
        typeof Hawksearch.SuggesterGlobal.items[i] == "object" &&
        Hawksearch.SuggesterGlobal.items[i].queryField === name
      ) {
        return Hawksearch.SuggesterGlobal.items[i];
      }
    }
  };

  Hawksearch.SuggesterGlobal.getMobileSuggester = function () {
    for (var i = 0, l = Hawksearch.SuggesterGlobal.items.length; i < l; i++) {
      if (
        typeof Hawksearch.SuggesterGlobal.items[i] == "object" &&
        Hawksearch.SuggesterGlobal.items[i].settings.isMobile === true
      ) {
        return Hawksearch.SuggesterGlobal.items[i];
      }
    }
  };

  // Hawksearch Suggest initialize

  Hawksearch.suggestInit = function (suggesters) {
    suggesters.forEach(function (item, index) {
      Hawksearch.SuggesterGlobal.items.push({
        queryField: item.queryField,

        settings: item.settings,
      });
      function hawksearchSuggest(settings) {
        settings = Object.assign(settings, {
          isAutoWidth: false,
          isInstatSearch: false,
          value: Hawksearch.store.pendingSearch.Keyword || "",
        });

        return optionsHandler(this, settings);

        // configures options and settings for hawk search suggest

        function optionsHandler(suggestQueryField, settings) {
          var submitBtn = suggestQueryField[0].parentElement.querySelector("#hawk_btnSearch");
          var suggestQueryFieldNode = suggestQueryField[0];

          // for some reason, Firefox 1.0 doesn't allow us to set autocomplete to off

          // this way, so you should manually set autocomplete="off" in the input tag

          // if you can -- we'll try to set it here in case you forget

          suggestQueryFieldNode.autocomplete = "off";

          suggestQueryFieldNode.value = settings.value;

          var suggesterInstanceSettings = Hawksearch.SuggesterGlobal.getSuggester(
            "#" + suggestQueryFieldNode.id
          ).settings;

          suggesterInstanceSettings.defaultKeyword = settings.value;

          suggestQueryFieldNode.addEventListener("keyup", keypressHandler);

          submitBtn.addEventListener('click', function() {
            if(suggestQueryFieldNode.value) {
              Hawksearch.setSearchSelections({
                PageId: undefined,
                CustomUrl: undefined,
                Keyword: encodeURIComponent(suggestQueryFieldNode.value),
                FacetSelections: undefined,
                SearchWithin: undefined,
              });
            }
          })

          suggestQueryFieldNode.addEventListener("focus", function (e) {
            suggesterInstanceSettings.focus = true;

            this.value = "";
          });

          if (settings.hiddenDivName) {
            suggesterInstanceSettings.divName = settings.hiddenDivName;
          } else {
            suggesterInstanceSettings.divName = "querydiv";
          }

          // This is the function that monitors the queryField, and calls the lookup functions when the queryField value changes.

          function suggestLookup(suggestQueryField) {
            var suggesterInstance = Hawksearch.SuggesterGlobal.getSuggester(
              "#" + suggestQueryFieldNode.id
            );

            var val = suggestQueryFieldNode.value;

            if (
              (suggesterInstance.settings.lastVal != val ||
                suggesterInstance.settings.lastVal != "") &&
              suggesterInstance.settings.focus &&
              Hawksearch.SuggesterGlobal.searching == false
            ) {
              suggesterInstance.settings.lastVal = val;

              suggestDoRemoteQuery(suggesterInstance, escape(val));
            }

            return true;
          }

          function suggestDoRemoteQuery(suggester, val) {
            Hawksearch.SuggesterGlobal.searching = true;
            var reqURL = suggester.settings.lookupUrlPrefix;
            requestGenerator(
              reqURL,
              {
                ClientGuid: Hawksearch.ClientGuid,
                Keyword: document.querySelector(suggester.queryField).value,
                IndexName: Hawksearch.CurrentIndex || undefined,
                DisplayFullResponse: true,
              },
              "POST"
            )
              .then(function (autoSuggestResult) {
                showQueryDiv(suggester, autoSuggestResult);
                Hawksearch.SuggesterGlobal.searching = false;
              })
              .catch(function () {
                hideSuggest();
                Hawksearch.SuggesterGlobal.searching = false;
              });
          }

          // Get the <DIV> we're using to display the lookup results, and create the <DIV> if it doesn't already exist.

          function getSuggestDiv(suggester) {
            if (!suggester.settings.globalDiv) {
              var divId = suggester.settings.divName;

              // if the div doesn't exist on the page already, create it

              if (!document.getElementById(divId)) {
                var newNode = document.createElement("div");

                newNode.setAttribute("id", divId);

                newNode.setAttribute("class", "hawk-searchQuery");

                document.body.appendChild(newNode);
              }

              // set the globalDiv referencea

              suggester.settings.globalDiv = document.getElementById(divId);
              suggester.settings.queryDiv = document.querySelector("#" + divId);
            }

            if (
              suggestQueryFieldNode &&
              suggestQueryFieldNode.offsetLeft !=
                suggester.settings.storedOffset
            ) {
              // figure out where the top corner of the div should be, based on the

              // bottom left corner of the input field

              var x = suggestQueryFieldNode.offsetLeft;
              var y =
                suggestQueryFieldNode.parentNode.parentNode.offsetTop +
                suggestQueryFieldNode.parentNode.parentNode.offsetHeight +
                25;
              var fieldID = suggestQueryFieldNode.getAttribute("id");

              suggester.settings.storedOffset = x;

              // add some formatting to the div, if we haven't already

              if (!suggester.settings.divFormatted) {
                // set positioning and apply identifier class using ID of corresponding search field

                suggester.settings.queryDiv.removeAttribute("style");
                suggester.settings.queryDiv.style.left =
                  suggestQueryFieldNode.parentNode.parentNode.offsetLeft + 20;
                suggester.settings.queryDiv.style.width =
                  suggestQueryFieldNode.parentNode.offsetWidth;
                suggester.settings.queryDiv.style.top = y;
                suggester.settings.queryDiv.setAttribute(
                  "class",
                  "hawk-searchQuery hawk-searchQuery-" + fieldID
                );

                // check to see if 'isAutoWidth' is enabled

                // if enabled apply width based on search field width

                if (settings && settings.isAutoWidth) {
                  var queryWidth = suggestQueryFieldNode.offsetWidth;

                  var minValue = 250;

                  if (queryWidth < minValue) {
                    queryWidth = minValue;
                  }

                  suggester.settings.queryDiv.css("width", queryWidth);
                }

                if (suggester.settings.isMobile) {
                  // $(suggester.settings.queryDiv).closest("input").focus();

                  suggester.settings.queryDiv.removeAttribute("style");

                  suggester.settings.queryDiv.style.width = "100%";

                  suggester.settings.queryDiv.style.height = "100%";

                  suggester.settings.queryDiv.style.top = "120px";

                  suggester.settings.queryDiv.style.background =
                    "rgba(30,30,30,0.8)";

                  suggester.settings.queryDiv.style.color = "white";

                  suggester.settings.queryDiv.setAttribute(
                    "class",
                    "hawk-searchQuery hawk-searchQuery-" + fieldID
                  );
                }

                //Hawksearch.SuggesterGlobal.divFormatted = true;
              }
            }

            return suggester.settings.queryDiv;
          }

          function suggestIsAbove(suggester) {
            if (suggester.settings.isAbove) {
              var queryHeight = suggester.settings.queryDiv.outerHeight(true);

              var y = suggestQueryFieldNode.offsetTop - queryHeight;

              suggester.settings.queryDiv.css({
                top: y,
              });

              if (!suggester.settings.queryDiv.hasClass("hawk-queryAbove")) {
                suggester.settings.queryDiv.addClass("hawk-queryAbove");
              }
            }
          }

          // This is the key handler function, for when a user presses the up arrow, down arrow, tab key, or enter key from the input field.

          function keypressHandler(e) {
            var suggestDiv = getSuggestDiv(
                Hawksearch.SuggesterGlobal.getSuggester("#" + e.target.id)
              ),
              divNode = suggestDiv[0];

            // don't do anything if the div is hidden

            // if (suggestDiv.is(":hidden")) {
            //   //return true;
            // }

            // make sure we have a valid event variable

            if (!e && window.event) {
              e = window.event;
            }

            var key;

            if (window.event) {
              key = e.keyCode; // IE
            } else {
              key = e.which;
            }

            // if this key isn't one of the ones we care about, just return

            var KEYUP = 38;

            var KEYDOWN = 40;

            var KEYENTER = 13;

            var KEYTAB = 9;

            if (
              key != KEYUP &&
              key != KEYDOWN &&
              key != KEYENTER &&
              key != KEYTAB
            ) {
              suggestLookup(suggestQueryField, settings, e);

              return true;
            }

            // get the span that's currently selected, and perform an appropriate action

            var selectedIndex = getSelectedItem(suggestDiv);

            //var selSpan = Hawksearch.suggest.setSelectedSpan(div, selNum);

            var selectedItem;

            if (key == KEYENTER) {
              if (selectedIndex >= 0) {
                var selectedItem = setSelectedItem(suggestDiv, selectedIndex);

                _selectResult(selectedItem);

                e.cancelBubble = true;

                if (window.event) {
                  return false;
                } else {
                  e.preventDefault();
                }
              } else {
                hideSuggest(e);
                Hawksearch.setSearchSelections({
                  PageId: undefined,
                  CustomUrl: undefined,
                  Keyword: encodeURIComponent(suggestQueryFieldNode.value),
                  FacetSelections: undefined,
                  SearchWithin: undefined,
                });
                return true;
              }
            } else if (key == KEYTAB) {
              if (
                selectedIndex + 1 <
                suggestDiv.querySelectorAll(".hawk-sqItem").length
              ) {
                e.cancelBubble = true;

                e.preventDefault();

                selectedItem = setSelectedItem(suggestDiv, selectedIndex + 1);
              } else {
                hideSuggest(e);
              }
            } else {
              if (key == KEYUP) {
                selectedItem = setSelectedItem(suggestDiv, selectedIndex - 1);
              } else if (key == KEYDOWN) {
                selectedItem = setSelectedItem(suggestDiv, selectedIndex + 1);
              }
            }

            return true;
          }

          // displays query div and query results

          function showQueryDiv(suggester, autoSuggestResult) {
            var suggestDiv = getSuggestDiv(suggester),
              // divNode = suggestDiv[0];
              divNode = suggestDiv;

            if (
              autoSuggestResult === null ||
              (autoSuggestResult.Count === 0 &&
                autoSuggestResult.ContentCount === 0 &&
                (autoSuggestResult.Categories == null ||
                  autoSuggestResult.Categories.length === 0) &&
                (autoSuggestResult.Popular == null ||
                  autoSuggestResult.Popular.length === 0))
            ) {
              showSuggest(suggester, false);

              return;
            }

            // remove any results that are already there

            while (divNode.childNodes.length > 0)
              divNode.removeChild(divNode.childNodes[0]);

            var categories = autoSuggestResult.Categories;

            var popular = autoSuggestResult.Popular;

            var products = autoSuggestResult.Products;

            var content = autoSuggestResult.Content;
            var trackingVersion = autoSuggestResult.TrackingVersion;

            var popularHeading = "Popular Searches";

            if (
              autoSuggestResult.PopularHeading != "" &&
              autoSuggestResult.PopularHeading != null
            ) {
              popularHeading = autoSuggestResult.PopularHeading;
            }

            showTerms(
              popular,
              popularHeading,
              Hawksearch.Schema.AutoCompleteClick.AutoCompleteType.popular,
              suggester,
              trackingVersion
            );

            var categoryHeading = "Top Product Categories";

            if (
              autoSuggestResult.CategoryHeading != "" &&
              autoSuggestResult.CategoryHeading != null
            ) {
              categoryHeading = autoSuggestResult.CategoryHeading;
            }

            showTerms(
              categories,
              categoryHeading,
              Hawksearch.Schema.AutoCompleteClick.AutoCompleteType.category,
              suggester,
              trackingVersion
            );

            var productsTitle =
              products.length == 1
                ? "Top Product Match"
                : "Top " + products.length + " Product Matches";

            if (
              autoSuggestResult.ProductHeading != "" &&
              autoSuggestResult.ProductHeading != null
            ) {
              productsTitle = autoSuggestResult.ProductHeading;
            }

            showProducts(suggestDiv, products, productsTitle, trackingVersion);

            var contentTitle =
              content.length == 1
                ? "Top Content Match"
                : "Top " + content.length + " Content Matches";

            if (
              autoSuggestResult.ContentHeading != "" &&
              autoSuggestResult.ContentHeading != null
            ) {
              contentTitle = autoSuggestResult.ContentHeading;
            }

            showContent(suggestDiv, content, contentTitle, trackingVersion);

            if (
              categories.length > 0 ||
              popular.length > 0 ||
              products.length > 0 ||
              content.length > 0
            ) {
              showFooter(suggestDiv, autoSuggestResult, suggester);

              showSuggest(suggester, true);
            }

            if (suggester.settings.isMobile) {
              suggester.settings.queryDiv
                .querySelectorAll(".hawk-sqHeader")
                .forEach(function (item) {
                  item.style.color = "white !important";
                  item.style.background = "#616161 !important";
                  item.style.textTransform = "uppercase !important";
                  item.style.padding = "20px !important";
                });

              suggester.settings.queryDiv
                .querySelectorAll(".hawk-sqFooter")
                .forEach(function (item) {
                  item.style.color = "white !important";
                  item.style.background = "#616161 !important";
                  item.style.textTransform = "uppercase !important";
                  item.style.padding = "20px !important";
                });

              suggester.settings.queryDiv
                .querySelectorAll(".hawk-searchQuery")
                .forEach(function (item) {
                  item.style.color = "white !important";
                  item.style.background = "#616161 !important";
                  item.style.textTransform = "uppercase !important";
                  item.style.padding = "20px !important";
                });

              suggester.settings.queryDiv
                .querySelectorAll(".hawk-sqItemName")
                .forEach(function (item) {
                  item.style.color = "white !important";
                  item.style.background = "#616161 !important";
                  item.style.textTransform = "uppercase !important";
                  item.style.padding = "20px !important";
                });

              suggester.settings.queryDiv
                .querySelectorAll(".hawk-sqItem")
                .forEach(function (item) {
                  item.style.color = "white !important";
                  item.style.background = "transparent !important";
                  item.style.textTransform = "uppercase !important";
                  item.style.padding = "20px !important";
                  item.style.border = "none !important";
                });

              // $(suggester.settings.queryDiv)
              //   .find(".hawk-sqItem")
              //   .each(function (item) {
              //     this.style.setProperty("color", "white", "important");

              //     this.style.setProperty(
              //       "background",
              //       "transparent",
              //       "important"
              //     );

              //     this.style.setProperty(
              //       "text-transform",
              //       "uppercase",
              //       "important"
              //     );

              //     this.style.setProperty("padding", "20px", "important");

              //     this.style.setProperty("border", "none", "important");

              //     $(this).hover(
              //       function () {
              //         this.style.setProperty(
              //           "background",
              //           "#a0a0a0",
              //           "important"
              //         );
              //       },
              //       function () {
              //         this.style.setProperty(
              //           "background",
              //           "inherit",
              //           "important"
              //         );
              //       }
              //     );
              //   });

              suggester.settings.queryDiv
                .querySelectorAll(".hawk-sqContent")
                .forEach(function (item) {
                  item.style.color = "white !important";
                  item.style.background = "rgba(30,30,30,0.8) !important";
                  item.style.textTransform = "uppercase !important";
                  item.style.padding = "20px !important";
                  item.style.border = "none !important";
                });
            }
          }

          // controls the visibility of the result lookup based on the "show" parameter

          function showSuggest(suggester, show) {
            if (show === false) {
              Hawksearch.SuggesterGlobal.items.forEach(function (item) {
                item.settings.globalDiv.style.display = "none";
              });

              document
                .querySelector("body")
                .removeEventListener("click", hideSuggest);
            } else {
              var suggestDisplay = getSuggestDiv(suggester);

              // suggestDisplay.show();
              suggestDisplay.style.display = "block";

              document
                .querySelector("body")
                .addEventListener("click", hideSuggest);
            }
          }

          // We originally used showSuggest as the function that was called by the onBlur

          // event of the field, but it turns out that Firefox will pass an event as the first

          // parameter of the function, which would cause the div to always be visible.

          function hideSuggest(e) {
            var updatedDisplay = false;

            // if (
            //   !updatedDisplay &&
            //   $(e.target).closest(".hawk-searchQuery").length <= 0
            // ) {
            showSuggest(null, false);

            //   updatedDisplay = true;
            // }
          }

          function isEven(num) {
            if (num !== false && num !== true && !isNaN(num)) {
              return num % 2 == 0;
            } else return false;
          }

          function showTerms(terms, title, type, suggester, trackingVersion) {
            if (terms.length >= 1) {
              //suggestDiv.empty();

              suggestDivNode = suggester.settings.globalDiv;

              // create and append suggest header to suggest container

              var suggestHeader = document.createElement("div");

              suggestHeader.className = "hawk-sqHeader";

              suggestHeader.innerHTML = title;

              suggestDivNode.appendChild(suggestHeader);

              // set up and append suggest content to suggest container

              var suggestContent = document.createElement("ul");

              suggestContent.className = "hawk-sqContent";

              suggestDivNode.appendChild(suggestContent);

              // loop through suggest options

              var resultItems = "";

              for (var i = 0; i < terms.length; i++) {
                var term = terms[i];

                if (term.Value == null) continue;

                var resultItem = document.createElement("li");

                resultItem.setAttribute("data-url", term.Url);

                resultItem.setAttribute("data-autoCompleteType", type);

                // check for odd/even alternative styling

                if (isEven(i)) {
                  resultItem.className = "hawk-sqItem term";
                } else {
                  resultItem.className = "hawk-sqItem hawk-sqItemAlt term";
                }

                var resultItemContent = document.createElement("h1");

                resultItemContent.className = "hawk-sqItemName";

                resultItemContent.innerHTML = term.Value;

                resultItem.appendChild(resultItemContent);

                // append results of suggest options to the suggest content container

                suggestContent.appendChild(resultItem);
              }

              // find all newly added suggest options

              var suggestItems = suggester.settings.globalDiv.querySelectorAll(
                ".hawk-sqContent .hawk-sqItem"
              );

              // pass suggestItems to 'suggestItemHandler' to handle events

              suggestItemHandler(trackingVersion, suggestItems);

              // check to see if query div should show above field

              suggestIsAbove(suggester);
            }
          }

          function showProducts(suggestDiv, products, title, trackingVersion) {
            if (products.length >= 1) {
              //suggestDiv.empty();

              // suggestDivNode = suggestDiv[0];
              suggestDivNode = suggestDiv;

              // create and append suggest header to suggest container

              var suggestHeader = document.createElement("div");

              suggestHeader.className = "hawk-sqHeader";

              suggestHeader.innerHTML = title;

              suggestDivNode.appendChild(suggestHeader);

              // set up and append suggest content to suggest container

              var suggestContent = document.createElement("ul");

              suggestContent.className = "hawk-sqContent";

              suggestDivNode.appendChild(suggestContent);

              // loop through suggest options

              for (var i = 0; i < products.length; i++) {
                var product = products[i];

                var resultItem = document.createElement("li");

                // check for odd/even alternative styling

                if (isEven(i)) {
                  resultItem.className = "hawk-sqItem";
                } else {
                  resultItem.className = "hawk-sqItem hawk-sqItemAlt";
                }

                resultItem.setAttribute("data-url", product.Url);

                resultItem.setAttribute(
                  "data-autoCompleteType",
                  Hawksearch.Schema.AutoCompleteClick.AutoCompleteType.product
                );

                resultItem.innerHTML = product.Html;

                // append results of suggest options to the suggest content container

                suggestContent.appendChild(resultItem);
              }

              // find all newly added suggest options
              var suggestItems = suggestDiv.querySelectorAll(
                ".hawk-sqContent .hawk-sqItem"
              );

              // pass suggestItems to 'suggestItemHandler' to handle events
              suggestItemHandler(trackingVersion, suggestItems);
            }
          }

          function showFooter(suggestDiv, autoSuggestResult, suggester) {
            // creating the footer container

            var footerContainer = document.createElement("div");

            footerContainer.className = "hawk-sqFooter";

            //creating the footer link

            var footerLink = document.createElement("a");

            footerLink.href = "javascript:void(0);";

            footerLink.innerHTML = "View All Matches";

            if (
              autoSuggestResult.ViewAllButtonLabel != "" &&
              autoSuggestResult.ViewAllButtonLabel != null
            ) {
              footerLink.innerHTML = autoSuggestResult.ViewAllButtonLabel;
            }

            //creating the footer count

            var footerCount = document.createElement("div");

            footerCount.style.marginTop = "3px";

            footerCount.style.fontSize = ".85em";

            var footerCountText = "";

            var con = "";

            if (autoSuggestResult.Count > 0) {
              footerCountText = autoSuggestResult.Count + " product(s)";

              con = ", ";
            }

            if (autoSuggestResult.ContentCount > 0) {
              footerCountText +=
                con + autoSuggestResult.ContentCount + " content item(s)";
            }

            if (footerCountText !== "") {
              footerCount.innerHTML = footerCountText;

              footerContainer.appendChild(footerCount);
            }

            //appending link and count to container

            footerContainer.appendChild(footerLink);

            //appending container to suggestDiv

            suggestDiv.appendChild(footerContainer);

            // check to see if query div should show above field

            suggestIsAbove(suggester);
          }

          function showContent(suggestDiv, content, title, trackingVersion) {
            if (content.length >= 1) {
              //suggestDiv.empty();

              suggestDivNode = suggestDiv[0];

              // create and append suggest header to suggest container

              var suggestHeader = document.createElement("div");

              suggestHeader.className = "hawk-sqHeader";

              suggestHeader.innerHTML = title;

              suggestDivNode.appendChild(suggestHeader);

              // set up and append suggest content to suggest container

              var suggestContent = document.createElement("ul");

              suggestContent.className = "hawk-sqContent";

              suggestDivNode.appendChild(suggestContent);

              // loop through suggest options

              for (var i = 0; i < content.length; i++) {
                var product = content[i];

                var resultItem = document.createElement("li");

                // check for odd/even alternative styling

                if (isEven(i)) {
                  resultItem.className = "hawk-sqItem term";
                } else {
                  resultItem.className = "hawk-sqItem hawk-sqItemAlt term";
                }

                resultItem.setAttribute("data-url", product.Url);

                resultItem.setAttribute(
                  "data-autoCompleteType",
                  Hawksearch.Schema.AutoCompleteClick.AutoCompleteType.content
                );

                resultItem.innerHTML = product.Html;

                // append results of suggest options to the suggest content container

                suggestContent.appendChild(resultItem);
              }

              // find all newly added suggest options

              var suggestItems = suggestDiv.querySelectorAll(
                ".hawk-sqContent .hawk-sqItem"
              );

              // pass suggestItems to 'suggestItemHandler' to handle events

              suggestItemHandler(trackingVersion, suggestItems);
            }
          }

          // sets up events for suggest items

          function suggestItemHandler(trackingVersion, suggestItems) {
            // bind mouseenter/mouseleave to suggest options
            // toggles active state on mouseenter

            suggestItems.forEach(function (item) {
              item.addEventListener("mouseover", mouseInteractiveEvent);
              item.addEventListener("mouseout", mouseInteractiveEvent);
            });

            // bind 'mousedown' event to suggest options to go to url

            // using 'mousedown' instead of 'click' due to 'blur' event blocking the 'click' event from firing

            suggestItems.forEach(function (item) {
              item.removeEventListener(
                "click",
                SuggestedItemClickBindingMethod
              );
              item.addEventListener("click", SuggestedItemClickBindingMethod);
            });
          }

          function mouseInteractiveEvent(e) {
            var sqItem = e.currentTarget;
            if (e.type === "mouseover") {
              highlightResult(sqItem);
            } else {
              unhighlightResult(sqItem);
            }
          }

          function SuggestedItemClickBindingMethod(e, trackingVersion) {
            SuggestedItemClick(trackingVersion, e);
          }

          function SuggestedItemClick(trackingVersion, e) {
            e.preventDefault();
            var itemUrl = e.currentTarget.getAttribute("data-url");
            // NOTE: Track Event
            Hawksearch.Tracking.track('autocompleteclick', {
              keyword: suggestQueryField[0].value,
              suggestType: e.target.closest('li').getAttribute('data-autocompletetype'),
              name: e.target.querySelector('h1')? e.target.querySelector('h1').textContent : e.target.textContent,
              url: itemUrl,
            });

            var name = e.target.textContent.replace(/\u00bb/g, "&raquo;");

            if (name === "") {
              name = $(e.target)
                .parents(".hawk-sqActive")
                .find("div.hawk-sqItemContent h1")
                .text();
            }


            // window.location = itemUrl;
          }

          // This is called whenever the user clicks one of the lookup results.

          // It puts the value of the result in the queryField and hides the lookup div.

          function selectResult(item) {
            _selectResult(item);
          }

          // This actually fills the field with the selected result and hides the div

          function _selectResult(item) {
            itemUrl = item.getAttribute("data-url");

            window.location = itemUrl;
          }

          // This is called when a user mouses over a lookup result

          function highlightResult(item) {
            _highlightResult(item);
          }

          // This actually highlights the selected result

          function _highlightResult(item) {
            if (item == null) return;

            item.classList.add("hawk-sqActive");
          }

          // This is called when a user mouses away from a lookup result

          function unhighlightResult(item) {
            _unhighlightResult(item);
          }

          // This actually unhighlights the selected result

          function _unhighlightResult(item) {
            item.classList.remove("hawk-sqActive");
          }

          // Get the number of the result that's currently selected/highlighted

          // (the first result is 0, the second is 1, etc.)

          function getSelectedItem(suggestDiv) {
            var count = -1;

            // var sqItems = suggestDiv.find(".hawk-sqItem");
            var sqItems = suggestDiv.querySelectorAll(".hawk-sqItem");

            if (sqItems) {
              var sqItemsCount = [];
              var itemIndex = -1;
              sqItems.forEach(function (item, index) {
                if (item.classList.contains("hawk-sqActive")) {
                  itemIndex = index;
                  sqItemsCount.push(item);
                }
              });
              if (sqItemsCount.length == 1) {
                count = itemIndex;
              }
            }

            return count;
          }

          // Select and highlight the result at the given position

          function setSelectedItem(suggestDiv, selectedIndex) {
            var count = -1;

            var selectedItem = null;

            var first = null;

            var sqItems = suggestDiv.querySelectorAll(".hawk-sqItem");

            if (sqItems) {
              for (var i = 0; i < sqItems.length; i++) {
                if (first == null) {
                  first = sqItems[i];
                }

                if (++count == selectedIndex) {
                  _highlightResult(sqItems[i]);

                  selectedItem = sqItems[i];
                } else {
                  _unhighlightResult(sqItems[i]);
                }
              }
            }

            // handle if nothing is select yet to select first

            // or loop through results if at the end/beginning.

            if (selectedItem == null && selectedIndex < 0) {
              selectedItem = sqItems[-1];

              _highlightResult(selectedItem);
            } else if (selectedItem == null) {
              selectedItem = first;

              _highlightResult(selectedItem);
            }

            return selectedItem;
          }
        }
      }
      hawksearchSuggest.call(
        document.querySelectorAll(item.queryField),
        item.settings
      );
    });
  };
})(window.Hawksearch);

// schemas

(function () {
  var root = this;
  root.Schema = {};
  root.Schema.AutoCompleteClick = {};
  root.Schema.AutoCompleteClick.AutoCompleteType = {
    popular: 1,
    category: 2,
    product: 3,
    content: 4,
  };
}.call(Hawksearch));
