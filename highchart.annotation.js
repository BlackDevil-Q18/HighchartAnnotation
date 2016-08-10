/*
 * Highchart Annotation plugin v 1.0 Released
 * Copyright (c) 2016 Pratik Tyagi
 * www.qscriptsolutions.com
 * Released under MIT License
 * @license
 *
 * Date: Wed Aug 8 8:30 PM 2016
 **/

var HighchartAnnotation = (function() {

    /*
		Default color settings
	 */
    var settings = {
        Line_COLOR: {
            label: "Line Color",
            type: "COLOR",
            key: "Line_COLOR",
            value: "#FF9800"
        },
        Text_COLOR: {
            label: "Text Color",
            type: "COLOR",
            key: "Text_COLOR",
            value: "#FF9800"
        }
    };

    function generateUUID() {
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //using high-precision timer
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    /**
     * Add text field over the Highchart container div
     * @param {object} options
     */
    var addTextField = function(options) {
            var UUID = generateUUID();
            var svgCover, textEntryBox;
            var chartDIV = options.chartObj.renderTo.firstChild;
            if (chartDIV) {
                chartDIV = $(chartDIV);
                svgCover = $('<div id="svgCover" class="svgCover"></div>')
                svgCover.css({
                    width: chartDIV.width(),
                    height: chartDIV.height()
                });
                svgCover.prependTo(options.chartObj.renderTo);
                svgCover.on("click", function(e) {
                    e.stopPropagation();
                    if (e.target === e.delegateTarget) {
                        $(this).hide();
                        textEntryBox.trigger("blur");
                    }
                });
            }

            if (svgCover) {
                var textEntryBox = $("<div id='" + UUID + "'><input type='text'></input></div>");
                textEntryBox.appendTo(svgCover);
                textEntryBox.css({
                    position: "absolute",
                    top: options.cy,
                    left: options.cx,
                    width: "180px"
                });
                textEntryBox.focus();
            }

            return textEntryBox;
        }
        /**
         * Add text/label handler
         * @param {object} renderer Highchart.renderer
         * @param {object} options  config.options
         */
    var addText = function(renderer, options) {
        var UUID = generateUUID();
        var userText = null;
        var defaultCSSOptions = {
            fontSize: '16pt',
            color: 'black'
        };
        $.extend(true, defaultCSSOptions, options.cssOptions);
        var rotation = options.rotation || 0;
        var textEntryBox = addTextField(options);

        var textAddedPromise = new Promise(function(resolve, reject) {
            textEntryBox.blur(function(e) {
                var $textEntryBox = $(this);
                $textEntryBox.hide();
                var text = $textEntryBox[0].firstChild.value;
                if (text !== "") {
                    renderer.text(text, options.cx, options.cy).attr({
                        id: UUID,
                        rotation: rotation,
                        zindex: 99999
                    }).css(defaultCSSOptions).add();
                }
                resolve(UUID);
            });
        });
        return textAddedPromise;
    }

    /**
     * Draw rectangle handler
     * @deprecated Use addRect
     * @param {object} renderer Highchart.renderer
     * @param {object} options  config.options
     */
    var addSquare = function(renderer, options) {
            var UUID = (new Date().getTime());
            var defaultCSSOptions = {};
            var defaultSVGAttrOptions = {
                id: UUID,
                fill: 'blue',
                stroke: 'black',
                'stroke-width': 1
            }
            $.extend(true, defaultCSSOptions, options.cssOptions);
            $.extend(true, defaultSVGAttrOptions, options.svgAttrOptions);
            renderer.rect(options.cx, options.cy, options.width, options.height, 5).attr(defaultSVGAttrOptions).css(defaultCSSOptions).add();

            return UUID;
        }
        /**
         * Draw rectangle handler
         * @param {object} renderer Highchart.renderer
         * @param {object} options  config.options
         */
    var addRect = function(renderer, options) {
        var UUID = generateUUID();
        var chartObj = options.chartObj.renderTo;
        var defaultCSSOptions = {};
        var defaultSVGAttrOptions = {
            id: UUID,
            'fill-opacity': '0.2',
            'fill': '#FF9800',
            'stroke': '#FF9800'
        }
        $.extend(true, defaultCSSOptions, options.cssOptions);
        $.extend(true, defaultSVGAttrOptions, options.svgAttrOptions);
        var rectSVG = renderer.rect(options.cx, options.cy, options.width, options.height, 5).attr(defaultSVGAttrOptions).css(defaultCSSOptions).add();

        var tempX = options.cx;
        var tempY = options.cy;
        var resizeRectEvent = function(e) {
            e.stopImmediatePropagation();
            var newX = e.offsetX;
            var newY = e.offsetY;
            setTimeout(function() {
                var _newX = newX - tempX;
                var _newY = newY - tempY;
                if (0 < _newX && 0 < _newY) {
                    rectSVG.attr({
                        width: _newX,
                        height: _newY
                    });
                }
                $(chartObj).onFirst("mouseover.rect", resizeRectEvent);
                return;
            }, 5);
            $(chartObj).off("mouseover.rect");
        };

        $(chartObj).onFirst("mouseover.rect", {
            options: options
        }, resizeRectEvent);
        $(chartObj).onFirst("click.rect", {
            options: options
        }, function(e) {
            e.stopImmediatePropagation();
            $(this).off("click.rect");
            $(this).off("mouseover.rect");
        });
        return UUID;
    }

    /**
     * Draw Line end point
     * @param {object} renderer Highchart.renderer
     * @param {number} cx       location-x
     * @param {number} cy       location-y
     * @param {string} color    Point color
     */
    var addLineEndPoint = function(renderer, cx, cy, color) {
        var UUID = generateUUID();
        renderer.circle(cx, cy, 5).attr({
            id: UUID,
            fill: color,
            stroke: color,
            'stroke-width': 1,
            zIndex: 2
        }).add();
        return UUID;
    }

    /**
     * Draw single line
     * @param {object} renderer Highchart.renderer
     * @param {object} options  config.options
     */
    var addLine = function(renderer, options) {
        var chartObj = options.chartObj.renderTo;
        var gUUid = [];
        var UUID = generateUUID();
        var defaultSVGAttrOptions = {
            stroke: 'black',
            'stroke-width': 3
        };
        $.extend(true, defaultSVGAttrOptions, options.svgAttrOptions);
        // var tempLine = renderer.path(options.cx, options.cy, options.cx+50, options.cy+50).attr(defaultSVGAttrOptions).css(defaultCSSOptions).add();
        // 
        gUUid.push(addLineEndPoint(renderer, options.cx, options.cy, defaultSVGAttrOptions.stroke));
        var tempLine = renderer.path().attr({
            d: "M " + options.cx + " " + options.cy + " L " + options.cx + " " + options.cy + "",
            id: UUID,
            opacity: '1',
            stroke: defaultSVGAttrOptions.stroke,
            'stroke-width': defaultSVGAttrOptions['stroke-width']
        })
        gUUid.push(UUID);

        var addLinePromise = new Promise(function(resolve, reject) {
            $(chartObj).onFirst("click.one", {
                tempLine: tempLine,
                options: options
            }, function(e) {
                e.stopImmediatePropagation();
                var newX = e.offsetX;
                var newY = e.offsetY;
                gUUid.push(addLineEndPoint(renderer, newX, newY, defaultSVGAttrOptions.stroke));
                tempLine.attr({
                    d: "M " + options.cx + " " + options.cy + " L " + newX + " " + newY + ""
                }).add();
                $(this).off("click.one");
                resolve(gUUid);

            });
        });
        return addLinePromise;
    }

    /**
     * Draw line continuously depending upon user click positions
     * @param {object} renderer Highchart.renderer
     * @param {object} options  config.options
     */
    var addContinueLine = function(renderer, options) {
        var chartObj = options.chartObj.renderTo;
        var gUUid = [];
        var UUID = generateUUID();
        var defaultSVGAttrOptions = {
            stroke: 'black',
            'stroke-width': 3
        };
        $.extend(true, defaultSVGAttrOptions, options.svgAttrOptions);

        gUUid.push(addLineEndPoint(renderer, options.cx, options.cy, defaultSVGAttrOptions.stroke));

        var tempLine = renderer.path().attr({
            d: "M " + options.cx + " " + options.cy + " L " + options.cx + " " + options.cy + "",
            id: UUID,
            opacity: '1',
            stroke: defaultSVGAttrOptions.stroke,
            'stroke-width': defaultSVGAttrOptions['stroke-width']
        })
        gUUid.push(UUID);

        var addContinueLinePromise = new Promise(function(resolve, reject) {

            $(chartObj).one("click.continue", {
                tempLine: tempLine,
                options: options
            }, function(e) {
                e.stopImmediatePropagation();
                var newX = e.offsetX;
                var newY = e.offsetY;
                gUUid.push(addLineEndPoint(renderer, newX, newY, defaultSVGAttrOptions.stroke));
                tempLine.attr({
                    d: "M " + options.cx + " " + options.cy + " L " + newX + " " + newY + ""
                }).add();
                resolve(gUUid);
            });

            $(chartObj).onFirst("dblclick.continue", {
                tempLine: tempLine,
                options: options
            }, function(e) {
                e.stopImmediatePropagation();
                $(this).off("click.continue");
                $(this).off("dblclick.continue");
                resolve(gUUid);
            });
        });

        return addContinueLinePromise;
    }

    /**
     * To handle command activation in the toolbar
     * @param  {[type]} toActivate drawbarItem to be avtivated
     */
    var enableActionInToolbar = function(toActivate) {
        this.clearAllEvent();
        $("#" + this.drawBarId).find(".drawActionItem.stickyAction").each(function() {
            $(this).removeClass("stickyAction");
        });
        if (toActivate) {
            $(toActivate).addClass("stickyAction");
        }
    }


    /**
     * Add color pallets in the toolbar settings.
     * @param {element} $container         Color pallets container.
     * @param {function} updateSettingValue Method to update the settings value.
     */
    var addColorPicker = function($container, updateSettingValue) {
        var colorList = ['#F44336', '#2196f3', '#ff9800', '#8bc34a', '#607d8b'];
        if ($container) {
            var tempContainer = $('<div class="colorListContainer"></div>');
            colorList.forEach(function(_colorCode) {
                var colorLink = $('<div class="colorCode" data-color-code="' + _colorCode + '" style="background:' + _colorCode + ' !important;"></div>')
                colorLink.appendTo(tempContainer);
                colorLink.on("click", function(e) {
                    var targetel = $(e.delegateTarget);
                    targetel.parent().find(".colorCode").each(function() {
                        $(this).removeClass("selected");
                    })
                    targetel.addClass("selected");
                    updateSettingValue(targetel.data("color-code"));
                });
            });
            tempContainer.appendTo($container);
        }
    }


    /**
     * Draw the Chart draw action bar.
     * ICONS are messsedd up
     * @param  {element} drawBarContainer Container div .
     * @param  {String} id                DrawBar unique Id based on timestamp.
     */
    function drawActionBar(drawBarContainer, id) {
        var drawBarContainer = $(drawBarContainer);
        drawBarContainer.addClass("drawbarContainer");
        $('<div id="' + id + '" class="drawActionBar">\
						<div class="drawActionItemContainer">\
							<div class="drawActionItem" data-action="CLOSE">\
								<span class="icon-logout" aria-hidden="true"></span>\
							</div>\
							<div class="drawActionItem" data-action="UNDO">\
								<span class="icon-edit" aria-hidden="true"></span>\
							</div>\
							<div class="drawActionItem" data-action="ARROW">\
								<span class="icon-mouse-pointer" aria-hidden="true"></span>\
							</div>\
							<div class="drawActionItem" data-sticky-action=true data-action="TEXT">\
								<span class="icon-pencil" aria-hidden="true"></span>\
							</div>\
							<div class="drawActionItem" data-sticky-action=true data-action="LINE">\
								<span class="icon-cog-alt" aria-hidden="true"></span>\
							</div>\
							<div class="drawActionItem" data-sticky-action=true data-action="CONTINUE-LINE">\
								<span class="icon-link" aria-hidden="true"></span>\
							</div>\
							<div class="drawActionItem" data-sticky-action=true data-action="RECT">\
								<span class="icon-check-empty" aria-hidden="true"></span>\
							</div>\
							<div class="drawActionItem" data-action="SETTINGS">\
								<span class="icon-undo" aria-hidden="true"></span>\
							</div>\
						</div>\
					</div>').prependTo(drawBarContainer);
    }


    var readjustAnnotations = function($el, dx, dy) {
        if ($el[0]) {
            switch ($el[0].tagName) {
                case "circle":
                    $el.attr('cx', parseInt($el.attr("cx")) * dx);
                    $el.attr('cy', parseInt($el.attr("cy")) * dy);
                    break;
                case "path":
                    var OD = $el.attr('d');
                    var DL = OD.split(" ");
                    DL[1] = parseInt(DL[1]) * dx;
                    DL[2] = parseInt(DL[2]) * dy;
                    DL[4] = parseInt(DL[4]) * dx;
                    DL[5] = parseInt(DL[5]) * dy;
                    $el.attr('d', DL.join(" "));
                    break;
                case "text":
                    $el.attr('x', parseInt($el.attr("x")) * dx);
                    $el.attr('y', parseInt($el.attr("y")) * dy);
                    break;
                case "rect":
                    $el.attr('x', parseInt($el.attr("x")) * dx);
                    $el.attr('y', parseInt($el.attr("y")) * dy);
                    $el.attr('width', parseInt($el.attr("width")) * dx);
                    $el.attr('height', parseInt($el.attr("height")) * dy);
                    break;
                default: //do nothing
            }
        }
    }



    var HighchartAnnotation = function(chartObj, editButton, container) {
        this.drawBarId = 'drawActionBar-' + ((new Date()).getTime()),
        this.chartObj = chartObj,
        this.container = container,
        this.editButton = editButton;
        this.userActionSelected = null;
        this.timeLine = [];
        this.originalDimentions = [chartObj.plotWidth, chartObj.plotHeight];
        this.currentDimentions = [chartObj.plotWidth, chartObj.plotHeight];

        this.init();
        var that = this;
        (function() {
            var tempReflow = that.chartObj.reflow;
            var tempRedraw = that.chartObj.redraw;
            that.chartObj.reflow = function() {
                var temp = tempReflow.call(that.chartObj);
                that.currentDimentions = [chartObj.plotWidth, chartObj.plotHeight];
                that.resizeChartCallback(that.currentDimentions[0] / that.originalDimentions[0], that.currentDimentions[1] / that.originalDimentions[1]);
                that.originalDimentions[0] = that.currentDimentions[0];
                that.originalDimentions[1] = that.currentDimentions[1];
                return temp;
            }

        })();
    };
    HighchartAnnotation.prototype = {
        init: function() {

            var chartObj = this.chartObj;
            var that = this;
            that.settings = $.extend(true, {}, settings);

            $(that.editButton).click(function() {
                that.slideToggle();
            });

            drawActionBar(that.container, that.drawBarId);

            $(that.container).find(".drawActionItem").on("click", function(e) {
                e.stopPropagation();
                that.clearAllEvent();
                var targetel = $(e.delegateTarget);
                var action = targetel.data("action");
                var sticky_action = targetel.data("sticky-action");

                switch (action) {
                    case "CLOSE":
                        that.userActionSelected = null;
                        enableActionInToolbar.call(that);
                        that.slideToggle();
                        break;
                    case "UNDO":
                        that.undo();
                        break;
                    case "ARROW":
                        that.userActionSelected = null;
                        enableActionInToolbar.call(that);
                        break;
                    case "SETTINGS":
                        that.displaySettings(targetel);
                        break;
                    default:
                        that.userActionSelected = action;
                }

                if (sticky_action === true && !targetel.hasClass("stickyAction")) {
                    enableActionInToolbar.call(that, targetel);
                }
            });




            $(chartObj.renderTo).on("click", function(e) {
                e.stopPropagation();
                var targetEl = e.target;
                var cx = e.offsetX,
                    cy = e.offsetY;
                var chartRenderer = chartObj.renderer;
                if (chartRenderer && that.userActionSelected != null) {
                    var addedElem;

                    function handleTextUpdate() {
                        var addTextPromise = addText(chartRenderer, {
                            chartObj: chartObj,
                            cssOptions: {
                                color: that.settings.Text_COLOR.value
                            },
                            cx: cx,
                            cy: cy
                        });
                        addTextPromise.then(function(elemData) {
                            that.timeLine.push(elemData);
                        })
                    }

                    function handleSingleLineUpdate() {
                        var addSingleLinePromise = addLine(chartRenderer, {
                            chartObj: chartObj,
                            svgAttrOptions: {
                                stroke: that.settings.Line_COLOR.value
                            },
                            cx: cx,
                            cy: cy
                        });
                        addSingleLinePromise.then(function(elemData) {
                            that.timeLine.push(elemData);
                        })
                    }

                    function handleContinueLineUpdate() {
                        var addContinueLinePromise = addContinueLine(chartRenderer, {
                            chartObj: chartObj,
                            svgAttrOptions: {
                                stroke: that.settings.Line_COLOR.value
                            },
                            cx: cx,
                            cy: cy
                        });
                        addContinueLinePromise.then(function(elemData) {
                            that.timeLine.push(elemData);
                        })
                    }

                    function handleRectangleUpdate() {
                        var addedElem = addRect(chartRenderer, {
                            chartObj: chartObj,
                            cx: cx,
                            cy: cy,
                            width: 100,
                            height: 50
                        });
                        that.timeLine.push(addedElem);
                    }

                    switch (that.userActionSelected) {
                        case "TEXT":
                            handleTextUpdate();
                            break;
                        case "LINE":
                            handleSingleLineUpdate();
                            break;
                        case "CONTINUE-LINE":
                            handleContinueLineUpdate();
                            break;
                        case "RECT":
                            handleRectangleUpdate();
                            break;
                    }

                }
            });
        },
        slideToggle: function() {
            $("#" + this.drawBarId).toggleClass("expand");
        },
        resizeChartCallback: function(dx, dy) {
            this.timeLine.forEach(function(_elem) {
                if (Array.isArray(_elem)) {
                    _elem.forEach(function(_id) {
                        var $el = $('#' + _id);
                        readjustAnnotations($el, dx, dy);
                    });
                } else {
                    var $el = $('#' + _elem);
                    $el.each(function() {
                        readjustAnnotations($(this), dx, dy);
                    });
                }
            });
        },
        clearAllEvent: function() {
            var chartObj = $(this.chartObj);
            chartObj.off("click.continue");
            chartObj.off("click.one");
            chartObj.off("dblclick.continue");
            chartObj.off("mouseover.rect");
            chartObj.off("click.rect");
            chartObj.off("mouseover.rect");
        },
        undo: function(renderer, id) {
            var that = this;
            var renderer = this.chartObj.renderer,
                id = that.timeLine.length > 0 ? that.timeLine.pop() : null
            if (id !== null && renderer && renderer.box) {
                if (Array.isArray(id)) {
                    id.forEach(function(UUID) {
                        $(renderer.box).find("#" + UUID).remove();
                    });
                } else {
                    $(renderer.box).find("#" + id).remove();
                }
            }
        },
        displaySettings: function(targetel) {
            var that = this;
            var drawbar = $('#' + that.drawBarId);
            var settingBox = drawbar.find("div.settingsBox");
            targetel.toggleClass("expanded");
            if (settingBox[0]) {
                settingBox.toggleClass("expanded");
            } else {
                var settingsbox = $('<div class="settingsBox"></div>');
                var keyList = Object.keys(that.settings);
                keyList.forEach(function(_key) {
                    var _setting = that.settings[_key];
                    var settingEntry = $('<div class="settingEntry"></div>');
                    $('<div class="settingLabel">' + _setting.label + '</div>').appendTo(settingEntry);
                    var settingSelector = $('<div class="settingSelector"></div>');
                    var updateSettingValue = function(updatedValue) {
                        _setting.value = updatedValue;
                    }
                    switch (_setting.type) {
                        case 'COLOR':
                            addColorPicker(settingSelector, updateSettingValue);
                            settingSelector.appendTo(settingEntry);
                            break;
                        default: //do nothing for now
                    }
                    settingEntry.appendTo(settingsbox);
                });
                settingsbox.addClass("expanded");
                settingsbox.appendTo(drawbar);

            }
        }
    }

    return HighchartAnnotation;

})();

/*
 * Including jQuery.bind-first library v0.2.3 to remove client depedency
 * Copyright (c) 2013 Vladimir Zhuravlev
 *
 * Released under MIT License
 * @license
 *
 * Date: Thu Feb  6 10:13:59 ICT 2014
 **/
(function(t) {
    function e(e) {
        return u ? e.data("events") : t._data(e[0]).events
    }

    function n(t, n, r) {
        var i = e(t),
            a = i[n];
        if (!u) {
            var s = r ? a.splice(a.delegateCount - 1, 1)[0] : a.pop();
            return a.splice(r ? 0 : a.delegateCount || 0, 0, s),
                void 0
        }
        r ? i.live.unshift(i.live.pop()) : a.unshift(a.pop())
    }

    function r(e, r, i) {
        var a = r.split(/\s+/);
        e.each(function() {
            for (var e = 0; a.length > e; ++e) {
                var r = t.trim(a[e]).match(/[^\.]+/i)[0];
                n(t(this), r, i)
            }
        })
    }

    function i(e) {
        t.fn[e + "First"] = function() {
            var n = t.makeArray(arguments),
                i = n.shift();
            return i && (t.fn[e].apply(this, arguments),
                    r(this, i)),
                this
        }
    }
    var a = t.fn.jquery.split("."),
        s = parseInt(a[0]),
        f = parseInt(a[1]),
        u = 1 > s || 1 == s && 7 > f;
    i("bind"),
    i("one"),
    t.fn.delegateFirst = function() {
        var e = t.makeArray(arguments),
            n = e[1];
        return n && (e.splice(0, 2),
                t.fn.delegate.apply(this, arguments),
                r(this, n, !0)),
            this
    },
    t.fn.liveFirst = function() {
        var e = t.makeArray(arguments);
        return e.unshift(this.selector),
            t.fn.delegateFirst.apply(t(document), e),
            this
    },
    u || (t.fn.onFirst = function(e, n) {
        var i = t(this),
            a = "string" == typeof n;
        if (t.fn.on.apply(i, arguments),
            "object" == typeof e)
            for (type in e)
                e.hasOwnProperty(type) && r(i, type, a);
        else
            "string" == typeof e && r(i, e, a);
        return i
    })
})(jQuery);