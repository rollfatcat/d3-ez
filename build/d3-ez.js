/**
 * d3-ez
 *
 * @author James Saunders [james@saunders-family.net]
 * @copyright Copyright (C) 2018 James Saunders
 * @license GPLv3
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
	(factory((global.d3 = global.d3 || {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

var version = "3.3.4";

/**
 * Base Functions - Data Parse
 *
 */
function dataParse (data) {

  var levels = function () {
    if (data["key"] !== undefined) {
      return 1;
    } else {
      return 2;
    }
  }();

  var groupName = function () {
    var ret = void 0;
    if (1 === levels) {
      ret = d3.values(data)[0];
    }

    return ret;
  }();

  var groupNames = function () {
    var ret = void 0;
    if (levels > 1) {
      ret = data.map(function (d) {
        return d.key;
      });
    }

    return ret;
  }();

  var groupTotals = function () {
    var ret = void 0;
    if (levels > 1) {
      ret = {};
      d3.map(data).values().forEach(function (d) {
        var groupName = d.key;
        d.values.forEach(function (d) {
          var categoryValue = +d.value;

          ret[groupName] = typeof ret[groupName] === "undefined" ? 0 : ret[groupName];
          ret[groupName] += categoryValue;
        });
      });
    }

    return ret;
  }();

  var groupTotalsMax = function () {
    var ret = void 0;
    if (levels > 1) {
      ret = d3.max(d3.values(groupTotals));
    }

    return ret;
  }();

  var union = function union(array1, array2) {
    var ret = [];
    var arr = array1.concat(array2);
    var len = arr.length;
    var assoc = {};

    while (len--) {
      var item = arr[len];

      if (!assoc[item]) {
        ret.unshift(item);
        assoc[item] = true;
      }
    }

    return ret;
  };

  var categoryNames = function () {

    var ret = [];
    if (1 === levels) {
      ret = d3.values(data.values).map(function (d) {
        return d.key;
      });
    } else {
      d3.map(data).values().forEach(function (d) {
        var tmp = [];
        d.values.forEach(function (d, i) {
          var categoryName = d.key;
          tmp[i] = categoryName;
        });

        ret = union(tmp, ret);
      });
    }

    return ret;
  }();

  var categoryTotal = function () {
    var ret = void 0;
    if (1 === levels) {
      ret = d3.sum(data.values, function (d) {
        return d.value;
      });
    }

    return ret;
  }();

  var categoryTotals = function () {
    var ret = void 0;
    if (levels > 1) {
      ret = {};
      d3.map(data).values().forEach(function (d) {
        d.values.forEach(function (d) {
          var categoryName = d.key;
          var categoryValue = +d.value;

          ret[categoryName] = typeof ret[categoryName] === "undefined" ? 0 : ret[categoryName];
          ret[categoryName] += categoryValue;
        });
      });
    }

    return ret;
  }();

  var categoryTotalsMax = function () {
    var ret = void 0;
    if (levels > 1) {
      ret = d3.max(d3.values(categoryTotals));
    }

    return ret;
  }();

  var minValue = function () {
    var ret = void 0;
    if (1 === levels) {
      ret = d3.min(data.values, function (d) {
        return +d.value;
      });
    } else {
      d3.map(data).values().forEach(function (d) {
        d.values.forEach(function (d) {
          ret = typeof ret === "undefined" ? d.value : d3.min([ret, +d.value]);
        });
      });
    }

    return +ret;
  }();

  var maxValue = function () {
    var ret = void 0;
    if (1 === levels) {
      ret = d3.max(data.values, function (d) {
        return +d.value;
      });
    } else {
      d3.map(data).values().forEach(function (d) {
        d.values.forEach(function (d) {
          ret = typeof ret === "undefined" ? d.value : d3.max([ret, +d.value]);
        });
      });
    }

    return +ret;
  }();

  var decimalPlaces = function decimalPlaces(num) {
    var match = ("" + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
      return 0;
    }
    var ret = Math.max(0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0) - (
    // Adjust for scientific notation.
    match[2] ? +match[2] : 0));

    return ret;
  };

  var maxDecimalPlace = function () {
    var ret = 0;
    if (levels > 1) {
      d3.map(data).values().forEach(function (d) {
        d.values.forEach(function (d) {
          ret = d3.max([ret, decimalPlaces(d.value)]);
        });
      });
    }

    return ret;
  }();

  // If thresholds values are not already set attempt to auto-calculate some thresholds
  var thresholds = function () {
    var distance = maxValue - minValue;
    var ret = [+(minValue + 0.15 * distance).toFixed(maxDecimalPlace), +(minValue + 0.40 * distance).toFixed(maxDecimalPlace), +(minValue + 0.55 * distance).toFixed(maxDecimalPlace), +(minValue + 0.90 * distance).toFixed(maxDecimalPlace)];

    return ret;
  }();

  var my = {
    levels: levels,
    groupName: groupName,
    groupNames: groupNames,
    groupTotals: groupTotals,
    groupTotalsMax: groupTotalsMax,
    categoryNames: categoryNames,
    categoryTotal: categoryTotal,
    categoryTotals: categoryTotals,
    categoryTotalsMax: categoryTotalsMax,
    minValue: minValue,
    maxValue: maxValue,
    maxDecimalPlace: maxDecimalPlace,
    thresholds: thresholds
  };

  return my;
}

/**
 * Colour Palettes
 *
 * @example
 * d3.ez.palette.categorical(1);
 * d3.ez.palette.diverging(1);
 * d3.ez.palette.sequential("#ff0000", 9);
 * d3.ez.palette.lumShift(d3.ez.palette.categorical(1), 0.2);
 */
var palette = {
  categorical: function categorical(index) {
    // Categorical colour palettes are the ones that are used to separate items into
    // distinct groups or categories.
    switch (index) {
      case 1:
        // Stephen Few - Show Me the Numbers Book
        //      Blue       Orange     Green      Pink       L Brown    Purple     D.Yellow   Red        Black
        return ["#5da5da", "#faa43a", "#60bd68", "#f17cb0", "#b2912f", "#b276b2", "#decf3f", "#f15854", "#4d4d4d"];
      case 2:
        // Color Brewer - http://colorbrewer2.com/
        //      Red        L.Blue     Green      Purple     Orange     Yellow     Brown      Pink       Grey
        return ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"];
      case 3:
        // Google Design - http://www.google.com/design/spec/style/color.html
        //      D. Blue    Orange     L.Green    Purple     Yellow     L.Blue     Red        D.Green    Brown
        return ["#3f51b5", "#ff9800", "#8bc34a", "#9c27b0", "#ffeb3b", "#03a9f4", "#f44336", "#009688", "#795548"];
    }
  },

  diverging: function diverging(index) {
    // Diverging colour palettes are used for quantitative data. Usually two different hues
    // that diverge from a light colour, for the critical midpoint, toward dark colours.
    switch (index) {
      case 1:
        // Color Brewer - Colourblind Safe
        return ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f", "#01665e"];
      case 2:
        // Color Brewer - RAG
        return ["#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850"];
      case 3:
        // Chroma.js - http://gka.github.io/palettes/#colors=Blue,Ivory,Red|steps=9|bez=0|coL=0
        return ["#0000ff", "#8052fe", "#b58bfb", "#ddc5f7", "#fffff0", "#ffcfb4", "#ff9e7a", "#ff6842", "#ff0000"];
    }
  },

  sequential: function sequential(origHex, count) {
    // Sequential colour palettes are primarily used to encode quantitative differences.
    // Quantitative values are arranged sequentially, from low to high.
    var lumStep = 0.1;
    var lumMax = lumStep * count / 2;
    var lumMin = 0 - lumMax;

    var lumScale = d3.scaleLinear().domain([1, count]).range([lumMin, lumMax]);

    var result = [];
    for (var i = 1; i <= count; i++) {
      var lum = lumScale(i);

      // Validate and normalise Hex value.
      origHex = String(origHex).replace(/[^0-9a-f]/gi, "");
      if (origHex.length < 6) {
        origHex = origHex[0] + origHex[0] + origHex[1] + origHex[1] + origHex[2] + origHex[2];
      }

      // Convert to decimal and change luminosity
      var newHex = "#";
      var c = void 0;
      for (var j = 0; j < 3; j++) {
        c = parseInt(origHex.substr(j * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        newHex += ("00" + c).substr(c.length);
      }
      result.push(newHex);
    }
    return result;
  },

  lumShift: function lumShift(colors, lum) {
    var result = [];
    colors.forEach(function addNumber(origHex, index) {
      origHex = String(origHex).replace(/[^0-9a-f]/gi, "");
      if (origHex.length < 6) {
        origHex = origHex[0] + origHex[0] + origHex[1] + origHex[1] + origHex[2] + origHex[2];
      }
      lum = lum || 0;

      // Convert to decimal and change luminosity
      var newHex = "#";
      for (var i = 0; i < 3; i++) {
        var c = parseInt(origHex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        newHex += ("00" + c).substr(c.length);
      }
      result[index] = newHex;
    });
    return result;
  }
};

/**
 * Reusable Credit Tag Component
 *
 */
function componentCreditTag () {

  /**
   * Default Properties
   */
  var text = "d3-ez.net";
  var href = "http://d3-ez.net";

  /**
   * Constructor
   */
  function my(selection) {
    var creditTag = selection.selectAll("#creditTag").data([0]).enter().append("g").attr("id", "creditTag");

    var creditText = creditTag.append("text").text(text).style("text-anchor", "end").attr("xlink:href", href).on("click", function () {
      window.open(href);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.text = function (_) {
    if (!arguments.length) return text;
    text = _;
    return this;
  };

  my.href = function (_) {
    if (!arguments.length) return href;
    href = _;
    return this;
  };

  return my;
}

/**
 * Reusable Title Component
 *
 */
function componentTitle () {

  /**
   * Default Properties
   */
  var mainText = "Title";
  var subText = "Sub Title";
  var height = 40;
  var width = 200;

  /**
   * Constructor
   */
  function my(selection) {
    selection.selectAll("#titleGroup").data([0]).enter().append("g").attr("id", "titleGroup");
    var titleGroup = selection.select("#titleGroup");

    titleGroup.selectAll(".title").data([mainText]).enter().append("text").classed("title", true).text(function (d) {
      return d;
    });
    var title = titleGroup.select(".title").text(mainText);

    titleGroup.selectAll(".subTitle").data([subText]).enter().append("text").classed("subTitle", true).text(function (d) {
      return d;
    });
    var subTitle = titleGroup.select(".subTitle").text(subText);

    // Centre Text
    // let titleOffset = 0 - (title.node().getBBox().width / 2);
    // let subTitleOffset = 0 - (subTitle.node().getBBox().width / 2);
    title.style("text-anchor", "middle").attr("transform", "translate(0, 15)");
    subTitle.style("text-anchor", "middle").attr("transform", "translate(0, 30)");
  }

  /**
   * Configuration Getters & Setters
   */
  my.mainText = function (_) {
    if (!arguments.length) return mainText;
    mainText = _;
    return this;
  };

  my.subText = function (_) {
    if (!arguments.length) return subText;
    subText = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  return my;
}

/**
 * Chart Base
 *
 */
function base () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var canvas = void 0;
  var width = 600;
  var height = 400;
  var margin = { top: 15, right: 15, bottom: 15, left: 15 };
  var canvasW = 580;
  var canvasH = 380;
  var chartTop = 0;
  var classed = "d3ez";

  var chart = void 0;
  var legend = void 0;
  var title = void 0;
  var creditTag = componentCreditTag();
  var yAxisLabel = "";

  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    canvasW = width - (margin.left + margin.right);
    canvasH = height - (margin.top + margin.bottom);

    // Init Chart
    chart.dispatch(dispatch).width(canvasW).height(canvasH);

    // Init Legend
    if (legend) {
      legend.width(150).height(200);
      chart.width(chart.width() - legend.width());
    }

    // Init Title
    if (title) {
      chartTop = title.height();
      chart.height(chart.height() - title.height());
    }

    // Init Credit Tag
    creditTag.text("d3-ez.net").href("http://d3-ez.net");
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      init(data);

      // Create SVG element (if it does not exist already)
      if (!svg) {
        svg = d3.select(this).append("svg").classed(classed, true).attr("width", width).attr("height", height);

        canvas = svg.append("g").classed("canvas", true);
        canvas.append("g").classed("chartbox", true);
        canvas.append("g").classed("legendbox", true);
        canvas.append("g").classed("titlebox", true);
        canvas.append("g").classed("creditbox", true);
      } else {
        canvas = svg.select(".canvas");
      }

      // Update the canvas dimensions
      canvas.attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", canvasW).attr("height", canvasH);

      // Add Chart
      canvas.select(".chartbox").datum(data).attr("transform", "translate(" + 0 + "," + chartTop + ")").call(chart);

      // Add Legend
      if (legend && (typeof chart.colorScale === "function" || typeof chart.sizeScale === "function")) {
        if (typeof chart.colorScale === "function") {
          legend.colorScale(chart.colorScale());
        }
        if (typeof chart.sizeScale === "function") {
          legend.sizeScale(chart.sizeScale());
        }
        canvas.select(".legendbox").attr("transform", "translate(" + (canvasW - legend.width()) + "," + title.height() + ")").call(legend);
      }

      // Add Title
      if (title) {
        canvas.select(".titlebox").attr("transform", "translate(" + width / 2 + "," + 0 + ")").call(title);
      }

      // Add Credit Tag
      canvas.select(".creditbox").attr("transform", "translate(" + (width - margin.right) + "," + (height - margin.bottom) + ")").call(creditTag);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.chart = function (_) {
    if (!arguments.length) return chart;
    chart = _;
    return this;
  };

  my.legend = function (_) {
    if (!arguments.length) return legend;
    legend = _;
    return this;
  };

  my.title = function (_) {
    if (!arguments.length) return title;
    if (typeof _ === "string") {
      // If the caller has passed a plain string convert it to a title object.
      title = componentTitle().mainText(_).subText("");
    } else {
      title = _;
    }
    return this;
  };

  my.yAxisLabel = function (_) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Circular Bar Chart Component
 *
 */
function componentBarsCircular () {

  /**
   * Default Properties
   */
  var width = 300;
  var height = 300;
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;
  var radius = 150;
  var innerRadius = 20;
  var startAngle = 0;
  var endAngle = 270;
  var cornerRadius = 2;
  var classed = "barsCircular";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(width, height) / 2 : radius;

    innerRadius = typeof innerRadius === "undefined" ? radius / 4 : innerRadius;

    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var maxValue = slicedData.maxValue;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleBand().domain(categoryNames).rangeRound([innerRadius, radius]).padding(0.15) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleLinear().domain([0, maxValue]).range([startAngle, endAngle]) : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Arc Generator
      var arc = d3.arc().startAngle(0).endAngle(function (d) {
        return yScale(d.value) * Math.PI / 180;
      }).outerRadius(function (d) {
        return xScale(d.key) + xScale.bandwidth();
      }).innerRadius(function (d) {
        return xScale(d.key);
      }).cornerRadius(cornerRadius);

      // Arc Tween
      var arcTween = function arcTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(0);
        return function (t) {
          return arc(i(t));
        };
      };

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add bars to series
      var bars = seriesGroup.selectAll(".bar").data(function (d) {
        return d.values;
      });

      bars.enter().append("path").attr("d", arc).classed("bar", true).style("fill", function (d) {
        return colorScale(d.key);
      }).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(bars).transition().ease(transition.ease).duration(transition.duration).attrTween("d", arcTween);

      bars.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.innerRadius = function (_) {
    if (!arguments.length) return innerRadius;
    innerRadius = _;
    return this;
  };

  my.startAngle = function (_) {
    if (!arguments.length) return startAngle;
    startAngle = _;
    return this;
  };

  my.endAngle = function (_) {
    if (!arguments.length) return endAngle;
    endAngle = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Stacked Bar Chart Component
 *
 */
function componentBarsStacked () {

  /**
   * Default Properties
   */
  var width = 100;
  var height = 300;
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var yScale = void 0;
  var colorScale = void 0;
  var classed = "barsStacked";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var groupTotalsMax = slicedData.groupTotalsMax;
    var categoryNames = slicedData.categoryNames;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleLinear().domain([0, groupTotalsMax]).range([0, height]).nice() : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Stack Generator
      var stacker = function stacker(data) {
        var series = [];
        var y0 = 0;
        var y1 = 0;
        data.forEach(function (d, i) {
          y1 = y0 + d.value;
          series[i] = {
            key: d.key,
            value: d.value,
            y0: y0,
            y1: y1
          };
          y0 += d.value;
        });

        return series;
      };

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add bars to series
      var bars = seriesGroup.selectAll(".bar").data(function (d) {
        return stacker(d.values);
      });

      bars.enter().append("rect").classed("bar", true).attr("width", width).attr("x", 0).attr("y", height).attr("rx", 0).attr("ry", 0).attr("height", 0).attr("fill", function (d) {
        return colorScale(d.key);
      }).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(bars).transition().ease(transition.ease).duration(transition.duration).attr("width", width).attr("x", 0).attr("y", function (d) {
        return height - yScale(d.y1);
      }).attr("height", function (d) {
        return yScale(d.value);
      });

      bars.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Vertical Bar Chart Component
 *
 */
function componentBarsVertical () {

  /**
   * Default Properties
   */
  var width = 400;
  var height = 400;
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;
  var classed = "barsVertical";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var maxValue = slicedData.maxValue;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleBand().domain(categoryNames).rangeRound([0, width]).padding(0.15) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleLinear().domain([0, maxValue]).range([0, height]).nice() : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add bars to series
      var bars = seriesGroup.selectAll(".bar").data(function (d) {
        return d.values;
      });

      bars.enter().append("rect").classed("bar", true).attr("fill", function (d) {
        return colorScale(d.key);
      }).attr("width", xScale.bandwidth()).attr("x", function (d) {
        return xScale(d.key);
      }).attr("y", height).attr("rx", 0).attr("ry", 0).attr("height", 0).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(bars).transition().ease(transition.ease).duration(transition.duration).attr("x", function (d) {
        return xScale(d.key);
      }).attr("y", function (d) {
        return height - yScale(d.value);
      }).attr("height", function (d) {
        return yScale(d.value);
      });

      bars.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Labeled Node Component
 *
 */
function componentLabeledNode () {

  /**
   * Default Properties
   */
  var color = "steelblue";
  var opacity = 1;
  var strokeColor = "#000000";
  var strokeWidth = 1;
  var radius = 8;
  var label = null;
  var display = "block";
  var fontSize = 10;
  var classed = "labeledNode";
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick");

  /**
   * Constructor
   */
  function my(selection) {

    // Size Accessor
    function sizeAccessor(_) {
      return typeof radius === "function" ? radius(_) : radius;
    }

    selection.each(function (data) {
      var r = sizeAccessor(data);

      var node = d3.select(this).attr("class", classed);

      node.append("circle").attr("r", r).attr("fill-opacity", opacity)
      //.style("stroke", strokeColor)
      //.style("stroke-width", strokeWidth)
      .style("fill", color);

      node.append("text").text(label).attr("dx", -r).attr("dy", -r).style("display", display).style("font-size", fontSize + "px").attr("alignment-baseline", "middle").style("text-anchor", "end");
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.color = function (_) {
    if (!arguments.length) return color;
    color = _;
    return this;
  };

  my.opacity = function (_) {
    if (!arguments.length) return opacity;
    opacity = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.label = function (_) {
    if (!arguments.length) return label;
    label = _;
    return this;
  };

  my.display = function (_) {
    if (!arguments.length) return display;
    display = _;
    return this;
  };

  my.fontSize = function (_) {
    if (!arguments.length) return fontSize;
    fontSize = _;
    return this;
  };

  my.stroke = function (_width, _color) {
    if (!arguments.length) return [strokeWidth, strokeColor];
    strokeWidth = _width;
    strokeColor = _color;
    return this;
  };

  my.classed = function (_) {
    if (!arguments.length) return classed;
    classed = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Scatter Plot Component
 *
 */
function componentBubbles () {

  /**
   * Default Properties
   */
  var width = 300;
  var height = 300;
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;
  var sizeScale = void 0;
  var classed = "bubbles";

  var minRadius = 10;
  var maxRadius = 20;

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    // Calculate the extents for each series.
    // TODO: use dataParse() ?
    function extents(key) {
      var serExts = [];
      d3.map(data).values().forEach(function (d) {
        var vals = d.values.map(function (e) {
          return +e[key];
        });
        serExts.push(d3.extent(vals));
      });
      // Merge all the series extents into one array.
      // Calculate overall extent.
      return d3.extent([].concat.apply([], serExts));
    }
    var xDomain = extents("x");
    var yDomain = extents("y");
    var sizeDomain = extents("value");
    var categoryNames = data.map(function (d) {
      return d.key;
    });

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // If the sizeScale has not been passed then attempt to calculate.
    sizeScale = typeof sizeScale === "undefined" ? d3.scaleLinear().domain(sizeDomain).range([minRadius, maxRadius]) : sizeScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleLinear().domain(xDomain).range([0, width]).nice() : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleLinear().domain(yDomain).range([height, 0]).nice() : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add bubbles to series
      var bubble = componentLabeledNode().radius(function (d) {
        return sizeScale(d.value);
      }).color(function (d) {
        return colorScale(d.series);
      }).label(function (d) {
        return d.key;
      }).stroke(1, "white").display("none").classed("bubble").dispatch(dispatch);

      var bubbles = seriesGroup.selectAll(".bubble").data(function (d) {
        return d.values;
      });

      bubbles.enter().append("g").attr("transform", function (d) {
        return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
      }).call(bubble).on("mouseover", function (d) {
        d3.select(this).select("text").style("display", "block");
        dispatch.call("customValueMouseOver", this, d);
      }).on("mouseout", function () {
        d3.select(this).select("text").style("display", "none");
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(bubbles);

      /*
      bubbles.enter().append("circle")
        .attr("class", "bubble")
        .attr("cx", function(d) { return xScale(d.x); })
        .attr("cy", function(d) { return yScale(d.y); })
        .attr("r", function(d) { return sizeScale(d.value); })
        .style("fill", function(d) { return colorScale(d.series); })
        .on("mouseover", function(d) { dispatch.call("customValueMouseOver", this, d.value); })
        .on("click", function(d) { dispatch.call("customValueClick", this, d.value); })
        .merge(bubbles)
        .transition()
        .ease(transition.ease)
        .duration(transition.duration)
        .attr("r", function(d) { return sizeScale(d.value); });
      */

      bubbles.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.sizeScale = function (_) {
    if (!arguments.length) return sizeScale;
    sizeScale = _;
    return my;
  };

  my.minRadius = function (_) {
    if (!arguments.length) return minRadius;
    minRadius = _;
    return this;
  };

  my.maxRadius = function (_) {
    if (!arguments.length) return maxRadius;
    maxRadius = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Candle Stick Component
 *
 */
function componentCandleSticks () {

  /**
   * Default Properties
   */
  var width = 400;
  var height = 400;
  var colors = ["green", "red"];
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = d3.scaleOrdinal().range(colors).domain([true, false]);
  var candleWidth = 3;
  var classed = "candleSticks";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    // Slice Data, calculate totals, max etc.
    var maxDate = d3.max(data.values, function (d) {
      return d.date;
    });
    var minDate = d3.min(data.values, function (d) {
      return d.date;
    });

    var xDomain = [new Date(minDate - 8.64e7), new Date(maxDate + 8.64e7)];
    var yDomain = [d3.min(data.values, function (d) {
      return d.low;
    }), d3.max(data.values, function (d) {
      return d.high;
    })];

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain([true, false]).range(colors) : colorScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleTime().domain(xDomain).range([0, width]) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleLinear().domain(yDomain).range([height, 0]).nice() : yScale;
  }

  /**
   * Constructor
   */
  var my = function my(selection) {
    init(selection.data()[0]);
    selection.each(function () {

      // Is Up Day
      var isUpDay = function isUpDay(d) {
        return d.close > d.open;
      };

      // Line Function
      var line = d3.line().x(function (d) {
        return d.x;
      }).y(function (d) {
        return d.y;
      });

      // High Low Lines
      var highLowLines = function highLowLines(bars) {
        var paths = bars.selectAll(".high-low-line").data(function (d) {
          return [d];
        });

        paths.enter().append("path").classed("high-low-line", true).attr("d", function (d) {
          return line([{ x: xScale(d.date), y: yScale(d.high) }, { x: xScale(d.date), y: yScale(d.low) }]);
        });
      };

      // Open Close Bars
      var openCloseBars = function openCloseBars(bars) {
        var rect = bars.selectAll(".open-close-bar").data(function (d) {
          return [d];
        });

        rect.enter().append("rect").classed("open-close-bar", true).attr("x", function (d) {
          return xScale(d.date) - candleWidth;
        }).attr("y", function (d) {
          return isUpDay(d) ? yScale(d.close) : yScale(d.open);
        }).attr("width", candleWidth * 2).attr("height", function (d) {
          return isUpDay(d) ? yScale(d.open) - yScale(d.close) : yScale(d.close) - yScale(d.open);
        });
      };

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add candles to series
      var candlesSelect = seriesGroup.selectAll(".candle").data(function (d) {
        return d.values;
      });

      var candles = candlesSelect.enter().append("g").classed("candle", true).attr("fill", function (d) {
        return colorScale(isUpDay(d));
      }).attr("stroke", function (d) {
        return colorScale(isUpDay(d));
      }).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(candlesSelect);

      highLowLines(candles);
      openCloseBars(candles);
      // openCloseTicks(candles);

      candles.exit().remove();
    });
  };

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.candleWidth = function (_) {
    if (!arguments.length) return candleWidth;
    candleWidth = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Circular Axis Component
 *
 */
function componentCircularAxis () {

  /**
   * Default Properties
   */
  var width = 300;
  var height = 300;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var radius = 150;
  var radialScale = void 0;
  var ringScale = void 0;

  /**
   * Constructor
   */
  function my(selection) {
    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(width, height) / 2 : radius;

    // Create axis group
    var axisSelect = selection.selectAll(".axis").data([0]);

    var axis = axisSelect.enter().append("g").classed("axis", true).on("click", function (d) {
      dispatch.call("customClick", this, d);
    }).merge(axisSelect);

    // Outer circle
    var outerCircle = axis.selectAll(".outerCircle").data([radius]).enter().append("circle").classed("outerCircle", true).attr("r", function (d) {
      return d;
    }).style("fill", "none").attr("stroke-width", 2).attr("stroke", "#ddd");

    // Tick Data Generator
    var tickData = function tickData() {
      var tickArray = void 0,
          tickPadding = void 0;
      if (typeof ringScale.ticks === "function") {
        // scaleLinear
        tickArray = ringScale.ticks();
        tickPadding = 0;
      } else {
        // scaleBand
        tickArray = ringScale.domain();
        tickPadding = ringScale.bandwidth() / 2;
      }

      return tickArray.map(function (d) {
        return {
          value: d,
          radius: ringScale(d),
          padding: tickPadding
        };
      });
    };

    var tickCirclesGroupSelect = axis.selectAll(".tickCircles").data(function () {
      return [tickData()];
    });

    var tickCirclesGroup = tickCirclesGroupSelect.enter().append("g").classed("tickCircles", true).merge(tickCirclesGroupSelect);

    var tickCircles = tickCirclesGroup.selectAll("circle").data(function (d) {
      return d;
    });

    tickCircles.enter().append("circle").style("fill", "none").attr("stroke-width", 1).attr("stroke", "#ddd").merge(tickCircles).transition().attr("r", function (d) {
      return d.radius + d.padding;
    });

    tickCircles.exit().remove();

    // Spoke Data Generator
    var spokeData = function spokeData() {
      var spokeCount = 0;
      var spokeArray = [];
      if (typeof radialScale.ticks === "function") {
        // scaleLinear
        var min = d3.min(radialScale.domain());
        var max = d3.max(radialScale.domain());
        spokeCount = radialScale.ticks().length;
        var spokeIncrement = (max - min) / spokeCount;
        for (var i = 0; i <= spokeCount; i++) {
          spokeArray[i] = (spokeIncrement * i).toFixed(0);
        }
      } else {
        // scaleBand
        spokeArray = radialScale.domain();
        spokeCount = spokeArray.length;
        spokeArray.push("");
      }

      var spokeScale = d3.scaleLinear().domain([0, spokeCount]).range(radialScale.range());

      return spokeArray.map(function (d, i) {
        return {
          value: d,
          rotate: spokeScale(i)
        };
      });
    };

    var spokesGroupSelect = axis.selectAll(".spokes").data(function () {
      return [spokeData()];
    });

    var spokesGroup = spokesGroupSelect.enter().append("g").classed("spokes", true).merge(spokesGroupSelect);

    var spokes = spokesGroup.selectAll("line").data(function (d) {
      return d;
    });

    spokes.enter().append("line").attr("id", function (d) {
      return d.value;
    }).attr("y2", -radius).merge(spokes).attr("transform", function (d) {
      return "rotate(" + d.rotate + ")";
    });

    spokes.exit().remove();
  }

  /**
   * Configuration Getters & Setters
   */
  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.radialScale = function (_) {
    if (!arguments.length) return radialScale;
    radialScale = _;
    return my;
  };

  my.ringScale = function (_) {
    if (!arguments.length) return ringScale;
    ringScale = _;
    return my;
  };

  return my;
}

/**
 * Reusable Radial Labels Component
 *
 */
function componentCircularRingLabels () {

  /**
   * Default Properties
   */
  var width = 300;
  var height = 300;
  var radius = void 0;
  var startAngle = 0;
  var endAngle = 360;
  var capitalizeLabels = false;
  var textAnchor = "centre";
  var radialScale = void 0;

  /**
   * Constructor
   */
  function my(selection) {
    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(width, height) / 2 : radius;

    var labelsSelect = selection.selectAll(".radialLabels").data([0]);

    var labels = labelsSelect.enter().append("g").classed("radialLabels", true).merge(labelsSelect);

    var radData = radialScale.domain();

    var defSelect = labels.selectAll("def").data(radData);

    defSelect.enter().append("def").append("path").attr("id", function (d, i) {
      return "radialLabelPath" + "-" + i;
    }).attr("d", function (d) {
      var r = radialScale(d);
      var arc = d3.arc().outerRadius(r).innerRadius(r);
      var pathConf = {
        startAngle: startAngle * Math.PI / 180,
        endAngle: endAngle * Math.PI / 180
      };
      var pathStr = arc(pathConf).split(/[A-Z]/);
      return "M" + pathStr[1] + "A" + pathStr[2];
    });

    var textSelect = labels.selectAll("text").data(radData);

    textSelect.enter().append("text").style("text-anchor", "start").attr("dy", -5).attr("dx", 5).append("textPath").attr("xlink:href", function (d, i) {
      return "#radialLabelPath" + "-" + i;
    }).attr("startOffset", "0%").text(function (d) {
      return d;
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.startAngle = function (_) {
    if (!arguments.length) return startAngle;
    startAngle = _;
    return this;
  };

  my.endAngle = function (_) {
    if (!arguments.length) return endAngle;
    endAngle = _;
    return this;
  };

  my.capitalizeLabels = function (_) {
    if (!arguments.length) return capitalizeLabels;
    capitalizeLabels = _;
    return this;
  };

  my.radialScale = function (_) {
    if (!arguments.length) return radialScale;
    radialScale = _;
    return my;
  };

  my.textAnchor = function (_) {
    if (!arguments.length) return textAnchor;
    textAnchor = _;
    return this;
  };

  return my;
}

/**
 * Reusable Circular Labels Component
 *
 */
function componentCircularSectorLabels () {

  /**
   * Default Properties
   */
  var width = 300;
  var height = 300;
  var radius = void 0;
  var startAngle = 0;
  var endAngle = 360;
  var capitalizeLabels = false;
  var textAnchor = "centre";
  var radialScale = void 0;

  /**
   * Constructor
   */
  function my(selection) {
    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(width, height) / 2 : radius;

    // Tick Data Generator
    var tickData = function tickData() {
      var tickCount = 0;
      var tickArray = [];

      if (typeof radialScale.ticks === "function") {
        // scaleLinear
        var min = d3.min(radialScale.domain());
        var max = d3.max(radialScale.domain());
        tickCount = radialScale.ticks().length;
        var tickIncrement = (max - min) / tickCount;
        for (var i = 0; i <= tickCount; i++) {
          tickArray[i] = (tickIncrement * i).toFixed(0);
        }
      } else {
        // scaleBand
        tickArray = radialScale.domain();
        tickCount = tickArray.length;
      }

      var tickScale = d3.scaleLinear().domain([0, tickCount]).range(radialScale.range());

      return tickArray.map(function (d, i) {
        return {
          value: d,
          offset: tickScale(i) / 360 * 100
        };
      });
    };

    // Unique id so that the text path defs are unique - is there a better way to do this?
    var uId = selection.attr("id") ? selection.attr("id") : "uid-" + Math.floor(1000 + Math.random() * 9000);
    selection.attr("id", uId);

    var labelsSelect = selection.selectAll(".circularLabels").data(function () {
      return [tickData()];
    });

    var labels = labelsSelect.enter().append("g").classed("circularLabels", true).merge(labelsSelect);

    // Labels
    var defSelect = labels.selectAll("def").data([radius]);

    defSelect.enter().append("def").append("path").attr("id", function () {
      var pathId = selection.attr("id") + "-path";
      return pathId;
    }).attr("d", function (d) {
      return "m0 " + -d + " a" + d + " " + d + " 0 1,1 -0.01 0";
    }).merge(defSelect);

    defSelect.exit().remove();

    var textSelect = labels.selectAll("text").data(function (d) {
      return d;
    });

    textSelect.enter().append("text").style("text-anchor", textAnchor).append("textPath").attr("xlink:href", function () {
      var pathId = selection.attr("id") + "-path";
      return "#" + pathId;
    }).text(function (d) {
      var text = d.value;
      return capitalizeLabels ? text.toUpperCase() : text;
    }).attr("startOffset", function (d) {
      return d.offset + "%";
    }).attr("id", function (d) {
      return d.value;
    }).merge(textSelect);

    textSelect.transition().select("textPath").text(function (d) {
      var text = d.value;
      return capitalizeLabels ? text.toUpperCase() : text;
    }).attr("startOffset", function (d) {
      return d.offset + "%";
    });

    textSelect.exit().remove();
  }

  /**
   * Configuration Getters & Setters
   */
  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.startAngle = function (_) {
    if (!arguments.length) return startAngle;
    startAngle = _;
    return this;
  };

  my.endAngle = function (_) {
    if (!arguments.length) return endAngle;
    endAngle = _;
    return this;
  };

  my.capitalizeLabels = function (_) {
    if (!arguments.length) return capitalizeLabels;
    capitalizeLabels = _;
    return this;
  };

  my.radialScale = function (_) {
    if (!arguments.length) return radialScale;
    radialScale = _;
    return my;
  };

  my.textAnchor = function (_) {
    if (!arguments.length) return textAnchor;
    textAnchor = _;
    return this;
  };

  return my;
}

/**
 * Reusable Donut Chart Component
 *
 */
function componentDonut () {

  /**
   * Default Properties
   */
  var width = 300;
  var height = 300;
  var radius = 150;
  var innerRadius = void 0;
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var colorScale = void 0;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var classed = "donut";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;

    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(width, height) / 2 : radius;

    innerRadius = typeof innerRadius === "undefined" ? radius / 4 : innerRadius;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      init(data);

      // Pie Generator
      var pie = d3.pie().value(function (d) {
        return d.value;
      }).sort(null).padAngle(0.015);

      // Arc Generator
      var arc = d3.arc().innerRadius(innerRadius).outerRadius(radius).cornerRadius(2);

      // Outer Arc Generator
      var outerArc = d3.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);

      // Arc Tween
      var arcTween = function arcTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(0);
        return function (t) {
          return arc(i(t));
        };
      };

      // Mid Angle
      var midAngle = function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
      };

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // TODO: I am not sure the below will work for updates?
      seriesGroup.append("g").attr("class", "slices");
      seriesGroup.append("g").attr("class", "labels");
      seriesGroup.append("g").attr("class", "lines");

      // Slices
      var slices = seriesGroup.select(".slices").selectAll("path.slice").data(function (d) {
        return pie(d.values);
      });

      slices.enter().append("path").attr("class", "slice").attr("fill", function (d) {
        return colorScale(d.data.key);
      }).attr("d", arc).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(slices).transition().duration(transition.duration).ease(transition.ease).attrTween("d", arcTween);

      slices.exit().remove();

      // Labels
      var labels = seriesGroup.select(".labels").selectAll("text.label").data(function (d) {
        return pie(d.values);
      });

      labels.enter().append("text").attr("class", "label").attr("dy", ".35em").merge(labels).transition().duration(transition.duration).text(function (d) {
        return d.data.key;
      }).attrTween("transform", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * (midAngle(d2) < Math.PI ? 1.2 : -1.2);
          return "translate(" + pos + ")";
        };
      }).styleTween("text-anchor", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start" : "end";
        };
      });

      labels.exit().remove();

      // Slice to Label Lines
      var lines = seriesGroup.select(".lines").selectAll("polyline.line").data(function (d) {
        return pie(d.values);
      });

      lines.enter().append("polyline").attr("class", "line").merge(lines).transition().duration(transition.duration).attrTween("points", function (d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1.2 : -1.2);
          return [arc.centroid(d2), outerArc.centroid(d2), pos];
        };
      });

      lines.exit().remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.innerRadius = function (_) {
    if (!arguments.length) return innerRadius;
    innerRadius = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Heat Map Ring Component
 *
 */
function componentHeatMapRing () {

  /**
   * Default Properties
   */
  var width = 300;
  var height = 300;
  var radius = 150;
  var innerRadius = 20;
  var startAngle = 0;
  var endAngle = 360;
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = [d3.rgb(214, 245, 0), d3.rgb(255, 166, 0), d3.rgb(255, 97, 0), d3.rgb(200, 65, 65)];
  var colorScale = void 0;
  var xScale = void 0;
  var yScale = void 0;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var classed = "heatMapRing";
  var thresholds = void 0;

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var groupNames = slicedData.groupNames;

    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(width, height) / 2 : radius;

    // If thresholds values are not set attempt to auto-calculate the thresholds.
    if (!thresholds) {
      thresholds = slicedData.thresholds;
    }

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleThreshold().domain(thresholds).range(colors) : colorScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleBand().domain(categoryNames).rangeRound([startAngle, endAngle]).padding(0.1) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleBand().domain(groupNames).rangeRound([radius, innerRadius]).padding(0.1) : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Pie Generator
      var segStartAngle = d3.min(xScale.range());
      var segEndAngle = d3.max(xScale.range());
      var pie = d3.pie().value(1).sort(null).startAngle(segStartAngle * (Math.PI / 180)).endAngle(segEndAngle * (Math.PI / 180)).padAngle(0.015);

      // Arc Generator
      var arc = d3.arc().outerRadius(radius).innerRadius(innerRadius).cornerRadius(2);

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add segments to series group
      var segments = seriesGroup.selectAll(".segment").data(function (d) {
        var key = d.key;
        var data = pie(d.values);
        data.forEach(function (d, i) {
          data[i].key = key;
        });

        return data;
      });

      segments.enter().append("path").attr("d", arc).attr("fill", "black").classed("segment", true).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d.data);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d.data);
      }).merge(segments).transition().duration(transition.duration).attr("fill", function (d) {
        return colorScale(d.data.value);
      });

      segments.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.innerRadius = function (_) {
    if (!arguments.length) return innerRadius;
    innerRadius = _;
    return this;
  };

  my.startAngle = function (_) {
    if (!arguments.length) return startAngle;
    startAngle = _;
    return this;
  };

  my.endAngle = function (_) {
    if (!arguments.length) return endAngle;
    endAngle = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.thresholds = function (_) {
    if (!arguments.length) return thresholds;
    thresholds = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Heat Map Table Row Component
 *
 */
function componentHeatMapRow () {

  /**
   * Default Properties
   */
  var width = 400;
  var height = 100;
  var colors = [d3.rgb(214, 245, 0), d3.rgb(255, 166, 0), d3.rgb(255, 97, 0), d3.rgb(200, 65, 65)];
  var colorScale = void 0;
  var xScale = void 0;
  var yScale = void 0;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var classed = "heatMapRow";
  var thresholds = void 0;

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var groupNames = slicedData.groupNames;

    // If thresholds values are not set attempt to auto-calculate the thresholds.
    if (!thresholds) {
      thresholds = slicedData.thresholds;
    }

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleThreshold().domain(thresholds).range(colors) : colorScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleBand().domain(categoryNames).range([0, width]).padding(0.1) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleBand().domain(groupNames).range([0, height]).padding(0.1) : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      var cellHeight = yScale.bandwidth();
      var cellWidth = xScale.bandwidth();

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add cells to series group
      var cells = seriesGroup.selectAll(".cell").data(function (d) {
        var seriesName = d.key;
        var seriesValues = d.values;

        return seriesValues.map(function (el) {
          var o = Object.assign({}, el);
          o.series = seriesName;
          return o;
        });
      });

      cells.enter().append("rect").attr("class", "cell").attr("x", function (d) {
        return xScale(d.key);
      }).attr("y", 0).attr("rx", 2).attr("ry", 2).attr("fill", "black").attr("width", cellWidth).attr("height", cellHeight).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(cells)
      //.transition()
      //.duration(transition.duration)
      .attr("fill", function (d) {
        return colorScale(d.value);
      });

      cells.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.thresholds = function (_) {
    if (!arguments.length) return thresholds;
    thresholds = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Simple HTML List
 *
 */
function componentHtmlList () {
  // HTML List Element (Populated by 'my' function)
  var listEl = void 0;

  // Default Options (Configurable via setters)
  var classed = "htmlList";

  // Dispatch (Custom events)
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Create HTML List 'ul' element (if it does not exist already)
      if (!listEl) {
        listEl = d3.select(this).append("ul").classed("d3ez", true).classed(classed, true);
      } else {
        listEl.selectAll("*").remove();
      }

      listEl.selectAll("li").data(data).enter().append("li").text(function (d) {
        return d.key;
      }).on("click", expand);

      function expand(d) {
        d3.event.stopPropagation();
        dispatch.call("customValueMouseOver", this, d);

        if (typeof d.values === "undefined") {
          return 0;
        }

        var ul = d3.select(this).on("click", collapse).append("ul");

        var li = ul.selectAll("li").data(d.values).enter().append("li").text(function (d) {
          if (typeof d.value !== "undefined") {
            return d.key + " : " + d.value;
          } else {
            return d.key;
          }
        }).on("click", expand);
      }

      function collapse() {
        d3.event.stopPropagation();
        d3.select(this).on("click", expand).selectAll("*").remove();
      }
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.classed = function (_) {
    if (!arguments.length) return classed;
    classed = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Simple HTML Table
 *
 */
function componentHtmlTable () {
  // HTML Table Element (Populated by 'my' function)
  var tableEl = void 0;

  // Default Options (Configurable via setters)
  var classed = "htmlTable";
  var width = 800;

  // Data Options (Populated by 'init' function)
  var rowNames = [];
  var columnNames = [];

  // Dispatch (Custom events)
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Initialise Data
   */
  function init(data) {
    // Cut the data in different ways....
    rowNames = data.map(function (d) {
      return d.key;
    });

    columnNames = [];
    data.map(function (d) {
      return d.values;
    })[0].forEach(function (d, i) {
      columnNames[i] = d.key;
    });
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      init(data);

      // Create HTML Table 'table' element (if it does not exist already)
      if (!tableEl) {
        tableEl = d3.select(this).append("table").classed("d3ez", true).classed(classed, true).attr("width", width);
      } else {
        tableEl.selectAll("*").remove();
      }
      var head = tableEl.append("thead");
      var foot = tableEl.append("tfoot");
      var body = tableEl.append("tbody");

      // Add table headings
      var hdr = head.append("tr");

      hdr.selectAll("th").data(function () {
        // Tack on a blank cell at the beginning,
        // this is for the top of the first column.
        return [""].concat(columnNames);
      }).enter().append("th").html(function (d) {
        return d;
      });

      // Add table body
      var rowsSelect = body.selectAll("tr").data(data);

      var rows = rowsSelect.enter().append("tr").attr("class", function (d) {
        return d.key;
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      }).merge(rowsSelect);

      // Add the first column of headings (categories)
      rows.append("th").html(function (d) {
        return d.key;
      });

      // Add the main data values
      rows.selectAll("td").data(function (d) {
        return d.values;
      }).enter().append("td").attr("class", function (d) {
        return d.key;
      }).html(function (d) {
        return d.value;
      }).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      });
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.classed = function (_) {
    if (!arguments.length) return classed;
    classed = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Line Chart Component
 *
 */
function componentLineChart () {

  /**
   * Default Properties
   */
  var width = 400;
  var height = 400;
  var transition = { ease: d3.easeBounce, duration: 1500 };
  var colors = palette.categorical(3);
  var colorScale = void 0;
  var xScale = void 0;
  var yScale = void 0;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var classed = "lineChart";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var groupNames = slicedData.groupNames;
    var maxValue = slicedData.maxValue;
    var dateDomain = d3.extent(data[0].values, function (d) {
      return d.key;
    });

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(groupNames).range(colors) : colorScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleTime().domain(dateDomain).range([0, width]) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleLinear().domain([0, maxValue * 1.05]).range([height, 0]) : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Line generation function
      var line = d3.line().curve(d3.curveCardinal).x(function (d) {
        return xScale(d.key);
      }).y(function (d) {
        return yScale(d.value);
      });

      // Line animation tween
      var pathTween = function pathTween(data) {
        var interpolate = d3.scaleQuantile().domain([0, 1]).range(d3.range(1, data.length + 1));
        return function (t) {
          return line(data.slice(0, interpolate(t)));
        };
      };

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Create series group
      var seriesLine = seriesGroup.selectAll(".seriesLine").data(function (d) {
        return [d];
      });

      seriesLine.enter().append("path").attr("class", "seriesLine").attr("stroke-width", 1.5).attr("stroke", function (d) {
        return colorScale(d.key);
      }).attr("fill", "none").merge(seriesLine).transition().duration(transition.duration).attrTween("d", function (d) {
        return pathTween(d.values);
      });

      seriesLine.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Number Row Component
 *
 */
function componentNumberCard () {

  /**
   * Default Properties
   */
  var width = 400;
  var height = 100;
  var colors = [d3.rgb("steelblue").brighter(), d3.rgb("steelblue").darker()];
  var colorScale = void 0;
  var xScale = void 0;
  var yScale = void 0;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var classed = "numberCard";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var groupNames = slicedData.groupNames;
    var maxValue = slicedData.maxValue;
    var minValue = slicedData.minValue;

    var valDomain = [minValue, maxValue];

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleLinear().domain(valDomain).range(colors) : colorScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleBand().domain(categoryNames).range([0, width]).padding(0.05) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleBand().domain(groupNames).range([0, height]).padding(0.05) : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Calculate cell sizes
      var cellHeight = yScale.bandwidth();
      var cellWidth = xScale.bandwidth();

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add numbers to series
      var numbers = seriesGroup.selectAll(".number").data(function (d) {
        return d.values;
      });

      numbers.enter().append("text").attr("class", "number").attr("x", function (d) {
        return xScale(d.key) + cellWidth / 2;
      }).attr("y", function (d) {
        return cellHeight / 2;
      }).attr("text-anchor", "middle").attr("dominant-baseline", "central").text(function (d) {
        return d["value"];
      }).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(numbers).transition().duration(1000).attr("fill", function (d) {
        return colorScale(d.value);
      });

      numbers.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Polar Area Chart Component
 *
 */
function componentPolarArea () {

  /**
   * Default Properties
   */
  var width = 300;
  var height = 300;
  var radius = 150;
  var startAngle = 0;
  var endAngle = 360;
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var colorScale = void 0;
  var xScale = void 0;
  var yScale = void 0;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var classed = "polarArea";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var maxValue = slicedData.maxValue;

    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(width, height) / 2 : radius;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleBand().domain(categoryNames).rangeRound([startAngle, endAngle]).padding(0.15) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleLinear().domain([0, maxValue]).range([0, radius]).nice() : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Pie Generator
      startAngle = d3.min(xScale.range());
      endAngle = d3.max(xScale.range());
      var pie = d3.pie().value(1).sort(null).startAngle(startAngle * (Math.PI / 180)).endAngle(endAngle * (Math.PI / 180)).padAngle(0);

      // Arc Generator
      var arc = d3.arc().outerRadius(function (d) {
        return yScale(d.data.value);
      }).innerRadius(0).cornerRadius(2);

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add segments to series
      var segments = seriesGroup.selectAll(".segment").data(function (d) {
        return pie(d.values);
      });

      segments.enter().append("path").classed("segment", true).style("fill", function (d) {
        return colorScale(d.data.key);
      }).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d.data);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d.data);
      }).merge(segments).transition().ease(transition.ease).duration(transition.duration).attr("d", arc);

      segments.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Proportional Area Circles Component
 *
 */
function componentProportionalAreaCircles () {

  /**
   * Default Properties
   */
  var width = 400;
  var height = 100;
  var colors = [d3.rgb("steelblue").brighter(), d3.rgb("steelblue").darker()];
  var colorScale = void 0;
  var xScale = void 0;
  var yScale = void 0;
  var sizeScale = void 0;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var classed = "proportionalAreaCircles";

  var minRadius = 2;
  var maxRadius = 20;
  var useGlobalScale = true;

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var groupNames = slicedData.groupNames;
    var maxValue = slicedData.maxValue;
    var minValue = slicedData.minValue;

    var valDomain = [minValue, maxValue];
    var sizeDomain = useGlobalScale ? valDomain : [0, d3.max(data[1]["values"], function (d) {
      return d["value"];
    })];

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleLinear().domain(valDomain).range(colors) : colorScale;

    // If the sizeScale has not been passed then attempt to calculate.
    sizeScale = typeof sizeScale === "undefined" ? d3.scaleLinear().domain(sizeDomain).range([minRadius, maxRadius]) : sizeScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleBand().domain(categoryNames).range([0, width]).padding(0.05) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleBand().domain(groupNames).range([0, height]).padding(0.05) : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Calculate cell sizes
      var cellHeight = yScale.bandwidth();
      var cellWidth = xScale.bandwidth();

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      var spot = componentLabeledNode().radius(function (d) {
        return sizeScale(d.value);
      }).color(function (d) {
        return colorScale(d.value);
      }).label(function (d) {
        return d.value;
      }).display("none").classed("punchSpot").dispatch(dispatch);

      // Add spots to series
      var spots = seriesGroup.selectAll(".punchSpot").data(function (d) {
        return d.values;
      });

      spots.enter().append("g").call(spot).attr("transform", function (d) {
        return "translate(" + (cellWidth / 2 + xScale(d.key)) + "," + cellHeight / 2 + ")";
      }).on("mouseover", function (d) {
        d3.select(this).select("text").style("display", "block");
        dispatch.call("customValueMouseOver", this, d);
      }).on("mouseout", function () {
        d3.select(this).select("text").style("display", "none");
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(spots);

      /*
      spots.enter()
        .append("circle")
        .attr("class", "punchSpot")
        .attr("cx", function(d) { return (cellWidth / 2 + xScale(d.key)); })
        .attr("cy", function(d) { return (cellHeight / 2); })
        .attr("r", 0)
        .on("mouseover", function(d) { dispatch.call("customValueMouseOver", this, d); })
        .on("click", function(d) { dispatch.call("customValueClick", this, d); })
        .merge(spots)
        .transition()
        .duration(transition.duration)
        .attr("fill", function(d) { return colorScale(d.value); })
        .attr("r", function(d) { return sizeScale(d['value']); });
      */

      spots.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.sizeScale = function (_) {
    if (!arguments.length) return sizeScale;
    sizeScale = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Scatter Plot Component
 *
 */
function componentScatterPlot () {

  /**
   * Default Properties
   */
  var width = 400;
  var height = 400;
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var colorScale = void 0;
  var xScale = void 0;
  var yScale = void 0;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var classed = "scatterPlot";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var groupNames = slicedData.groupNames;
    var maxValue = slicedData.maxValue;
    var dateDomain = d3.extent(data[0].values, function (d) {
      return d.key;
    });

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(groupNames).range(colors) : colorScale;

    // If the xScale has not been passed then attempt to calculate.
    xScale = typeof xScale === "undefined" ? d3.scaleTime().domain(dateDomain).range([0, width]) : xScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleLinear().domain([0, maxValue * 1.05]).range([height, 0]) : yScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Create series group
      var seriesDots = seriesGroup.selectAll(".seriesDots").data(function (d) {
        return [d];
      });

      var series = seriesDots.enter().append("g").classed("seriesDots", true).attr("fill", function (d) {
        return colorScale(d.key);
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      }).merge(seriesDots);

      // Add dots to series
      var dots = series.selectAll(".dot").data(function (d) {
        return d.values;
      });

      dots.enter().append("circle").attr("class", "dot").attr("r", 3).attr("cx", function (d) {
        return xScale(d.key);
      }).attr("cy", height).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(dots).transition().ease(transition.ease).duration(transition.duration).attr("cx", function (d) {
        return xScale(d.key);
      }).attr("cy", function (d) {
        return yScale(d.value);
      });

      dots.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Rose Chart Sector
 *
 */
function componentRoseChartSector () {

  /**
   * Default Properties
   */
  var width = 300;
  var height = 300;
  var transition = { ease: d3.easeBounce, duration: 500 };
  var radius = void 0;
  var startAngle = 0;
  var endAngle = 45;
  var colors = palette.categorical(3);
  var colorScale = void 0;
  var xScale = void 0;
  var yScale = void 0;
  var stacked = false;
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
  var classed = "roseChartSector";

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var maxValue = stacked ? slicedData.groupTotalsMax : slicedData.maxValue;

    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(width, height) / 2 : radius;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // If the yScale has not been passed then attempt to calculate.
    yScale = typeof yScale === "undefined" ? d3.scaleLinear().domain([0, maxValue]).range([0, radius]) : yScale;

    // If the xScale has been passed then re-calculate the start and end angles.
    if (typeof xScale !== "undefined") {
      startAngle = xScale(data.key);
      endAngle = xScale(data.key) + xScale.bandwidth();
    }
  }

  /**
   * Constructor
   */
  function my(selection) {
    init(selection.data());
    selection.each(function () {
      // Stack Generator
      var stacker = function stacker(data) {
        // Calculate inner and outer radius values
        var series = [];
        var innerRadius = 0;
        var outerRadius = 0;
        data.forEach(function (d, i) {
          outerRadius = innerRadius + d.value;
          series[i] = {
            key: d.key,
            value: d.value,
            innerRadius: yScale(innerRadius),
            outerRadius: yScale(outerRadius)
          };
          innerRadius += stacked ? d.value : 0;
        });

        return series;
      };

      // Arc Generator
      var arc = d3.arc().innerRadius(function (d) {
        return d.innerRadius;
      }).outerRadius(function (d) {
        return d.outerRadius;
      }).startAngle(startAngle * (Math.PI / 180)).endAngle(endAngle * (Math.PI / 180));

      // Update series group
      var seriesGroup = d3.select(this);
      seriesGroup.classed(classed, true).attr("id", function (d) {
        return d.key;
      }).on("mouseover", function (d) {
        dispatch.call("customSeriesMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customSeriesClick", this, d);
      });

      // Add arcs to series group
      var arcs = seriesGroup.selectAll(".arc").data(function (d) {
        return stacker(d.values);
      });

      arcs.enter().append("path").classed("arc", true).attr("fill", function (d) {
        return colorScale(d.key);
      }).on("mouseover", function (d) {
        dispatch.call("customValueMouseOver", this, d);
      }).on("click", function (d) {
        dispatch.call("customValueClick", this, d);
      }).merge(arcs).transition().ease(transition.ease).duration(transition.duration).attr("d", arc);

      arcs.exit().transition().style("opacity", 0).remove();
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.startAngle = function (_) {
    if (!arguments.length) return startAngle;
    startAngle = _;
    return this;
  };

  my.endAngle = function (_) {
    if (!arguments.length) return endAngle;
    endAngle = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return my;
  };

  my.xScale = function (_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return my;
  };

  my.yScale = function (_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return my;
  };

  my.stacked = function (_) {
    if (!arguments.length) return stacked;
    stacked = _;
    return my;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Reusable Size Legend Component
 *
 */
function componentLegendSize () {

	/**
  * Default Properties
  */
	var width = 100;
	var height = 200;
	var sizeScale = undefined;
	var itemCount = 4;

	/**
  * Constructor
  */
	function my(selection) {
		height = height ? height : this.attr("height");
		width = width ? width : this.attr("width");

		// Legend Box
		var legendSelect = selection.selectAll("#legendBox").data([0]);

		var legend = legendSelect.enter().append("g").attr("id", "legendBox").attr("width", width).attr("height", height).merge(legendSelect);

		var data = function data() {
			// Calculate radiusScale
			var domainMin = d3.min(sizeScale.domain());
			var domainMax = d3.max(sizeScale.domain());
			var increment = (domainMax - domainMin) / itemCount;
			var ranges = Array(itemCount).fill().map(function (v, i) {
				var rangeStart = domainMin + increment * i;
				var rangeEnd = domainMin + increment * (i + 1);
				return [rangeStart, rangeEnd];
			});

			// Calculate yScale
			var yStep = height / (itemCount * 2);
			var yDomain = [0, itemCount - 1];
			var yRange = [yStep, height - yStep];
			var yScale = d3.scaleLinear().domain(yDomain).range(yRange);

			return ranges.map(function (v, i) {
				return {
					x: sizeScale(domainMax),
					y: yScale(i),
					r: sizeScale(ranges[i][0]),
					text: v[0].toFixed(0) + " - " + v[1].toFixed(0)
				};
			});
		};

		var itemsSelect = legend.selectAll(".legendItem").data(data);

		var items = itemsSelect.enter().append("g").classed("legendItem", true).attr("transform", function (d) {
			return "translate(0," + d.y + ")";
		}).merge(itemsSelect);

		items.exit().remove();

		items.append("circle").attr("r", function (d) {
			return d.r;
		}).attr("cx", function (d) {
			return d.x;
		}).attr("fill", "lightgrey").attr("stroke", "grey").attr("stroke-width", 1);

		items.append("text").text(function (d) {
			return d.text;
		}).attr("dominant-baseline", "middle").attr("x", function (d) {
			return d.x * 2 + 5;
		});
	}

	/**
  * Configuration Getters & Setters
  */
	my.sizeScale = function (_) {
		if (!arguments.length) return sizeScale;
		sizeScale = _;
		return my;
	};

	my.height = function (_) {
		if (!arguments.length) return height;
		height = _;
		return my;
	};

	my.width = function (_) {
		if (!arguments.length) return width;
		width = _;
		return my;
	};

	my.itemCount = function (_) {
		if (!arguments.length) return itemCount;
		itemCount = _;
		return my;
	};

	return my;
}

/**
 * Reusable Categorical Legend Component
 *
 */
function componentLegendCategorical () {

  /**
   * Default Properties
   */
  var width = 100;
  var height = 200;
  var colorScale = undefined;
  var itemCount = void 0;
  var itemType = "rect";

  /**
   * Constructor
   */
  function my(selection) {
    height = height ? height : this.attr("height");
    width = width ? width : this.attr("width");

    // Legend Box
    var legendSelect = selection.selectAll("#legendBox").data([0]);

    var legend = legendSelect.enter().append("g").attr("id", "legendBox").attr("width", width).attr("height", height).merge(legendSelect);

    var data = function data() {
      var domain = colorScale.domain();
      itemCount = domain.length;
      var itemHeight = height / itemCount - 20;
      var itemWidth = 20;

      return domain.map(function (v, i) {
        return {
          y: 10 + (itemHeight + 20) * i,
          width: itemWidth,
          height: itemHeight,
          color: colorScale(v),
          text: v
        };
      });
    };

    var itemsSelect = legend.selectAll(".legendItem").data(data);

    var items = itemsSelect.enter().append("g").classed("legendItem", true).attr("transform", function (d) {
      return "translate(0," + d.y + ")";
    }).merge(itemsSelect);

    items.exit().remove();

    switch (itemType) {
      case "line":
        items.append("line").attr("x1", function () {
          return 0;
        }).attr("y1", function (d) {
          return d.height / 2;
        }).attr("x2", function (d) {
          return d.width;
        }).attr("y2", function (d) {
          return d.height / 2;
        }).attr("stroke", function (d) {
          return d.color;
        }).attr("stroke-width", 1);
        break;

      case "rect":
      default:
        items.append("rect").attr("width", function (d) {
          return d.width;
        }).attr("height", function (d) {
          return d.height;
        }).style("fill", function (d) {
          return d.color;
        }).attr("stroke", "#dddddd").attr("stroke-width", 1);
        break;
    }

    items.append("text").text(function (d) {
      return d.text;
    }).attr("dominant-baseline", "middle").attr("x", 40).attr("y", function (d) {
      return d.height / 2;
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return my;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return my;
  };

  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return my;
  };

  my.itemType = function (_) {
    if (!arguments.length) return itemType;
    itemType = _;
    return my;
  };

  return my;
}

/**
 * Reusable Threshold Legend Component
 * https://bl.ocks.org/mbostock/4573883
 */
function componentLegendThreshold () {

	/**
  * Default Properties
  */
	var width = 100;
	var height = 200;
	var thresholdScale = undefined;

	/**
  * Constructor
  */
	function my(selection) {
		height = height ? height : this.attr("height");
		width = width ? width : this.attr("width");

		// Legend Box
		var legendSelect = selection.selectAll("#legendBox").data([0]);

		var legend = legendSelect.enter().append("g").attr("id", "legendBox").attr("width", width).attr("height", height).merge(legendSelect);

		var domainMin = d3.min(thresholdScale.domain());
		var domainMax = d3.max(thresholdScale.domain());
		var domainMargin = (domainMax - domainMin) * 0.1;

		var x = d3.scaleLinear().domain([domainMin - domainMargin, domainMax + domainMargin]).range([0, height]);

		var xAxis = d3.axisRight(x).tickSize(13).tickValues(thresholdScale.domain());

		var g = legend.call(xAxis);
		g.select(".domain").remove();

		g.selectAll("rect").data(thresholdScale.range().map(function (color) {
			var d = thresholdScale.invertExtent(color);
			if (typeof d[0] === 'undefined') d[0] = x.domain()[0];
			if (typeof d[1] === 'undefined') d[1] = x.domain()[1];

			return d;
		})).enter().insert("rect", ".tick").attr("width", 10).attr("y", function (d) {
			return x(d[0]);
		}).attr("height", function (d) {
			return x(d[1]) - x(d[0]);
		}).attr("fill", function (d) {
			return thresholdScale(d[0]);
		});
	}

	/**
  * Configuration Getters & Setters
  */
	my.thresholdScale = function (_) {
		if (!arguments.length) return thresholdScale;
		thresholdScale = _;
		return my;
	};

	my.height = function (_) {
		if (!arguments.length) return height;
		height = _;
		return my;
	};

	my.width = function (_) {
		if (!arguments.length) return width;
		width = _;
		return my;
	};

	return my;
}

/**
 * Reusable Legend Component
 *
 */
function componentLegend () {

	/**
  * Default Properties
  */
	var sizeScale = undefined;
	var colorScale = undefined;
	var title = null;
	var width = 100;
	var height = 150;
	var opacity = 0.7;

	/**
  * Constructor
  */
	function my(selection) {
		height = height ? height : this.attr("height");
		width = width ? width : this.attr("width");

		// Legend Box
		var legendBox = selection.selectAll("#legendBox").data([0]).enter().append("g").attr("id", "legendBox");

		legendBox.append("rect").attr("width", width).attr("height", height).attr("fill-opacity", opacity).attr("fill", "#ffffff").attr("stroke-width", 1).attr("stroke", "#000000");

		var legend = void 0;

		// Size Legend
		if (typeof sizeScale !== "undefined") {
			legend = componentLegendSize().sizeScale(sizeScale).itemCount(4);
		}

		// Colour Legend
		if (typeof colorScale !== "undefined") {
			if (scaleType(colorScale) === "threshold") {
				// console.log("threshold");
				legend = componentLegendThreshold().thresholdScale(colorScale);
			} else {
				// console.log("categorical");
				legend = componentLegendCategorical().colorScale(colorScale).itemType("rect");
			}
		}

		legendBox.append("g").attr("transform", "translate(10, 5)").append("text").style("font-weight", "bold").attr("dominant-baseline", "hanging").text(title);

		legend.width(width - 20).height(height - 35);
		legendBox.append("g").attr("transform", "translate(10, 20)").call(legend);
	}

	/**
  * Detect Scale Type
  */
	function scaleType(scale) {
		var s = scale.copy();
		if (s.domain([1, 2]).range([1, 2])(1.5) === 1) {
			return "ordinal";
		} else if (typeof s.invert !== "function") {
			return "threshold";
		} else if (s.domain([1, 2]).range([1, 2]).invert(1.5) === 1.5) {
			return "linear";
		} else if (s.domain([1, 2]).range([1, 2]).invert(1.5) instanceof Date) {
			return "time";
		} else {
			return "not supported";
		}
	}

	/**
  * Configuration Getters & Setters
  */
	my.height = function (_) {
		if (!arguments.length) return height;
		height = _;
		return my;
	};

	my.width = function (_) {
		if (!arguments.length) return width;
		width = _;
		return my;
	};

	my.sizeScale = function (_) {
		if (!arguments.length) return sizeScale;
		sizeScale = _;
		return my;
	};

	my.colorScale = function (_) {
		if (!arguments.length) return colorScale;
		colorScale = _;
		return my;
	};

	my.title = function (_) {
		if (!arguments.length) return title;
		title = _;
		return my;
	};

	return my;
}

var component = {
  barsCircular: componentBarsCircular,
  barsStacked: componentBarsStacked,
  barsVertical: componentBarsVertical,
  bubbles: componentBubbles,
  candleSticks: componentCandleSticks,
  circularAxis: componentCircularAxis,
  circularRingLabels: componentCircularRingLabels,
  circularSectorLabels: componentCircularSectorLabels,
  creditTag: componentCreditTag,
  donut: componentDonut,
  heatMapRing: componentHeatMapRing,
  heatMapRow: componentHeatMapRow,
  htmlList: componentHtmlList,
  htmlTable: componentHtmlTable,
  labeledNode: componentLabeledNode,
  legend: componentLegend,
  legendSize: componentLegendSize,
  legendCategorical: componentLegendCategorical,
  legendThreshold: componentLegendThreshold,
  lineChart: componentLineChart,
  numberCard: componentNumberCard,
  polarArea: componentPolarArea,
  roseChartSector: componentRoseChartSector,
  proportionalAreaCircles: componentProportionalAreaCircles,
  scatterPlot: componentScatterPlot,
  title: componentTitle
};

/**
 * Circular Bar Chart (also called: Progress Chart)
 * @see http://datavizproject.com/data-type/circular-bar-chart/
 */
function chartBarChartCircular () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "barChartCircular";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;
  var radius = void 0;
  var innerRadius = void 0;

  /**
   * Scales
   */
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Other Customisation Options
   */
  var startAngle = 0;
  var endAngle = 270;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(chartW, chartH) / 2 : radius;

    innerRadius = typeof innerRadius === "undefined" ? radius / 4 : innerRadius;

    // Slice Data, calculate totals, max etc.
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var maxValue = slicedData.maxValue;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleBand().domain(categoryNames).rangeRound([innerRadius, radius]).padding(0.15);

    yScale = d3.scaleLinear().domain([maxValue, 0]).range([startAngle, endAngle]);
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG element (if it does not exist already)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("circularAxis", true);
        chart.append("g").classed("barsCircular", true);
        chart.append("g").classed("circularSectorLabels", true);
        chart.append("g").classed("circularRingLabels", true);
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")").attr("width", chartW).attr("height", chartH);

      // Circular Axis
      var circularAxis = component.circularAxis().radius(radius).radialScale(yScale).ringScale(xScale);

      chart.select(".circularAxis").call(circularAxis);

      // Outer Labels
      var circularSectorLabels = component.circularSectorLabels().radius(radius * 1.04).radialScale(yScale).textAnchor("middle");

      chart.select(".circularSectorLabels").call(circularSectorLabels);

      // Radial Bar Chart
      var barsCircular = component.barsCircular().radius(radius).innerRadius(innerRadius).colorScale(colorScale).xScale(xScale)
      //.yScale(yScale)
      .dispatch(dispatch);

      chart.select(".barsCircular").datum(data).call(barsCircular);

      // Ring Labels
      var circularRingLabels = component.circularRingLabels().radialScale(xScale).textAnchor("middle");

      chart.select(".circularRingLabels").call(circularRingLabels);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.innerRadius = function (_) {
    if (!arguments.length) return innerRadius;
    innerRadius = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Clustered Bar Chart (also called: Multi-set Bar Chart; Grouped Bar Chart)
 * @see http://datavizproject.com/data-type/grouped-bar-chart/
 */
function chartBarChartClustered () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "barChartClustered";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 20, left: 40 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;

  /**
   * Scales
   */
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Other Customisation Options
   */
  var yAxisLabel = null;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    // Slice Data, calculate totals, max etc.
    var slicedData = dataParse(data);
    var groupNames = slicedData.groupNames;
    var maxValue = slicedData.maxValue;
    var categoryNames = slicedData.categoryNames;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleBand().domain(groupNames).rangeRound([0, chartW]).padding(0.1);

    yScale = d3.scaleLinear().domain([0, maxValue]).range([chartH, 0]).nice();
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("xAxis axis", true);
        chart.append("g").classed("yAxis axis", true).append("text").attr("transform", "rotate(-90)").attr("y", -35).attr("dy", ".71em").style("text-anchor", "end").text(yAxisLabel);
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", chartW).attr("height", chartH);

      var barsVertical = component.barsVertical().width(xScale.bandwidth()).height(chartH).colorScale(colorScale)
      //.xScale(xScale)
      //.yScale(yScale)
      .dispatch(dispatch);

      // Create bar group
      var seriesGroup = chart.selectAll(".seriesGroup").data(data);

      seriesGroup.enter().append("g").classed("seriesGroup", true).attr("transform", function (d) {
        return "translate(" + xScale(d.key) + ", 0)";
      }).merge(seriesGroup).call(barsVertical);

      seriesGroup.exit().remove();

      // Add X Axis to chart
      var xAxis = d3.axisBottom(xScale);
      chart.select(".xAxis").attr("transform", "translate(0," + chartH + ")").call(xAxis);

      // Add Y Axis to chart
      var yAxis = d3.axisLeft(yScale);
      chart.select(".yAxis").call(yAxis);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.yAxisLabel = function (_) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Stacked Bar Chart
 * @see http://datavizproject.com/data-type/stacked-bar-chart/
 */
function chartBarChartStacked () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "barChartStacked";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 20, left: 40 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;

  /**
   * Scales
   */
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Other Customisation Options
   */
  var yAxisLabel = null;

  /**
   * Initialise Data and Scales
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    var slicedData = dataParse(data);
    var groupNames = slicedData.groupNames;
    var groupTotalsMax = slicedData.groupTotalsMax;
    var categoryNames = slicedData.categoryNames;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleBand().domain(groupNames).rangeRound([0, chartW]).padding(0.15);

    yScale = d3.scaleLinear().domain([0, groupTotalsMax]).range([chartH, 0]).nice();
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("xAxis axis", true);
        chart.append("g").classed("yAxis axis", true).append("text").attr("transform", "rotate(-90)").attr("y", -35).attr("dy", ".71em").style("text-anchor", "end").text(yAxisLabel);
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", chartW).attr("height", chartH);

      var barsStacked = component.barsStacked().width(xScale.bandwidth()).height(chartH).colorScale(colorScale)
      //.yScale(yScale)
      .dispatch(dispatch);

      // Create bar group
      var seriesGroup = chart.selectAll(".seriesGroup").data(function (d) {
        return d;
      });

      seriesGroup.enter().append("g").classed("seriesGroup", true).attr("transform", function (d) {
        return "translate(" + xScale(d.key) + ", 0)";
      }).merge(seriesGroup).call(barsStacked);

      seriesGroup.exit().remove();

      // Add X Axis to chart
      var xAxis = d3.axisBottom(xScale);
      chart.select(".xAxis").attr("transform", "translate(0," + chartH + ")").call(xAxis);

      // Add Y Axis to chart
      var yAxis = d3.axisLeft(yScale);
      chart.select(".yAxis").call(yAxis);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.yAxisLabel = function (_) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Bar Chart (vertical) (also called: Bar Chart; Bar Graph)
 * @see http://datavizproject.com/data-type/bar-chart/
 */
function chartBarChartVertical () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "barChartVertical";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 20, left: 40 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;

  /**
   * Scales
   */
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    // Slice Data, calculate totals, max etc.
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var maxValue = slicedData.maxValue;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleBand().domain(categoryNames).rangeRound([0, chartW]).padding(0.15);

    yScale = d3.scaleLinear().domain([0, maxValue]).range([chartH, 0]).nice();
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("xAxis axis", true);
        chart.append("g").classed("yAxis axis", true);
        chart.append("g").classed("barChart", true);
      } else {
        chart = svg.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", chartW).attr("height", chartH);

      // Add bars to the chart
      var barsVertical = component.barsVertical().width(chartW).height(chartH).colorScale(colorScale).xScale(xScale)
      //.yScale(yScale)
      .dispatch(dispatch);

      chart.select(".barChart").datum(data).call(barsVertical);

      // Add X Axis to chart
      var xAxis = d3.axisBottom(xScale);
      chart.select(".xAxis").attr("transform", "translate(0," + chartH + ")").call(xAxis);

      // Add Y Axis to chart
      var yAxis = d3.axisLeft(yScale);
      chart.select(".yAxis").call(yAxis);

      // Add Labels to chart
      var ylabel = chart.select(".yAxis").selectAll(".yAxisLabel").data([data.key]);

      ylabel.enter().append("text").classed("yAxisLabel", true).attr("transform", "rotate(-90)").attr("y", -40).attr("dy", ".71em").attr("fill", "#000000").style("text-anchor", "end").merge(ylabel).transition().text(function (d) {
        return d;
      });
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Bubble Chart
 * @see http://datavizproject.com/data-type/bubble-chart/
 */
function chartBubbleChart () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "bubbleChart";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 40, left: 40 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;

  /**
   * Scales
   */
  var xScale = void 0;
  var yScale = void 0;
  var sizeScale = void 0;
  var colorScale = void 0;

  /**
   * Other Customisation Options
   */
  var minRadius = 3;
  var maxRadius = 20;
  var yAxisLabel = void 0;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    // Calculate the extents for each series.
    // TODO: use dataParse() ?
    function extents(key) {
      var serExts = [];
      d3.map(data).values().forEach(function (d) {
        var vals = d.values.map(function (e) {
          return +e[key];
        });
        serExts.push(d3.extent(vals));
      });
      // Merge all the series extents into one array.
      // Calculate overall extent.
      return d3.extent([].concat.apply([], serExts));
    }
    var xDomain = extents("x");
    var yDomain = extents("y");
    var sizeDomain = extents("value");
    var categoryNames = data.map(function (d) {
      return d.key;
    });

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // If the sizeScale has not been passed then attempt to calculate.
    sizeScale = typeof sizeScale === "undefined" ? d3.scaleLinear().domain(sizeDomain).range([minRadius, maxRadius]) : sizeScale;

    // X & Y Scales
    xScale = d3.scaleLinear().domain(xDomain).range([0, chartW]).nice();

    yScale = d3.scaleLinear().domain(yDomain).range([chartH, 0]).nice();
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("xAxis axis", true);
        chart.append("g").classed("yAxis axis", true);
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", chartW).attr("height", chartH);

      // Add bubbles to the chart
      var bubbles = component.bubbles().width(chartW).height(chartH).colorScale(colorScale).xScale(xScale).yScale(yScale).minRadius(minRadius).maxRadius(maxRadius).dispatch(dispatch);

      var seriesGroup = chart.selectAll(".seriesGroup").data(function (d) {
        return d;
      });

      seriesGroup.enter().append("g").data(function (d) {
        return d;
      }).attr("class", "seriesGroup").merge(seriesGroup).call(bubbles);

      seriesGroup.exit().remove();

      // Add X Axis to chart
      var xAxis = d3.axisBottom(xScale);
      chart.select(".xAxis").attr("transform", "translate(0," + chartH + ")").call(xAxis).selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");

      // Add Y Axis to chart
      var yAxis = d3.axisLeft(yScale);
      chart.select(".yAxis").call(yAxis);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.yAxisLabel = function (_) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.sizeScale = function (_) {
    if (!arguments.length) return sizeScale;
    sizeScale = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Candlestick Chart (also called: Japanese Candlestick; OHLC Chart; Box Plot)
 * @see http://datavizproject.com/data-type/candlestick-chart/
 */
function chartCandlestickChart () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "candlestickChart";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 40, left: 40 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = ["green", "red"];
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;

  /**
   * Scales
   */
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    // Convert dates
    data.values.forEach(function (d, i) {
      data.values[i].date = Date.parse(d.date);
    });

    // Slice Data, calculate totals, max etc.
    var maxDate = d3.max(data.values, function (d) {
      return d.date;
    });
    var minDate = d3.min(data.values, function (d) {
      return d.date;
    });
    var xDomain = [new Date(minDate - 8.64e7), new Date(maxDate + 8.64e7)];
    var yDomain = [d3.min(data.values, function (d) {
      return d.low;
    }), d3.max(data.values, function (d) {
      return d.high;
    })];

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain([true, false]).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleTime().domain(xDomain).range([0, chartW]);

    yScale = d3.scaleLinear().domain(yDomain).range([chartH, 0]).nice();

    //if (!yAxisLabel) {
    //  yAxisLabel = slicedData.groupName;
    //}
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("xAxis axis", true);
        chart.append("g").classed("yAxis axis", true);
        chart.append("g").classed("seriesGroup", true);
      } else {
        chart = svg.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", chartW).attr("height", chartH);

      // Add Clip Path
      // chart.append('clipPath')
      //   .attr('id', 'plotAreaClip')
      //   .append('rect')
      //   .attr('width', chartW)
      //   .attr('height', chartH)
      //   .attr('clip-path', 'url(#plotAreaClip)');

      // Add candles to the chart
      var candleSticks = component.candleSticks().width(chartW).height(chartH).colorScale(colorScale).xScale(xScale).yScale(yScale).dispatch(dispatch);

      chart.select(".seriesGroup").datum(data).call(candleSticks);

      // Add X Axis to chart
      var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%d-%b-%y"));
      chart.select(".xAxis").attr("transform", "translate(0," + chartH + ")").call(xAxis).selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");

      // Add Y Axis to chart
      var yAxis = d3.axisLeft(yScale);
      chart.select(".yAxis").call(yAxis);

      // Add Labels to chart
      var ylabel = chart.select(".yAxis").selectAll(".yAxisLabel").data([data.key]);

      ylabel.enter().append("text").classed("yAxisLabel", true).attr("transform", "rotate(-90)").attr("y", -40).attr("dy", ".71em").attr("fill", "#000000").style("text-anchor", "end").merge(ylabel).transition().text(function (d) {
        return d;
      });
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Donut Chart (also called: Doughnut Chart; Pie Chart)
 * @see http://datavizproject.com/data-type/donut-chart/
 */
function chartDonutChart () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "donutChart";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 };
  var transition = { ease: d3.easeCubic, duration: 750 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;
  var radius = void 0;
  var innerRadius = void 0;

  /**
   * Scales
   */
  var colorScale = void 0;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(chartW, chartH) / 2 : radius;

    innerRadius = typeof innerRadius === "undefined" ? radius / 2 : innerRadius;

    // Slice Data, calculate totals, max etc.
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
      } else {
        chart = svg.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")").attr("width", chartW).attr("height", chartH);

      // Add the chart
      var donutChart = component.donut().radius(radius).innerRadius(innerRadius).colorScale(colorScale).dispatch(dispatch);

      chart.datum(data).call(donutChart);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.innerRadius = function (_) {
    if (!arguments.length) return innerRadius;
    innerRadius = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Circular Heat Map (also called: Radial Heat Map)
 * @see http://datavizproject.com/data-type/radial-heatmap/
 */
function chartHeatMapRadial () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "heatMapRadial";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = ["#D34152", "#f4bc71", "#FBF6C4", "#9bcf95", "#398abb"];
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;
  var radius = void 0;
  var innerRadius = void 0;

  /**
   * Scales
   */
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Other Customisation Options
   */
  var startAngle = 0;
  var endAngle = 270;
  var thresholds = void 0;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(chartW, chartH) / 2 : radius;

    innerRadius = typeof innerRadius === "undefined" ? radius / 4 : innerRadius;

    // Slice Data, calculate totals, max etc.
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var groupNames = slicedData.groupNames;

    // If thresholds values are not set attempt to auto-calculate the thresholds.
    if (!thresholds) {
      thresholds = slicedData.thresholds;
    }

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleThreshold().domain(thresholds).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleBand().domain(categoryNames).rangeRound([startAngle, endAngle]).padding(0.1);

    yScale = d3.scaleBand().domain(groupNames).rangeRound([radius, innerRadius]).padding(0.1);
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create chart element (if it does not exist already)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("circleRings", true);
        chart.append("g").classed("circularSectorLabels", true);
        chart.append("g").classed("circularRingLabels", true);
      } else {
        chart = svg.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")").attr("width", chartW).attr("height", chartH);

      var heatMapRing = component.heatMapRing().radius(function (d) {
        return yScale(d.key);
      }).innerRadius(function (d) {
        return yScale(d.key) + yScale.bandwidth();
      }).startAngle(startAngle).endAngle(endAngle).colorScale(colorScale).xScale(xScale).yScale(yScale).dispatch(dispatch).thresholds(thresholds);

      var seriesGroup = chart.select(".circleRings").selectAll(".seriesGroup").data(function (d) {
        return d;
      });

      seriesGroup.enter().append("g").attr("class", "seriesGroup").merge(seriesGroup).call(heatMapRing);

      seriesGroup.exit().remove();

      // Circular Labels
      var circularSectorLabels = component.circularSectorLabels().radius(radius * 1.04).radialScale(xScale).textAnchor("start");

      chart.select(".circularSectorLabels").call(circularSectorLabels);

      // Ring Labels
      var circularRingLabels = component.circularRingLabels().radialScale(yScale).textAnchor("middle");

      chart.select(".circularRingLabels").call(circularRingLabels);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.innerRadius = function (_) {
    if (!arguments.length) return innerRadius;
    innerRadius = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.thresholds = function (_) {
    if (!arguments.length) return thresholds;
    thresholds = _;
    return my;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Heat Map (also called: Heat Table; Density Table; Heat Map)
 * @see http://datavizproject.com/data-type/heat-map/
 */
function chartHeatMapTable () {

	/**
  * Default Properties
  */
	var svg = void 0;
	var chart = void 0;
	var classed = "heatMapTable";
	var width = 400;
	var height = 300;
	var margin = { top: 50, right: 20, bottom: 20, left: 50 };
	var colors = ["#D34152", "#f4bc71", "#FBF6C4", "#9bcf95", "#398abb"];
	var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

	/**
  * Chart Dimensions
  */
	var chartW = void 0;
	var chartH = void 0;

	/**
  * Scales
  */
	var xScale = void 0;
	var yScale = void 0;
	var colorScale = void 0;

	/**
  * Other Customisation Options
  */
	var thresholds = void 0;

	/**
  * Initialise Data, Scales and Series
  */
	function init(data) {
		chartW = width - margin.left - margin.right;
		chartH = height - margin.top - margin.bottom;

		// Slice Data, calculate totals, max etc.
		var slicedData = dataParse(data);
		var categoryNames = slicedData.categoryNames;
		var groupNames = slicedData.groupNames;

		// If thresholds values are not set attempt to auto-calculate the thresholds.
		if (!thresholds) {
			thresholds = slicedData.thresholds;
		}

		// If the colorScale has not been passed then attempt to calculate.
		colorScale = typeof colorScale === "undefined" ? d3.scaleThreshold().domain(thresholds).range(colors) : colorScale;

		// X & Y Scales
		xScale = d3.scaleBand().domain(categoryNames).range([0, chartW]).padding(0.1);

		yScale = d3.scaleBand().domain(groupNames).range([0, chartH]).padding(0.1);
	}

	/**
  * Constructor
  */
	function my(selection) {
		selection.each(function (data) {
			// Initialise Data
			init(data);

			// Create SVG and Chart containers (if they do not already exist)
			if (!svg) {
				svg = function (selection) {
					var el = selection._groups[0][0];
					if (!!el.ownerSVGElement || el.tagName === "svg") {
						return selection;
					} else {
						return selection.append("svg");
					}
				}(d3.select(this));

				svg.classed("d3ez", true).attr("width", width).attr("height", height);

				chart = svg.append("g").classed("chart", true);
				chart.append("g").classed("xAxis axis", true);
				chart.append("g").classed("yAxis axis", true);
			} else {
				chart = selection.select(".chart");
			}

			// Update the chart dimensions
			chart.classed(classed, true).attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", chartW).attr("height", chartH);

			var heatMapRow = component.heatMapRow().width(chartW).height(chartH).colorScale(colorScale).xScale(xScale).yScale(yScale).dispatch(dispatch).thresholds(thresholds);

			var seriesGroup = chart.selectAll(".seriesGroup").data(function (d) {
				return d;
			});

			seriesGroup.enter().append("g").attr("class", "seriesGroup").attr("transform", function (d) {
				return "translate(0, " + yScale(d.key) + ")";
			}).merge(seriesGroup).call(heatMapRow);

			seriesGroup.exit().remove();

			// Add X Axis to chart
			var xAxis = d3.axisTop(xScale);
			chart.select(".xAxis").call(xAxis).selectAll("text").attr("y", 0).attr("x", -8).attr("transform", "rotate(60)").style("text-anchor", "end");

			// Add Y Axis to chart
			var yAxis = d3.axisLeft(yScale);
			chart.select(".yAxis").call(yAxis);
		});
	}

	/**
  * Configuration Getters & Setters
  */
	my.width = function (_) {
		if (!arguments.length) return width;
		width = _;
		return this;
	};

	my.height = function (_) {
		if (!arguments.length) return height;
		height = _;
		return this;
	};

	my.margin = function (_) {
		if (!arguments.length) return margin;
		margin = _;
		return this;
	};

	my.colors = function (_) {
		if (!arguments.length) return colors;
		colors = _;
		return this;
	};

	my.colorScale = function (_) {
		if (!arguments.length) return colorScale;
		colorScale = _;
		return this;
	};

	my.thresholds = function (_) {
		if (!arguments.length) return thresholds;
		thresholds = _;
		return this;
	};

	my.dispatch = function (_) {
		if (!arguments.length) return dispatch();
		dispatch = _;
		return this;
	};

	my.on = function () {
		var value = dispatch.on.apply(dispatch, arguments);
		return value === dispatch ? my : value;
	};

	return my;
}

/**
 * Line Chart (also called: Line Graph; Spline Chart)
 * @see http://datavizproject.com/data-type/line-chart/
 */
function chartLineChart () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "lineChart";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 40, left: 40 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;

  /**
   * Scales
   */
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Other Customisation Options
   */
  var yAxisLabel = null;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - margin.left - margin.right;
    chartH = height - margin.top - margin.bottom;

    // Slice Data, calculate totals, max etc.
    var slicedData = dataParse(data);
    var maxValue = slicedData.maxValue;
    var groupNames = slicedData.groupNames;

    // Convert dates
    data.forEach(function (d, i) {
      d.values.forEach(function (b, j) {
        data[i].values[j].key = new Date(b.key * 1000);
      });
    });
    var dateDomain = d3.extent(data[0].values, function (d) {
      return d.key;
    });

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(groupNames).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleTime().domain(dateDomain).range([0, chartW]);

    yScale = d3.scaleLinear().domain([0, maxValue]).range([chartH, 0]).nice();
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("xAxis axis", true);
        chart.append("g").classed("yAxis axis", true).append("text").attr("transform", "rotate(-90)").attr("y", -35).attr("dy", ".71em").style("text-anchor", "end").text(yAxisLabel);
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", chartW).attr("height", chartH);

      var lineChart = component.lineChart().width(chartW).height(chartH).colorScale(colorScale).xScale(xScale).yScale(yScale).dispatch(dispatch);

      var scatterPlot = component.scatterPlot().width(chartW).height(chartH).colorScale(colorScale).yScale(yScale).xScale(xScale).dispatch(dispatch);

      var seriesGroup = chart.selectAll(".seriesGroup").data(function (d) {
        return d;
      });

      seriesGroup.enter().append("g").attr("class", "seriesGroup").style("fill", function (d) {
        return colorScale(d.key);
      }).datum(function (d) {
        return d;
      }).merge(seriesGroup).call(lineChart).call(scatterPlot);

      seriesGroup.exit().remove();

      // Add X Axis to chart
      var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%d-%b-%y"));
      chart.select(".xAxis").attr("transform", "translate(0," + chartH + ")").call(xAxis).selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", ".15em").attr("transform", "rotate(-65)");

      // Add Y Axis to chart
      var yAxis = d3.axisLeft(yScale);
      chart.select(".yAxis").call(yAxis);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.yAxisLabel = function (_) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Polar Area Chart (also called: Coxcomb Chart; Rose Chart)
 * @see http://datavizproject.com/data-type/polar-area-chart/
 */
function chartPolarAreaChart () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "polarArea";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;
  var radius = void 0;

  /**
   * Scales and Axis
   */
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Other Customisation Options
   */
  var startAngle = 0;
  var endAngle = 360;
  var capitalizeLabels = false;
  var colorLabels = false;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - (margin.left + margin.right);
    chartH = height - (margin.top + margin.bottom);

    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(chartW, chartH) / 2 : radius;

    // Slice Data, calculate totals, max etc.
    var slicedData = dataParse(data);
    var categoryNames = slicedData.categoryNames;
    var maxValue = slicedData.maxValue;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleBand().domain(categoryNames).rangeRound([startAngle, endAngle]).padding(0.15);

    yScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]).nice();
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG element (if it does not exist already)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("circularAxis", true);
        chart.append("g").classed("polarArea", true);
        chart.append("g").classed("circularSectorLabels", true);
        chart.append("g").classed("verticalAxis axis", true);
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")").attr("width", chartW).attr("height", chartH);

      // Circular Axis
      var circularAxis = component.circularAxis().radialScale(xScale).ringScale(yScale).radius(radius);

      chart.select(".circularAxis").call(circularAxis);

      // Radial Bar Chart
      var polarArea = component.polarArea().radius(radius).colorScale(colorScale).xScale(xScale).yScale(yScale).dispatch(dispatch);

      chart.select(".polarArea").datum(data).call(polarArea);

      // Vertical Axis
      // We reverse the yScale
      var axisScale = d3.scaleLinear().domain(yScale.domain()).range(yScale.range().reverse()).nice();
      var verticalAxis = d3.axisLeft(axisScale);
      chart.select(".verticalAxis").attr("transform", "translate(0," + -radius + ")").call(verticalAxis);

      // Circular Labels
      var circularSectorLabels = component.circularSectorLabels().radius(radius * 1.04).radialScale(xScale).textAnchor("start");

      chart.select(".circularSectorLabels").call(circularSectorLabels);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.radius = function (_) {
    if (!arguments.length) return radius;
    radius = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.capitalizeLabels = function (_) {
    if (!arguments.length) return capitalizeLabels;
    capitalizeLabels = _;
    return this;
  };

  my.colorLabels = function (_) {
    if (!arguments.length) return colorLabels;
    colorLabels = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Punch Card
 * @see http://datavizproject.com/data-type/proportional-area-chart-circle/
 */
function chartPunchCard () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "punchCard";
  var width = 400;
  var height = 300;
  var margin = { top: 50, right: 20, bottom: 20, left: 50 };
  var colors = [d3.rgb("steelblue").brighter(), d3.rgb("steelblue").darker()];
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;

  /**
   * Scales
   */
  var sizeScale = void 0;
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Other Customisation Options
   */
  var minRadius = 2;
  var maxRadius = 20;
  var useGlobalScale = true;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - margin.left - margin.right;
    chartH = height - margin.top - margin.bottom;

    // Slice Data, calculate totals, max etc.
    var slicedData = dataParse(data);
    var maxValue = slicedData.maxValue;
    var minValue = slicedData.minValue;
    var categoryNames = slicedData.categoryNames;
    var groupNames = slicedData.groupNames;

    var valDomain = [minValue, maxValue];
    var sizeDomain = useGlobalScale ? valDomain : [0, d3.max(data[1]["values"], function (d) {
      return d["value"];
    })];

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleLinear().domain(valDomain).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleBand().domain(categoryNames).range([0, chartW]).padding(0.05);

    yScale = d3.scaleBand().domain(groupNames).range([0, chartH]).padding(0.05);

    // Size Scale
    sizeScale = d3.scaleLinear().domain(sizeDomain).range([minRadius, maxRadius]);
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("xAxis axis", true);
        chart.append("g").classed("yAxis axis", true);
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("width", chartW).attr("height", chartH);

      var proportionalAreaCircles = component.proportionalAreaCircles().width(chartW).height(chartH).colorScale(colorScale).xScale(xScale).yScale(yScale).sizeScale(sizeScale).dispatch(dispatch);

      var seriesGroup = chart.selectAll(".seriesGroup").data(function (d) {
        return d;
      });

      seriesGroup.enter().append("g").attr("class", "seriesGroup").attr("transform", function (d) {
        return "translate(0, " + yScale(d.key) + ")";
      }).merge(seriesGroup).call(proportionalAreaCircles);

      seriesGroup.exit().remove();

      // Add X Axis to chart
      var xAxis = d3.axisTop(xScale);
      chart.select(".xAxis").call(xAxis).selectAll("text").attr("y", 0).attr("x", -8).attr("transform", "rotate(60)").style("text-anchor", "end");

      // Add Y Axis to chart
      var yAxis = d3.axisLeft(yScale);
      chart.select(".yAxis").call(yAxis);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.minRadius = function (_) {
    if (!arguments.length) return minRadius;
    minRadius = _;
    return this;
  };

  my.maxRadius = function (_) {
    if (!arguments.length) return maxRadius;
    maxRadius = _;
    return this;
  };

  my.sizeScale = function (_) {
    if (!arguments.length) return sizeScale;
    sizeScale = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.useGlobalScale = function (_) {
    if (!arguments.length) return useGlobalScale;
    useGlobalScale = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

/**
 * Rose Chart (also called: Coxcomb Chart; Circumplex Chart; Nightingale Chart)
 * @see http://datavizproject.com/data-type/polar-area-chart/
 */
function chartRoseChart () {

  /**
   * Default Properties
   */
  var svg = void 0;
  var chart = void 0;
  var classed = "roseChart";
  var width = 400;
  var height = 300;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 };
  var transition = { ease: d3.easeBounce, duration: 500 };
  var colors = palette.categorical(3);
  var dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

  /**
   * Chart Dimensions
   */
  var chartW = void 0;
  var chartH = void 0;
  var radius = void 0;

  /**
   * Scales and Axis
   */
  var xScale = void 0;
  var yScale = void 0;
  var colorScale = void 0;

  /**
   * Initialise Data, Scales and Series
   */
  function init(data) {
    chartW = width - margin.left - margin.right;
    chartH = height - margin.top - margin.bottom;

    // If the radius has not been passed then calculate it from width/height.
    radius = typeof radius === "undefined" ? Math.min(chartW, chartH) / 2 : radius;

    // Slice Data, calculate totals, max etc.
    var slicedData = dataParse(data);
    var groupNames = slicedData.groupNames;
    var maxValue = slicedData.maxValue;
    var categoryNames = slicedData.categoryNames;

    // If the colorScale has not been passed then attempt to calculate.
    colorScale = typeof colorScale === "undefined" ? d3.scaleOrdinal().domain(categoryNames).range(colors) : colorScale;

    // X & Y Scales
    xScale = d3.scaleBand().domain(groupNames).rangeRound([0, 360]);

    yScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);
  }

  /**
   * Constructor
   */
  function my(selection) {
    selection.each(function (data) {
      // Initialise Data
      init(data);

      // Create SVG and Chart containers (if they do not already exist)
      if (!svg) {
        svg = function (selection) {
          var el = selection._groups[0][0];
          if (!!el.ownerSVGElement || el.tagName === "svg") {
            return selection;
          } else {
            return selection.append("svg");
          }
        }(d3.select(this));

        svg.classed("d3ez", true).attr("width", width).attr("height", height);

        chart = svg.append("g").classed("chart", true);
        chart.append("g").classed("circularSectorLabels", true);
      } else {
        chart = selection.select(".chart");
      }

      // Update the chart dimensions
      chart.classed(classed, true).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")").attr("width", chartW).attr("height", chartH);

      var roseChartSector = component.roseChartSector().radius(radius).colorScale(colorScale).yScale(yScale).stacked(false).dispatch(dispatch);

      // Create series group
      var seriesGroup = chart.selectAll(".seriesGroup").data(data);

      seriesGroup.enter().append("g").classed("seriesGroup", true).merge(seriesGroup).each(function (d) {
        var startAngle = xScale(d.key);
        var endAngle = xScale(d.key) + xScale.bandwidth();
        roseChartSector.startAngle(startAngle).endAngle(endAngle);
        d3.select(this).call(roseChartSector);
      });

      seriesGroup.exit().remove();

      // Circular Labels
      var circularSectorLabels = component.circularSectorLabels().radius(radius * 1.04).radialScale(xScale).textAnchor("start").capitalizeLabels(true);

      chart.select(".circularSectorLabels").call(circularSectorLabels);
    });
  }

  /**
   * Configuration Getters & Setters
   */
  my.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  my.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  my.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  my.transition = function (_) {
    if (!arguments.length) return transition;
    transition = _;
    return this;
  };

  my.colors = function (_) {
    if (!arguments.length) return colors;
    colors = _;
    return this;
  };

  my.colorScale = function (_) {
    if (!arguments.length) return colorScale;
    colorScale = _;
    return this;
  };

  my.dispatch = function (_) {
    if (!arguments.length) return dispatch();
    dispatch = _;
    return this;
  };

  my.on = function () {
    var value = dispatch.on.apply(dispatch, arguments);
    return value === dispatch ? my : value;
  };

  return my;
}

var chart = {
  barChartCircular: chartBarChartCircular,
  barChartClustered: chartBarChartClustered,
  barChartStacked: chartBarChartStacked,
  barChartVertical: chartBarChartVertical,
  bubbleChart: chartBubbleChart,
  candlestickChart: chartCandlestickChart,
  donutChart: chartDonutChart,
  heatMapRadial: chartHeatMapRadial,
  heatMapTable: chartHeatMapTable,
  lineChart: chartLineChart,
  polarAreaChart: chartPolarAreaChart,
  punchCard: chartPunchCard,
  roseChart: chartRoseChart
};

/**
 * d3-ez
 *
 * @author James Saunders [james@saunders-family.net]
 * @copyright Copyright (C) 2018 James Saunders
 * @license GPLv3
 */

var my = {
  version: version,
  author: "James Saunders",
  copyright: "Copyright (C) 2018 James Saunders",
  license: "GPL-3.0",
  base: base,
  dataParse: dataParse,
  palette: palette,
  component: component,
  chart: chart
};

exports.ez = my;

Object.defineProperty(exports, '__esModule', { value: true });

})));
