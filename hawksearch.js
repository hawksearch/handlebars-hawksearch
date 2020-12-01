/// <reference path="http://localhost:53453/login.aspx" />
// check to see if bootstrap3 already exists
var bootstrap3_enabled = (typeof $ == 'function' && typeof $().emulateTransitionEnd == 'function');
// check to see if boostrap collapse plugin exists
var bootstrapCollapse_enabled = (typeof $ == 'function' && typeof $.fn.collapse == 'function');

(function (HawkSearchLoader, undefined) {
    var jQuery;

    //if true, HawkSearch's jQuery will be loaded dynamically in noConflict mode.
    HawkSearchLoader.loadjQuery = true;

    //if true, some messages will be sent to the co nsole.
    HawkSearchLoader.debugMode = false;

    HawkSearch.SuggesterGlobal = {};

    HawkSearch.SuggesterGlobal.items = [];

    HawkSearch.SuggesterGlobal.searching = false;

    HawkSearch.SuggesterGlobal.template = {

        qf: '',

        lookupURL: '',

        divName: '',

        lastVal: '',

        searching: false,

        globalDiv: null,

        divFormatted: false,

        focus: false,

        defaultKeyword: [],

        isMobile: false

    };

    

    HawkSearch.SuggesterGlobal.getSuggester = function (name, isMobile) {

        for (var i = 0, l = HawkSearch.SuggesterGlobal.items.length; i < l; i++) {

            if (typeof HawkSearch.SuggesterGlobal.items[i] == "object" && HawkSearch.SuggesterGlobal.items[i].queryField === name) {

                return HawkSearch.SuggesterGlobal.items[i];

            }

        }

    };

    

    HawkSearch.SuggesterGlobal.getMobileSuggester = function () {

        for (var i = 0, l = HawkSearch.SuggesterGlobal.items.length; i < l; i++) {

            if (typeof HawkSearch.SuggesterGlobal.items[i] == "object" && HawkSearch.SuggesterGlobal.items[i].settings.isMobile === true) {

                return HawkSearch.SuggesterGlobal.items[i];

            }

        }

    };
   
    HawkSearch.GetQueryStringValue = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    HawkSearch.getTrackingUrl = function () {
        if (HawkSearch.TrackingUrl === undefined || HawkSearch.TrackingUrl === "") {
            return HawkSearch.BaseUrl;
        } else {
            return HawkSearch.TrackingUrl;
        }
    };

    HawkSearch.getHawkUrl = function () {
        if (HawkSearch.HawkUrl === undefined || HawkSearch.HawkUrl === "") {
            return HawkSearch.BaseUrl;
        } else {
            return HawkSearch.HawkUrl;
        }
    };

    HawkSearch.getClientGuid = function () {
        if (HawkSearch.ClientGuid !== undefined) {
            return HawkSearch.ClientGuid;
        } else {
            return '';
        }
    }

    HawkSearch.getCustomUrl = function () {
        var lpurl = window.location.pathname;
        if (lpurl.indexOf('/preview.aspx') >= 0) {
            lpurl = '';
        }
        if (lpurl.indexOf('/search/') >= 0) {
            lpurl = '';
        }
        return lpurl;
    };

    HawkSearch.RecommendationContext = {
        visitId: "",
        visitorId: "",
        baseUrl: HawkSearch.getHawkUrl(),
        clientGuid: HawkSearch.getClientGuid(),
        enablePreview: false,
        widgetUids: [],
        contextProperties: {},
        customProperties: {},
        landingPageUrl: ""
    };

    // and we can set up a data structure that contains information
    // that the server retrieved from long term storage to send
    // along with our clicks
    HawkSearch.EventBase = {
        version: '0.1a',
        event_type: 'PageLoad'
    };

    HawkSearch.Tracking = {}

    HawkSearch.Tracking.eventQueue = [];

    HawkSearch.Tracking.isReady = false;

    HawkSearch.Tracking.ready = function (callback) {

        if (HawkSearch.Tracking.isReady) {

            callback(HawkSearch.jQuery);

        } else {

            HawkSearch.Tracking.eventQueue.push(callback);

        }

    }

    

    HawkSearch.Tracking.setReady = function ($) {

        if (HawkSearch.lilBro.getTrackingId()) {

            var previousGuid = localStorage.getItem("hdnhawktrackingid");

            var currentGuid = HawkSearch.lilBro.getTrackingId();

            if (currentGuid == previousGuid) {

                log("history back");

                var newGuid = HawkSearch.lilBro.event.createUUID()

                HawkSearch.lilBro.setTrackingId(newGuid);

                HawkSearch.Tracking.copyRequestTracking(currentGuid, newGuid);

            } else {

                localStorage.setItem("hdnhawktrackingid", currentGuid);

            }

        }

    

        var callback;

        while (callback = HawkSearch.Tracking.eventQueue.shift()) {

            callback($);

        }

        HawkSearch.Tracking.isReady = true;

    }

    

    HawkSearch.Tracking.CurrentVersion = function () {

        return HawkSearch.jQuery("#hdnhawktrackingversion").val();

    }

    

    HawkSearch.Tracking.Version = {

        none: "none",

        v1: "v1",

        v2: "v2",

        v2AndSQL: "v2AndSQL"

    }

    

    HawkSearch.Tracking.writePageLoad = function (pageType) {

        var callback = function () {

            if (pageType === undefined) {

                pageType = "";

            }

    

            var pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.itemDetails;

            switch (pageType.toLowerCase()) {

                case "page":

                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.landingPage;

                    break;

                case "item":

                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.itemDetails;

                    break;

                case "cart":

                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.shoppingCart;

                    break;

                case "order":

                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.orderConfirmation;

                    break;

                case "custom":

                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.custom;

                    break;

                default:

                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.itemDetails;

            }

            var trackingValues = null;

            if (trackingValues != null) {

                return;

            }

            log("Tracking: write page load");

            var trackingContextValues = null;

            if (HawkSearch.Context) {

                trackingContextValues = HawkSearch.Context.keyValuePairs()

            }

    

            HawkSearch.lilBro.write({

                event_type: 'PageLoad',

                tracking_properties: JSON.stringify(trackingContextValues),

                page_type_id: pageTypeVal

            });

        }

        HawkSearch.Tracking.ready(callback);

    }

    

    

    HawkSearch.Tracking.writeSearchTracking = function (trackingId) {

        var callback = function (jQuery) {

            var $ = jQuery;

    

            if (trackingId == null || trackingId === "") {

                return;

            }

    

            var typeId = HawkSearch.LilBro.Schema.Search.SearchType["Refinement"];

            if (HawkSearch.Context && HawkSearch.Context.SearchTypeId) {

                typeId = HawkSearch.Context.SearchTypeId;

            } else {

                if ($("#hdnhawkquery").size() === 0) {

                    $('<input>').attr({

                        type: 'hidden',

                        id: 'hdnhawkquery',

                        name: 'hdnhawkquery'

                    }).appendTo('body');

                    $("#hdnhawkquery").val(HawkSearch.lilBro.event.createUUID());

                    typeId = HawkSearch.LilBro.Schema.Search.SearchType["Search"];

                }

            }

    

            var mpp = HawkSearch.getHashOrQueryVariable("mpp");

            var pg = HawkSearch.getHashOrQueryVariable("pg");

            var sort = HawkSearch.getHashOrQueryVariable("sort");

    

            var spellingSuggestion = HawkSearch.getHashOrQueryVariable("hawks") === "1";

            var lpurl = HawkSearch.getCustomUrl();

            if (lpurl == "/") {

                lpurl = "";

            }

    

            log("Tracking: write search type" + typeId);

            HawkSearch.lilBro.write({

                event_type: 'Search',

                tracking_id: trackingId,

                query_id: $('#hdnhawkquery').val(),

                type_id: typeId,

                lpurl: lpurl

            });

        }

        HawkSearch.Tracking.ready(callback);

    }

    

    HawkSearch.Tracking.writeSearch = function () {

        var callback = function (jQuery) {

            var $ = jQuery;

            var trackingId = HawkSearch.lilBro.getTrackingId();

            if (trackingId == null) {

                return;

            }

            HawkSearch.Tracking.writeSearchTracking(trackingId);

        }

        HawkSearch.Tracking.ready(callback);

    }

    

    HawkSearch.Tracking.writeClick = function (event, elementNo, mlt, uniqueId, trackingId) {

        var $ = $ || jQuery;

        var maxPerPage = $("#hdnhawkmpp").val();

        var pageNo = $("#hdnhawkpg").val();

        HawkSearch.Tracking.writeClick(event, elementNo, mlt, uniqueId, trackingId, maxPerPage, pageNo);

    }

    

    HawkSearch.Tracking.writeClick = function (event, elementNo, mlt, uniqueId, trackingId, maxPerPage, pageNo) {

        log("Tracking: write click");

    

        if (trackingId == null) {

            return;

        }

    

        if (trackingId != HawkSearch.lilBro.getTrackingId()) {

            trackingId = HawkSearch.lilBro.getTrackingId();

        }

    

        if (pageNo > 1) {

            elementNo = elementNo + maxPerPage * (pageNo - 1);

        }

    

        var url = event.currentTarget.href;

        var location = escape(event.currentTarget.href.href).replace(/\+/g, "%2B");

        HawkSearch.lilBro.write({

            url: url,

            event_type: 'Click',

            tracking_id: trackingId,

            element_no: elementNo,

            mlt: mlt === true,

            unique_id: uniqueId,

            location: location,

            ev: event

        });

    };

    

    HawkSearch.Tracking.writeBannerClick = function (el, id) {

        log("Tracking: banner click id:" + id);

        if (el && el.hasAttribute("onmousedown")) {

            el.removeAttribute("onmousedown");

        }

    

        HawkSearch.lilBro.write({

            event_type: 'BannerClick',

            banner_id: id,

            tracking_id: HawkSearch.lilBro.getTrackingId()

        });

    }

    

    HawkSearch.Tracking.writeBannerImpression = function (id) {

        var callback = function () {

            log("Tracking: banner impression id:" + id);

            HawkSearch.lilBro.write({

                event_type: 'BannerImpression',

                banner_id: id,

                tracking_id: HawkSearch.lilBro.getTrackingId()

            });

        }

    

        HawkSearch.Tracking.ready(callback);

    };

    

    HawkSearch.Tracking.writeSale = function (orderNo, itemList, total, subTotal, tax, currency) {

        var callback = function () {

            log("Tracking: write sale");

            HawkSearch.lilBro.write({

                event_type: 'Sale',

                order_no: orderNo,

                item_list: JSON.stringify(itemList),

                total: total,

                tax: tax,

                currency: currency,

                sub_total: subTotal

            }, function () {

                HawkSearch.lilBro.event.clearVisitId();

                log("Tracking visit id clared after order.");

            });

        }

        HawkSearch.Tracking.ready(callback);

    };

    

    HawkSearch.Tracking.writeAdd2Cart = function (uniqueId, price, quantity, currency) {

        var callback = function () {

            log("Tracking: write Add2Cart");

            HawkSearch.lilBro.write({

                event_type: 'Add2Cart',

                unique_id: uniqueId,

                price: price,

                quantity: quantity,

                currency: currency

            });

        }

    

        HawkSearch.Tracking.ready(callback);

    }

    

    /**

     * @param {{uniqueId: string, price: number, quantity: number, currency: number}[]} itemsList

     */

    HawkSearch.Tracking.writeAdd2CartMultiple = function (itemsList) {

        if (!itemsList) {

            throw "Items list cannot be null.";

        }

    

        if (Object.prototype.toString.call(itemsList) !== '[object Array]') {

            throw "Items list has to be an array.";

        }

    

        if (itemsList.length == 0) {

            throw "Items list cannot be empty.";

        }

    

        var callback = function () {

            log("Tracking: write Add2CartMultiple");

            HawkSearch.lilBro.write({

                event_type: 'Add2CartMultiple',

                items_list: JSON.stringify(itemsList)

            });

        };

    

        HawkSearch.Tracking.ready(callback);

    };

    

    HawkSearch.Tracking.writeRate = function (uniqueId, value) {

        if (value < 1 || value > 5) {

            return;

        }

        var callback = function () {

            log("Tracking: write Rate");

            HawkSearch.lilBro.write({

                event_type: 'Rate',

                unique_id: uniqueId,

                value: value

            });

        }

    

        HawkSearch.Tracking.ready(callback);

    }

    

    

    HawkSearch.Tracking.writeRecommendationClick = function (widgetGuid, uniqueId, itemIndex, requestId) {

        var callback = function () {

            log("Tracking: write RecommendationClick");

            HawkSearch.lilBro.write({

                event_type: 'RecommendationClick',

                widget_guid: widgetGuid,

                unique_id: uniqueId,

                item_index: itemIndex,

                request_id: requestId

            });

        }

        HawkSearch.Tracking.ready(callback);

    }

    

    HawkSearch.Tracking.writeAutoCompleteClick = function (keyword, event, type, name, itemUrl) {

        log("AutoComplete: item click id:" + name);

        var $ = $ || jQuery;

    

        if (typeof (ga) !== "undefined") {

            ga('send', {

                hitType: 'event',

                eventCategory: 'Autocomplete',

                eventAction: 'search',

                eventLabel: keyword,

                transport: 'beacon'

            });

        }

    

        HawkSearch.lilBro.write({

            event_type: 'AutoCompleteClick',

            url: itemUrl,

            suggest_type: type,

            name: name,

            keyword: keyword

        });

    }

    

    HawkSearch.Tracking.copyRequestTracking = function (oldTrackingId, newTrackingId) {

        log("CopyRequestTracking: old trackingId: " + oldTrackingId + " new trackingId:" + newTrackingId);

        var $ = $ || jQuery;

    

        HawkSearch.lilBro.write({

            event_type: 'CopyRequestTracking',

            old_tracking_id: oldTrackingId,

            new_tracking_id: newTrackingId

        });

    }

    

    HawkSearch.Tracking.track = function (eventName, args) {

        var ns = HawkSearch.Tracking;

        switch (eventName.toLowerCase()) {

            case 'pageload':

                return ns.writePageLoad(args.pageType);

            case 'search':

                return ns.writeSearch();

            case 'searchtracking':

                return ns.writeSearchTracking(args.trackingId);

            case 'click':

                return ns.writeClick(args.event, args.elementNo, args.mlt, args.uniqueId, args.trackingId);

            case 'clickEx':

                return ns.writeClick(args.event, args.elementNo, args.mlt, args.uniqueId, args.trackingId, args.maxPerPage, args.pageNo);

            case 'bannerclick':

                return ns.writeBannerClick(args.el, args.id);

            case 'bannerimpression':

                return ns.writeBannerImpression(args.id);

            case 'sale':

                return ns.writeSale(args.orderNo, args.itemList, args.total, args.subTotal, args.tax, args.currency);

            case 'add2cart':

                return ns.writeAdd2Cart(args.uniqueId, args.price, args.quantity, args.currency);

            case 'add2cartmultiple':

                return ns.writeAdd2CartMultiple(args);

            case 'rate':

                return ns.writeRate(args.uniqueId, args.value);

            case 'recommendationclick':

                return ns.writeRecommendationClick(args.widgetGuid, args.uniqueId, args.itemIndex, args.requestId);

            case 'autocompleteclick':

                return ns.writeAutoCompleteClick(args.keyword, args.event, args.suggest_type, args.name, args.itemUrl);

            case 'copyRequestTracking':

                return ns.copyRequestTracking(args.oldTrackingId, args.newTrackingId);

        }

    

        throw 'No such tracking event: ' + eventName;

    };

    

    HawkSearch.Tracking.V1 = {};

    

    HawkSearch.Tracking.V1.bannerLink = function (el, id) {

        el.href = HawkSearch.BaseUrl + '/banners.aspx?BannerId=' + id; el.mousedown = '';

        return true;

    };

    

    HawkSearch.Tracking.V1.autosuggestClick = function (keyword, name, url, type) {

        var args = '&keyword=' + encodeURIComponent(keyword) + '&name=' + encodeURIComponent(name) + '&type=' + type + '&url=' + encodeURIComponent(url);

        var getUrl = HawkSearch.BaseUrl + "?fn=ajax&f=GetAutoCompleteClick" + args;

        var $ = $ || jQuery;

    

        $.ajax({

            "type": "GET",

            "data": "",

            "async": "false",

            "contentType": "application/json; charset=utf-8",

            "url": getUrl,

            "dataType": "jsonp",

            success: function (data) {

                var json = $.parseJSON(data);

                if (json.success === 'True') {

                    log("success added tracking autocomplete click");

                }

                else {

                    log("failed added tracking autocomplete click");

                }

            },

            error: function (error) {

                log(error);

            }

        });

    };

    

    HawkSearch.Tracking.V1.link = function (el, id, i, pk, mlt) {

        var full = HawkSearch.BaseUrl + "/link.aspx?id=" + escape(id) + "&q=" + escape(el.currentTarget.href).replace(/\+/g, "%2B") + "&i=" + i + "&pk=" + pk + "&mlt=" + mlt;

        el.currentTarget.href = full;

        return true;

    };

    // LilBro code

    HawkSearch.LilBro = function (args) {

    

        var self = this;

        var $ = null;

    

        this.initialize = function (args) {

            this.ensureBase64Encoding();

            if (args) {

                if (!args.server) {

                    return;

                }

    

                $ = args.jQuery;

                this.watch_container(args.element, args.watch_focus);

    

                this.freshEvent = function () {

                    var base = {};

                    if (args.event_base) {

                        for (var p in args.event_base) {

                            if (args.event_base.hasOwnProperty(p)) {

                                base[p] = args.event_base[p];

                            }

                        }

                    }

    

                    var eventType = args.event_type || args.event_base.event_type || "PageLoad";

                    return new HawkSearch.LilBro.Event({

                        base: base,

                        key_map: args.key_map || HawkSearch.LilBro.Schema[eventType].key_map || HawkSearch.LilBro.Schema.key_map,

                        type_map: args.type_map || HawkSearch.LilBro.Schema.type_map,

                        server: args.server,

                        ssl_server: args.ssl_server,

                        visit_id_cookie: args.visit_id_cookie || 'visit_id',

                        visitor_id_cookie: args.visitor_id_cookie || 'visitor_id'

                    });

                };

            } else {

                return;

            }

    

            try {

                if (sessionStorage && sessionStorage.getItem('lilbrobug' + window.location.protocol)) {

                    var src = decodeURIComponent(sessionStorage.getItem('lilbrobug' + window.location.protocol));

                    var bug = new Image();

                    bug.onload = function () {

                        sessionStorage.removeItem('lilbrobug' + window.location.protocol);

                    };

                    bug.src = src;

                }

            } catch (e) {

                log('ERROR: ' + e);

            }

    

            this.event = this.freshEvent();

            HawkSearch.RecommendationContext.visitorId = this.event.getVisitorId();

            HawkSearch.RecommendationContext.visitId = this.event.getVisitId();

        };

    

        this.watch_container = function (el, focus) {

            if (!el) {

                return;

            }

            if (el.addEventListener) {

                el.addEventListener('click', _doer_maker('click'), false);

                if (focus) {

                    el.addEventListener('focusin', _doer_maker('focusin'), false);

                    el.addEventListener('focusout', _doer_maker('focusout'), false);

                }

            } else {

                el.attachEvent('onclick', _doer_maker('click'), false);

                if (focus) {

                    el.attachEvent('onfocusin', _doer_maker('focusin'), false);

                    el.attachEvent('onfocusout', _doer_maker('focusout'), false);

                }

            }

        };

    

        this.watch = function (args) {

            if (!args) {

                return;

            }

            if (!args.element) {

                return;

            }

            if (args.element.addEventListener) {

                args.element.addEventListener(

                    'click',

                    _doer_maker('click', args.callback, args.bubble),

                    false

                );

            } else {

                args.element.attachEvent(

                    'onclick',

                    _doer_maker('click', args.callback, args.bubble),

                    false

                );

            }

        };

    

        function _doer_maker(type, callback, bubble) {

            return function (ev) {

                if (!ev) {

                    ev = window.event;

                }

                var targ = self._findTarget(ev);

                self.event.fill({

                    type: type,

                    event: ev,

                    target: targ

                });

                if (callback) {

                    try {

                        callback(self.event);

                    } catch (e) {

                    }

                }

                if (bubble != null && !bubble) {

                    ev.cancelBubble = true;

                    if (ev.stopPropagation) {

                        ev.stopPropagation();

                    }

                }

                self.event.write();

                self.event = self.freshEvent();

            };

        };

    

        this.createObjectProps = function (obj) {

            var key_map = obj._key_map;

            for (var key in key_map) {

                if (!obj._event.hasOwnProperty(key)) {

                    obj._event[key] = "";

                }

            }

        };

    

        this.write = function (obj, callback) {

            var schema = HawkSearch.LilBro.Schema[obj.event_type];

            var key_map = args.key_map || schema.key_map;

            var version = schema.version || HawkSearch.LilBro.Schema.version;

            self.event._key_map = key_map;

            this.createObjectProps(self.event);

            var ev = obj.ev;

            if (!obj.ev && window.event) {

                ev = window.event;

            }

            var targ = self._findTarget(ev);

            self.event.fill({

                type: obj.event_type,

                event: ev,

                target: targ,

                version: version

            });

    

            for (var key in obj) {

                self.event.set(key, obj[key]);

            }

    

            self.event.write(callback);

            self.event = self.freshEvent();

        };

    

        // event target lifted from quirksmode

        this._findTarget = function (ev) {

            var targ = null;

            if (ev && ev.target) {

                targ = ev.target;

            } else if (ev && ev.srcElement) {

                targ = ev.srcElement;

            }

            // defeat Safari bug

            if (targ && targ.nodeType == 3) {

                targ = targ.parentNode;

            }

            return targ;

        };

    

        this.getTrackingId = function () {

            if (HawkSearch.Context && HawkSearch.Context.TrackingId) {

                return HawkSearch.Context.TrackingId;

            }

    

            if ($("#hdnhawktrackingid").size() == 0 || $("#hdnhawktrackingid").val() === "") {

                return null;

            }

            return $("#hdnhawktrackingid").val();

        };

    

        this.setTrackingId = function (trackingId) {

            if (HawkSearch.Context && HawkSearch.Context.TrackingId) {

                HawkSearch.Context.TrackingId = trackingId;

            }

    

            if ($("#hdnhawktrackingid").size() > 0) {

                $("#hdnhawktrackingid").val(trackingId);

            }

            

        };

    

        this.ensureBase64Encoding = function () {

            /*base 64*/

            !function () {

                function t(t) { this.message = t } var r = "undefined" != typeof exports ? exports : this, e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; t.prototype = new Error, t.prototype.name = "InvalidCharacterError", r.btoa || (r.btoa = function (r) {

                    for (var o, n, a = String(r), i = 0, c = e, d = ""; a.charAt(0 | i) || (c = "=", i % 1) ; d += c.charAt(63 & o >> 8 - i % 1 * 8)) {

                        if (n = a.charCodeAt(i += .75), n > 255) throw new t("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range."); o = o << 8 | n

                    } return d

                }), r.atob || (r.atob = function (r) {

                    var o = String(r).replace(/=+$/, ""); if (o.length % 4 == 1) throw new t("'atob' failed: The string to be decoded is not correctly encoded."); for (var n, a, i = 0, c = 0, d = ""; a = o.charAt(c++) ; ~a && (n = i % 4 ? 64 * n + a : a, i++ % 4) ? d += String.fromCharCode(255 & n >> (-2 * i & 6)) : 0) a = e.indexOf(a); return d

                })

            }();

        }

    

        this.initialize(args);

    };

    

    HawkSearch.LilBro.Event = function (args) {

    

        this.initialize = function (args) {

            this._event = args.base;

            this._key_map = args.key_map;

            this._type_map = args.type_map;

            this.server = args.server;

            this.ssl_server = args.ssl_server;

            this.visit_id_cookie = args.visit_id_cookie;

            this.visitor_id_cookie = args.visitor_id_cookie;

        };

    

        this.set = function (prop, val) {

            if (!this._event.hasOwnProperty(prop)) {

                return;

            }

            return this._event[prop] = val;

        };

    

        this.get = function (prop) {

            return this._event[prop];

        };

    

        this.write = function (callback) {

            var isExpand = HawkSearch.GetQueryStringValue["expand"] !== undefined;

            if (isExpand) {

                return;

            }

            var event = [];

            var et = "";

            for (var key in this._key_map) {

                if (key === "event_type") {

                    event[this._key_map[key]] = this._type_map[this.get(key)] || 0;

                    et = event[this._key_map[key]];

                } else {

                    event[this._key_map[key]] = this.get(key);

                }

            }

            var protocol = window.location.protocol;

            var customDictionaryString = JSON.stringify(HawkSearch.Context.Custom.keyValuePairs());

    

            var clientIdentifyToken;

            if (HawkSearch.getClientGuid() !== "") {

                clientIdentifyToken = '&cg=' + HawkSearch.getClientGuid();

            } else {

                clientIdentifyToken = '&bu=' + HawkSearch.getHawkUrl();

            }

    

            var src = HawkSearch.getTrackingUrl() + '/hawk.png?t=' + encodeURIComponent(btoa(event.join('\x01'))) + '&et=' + et + clientIdentifyToken + '&cd=' + encodeURIComponent(customDictionaryString) + '&' + this.randomHexBlocks(1);

    

            log(src);

            try {

                if (sessionStorage) {

                    sessionStorage.setItem(

                        'lilbrobug' + protocol,

                        encodeURIComponent(src)

                    );

                }

            } catch (e) {

                log('Tracking: ERROR ' + e);

            }

    

            var bug = new Image();

            bug.onload = function () {

                log("Tracking sent. " + src);

                try {

                    sessionStorage.removeItem('lilbrobug' + protocol);

                } catch (e) {

                    log('Tracking: ERROR ' + e);

                }

                if (callback) {

                    callback();

                }

            };

            bug.src = src;

        };

    

        this.fill

            = function (args) {

                //version

                if (args && args.version) {

                    this.set('version', args.version);

                } else {

                    this.set('version', HawkSearch.LilBro.Schema.version);

                }

    

                if (args && args.type) {

                    // event type

                    this.set('event_type', args.type);

                };

                if (args && args.event) {

    

                    // mouse coordinates

                    var mouse_x = '';

                    var mouse_y = '';

                    if (args.event.pageX || args.event.pageY) {

                        mouse_x = args.event.pageX;

                        mouse_y = args.event.pageY;

                    } else if (args.event.clientX || args.event.clientY) {

                        mouse_x = args.event.clientX + document.body.scrollLeft

                            + document.documentElement.scrollLeft;

                        mouse_y = args.event.clientY + document.body.scrollTop

                            + document.documentElement.scrollTop;

                    }

                    this.set('mouse_x', mouse_x);

                    this.set('mouse_y', mouse_y);

                }

    

                // viewport

                this.set('viewport_width', document.documentElement.clientWidth);

                this.set('viewport_height', document.documentElement.clientHeight);

    

                // scroll, snaked from http://webcodingeasy.com/Javascript/Get-scroll-position-of-webpage--crossbrowser

                var scroll_x = 0, scroll_y = 0;

                if (typeof (window.pageYOffset) == 'number') {

                    scroll_x = window.pageXOffset;

                    scroll_y = window.pageYOffset;

                } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {

                    scroll_x = document.body.scrollLeft;

                    scroll_y = document.body.scrollTop;

                } else if (document.documentElement && (document.documentElement.scrollLeft

                    || document.documentElement.scrollTop)) {

                    scroll_x = document.documentElement.scrollLeft;

                    scroll_y = document.documentElement.scrollTop;

                }

                this.set('scroll_x', scroll_x || 0);

                this.set('scroll_y', scroll_y || 0);

    

                // element goodies

                if (args && args.target) {

                    // element id and class, or their closest ancestors

                    var el_id = args.target.id;

                    var el_class = args.target.className;

                    var id_from_ancestor = !el_id;

                    var class_from_ancestor = !el_class;

                    var id_path, class_path;

                    if (!el_id || !el_class) {

                        var targ_orig = args.target;

                        id_path = args.target.tagName;

                        class_path = args.target.tagName;

                        do {

                            args.target = args.target.parentNode;

                            if (args.target === null || args.target == undefined) {

                                break;

                            }

                            if (!el_id && args.target.tagName) {

                                id_path = args.target.tagName + '/' + id_path;

                                el_id = args.target.id;

                            }

                            if (!el_class && args.target.tagName) {

                                class_path = args.target.tagName + '/' + class_path;

                                el_class = args.target.className;

                            }

                        } while ((!el_id || !el_class) && args.target.parentNode);

                        args.target = targ_orig;

                    }

                    this.set('element_id', el_id);

                    this.set('element_class', el_class);

                    if (el_id && id_from_ancestor) {

                        this.set('element_id_from', id_path);

                    }

                    if (el_class && class_from_ancestor) {

                        this.set('element_class_from', class_path);

                    }

    

                    // element sundry

                    this.set('element_name', args.target.name || '');

                    this.set('element_tag', args.target.tagName || '');

                    this.set('element_type', args.target.type || '');

                    this.set('element_checked', args.target.checked ? 1 : '');

                    // by default, ignore typed input

                    if (args.target.type && args.target.type.toLowerCase() !== 'text'

                        && args.target.type.toLowerCase() !== 'password') {

                        this.set('element_value', args.target.value || '');

                    }

    

                    // including the position best effort (http://stackoverflow.com/a/442474)

                    var element_x = 0;

                    var element_y = 0;

                    var targ_orig = args.target;

                    while (args.target && !isNaN(args.target.offsetLeft) && !isNaN(args.target.offsetTop)) {

                        element_x += args.target.offsetLeft - args.target.scrollLeft;

                        element_y += args.target.offsetTop - args.target.scrollTop;

                        args.target = args.target.offsetParent;

                    }

                    args.target = targ_orig;

                    this.set('element_x', element_x);

                    this.set('element_y', element_y);

                }

    

                // browser

                if (HawkSearch.LilBro.BrowserDetect) {

                    this.set('browser', HawkSearch.LilBro.BrowserDetect.browser);

                    this.set('browser_version', HawkSearch.LilBro.BrowserDetect.version);

                    this.set('operating_system', HawkSearch.LilBro.BrowserDetect.OS);

                }

    

                // path part of url

                this.set('request_path', window.location.pathname);

    

                // other client bits

                var d = new Date();

                this.set('timestamp', d.getTime());

                var visitorId = this.getVisitorId();

                var visitId = this.getVisitId();

                this.set('visitor_id', visitorId);

                this.set('visit_id', visitId);

                this.set('qs', encodeURIComponent(HawkSearch.getHash()));

            };

    

        this.getVisitorId = function () {

            var visitor_id = this.getCookie(this.visitor_id_cookie);

            if (!visitor_id) {

                visitor_id = this.createUUID();

            }

            this.setCookie(this.visitor_id_cookie, visitor_id, this.getVisitorExpiry());

            return visitor_id;

        };

    

        this.getVisitId = function () {

            var visit_id = this.getCookie(this.visit_id_cookie);

            if (!visit_id) {

                visit_id = this.createUUID();

            }

            this.setCookie(this.visit_id_cookie, visit_id, this.getVisitExpiry());

            return visit_id;

        };

    

        this.clearVisitId = function () {

            this.setCookie(this.visit_id_cookie, "", 'Thu, 01 Jan 1970 00:00:01 GMT');

        };

    

        this.getVisitorExpiry = function () {

            var d = new Date();

            // 1 year

            d.setTime(d.getTime() + (360 * 24 * 60 * 60 * 1000));

            return d.toGMTString();

        };

    

        this.getVisitExpiry = function () {

            var d = new Date();

            // 4 hours

            d.setTime(d.getTime() + (4 * 60 * 60 * 1000));

            return d.toGMTString();

        };

    

        this.randomHexBlocks = function (blocks) {

            if (!blocks) {

                blocks = 4;

            }

            var hex = '';

            for (var i = 0; i < blocks; i++) {

                hex += parseInt(Math.random() * (Math.pow(2, 32))).toString(16);

            }

            return hex;

        };

    

        this.createUUID = function () {

            var s = [];

            var hexDigits = "0123456789abcdef";

            for (var i = 0; i < 36; i++) {

                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);

            }

            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010

            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01

            s[8] = s[13] = s[18] = s[23] = "-";

    

            var uuid = s.join("");

            return uuid;

        }

    

    

        // cookies borrowed from quirksmode

        this.setCookie = function (name, value, expiry) {

            var expires;

            if (expiry) {

                expires = "; expires=" + expiry;

            } else {

                expires = "";

            }

            document.cookie = name + "=" + value + expires + "; path=/";

        };

    

        this.getCookie = function (name) {

            var nameEQ = name + "=";

            var ca = document.cookie.split(';');

            for (var i = 0; i < ca.length; i++) {

                var c = ca[i];

                while (c.charAt(0) == ' ') c = c.substring(1, c.length);

                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);

            }

            return null;

        };

    

        this.initialize(args);

    };

    

    // browser detection lifted from quirksmode

    HawkSearch.LilBro.BrowserDetect = {

        init: function () {

            this.browser = this.searchString(this.dataBrowser) || "An unknown browser";

            this.version = this.searchVersion(navigator.userAgent)

                || this.searchVersion(navigator.appVersion)

                || "an unknown version";

            this.OS = this.searchString(this.dataOS) || "an unknown OS";

        },

        searchString: function (data) {

            for (var i = 0; i < data.length; i++) {

                var dataString = data[i].string;

                var dataProp = data[i].prop;

                this.versionSearchString = data[i].versionSearch || data[i].identity;

                if (dataString) {

                    if (dataString.indexOf(data[i].subString) != -1)

                        return data[i].identity;

                }

                else if (dataProp)

                    return data[i].identity;

            }

        },

        searchVersion: function (dataString) {

            var index = dataString.indexOf(this.versionSearchString);

            if (index == -1) return;

            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));

        },

        dataBrowser: [

            {

                string: navigator.userAgent,

                subString: "BlackBerry",

                identity: "BlackBerry"

            },

            {

                string: navigator.userAgent,

                subString: "BB10",

                identity: "BlackBerry"

            },

            {

                string: navigator.userAgent,

                subString: "PlayBook",

                identity: "BlackBerry"

            },

            {

                string: navigator.userAgent,

                subString: "Chrome",

                identity: "Chrome"

            },

            {

                string: navigator.userAgent,

                subString: "OmniWeb",

                versionSearch: "OmniWeb/",

                identity: "OmniWeb"

            },

            {

                string: navigator.vendor,

                subString: "Apple",

                identity: "Safari",

                versionSearch: "Version"

            },

            {

                prop: window.opera,

                identity: "Opera",

                versionSearch: "Version"

            },

            {

                string: navigator.vendor,

                subString: "iCab",

                identity: "iCab"

            },

            {

                string: navigator.vendor,

                subString: "KDE",

                identity: "Konqueror"

            },

            {

                string: navigator.userAgent,

                subString: "Firefox",

                identity: "Firefox"

            },

            {

                string: navigator.vendor,

                subString: "Camino",

                identity: "Camino"

            },

            {// for newer Netscapes (6+)

                string: navigator.userAgent,

                subString: "Netscape",

                identity: "Netscape"

            },

            {

                string: navigator.userAgent,

                subString: "MSIE",

                identity: "Explorer",

                versionSearch: "MSIE"

            },

            {

                string: navigator.userAgent,

                subString: "Gecko",

                identity: "Mozilla",

                versionSearch: "rv"

            },

            { // for older Netscapes (4-)

                string: navigator.userAgent,

                subString: "Mozilla",

                identity: "Netscape",

                versionSearch: "Mozilla"

            }

        ],

        dataOS: [

            {

                string: navigator.userAgent,

                subString: "iPhone",

                identity: "iPhone/iPod"

            },

            {

                string: navigator.userAgent,

                subString: "iPod",

                identity: "iPhone/iPod"

            },

            {

                string: navigator.userAgent,

                subString: "iPad",

                identity: "iPad"

            },

            {

                string: navigator.userAgent,

                subString: "BlackBerry",

                identity: "BlackBerry"

            },

            {

                string: navigator.userAgent,

                subString: "BB10",

                identity: "BlackBerry"

            },

            {

                string: navigator.userAgent,

                subString: "PlayBook",

                identity: "BlackBerry"

            },

            {

                string: navigator.userAgent,

                subString: "Android",

                identity: "Android"

            },

            {

                string: navigator.platform,

                subString: "Win",

                identity: "Windows"

            },

            {

                string: navigator.platform,

                subString: "Mac",

                identity: "Mac"

            },

            {

                string: navigator.platform,

                subString: "Linux",

                identity: "Linux"

            }

        ]

    };

    try {
        HawkSearch.LilBro.BrowserDetect.init();
    } catch (e) { }

    HawkSearch.Recommender = function (jQuery) {

        HawkSearch.Recommender.setReady(jQuery);

        var self = this;

        this._uniqueId = null;

        var $ = jQuery;

    

        this.Init = function () {

            if (!HawkSearch.getRecommenderUrl()) {

                return;

            }

    

            log("Recommender init");

    

            if (HawkSearch.Context.containsKey("uniqueid")) {

                self._uniqueId = HawkSearch.Context["uniqueid"];

            }

    

            self._context = HawkSearch.RecommendationContext;

            self._context.enablePreview = HawkSearch.Recommender.IsPreviewEnabled();

    

            self._context.contextProperties = HawkSearch.Context;

            self._context.customProperties = HawkSearch.Context.Custom;

    

            $(".hawk-recommendation").each(function () {

                var uid = HawkSearch.Recommender.GetWidgetUid($(this).data("widgetguid"), $(this).data("uniqueid"));

                if ($(this).data("uniqueid") === undefined || uid.uniqueId === "") {

                    uid.uniqueId = self._uniqueId;

                }

                var widgetExists = false;

                $(self._context.widgetUids).each(function () {

                    var currentWidgetGuid = this.widgetGuid;

                    if (currentWidgetGuid == uid.widgetGuid) {

                        widgetExists = true;

                        return;

                    }

                })

                if (!widgetExists) {

                    self._context.widgetUids.push(uid);

                }

            });

    

            if (self._context.widgetUids.length == 0) {

                return;

            }

            var recommenderUrl = HawkSearch.getRecommenderUrl() + "/api/recommendation/";

    

            var previewVisitorTargets = HawkSearch.Recommender.PreviewVisitorTarget();

    

            if (HawkSearch.Recommender.IsPreviewEnabled() && previewVisitorTargets != null && previewVisitorTargets !== "") {

                recommenderUrl = recommenderUrl + "?hawkb=" + previewVisitorTargets;

            }

    

            $.ajax({

                type: 'POST',

                url: recommenderUrl,

                data: JSON.stringify(self._context),

                contentType: "application/json",

                dataType: 'json'

            })

            .done(self.RegWidgets);

        }

    

        bindRecommendationPopover = function (container, ruleExplainDictionary, triggerRuleExplainDictionary) {

            container.find(".hawk-recommendation-item").each(function () {

                var modelType = $(this).data("hawk-modeltype");

                var modelName = $(this).data("hawk-modelname");

                var modelGuid = $(this).data("hawk-modelguid");

                var recInfoContainer = $(this).find(".hawk-recommendation-info");

                if (recInfoContainer.size() === 0) {

                    recInfoContainer = $("<div class='hawk-recommendation-info' data-trigger='hover'></div>");

                    recInfoContainer.append($("<div class='hawk-recommendation-model-icon hawk-" + modelType.toLowerCase() + "'></div>"));

                    $(this).prepend(recInfoContainer);

                }

    

                var ruleString = ruleExplainDictionary[modelGuid];

                var triggerRuleString = triggerRuleExplainDictionary[modelGuid];

    

                $(recInfoContainer).popover({

                    html: true,

                    placement: HawkSearch.getTipPlacementFunction('top', 230, 200),

    

                    content: function () {

                        var content = "<b>Strategy Name:</b> " + modelName;

                        if (ruleString !== undefined && ruleString !== "") {

                            content += "<div class=''>"

                            content += "<div class=''><b>Rule:</b></div>";

                            content += ruleString;

                            content += "</div>";

                        }

    

                        if (triggerRuleString !== undefined && triggerRuleString !== "") {

                            content += "<div class=''>"

                            content += "<div class=''><b>Trigger Rule:</b></div>";

                            content += triggerRuleString;

                            content += "</div>";

                        }

    

                        return content;

                    },

                    trigger: 'hover',

                    container: 'body'

                });

    

            });

        }

    

        this.RegWidgets = function (data) {

            if (!data.isSuccess) {

                HawkSearch.hideRecsBlockUI();

                return;

            }

    

            $(data.items).each(function () {

                var item = this;

                var contaierSelector = '.hawk-recommendation[data-widgetguid="' + item.widgetGuid + '"]';

                var widgetContainer = $(contaierSelector);

                if (widgetContainer.length > 0) {

                    widgetContainer.attr("data-hawk-requestid", data.requestId);

                    var layoutClass = "hawk-recommendation-" + (item.isVertical ? "vertical" : "horizontal");

                    widgetContainer.addClass(layoutClass);

                    widgetContainer.addClass(item.widgetCssClass);

                    widgetContainer.append("<div class='hawk-recommendation-inner'></div>");

                    var widgetContainerInner = widgetContainer.find(".hawk-recommendation-inner");

                    widgetContainerInner.css('visibility', 'hidden');

                    widgetContainerInner.html(item.html);

                    var hawkRecommendationItems = widgetContainerInner.find(".hawk-recommendation-item");

                    widgetContainerInner.waitForImages(function () {

                        var itemContainer = widgetContainerInner.find(".hawk-recommendation-list")

    

                        hawkRecommendationItems.matchHeights({ includeMargin: true });

    

                        if (!itemContainer.children().length) {

                            widgetContainer.hide();

                        }

    

                        var container = $("#hawkitemlist");

    

                        HawkSearch.ExposeEvents("RecommenderAfterWidgetImagesLoaded", { widgetContainer: widgetContainer });

    

    

                        if (item.isCarousel) {

                            if (item.carouselData.showNextPrevButtons) {

                                widgetContainerInner.addClass("has-arrows");

                            }

                            if (item.carouselData.showDots) {

                                widgetContainerInner.addClass("has-dots vertical-dots");

                            }

    

                            var autoRotateSpeed = item.carouselData.autoRotate ? item.carouselData.autoRotateSpeed : 0;

                            var showDots = item.carouselData.showDots;

                            var slickOptions = {

                                speed: item.carouselData.animationSpeed,

                                autoplay: item.carouselData.autoRotate,

                                autoplaySpeed: item.carouselData.autoRotateSpeed,

                                vertical: item.isVertical,

                                slidesToShow: item.carouselData.nofVisible,

                                arrows: item.carouselData.showNextPrevButtons,

                                nextArrow: '<button type="button" class="hawk-carousel-next"><span>Next</span></button>',

                                prevArrow: '<button type="button" class="hawk-carousel-prev"><span>Prev</span></button>',

                                slidesToScroll: item.carouselData.scrollNumber,

                                infinite: item.carouselData.isCircular,

                                dots: item.carouselData.showDots,

                                //variableWidth: (!item.isVertical),

                                slide: ".hawk-recommendation-item",

                                pauseOnHover: true,

                                pauseOnDotsHover: true,

                                mobileFirst: true

                            };

                            if (item.carouselData.enableResponsive) {

                                var responsiveConfig = null;

                                try {

                                    responsiveConfig = JSON.parse(item.carouselData.responseiveConfig);

    

                                } catch (e) {

                                    log("Responsive data is corupted. WidgetGuid: " + item.widgetGuid + " Error:" + e);

                                }

                                if (responsiveConfig != null) {

                                    slickOptions.responsive = responsiveConfig;

                                }

                            }

    

                            itemContainer.slick(slickOptions);

    

                            if (!item.isVertical) {

                                var itemWidth = itemContainer.find(".hawk-recommendation-item:visible").first().outerWidth(true);

                                var itemCount = item.carouselData.nofVisible;

                                //itemContainer.width(itemWidth * itemCount);

                                //widgetContainer.css( "maxWidth", widgetContainerInner.width() + 52 + "px");

                                //widgetContainer.height(widgetContainerInner.height() + "px");

                            }

                            else {

                                var itemWidth = itemContainer.find(".hawk-recommendation-item:visible").first().outerWidth(true);

                                //itemContainer.width(itemWidth + "px");

                            }

    

                            $(window).on("debouncedresize", function () {

                                itemContainer.slick('slickGoTo', itemContainer.slick('slickCurrentSlide'), true);

                            });

                        } else {

                            if (!item.isVertical) {

                                var itemWidth = itemContainer.find(".hawk-recommendation-item:visible").first().outerWidth(true);

                                var itemCount = itemContainer.find(".hawk-recommendation-item").size();

                                itemContainer.width(itemWidth * itemCount);

                                widgetContainer.height(widgetContainerInner.height() + "px");

                            }

                            else {

                                widgetContainer.width(widgetContainerInner.width() + "px");

                            }

                        }

                        widgetContainer.append("<div class='clearfix'></div>");

                        widgetContainerInner.css('visibility', 'visible');

    

                        var enablePreview = HawkSearch.Recommender.IsPreviewEnabled();

    

                        if (enablePreview) {

                            var ruleExplainDictionary = new HawkSearch.Dictionary();

                            var triggerRuleExplainDictionary = new HawkSearch.Dictionary();

                            var bindPreview = function (data) {

    

                                for (i = 0; i < data.length; i++) {

                                    var item = data[i];

                                    ruleExplainDictionary[item.ModelGuid] = item.RuleString;

                                    triggerRuleExplainDictionary[item.ModelGuid] = item.TriggerRuleString;

                                }

                                bindRecommendationPopover(widgetContainerInner, ruleExplainDictionary, triggerRuleExplainDictionary);

                            };

    

                            $(window).on("debouncedresize", function () {

                                $(".hawk-recommendation-info").each(function (index, item) {

                                    $(item).popover('destroy');

                                });

    

                                setTimeout(function () {

                                    bindRecommendationPopover(widgetContainerInner, ruleExplainDictionary, triggerRuleExplainDictionary);

                                }, 10);

    

                            });

                            var uriParser = document.createElement("a");

                            var url = uriParser.href = HawkSearch.HawkUrl || HawkSearch.BaseUrl;

                            var apiUrl = uriParser.protocol + "//" + uriParser.hostname + "/api/v3/RecommendationModel/getruleexplain?widgetGuid=" + item.widgetGuid + "&bu=" + encodeURIComponent(HawkSearch.getHawkUrl()) + "&cg=" + HawkSearch.getClientGuid();

                            $.ajax({

                                url: apiUrl,

                                dataType: "jsonp",

                                success: bindPreview

                            });

                        }

                    });

                }

                HawkSearch.ExposeEvents('RecommenderAfterWidgetInit', { widgetGuid: item.widgetGuid, itemsCount: item.itemsCount, widgetContainer: widgetContainer });

            });

            HawkSearch.hideRecsBlockUI();

            HawkSearch.ExposeEvents('RecommenderAfterInit');

        }

        this.Init();

    }

    HawkSearch.Recommender.isReady = false;

    HawkSearch.Recommender.eventQueue = [];

    

    HawkSearch.Recommender.ready = function (callback) {

        if (HawkSearch.Recommender.isReady) {

            callback(HawkSearch.jQuery);

        } else {

            HawkSearch.Recommender.eventQueue.push(callback);

        }

    }

    

    HawkSearch.Recommender.setReady = function ($) {

        var callback;

        while (callback = HawkSearch.Recommender.eventQueue.shift()) {

            callback($);

        }

        HawkSearch.Recommender.isReady = true;

    }

    HawkSearch.Recommender.PreviewInfoCookieName = "EnableRecommendationPreviewInfo";

    HawkSearch.Recommender.HawkPreviewBucket = "hawkPreviewBucket";

    

    HawkSearch.Recommender.GetWidgetUid = function (widgetGuid, uniqueId) {

        var uid = new Object();

        uid.widgetGuid = widgetGuid;

        uid.uniqueId = uniqueId;

    

        if (uniqueId !== undefined && uniqueId.match(/{{.+}}/)) {

            uid.uniqueId = "";

        }

    

        return uid;

    }

    

    HawkSearch.Recommender.SetWidget = function (widgetGuid, uniqueId) {

        HawkSearch.RecommendationContext.widgetUids.push(HawkSearch.Recommender.GetWidgetUid(widgetGuid, uniqueId));

    }

    

    HawkSearch.Recommender.IsPreviewEnabled = function () {

        var enablePreview = HawkSearch.lilBro.event.getCookie(HawkSearch.Recommender.PreviewInfoCookieName)

    

        return (enablePreview !== null && enablePreview.toLowerCase() === 'true');

    }

    

    HawkSearch.Recommender.ToggleRecPreview = function () {

        HawkSearch.Tracking.ready(function () {

            var toggleVal = HawkSearch.getHashOrQueryVariable("hawkToggleRecPreview");

            if (toggleVal !== "") {

                HawkSearch.lilBro.event.setCookie(HawkSearch.Recommender.PreviewInfoCookieName, toggleVal, HawkSearch.lilBro.event.getVisitorExpiry());

                var hawkb = HawkSearch.getHashOrQueryVariable("hawksetb");

                HawkSearch.lilBro.event.setCookie(HawkSearch.Recommender.HawkPreviewBucket, hawkb, HawkSearch.lilBro.event.getVisitorExpiry());

            }

        });

    }

    

    HawkSearch.Recommender.setLandingPageUrl = function (lpurl) {

        HawkSearch.RecommendationContext.landingPageUrl = lpurl;

    }

    

    HawkSearch.Recommender.PreviewVisitorTarget = function () {

        return HawkSearch.lilBro.event.getCookie(HawkSearch.Recommender.HawkPreviewBucket);

    }

    

    HawkSearch.Recommender.Track = function (el, uniqueId, itemIndex) {

        var widgetGuid = HawkSearch.jQuery(el).parents(".hawk-recommendation").data("widgetguid");

        var recommendation = HawkSearch.jQuery(el).parents(".hawk-recommendation");

        var requestId = recommendation.data("hawk-requestid");

        HawkSearch.Tracking.writeRecommendationClick(widgetGuid, uniqueId, itemIndex, requestId);

    }

    function log(msg) {

        if (HawkSearchLoader.debugMode && window.console && console.log) {

            console.log('HawkSearch: ' + msg);

        };

    }

    if (HawkSearchLoader.loadjQuery) {
        log('Loading jQuery/jQuery UI.');
        // set document head to varible
        var head = (document.getElementsByTagName("head")[0] || document.documentElement),
			script = "//manage.hawksearch.com/sites/shared/includes/jquery-1.11.0_jquery-ui-slider-1.10.4.min.js";

        var jqScriptTag = document.createElement('script');
        jqScriptTag.type = 'text/javascript';
        jqScriptTag.src = script;

        // Handle Script loading
        // IE9+ supports both script.onload AND script.onreadystatechange (bit.ly/18gsqtw)
        // so both events will be triggered (that's 2 calls), which is why "jqLoadDone" is needed
        var jqLoadDone = false;

        // Attach handlers for all browsers
        jqScriptTag.onload = jqScriptTag.onreadystatechange = function () {
            if (!jqLoadDone && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                jqLoadDone = true;

                log("jQuery applied and ready");
                jQueryLoaded();

                // Handle memory leak in IE
                jqScriptTag.onload = jqScriptTag.onreadystatechange = null;
                if (head && jqScriptTag.parentNode) {
                    head.removeChild(jqScriptTag);
                }
            }
        };


        // add script to page's head tag.
        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
        // This arises when a base node is used (#2709 and #4378).
        head.insertBefore(jqScriptTag, head.firstChild);

    } else {
        jQuery = window.jQuery;
        containedHawkSearchInitializer(jQuery);
    }

    function jQueryLoaded() {
        log('Finalizing JS Component Binding');
        jQuery = window.jQuery.noConflict(true);

        log('Local jQuery version: ' + jQuery.fn.jquery);

        if (window.jQuery)
            log('Global jQuery version: ' + window.jQuery.fn.jquery);
        else {
            log('No Global jQuery present. Adding current jQuery');
            window.jQuery = jQuery;
        }
        containedHawkSearchInitializer(jQuery);
    };

    //Since we're loading jQuery dynamically and are using callbacks, we need to store all of our
    //plugins inside a single function that passes $ aliased from our version of jQuery.
    function containedHawkSearchInitializer($) {

        // BEGIN Namespaced HawkSearch block.

        (function (HawkSearch, $) {

            HawkSearch.loadingtpl = '<img src="//manage.hawksearch.com/sites/shared/images/global/load.gif" style="margin:0 5px;vertical-align:middle;" />';

            HawkSearch.loadtimer = null;

            HawkSearch.scroll = false;

            HawkSearch.processing = false;

        

            HawkSearch.disableAjax = function () {

                return false;

            };

        

            HawkSearch.getHash = function () {

                var hashSplit = window.location.toString().split("#");

                if (hashSplit.length > 1) return hashSplit[1];

                return window.location.search.substring(1);

            };

        

            HawkSearch.lilBro = new HawkSearch.LilBro({

                server: HawkSearch.getHawkUrl(),

                server_ssl: HawkSearch.getHawkUrl() + ':443',

                watch_focus: false,

                watch_click: false,

                event_base: HawkSearch.EventBase,

                qs: encodeURIComponent(HawkSearch.getHash()),

                jQuery: $

            });

        

            HawkSearch.jQuery = $;

        

            HawkSearch.normalizeHeights = function () {

                var container = $("#hawkitemlist");

                var topcontainer = $("#hawkbannertop");

                var targetElement = container.find(".itemWrapper");

        

                // use imagesLoaded() plugin to detect if images are fully loaded

                // http://imagesloaded.desandro.com/

                var imgLoad = imagesLoaded(container);

        

                // Triggered after all images have been either loaded or confirmed broken.

                imgLoad.on("always", function (instance) {

                    log("Heights Normalize; No broken images");

                    // match heights of specified elements

                    container.find(".itemWrapper .itemImage").matchHeights();

                    container.find(".itemWrapper .itemTitle").matchHeights();

                    topcontainer.find(".itemWrapper .itemImage").matchHeights();

                    topcontainer.find(".itemWrapper .itemTitle").matchHeights();

                    targetElement.matchHeights({

                        extension: 3

                    });

                });

        

                // Triggered after all images have been loaded with at least one broken image.

                imgLoad.on('fail', function (instance) {

                    log("Heights Normalize; Broken image(s)");

                });

        

                // Triggered after each image has been loaded.

                imgLoad.on("progress", function (instance, image) {

                    var result = image.isLoaded ? 'loaded' : 'broken';

                    // check if image is broken

                    if (result === "broken") {

                        // in debug mode log broken image src

                        log('Image Broken: ' + image.img.src);

                        // change broken image src with spacer.gif and apply broken image class

                        image.img.src = "/sites/shared/images/spacer.gif";

                        image.img.className = "itemImage hawk-brokenImage";

                    };

                });

            };

        

            HawkSearch.regTracking = function () {

                log("Register Tracking");

        

                $(".hawk-bannerLink,.hawk-banner").each(function () {

                    var bannerId = $(this).data("bannerid");

                    HawkSearch.Tracking.writeBannerImpression(bannerId);

                });

            };

        

            HawkSearch.regSmartBug = function () {

                $('#aBug').click(function () {

                    if ($('#divSmartBug > ul').children().length > 0) {

                        $('#divSmartBugEye').hide();

                        $('#divSmartBugPinning').hide();

                        $('#divSmartBug').toggle('fast');

                        return false;

                    }

                    return true;

                });

        

                $('#spanSmartBug').click(function () {

                    $('#divSmartBug').hide();

                    $('#divSmartBugEye').hide();

                    $('#divSmartBugPinning').hide();

                    var data = $('#hawkHdnUserProfileJson').val();

                    var jsonPretty = JSON.stringify(JSON.parse(data), null, 2);

                    $('#userProfileJson').text(jsonPretty);

                    $("#divSmartBugUserProfile").toggle('fast');

                });

        

                $("#divSmartBugUserProfile").click(function () {

                    $(this).toggle('fast');

                });

        

                $('#aEye').click(function () {

                    if ($('#divSmartBugEye > ul').children().length > 0) {

                        $('#divSmartBug').hide();

                        $('#divSmartBugPinning').hide();

                        $('#divSmartBugEye').toggle('fast');

                        return false;

                    }

                    return true;

                });

        

                $('#aRefresh').off("click");

                $('#aRefresh').click(function () {

                    HawkSearch.resetSearch();

                });

        

                $("#divSmartBugEye .hawk-mutilbucket input[type=checkbox]").click(function (e) {

                    e.stopPropagation();

                });

        

                $("#divSmartBugEye a.hawk-mutilbucket").click(function (e) {

                    e.preventDefault();

                    var checkBox = $(this).find("input[type=checkbox]");

                    checkBox.prop("checked", !checkBox.prop("checked"));

                });

        

        

                $("#hawkBtnApplayVisitorTarget").click(function () {

                    var url = $("#hawkHdnBucketUrl").val();

                    var selectedBuckets = [];

        

                    $("#divSmartBugEye .hawk-mutilbucket input[type=checkbox]:checked").each(function () {

                        selectedBuckets.push($(this).data("hawkbucketid"));

                    });

        

                    if ($("#divSmartBugEye .hawk-mutilbucket input[type=checkbox]:checked").length === 0) {

                        selectedBuckets.push(0);

                    }

        

                    url = url.replace(/__bucket_ids__/i, selectedBuckets.join());

                    window.location.href = url;

                });

        

                if (typeof HawkPreviewDateTime !== 'undefined') {

                    HawkPreviewDateTime.registerPreviewDatetime();

                }

            }

        

            HawkSearch.regFacets = function () {

                log("Register Facets");

        

                // normalize heights across items in results list

                HawkSearch.normalizeHeights();

        

                // initializes slider configuration for use with price range

                $("div.hawk-slideRange").each(function () {

                    var container = $(this),

                        options = container.data(),

                        minRange = options.minRange,

                        maxRange = options.maxRange,

                        stepSlide = options.stepRange,

                        minValueDisplay = container.siblings(".slider-min-value"),

                        maxValueDisplay = container.siblings(".slider-max-value");

        

                    var values = $(this).parent().find("input.hawk-sliderRangeInput").val().split(','),

                        minValue = parseInt(values[0]),

                        maxValue = parseInt(values[1]);

        

                    var numericFrom = $($(this).parent().find(".numeric-from"));

                    var numericTo = $($(this).parent().find(".numeric-to"));

        

                    // set up slider range functionality

                    container.slider({

                        range: true,

                        min: minRange,

                        max: maxRange,

                        step: stepSlide,

                        values: [minValue, maxValue],

                        slide: function (event, ui) {

                            var start = ui.values[0];

                            var end = ui.values[1];

                            var type = $(this).parent().find("input:last").val().toLowerCase();

                            if (type == 'currency') {

                                start = HawkSearch.formatCurrency(start);

                                end = HawkSearch.formatCurrency(end);

                            }

        

                            if (numericTo.size() > 0) {

                                numericFrom.val(start);

                                numericTo.val(end);

                            }

        

                            minValueDisplay.text(start);

                            maxValueDisplay.text(end);

        

                            $(this).parent().find("input.hawk-sliderRangeInput").val(ui.values[0] + ',' + ui.values[1]);

                        },

                        stop: function (event, ui) {

                            // clear the current page

                            $("#hdnhawkpg").val("");

        

                            HawkSearch.refreshUrl();

                        }

                    });

        

                    var hawkSlideHandles = container.children().filter("a");

                    hawkSlideHandles.eq(0).addClass("first-handle");

                    hawkSlideHandles.eq(1).addClass("second-handle");

                });

        

                $("div.hawk-sliderNumeric").each(function () {

                    $(this).find(".hawk-numericInput").each(function (e) {

                        $(this).numeric();

                        $(this).blur(function () {

                            var val = parseFloat($(this).val().replace(/[^0-9\.]+/g, ""));

                            var type = $(this).data("type");

                            if (type == 'currency') {

                                $(this).val(HawkSearch.formatCurrency(val));

                            }

                        });

        

                        $(this).on("focus", function () {

                            $(this).attr("data-orgval", $(this).val().replace(/[^0-9\.]+/g, ""));

                        });

        

                        $(this).on("change", function () {

                            var val = parseFloat($(this).val().replace(/[^0-9\.]+/g, ""));

                            var minValue = parseFloat($(this).data("min"));

                            var maxValue = parseFloat($(this).data("max"));

                            var isInvalid = false;

        

                            var numericFrom = $($(this).parent().find(".numeric-from"));

                            var numericTo = $($(this).parent().find(".numeric-to"));

        

                            var fromVal = parseFloat(numericFrom.val().replace(/[^0-9\.]+/g, ""));

                            var toVal = parseFloat(numericTo.val().replace(/[^0-9\.]+/g, ""));

        

                            var orgval = parseFloat($(this).data("orgval"));

                            val = val || orgval;

        

                            if (isNaN(fromVal) || isNaN(toVal)) {

                                isInvalid = true;

                            }

        

                            if (val < minValue || val > maxValue || fromVal > toVal) {

                                val = orgval;

                                isInvalid = true;

                            }

        

                            var type = $(this).data("type");

                            if (type == 'currency') {

                                $(this).val(HawkSearch.formatCurrency(val));

                            } else {

                                $(this).val(val);

                            }

                            if (isInvalid) {

                                return;

                            }

        

                            $(this).parents(".hawk-slideFacet").find("div.hawk-slideRange").slider('values', 0, parseFloat(fromVal));

                            $(this).parents(".hawk-slideFacet").find("div.hawk-slideRange").slider('values', 1, parseFloat(toVal));

                            $(this).parents(".hawk-slideFacet").find("input.hawk-sliderRangeInput").val(fromVal + ',' + toVal);

        

                            HawkSearch.refreshUrl();

                        });

                    })

        

        

                })

        

                // configures truncated list functionality

                $(".hawk-navTruncateList").each(function () {

                    var cont = $(this);

                    var listItems = cont.children("li");

                    var options = cont.data().options;

        

                    var moreItems = listItems.filter(function (index) {

                        return index >= options.cutoff;

                    });

        

                    if (moreItems.size() == 0) {

                        return;

                    }

                    // only hide if not already expanded

                    if (!window["hawkexpfacet_" + cont.attr("id")])

                        moreItems.hide();

        

                    var moreLess = $("<li class='hawk-navMore'><span>" + options.moreText + "</span></li>");

                    cont.append(moreLess);

                    moreLess.children("span").click(function (event) {

                        var moreTrigger = $(this);

                        if ($(this).hasClass("hawk-navMoreActive")) {

                            moreItems.hide();

                            moreTrigger.removeClass("hawk-navMoreActive").closest("span").text(options.moreText);

                            window["hawkexpfacet_" + cont.attr("id")] = null;

                        } else {

                            moreItems.show();

                            moreTrigger.addClass("hawk-navMoreActive").closest("span").text(options.lessText);

                            window["hawkexpfacet_" + cont.attr("id")] = true;

                        };

                    });

        

                    if (window["hawkexpfacet_" + cont.attr("id")]) cont.find(".hawk-navMore span").click();

        

                });

        

        

                $(".hawkRailNav").delegate(".hawk-navGroup li > a > span.hawk-negativeIcon", "click", function (event) {

                    event.preventDefault();

                    event._hawkSettingNegative = true;

        

                    var facetCont = $(this).closest("li");

        

                    facetCont.removeClass("hawkFacet-active");

        

                    if (facetCont.hasClass("hawkFacet-negative")) {

                        facetCont.removeClass("hawkFacet-negative");

                    } else {

                        facetCont.addClass("hawkFacet-negative");

                    }

                });

        

        

                // this handles the mouse hovers and click states for the hawk nav

                $(".hawkRailNav").delegate(".hawk-navGroup li > a", "mouseover mouseout click", function (event) {

        

                    var facetCont = $(this).parent();

        

                    if (event.type == "mouseover") {

                        facetCont.addClass("hawkFacet-hover");

                    } else if (event.type == "mouseout") {

                        facetCont.removeClass("hawkFacet-hover");

                    } else if (event.type == "click") {

                        event.preventDefault();

                        //if (facetCont.hasClass("hawkFacet-indetermined")) {

                        //    facetCont.removeClass("hawkFacet-indetermined")

                        //    facetCont.addClass("hawkFacet-active");

                        //    facetCont.find("> ul > li ").removeClass("hawkFacet-active");

                        //} else {

                        //    facetCont.toggleClass("hawkFacet-active");

                        //}

        

                        $(facetCont).find(".hawkFacet-active").removeClass("hawkFacet-active");

                        $(facetCont).parentsUntil(".hawk-navGroupContent", "ul").each(function () {

                            var parentUl = $(this);

                            var activeCount = parentUl.find("li.hawkFacet-active").size();

                            var allCount = parentUl.find("li").size();

                            if (allCount > 0) {

                                var closestLi = $(this).closest("li");

                                closestLi.removeClass("hawkFacet-active");

                                closestLi.addClass("hawkFacet-indetermined");

                            }

                        });

        

                        if (event._hawkSettingNegative) {

                            facetCont.removeClass("hawkFacet-indetermined")

                            return;

                        } else {

                            facetCont.removeClass("hawkFacet-negative");

                        }

        

                        if (facetCont.hasClass("hawkFacet-indetermined")) {

                            facetCont.removeClass("hawkFacet-indetermined")

                            facetCont.addClass("hawkFacet-active");

                            facetCont.find("> ul > li ").removeClass("hawkFacet-active");

                        } else {

                            facetCont.toggleClass("hawkFacet-active");

                        }

                    }

                });

        

                // initializes filter quicksearch

                $('.hawk-quickSearch input').each(function () {

                    var searchInput = $(this);

                    searchInput.filterThatList({

                        list: searchInput.parent().next()

                    });

                });

        

                // handles collapsible display on larger screens

                $(".hawk-guidedNavWrapper .hawk-collapsible .hawk-groupHeading").on("click", function () {

                    var facetGroup = $(this).closest(".hawk-navGroup");

                    var fgHeightBefore = facetGroup.outerHeight();

                    facetGroup.toggleClass("hawk-collapsed");

                    var fgHeightAfter = facetGroup.outerHeight();

                    if ($(".hawk-facetScollingContainer").length && $(".hawk-facetScollingContainer").position().top > 0) {

                        var menuHeight = $(".hawk-facetScollingContainer").outerHeight();

                        var maxOffset = $(".footer").offset().top;

                        var menuOffset = $(".hawk-facetScollingContainer").offset().top;

                        if (menuHeight + menuOffset > maxOffset) {

                            var offset = $(".hawk-facetScollingContainer").position().top;

                            offset = offset - (menuHeight + menuOffset - maxOffset) - 10;

                            $(".hawk-facetScollingContainer").css("top", offset + "px");

                        }

        

                        HawkSearch.SetFacetScrollPosition();

                    }

        

                    var fieldName = facetGroup.attr("data-field");

                    var collapsed = false;

                    if (facetGroup.hasClass("hawk-collapsed")) {

                        collapsed = true;

                    }

                    $.cookie(fieldName, collapsed, { expires: 365 });

                });

        

                $(".hawk-guidedNavWrapper .hawk-collapsible").each(function () {

                    var fieldName = $(this).attr("data-field");

                    var visible = $.cookie(fieldName);

                    if (visible == 'true') {

                        $(this).addClass("hawk-collapsed");

                    } else if (visible == 'false') {

                        $(this).removeClass("hawk-collapsed");

                    }

                });

        

                // bind click event to filter heading to hide/show for small devices

                $(".hawk-railNavHeading").on("click", function () {

                    var railNavHeading = $(this);

                    var hawkNavFilters = railNavHeading.next(".hawkRailNav");

                    railNavHeading.toggleClass("hawk-railNavHeadingActive");

                    hawkNavFilters.toggleClass("hawk-notCollapsed");

                });

        

                // bind click event to filter group heading to hide/show for small devices

                $(".hawk-guidedNavWrapper .hawk-navGroup .hawk-groupHeading").on("click", function () {

                    var facetGroup = $(this).closest(".hawk-navGroup");

                    facetGroup.toggleClass("hawk-notCollapsed");

                });

        

                HawkSearch.regSmartBug();

        

                $("table.compTbl div.itemWrapper .itemPrice").matchHeights();

        

                $(".hawk-nestedfacet .hawkFacet-active").each(function () {

                    $(this).children("ul").removeClass("collapse").addClass("in");

                    $(this).children(".hawk-collapseState").removeClass("collapsed");

        

                    $(this).parentsUntil(".hawk-navGroup", ".hawk-facetgroup").addClass("in");

                    $(this).parentsUntil(".hawk-navGroup", "li").each(function () {

                        $(this).children(".hawk-collapseState").removeClass("collapsed");

                    });

                });

        

                $(".hawk-nestedfacet .hawkFacet-negative").each(function () {

                    $(this).parentsUntil(".hawk-navGroup", ".hawk-facetgroup").addClass("in");

                    $(this).parentsUntil(".hawk-navGroup", "li").each(function () {

                        $(this).children(".hawk-collapseState").removeClass("collapsed");

                    });

                });

        

        

                $(".hawk-nestedfacet ul >.hawkFacet-active, .hawk-nestedfacet ul >.hawkFacet-negative").each(function () {

                    var parents = $(this).parentsUntil(".hawk-navGroupContent", "ul").each(function () {

                        var parentUl = $(this);

                        var activeCount = parentUl.find("li.hawkFacet-active").size();

                        var allCount = parentUl.find("li").size();

                        if (allCount > 0) {

                            var closestLi = $(this).closest("li");

                            closestLi.removeClass("hawkFacet-active");

                            closestLi.addClass("hawkFacet-indetermined");

                        }

                    });

        

                });

            };

        

            HawkSearch.refreshUrl = function (event, forceReload) {

                $("#hdnhawkcompare").val(window['hawktocompare'].join(","));

        

                var qs = "";

                var prevName = "";

                var vals = "";

                var keyword = $("#hdnhawkkeyword").val();

                var prv = $("#hdnhawkprv").val();

        

                var lp = $("#hdnhawklp").val();

                var adv = $("#hdnhawkadv").val();

                var searchWithin = $("#searchWithin").val();

                var pg = $("#hdnhawkpg").val();

                var mpp = $("#hdnhawkmpp").val();

                var sort = $("#hdnhawksortby").val();

                var it = $("#hdnhawkit").val();

                var items = $("#hdnhawkcompare").val();

                var operator = $("#hdnhawkoperator").val();

                var expand = $("#hdnhawkexpand").val();

                var hawkb = $("#hdnhawkb").val();

                var defaultmpp = $("#hdnhawkdefaultmpp").val();

                var keywordfield = $("#hdnhawkkeywordfield").val();

                var previewDate = typeof smartbugDatetimepicker != 'undefined' ? smartbugDatetimepicker.hawkDate : null;

                var hawkflags = $('#hdnhawkflags').val();

                var aid = $("#hdnhawkaid").val();

                var hawkp = $("#hdnhawkp").val();

        

                if (keyword && keyword !== "") qs += (qs === "" ? "" : "&") + keywordfield + "=" + encodeURIComponent(keyword);

                if (prv && prv !== "") qs += (qs === "" ? "" : "&") + "prv=" + encodeURIComponent(prv);

                if (lp && lp !== "") qs += (qs === "" ? "" : "&") + "lp=" + encodeURIComponent(lp);

                if (adv && adv !== "") qs += (qs === "" ? "" : "&") + "adv=" + encodeURIComponent(adv);

                if (searchWithin && searchWithin !== "") qs += (qs === "" ? "" : "&") + "searchWithin=" + encodeURIComponent(searchWithin);

                if (sort && sort !== "") qs += (qs === "" ? "" : "&") + "sort=" + encodeURIComponent(sort);

                if (it && it !== "") qs += (qs === "" ? "" : "&") + "it=" + encodeURIComponent(it);

                if (items && items !== "") qs += (qs === "" ? "" : "&") + "items=" + encodeURIComponent(items);

                if (operator && operator !== "") qs += (qs === "" ? "" : "&") + "operator=" + encodeURIComponent(operator);

                if (expand && expand !== "") qs += (qs === "" ? "" : "&") + "expand=" + encodeURIComponent(expand);

                if (hawkb && hawkb !== "") qs += (qs === "" ? "" : "&") + "hawkb=" + encodeURIComponent(hawkb);

                if (previewDate) qs += (qs === "" ? "" : "&") + "HawkDate=" + previewDate;

                if (hawkflags && hawkflags !== "") qs += (qs === "" ? "" : "&") + "hawkflags=" + encodeURIComponent(hawkflags);

                if (aid && aid !== "") qs += (qs === "" ? "" : "&") + "hawkaid=" + encodeURIComponent(aid);

                if (hawkp && hawkp !== "") qs += (qs === "" ? "" : "&") + "hawkp=" + encodeURIComponent(hawkp);

        

                var selectedFacetList = new HawkSearch.Dictionary();

        

                $(".hawk-facetFilters li.hawkFacet-active > a").each(function () {

                    var options = $(this).data().options;

                    if (!selectedFacetList[options.name]) {

                        selectedFacetList.add(options.name, []);

                    }

                    var valueArr = selectedFacetList[options.name];

                    

                    var urlValue = options.value.replace(/,/g, "%c%");

                    valueArr.push(urlValue);

        

                    prevName = options.name;

                });

        

                //sort facet dictionary in order that were selected

                var facetOrder = [];

                for (var i = 0; i < selectedFacetList.keys().length; i++) {

                    var facetKey = selectedFacetList.keys()[i]

                    facetOrder.push({ "key": facetKey, "order": HawkSearch.getHashOrQueryVariableOrder(facetKey) });

                }

        

                facetOrder.sort(function (a, b) {

                    if (a.order > b.order) {

                        return 1;

                    } else if (a.order < b.order) {

                        return -1;

                    } else {

                        return 0;

                    }

                });

        

              //sorts values of each facet in order that are selected

                for (var i = 0; i < facetOrder.length; i++) {

                    var facetKey = facetOrder[i].key;

                    var currentFacetSelection = selectedFacetList[facetKey];

                    var currentValues = (HawkSearch.getHashOrQueryVariable(facetKey) + "").split(",");

                    

                    var sortedArray = [];

                    for (var j = currentFacetSelection.length - 1; j >= 0; j--) {

                        var currentFacetValue = currentFacetSelection[j]

                        currentFacetValue = encodeURIComponent(currentFacetValue.replace(/,/g, "%c%"))

                        if (currentValues.indexOf(currentFacetValue) < 0) {

                            //if new value adding at end of list

                            sortedArray.push(currentFacetValue);

                        } else {

                            //new value adding at front of list

                            sortedArray.unshift(currentFacetValue);

                        }

                    }

        

                    qs += (qs === "" ? "" : "&") + encodeURIComponent(facetKey) + "=" + sortedArray.join();

                }

        

                $(".hawk-facetFilters li.hawkFacet-negative > a").each(function () {

                    var options = $(this).data().options;

                    if (options.name !== prevName) {

                        if (vals !== "") qs += (qs === "" ? "" : "&") + encodeURIComponent(prevName) + '=' + vals;

                        vals = "";

                    }

                    vals += (vals === "" ? "" : ",") + encodeURIComponent("-" + options.value.replace(/,/g, "%c%"));

                    prevName = options.name;

                });

        

                if (prevName !== "" && vals !== "") qs += (qs === "" ? "" : "&") + encodeURIComponent(prevName) + '=' + vals;

        

                $(".hawk-sliderRangeInput").each(function () {

                    if ($(this).val() !== "") {

                        var values = $(this).val().split(",");

                        if (values.length === 2) {

                            var sliderRange = $(this).parent().find(".hawk-slideRange");

                            var min = sliderRange.data().minRange;

                            var max = sliderRange.data().maxRange;

        

                            if (parseFloat(values[0]) !== parseFloat(min) || parseFloat(values[1]) !== parseFloat(max)) {

                                qs += (qs === "" ? "" : "&") + encodeURIComponent($(this).attr("name")) + '=' + encodeURIComponent(values[0]) + ',' + encodeURIComponent(values[1]);

                            }

                        }

                    }

                });

        

                if (mpp && mpp !== "" && mpp !== defaultmpp) qs += (qs === "" ? "" : "&") + "mpp=" + encodeURIComponent(mpp);

                if (pg && pg !== "" && pg !== "1") qs += (qs === "" ? "" : "&") + "pg=" + encodeURIComponent(pg);

        

                // cancel refresh if hash is not changed

                if (window.location.hash === "#" + qs) {

                    return;

                }

        

                if (HawkSearch.disableAjax() || forceReload) {

                    var url = window.location.toString();

                    if (url.indexOf("?") > -1) url = url.substring(0, url.indexOf("?"));

                    if (url.indexOf("#") > -1) url = url.substring(0, url.indexOf("#"));

                    window.location = url + '?' + qs;

                } else {

                    if (window.location.hash !== "" || qs !== "") {

                        var scroll = $(document).scrollTop();

        

                        window.history.pushState({}, {}, "?" + qs);

                        HawkSearch.refreshResults();

        

                        if (qs === "") {

                            $(document).scrollTop(scroll);

                        }

                    }

                    else if (qs === "") {

                        window.history.pushState({}, {}, window.location.pathname);

                        HawkSearch.refreshResults();

                    }

        

                }

        

            };

        

            HawkSearch.resetSearch = function () {

                $("#hdnhawkpg").val(1);

                if (window.location.hash !== "") {

                    window.location.hash += "&";

                }

                HawkSearch.clearAllFacets();

            }

        

            HawkSearch.IsExplainPopupOpen = false;

        
            HawkSearch.viewRules = function(url, id){
                window.parent.location.href = url + "/settings/ranking/rulesreport.aspx?id=" + id;
            }


            HawkSearch.getPinFunctionUrl = function (f, itemId) {

                var keywordField = $('#hdnhawkkeywordfield').val();

                var keyword = HawkSearch.getHashOrQueryVariable(keywordField);

                var lpurl = HawkSearch.getCustomUrl();

                var lpId = $("#hdnhawklp").val();

                var ssfid = $("#hdnhawkssfid").val();
                
                var hawkbuckets = $("#hdnhawkbuckets").val();

                var previewDate = typeof smartbugDatetimepicker != 'undefined' ? smartbugDatetimepicker.hawkDate : '';

                return HawkSearch.BaseUrl + "/?fn=ajax&f=" + f + "&itemId=" + encodeURIComponent(itemId) + "&" + keywordField + "=" + keyword + "&lp=" + encodeURIComponent(lpId) + "&lpurl=" + encodeURIComponent(lpurl) + "&hawkb=" + HawkSearch.getHashOrQueryVariable("hawkb") + "&hawkaid=" + HawkSearch.getHashOrQueryVariable("hawkaid") + "&hawkp=" + HawkSearch.getHashOrQueryVariable("hawkp") + "&HawkDate=" + previewDate + "&ssfid=" + encodeURIComponent(ssfid) +"&hawkbuckets=" + hawkbuckets;

            }

        

            HawkSearch.addToTop = function (el, itemId) {

        

                var url = HawkSearch.getPinFunctionUrl("AddItemToTop", itemId);

                var currentEl = el;

                $.ajax({

                    type: "GET",

                    async: true,

                    context: el,

                    contentType: "application/json; charset=utf-8",

                    url: url,

                    dataType: "jsonp",

                    success: function () {

                        log("Added item to top");

                        var parentContainer = $(this).parents(".grid_3");

                        parentContainer.addClass("hawk-itemPinned");

                        parentContainer.find(".preview-info").append("<span class='hawkIcon-itemPinned'></span>");

                        $(".itemWrapper.hawk-itemWrapper").removeClass("hawk-itemPinned preview-info");

        

                        $(this).parents(".popover").popover('hide');

                    },

                    error: function (e) {

                        log("ERROR: Add item to top " + e);

                    }

                });

            }

        

            HawkSearch.unpinItem = function (el, itemId) {

                var keywordField = $('#hdnhawkkeywordfield').val();

                var keyword = HawkSearch.getHashOrQueryVariable(keywordField);

                var lpurl = HawkSearch.getCustomUrl();

                var lpId = $("#hdnhawklp").val();

                var url = HawkSearch.getPinFunctionUrl("UnpinItem", itemId);

        

                $.ajax({

                    type: "GET",

                    async: true,

                    contentType: "application/json; charset=utf-8",

                    url: url,

                    context: el,

                    dataType: "jsonp",

                    success: function () {

                        log("Unpin item");

                        var parentContainer = $(this).parents(".grid_3");

                        parentContainer.removeClass("hawk-itemPinned");

                        parentContainer.find(".hawkIcon-itemPinned").remove();

                        $(this).parents(".popover").popover('hide');

                    },

                    error: function (e) {

                        log("ERROR: Unpin item " + e);

                    }

                });

            };

        

            HawkSearch.updatePinOrder = function (itemOrder) {

                var url = HawkSearch.getPinFunctionUrl("UpdateItemPinOrder", 0);

                url += "&itemList=" + encodeURIComponent(itemOrder);

        

                $.ajax({

                    type: "GET",

                    async: true,

                    contentType: "application/json; charset=utf-8",

                    url: url,

                    dataType: "jsonp",

                    success: function () {

                        log("UpdateItemPinOrder");

                    },

                    error: function (e) {

                        log("ERROR: UpdateItemPinOrder " + e);

                    }

                });

            }

        

            HawkSearch.explain = function (docid) {

                if (HawkSearch.IsExplainPopupOpen) {

                    return;

                }

        

                HawkSearch.IsExplainPopupOpen = true;

        

                var keyword = $("#hdnhawkkeyword").val();

                var keywordField = $("#hdnhawkkeywordfield").val();

                var keywordfromQuery = HawkSearch.getHashOrQueryVariable(keywordField);

                var hash = window.location.search.substring(1);

                if (keyword.toLowerCase() != decodeURIComponent(keywordfromQuery.toLowerCase().replace(/\+/g, " "))) {

                    hash = hash.replace(keywordField + '=' + keywordfromQuery, keywordField + '=' + encodeURIComponent(keyword));

                }

                if (hash === "" || (window.location.search.substring(1) !== "" && window.location.href.indexOf("#") > -1)) hash = HawkSearch.getHash();

        

                var lpurl = HawkSearch.getCustomUrl();

                var hawkcustom = $("#hdnhawkcustom").val();

                var full = HawkSearch.BaseUrl + "/?" + hash + "&ajax=1&json=1&docid=" + encodeURIComponent(docid) + (lpurl != '' ? "&lpurl=" + encodeURIComponent(lpurl) : "") + (hawkcustom != '' ? "&hawkcustom=" + encodeURIComponent(hawkcustom) : "");

                full += "&hawkvisitorid=" + HawkSearch.lilBro.event.getVisitorId()

        

                $.ajax({ "type": "GET", "data": "", "async": "false", "contentType": "application/json; charset=utf-8", "url": full, "dataType": "jsonp", "success": HawkSearch.showAjaxPopup });

            };

        

            HawkSearch.loadMoreLikeThis = function (event, arg) {

                var argsArr = arg.split('|');

                var pk = argsArr[0];

                var trackingId = HawkSearch.lilBro.getTrackingId();

                if (argsArr.length >= 3) {

                    trackingId = argsArr[2];

                }

                HawkSearch.Tracking.writeClick(event, 0, true, pk, trackingId);

        

                var url = HawkSearch.BaseUrl + "/default.aspx?fn=ajax&f=MoreLikeThis&args=" + arg;

        

                $.ajax({

                    "type": "GET",

                    "data": "",

                    "async": "false",

                    "contentType": "application/json; charset=utf-8",

                    "url": url,

                    "dataType": "jsonp",

                    "success": function (data) {

                        HawkSearch.bootbox.dialog({

                            title: "More Like This",

                            message: data.Html,

                            buttons: {

                                main: {

                                    label: "Close"

                                }

                            }

                        });

                    }

                });

            };

        

            HawkSearch.HawkSubmit = (function (e) {

                var field = $(e).find('input[name=' + $('#hdnhawkkeywordfield').val() + ']');

                var keywords = $(field).val();

                var id = $(field).attr('id');

                var suggester = HawkSearch.SuggesterGlobal.getSuggester('#' + id);

                if (!(field.length == 0 && $('#hdnhawkkeyword').length == 0)) {

                    if ((keywords == suggester.settings.defaultKeyword[id]) || (keywords == $('#hdnhawkkeyword').val())) {

                        return false;

                    }

                }

                return true;

            });

        

            HawkSearch.showAjaxPopup = function (json) {

                var html = json.html;

                var objs = $(html);

        

                var obj = objs.find("#hawkexplain");

                if (obj != null && obj.length > 0) $("#divAjaxPopupContent").html(obj.html());

                HawkSearch.bootbox.dialog({

                    title: "Item Information",

                    message: obj.html(),

                    className: "wideModal",

                    buttons: {

                        main: {

                            label: "Close"

                        }

                    }

                });

        

                HawkSearch.IsExplainPopupOpen = false;

            };

        

            HawkSearch.hideBlockUI = function () {

                if (HawkSearch.processing || HawkSearch.scroll) {

                    return;

                }

                $.unblockUI({ "fadeOut": 0 });

            };

        

            HawkSearch.showBlockUI = function () {

                $.blockUI({ "message": HawkSearch.loadingtpl, "fadeIn": 0, overlayCSS: { backgroundColor: '#fff', opacity: 0.5, cursor: 'wait' }, "css": { "borderWidth": "0px", top: ($(window).height() - 100) / 2 + 'px', left: ($(window).width()) / 2 + 'px', width: '0px' } });

            };

        

            HawkSearch.showRecsBlockUI = function () {

                $(".hawk-recommendation").css("height", "100px");

                $(".hawk-recommendation").block({ "message": HawkSearch.loadingtpl, "fadeIn": 0, overlayCSS: { backgroundColor: '#fff', opacity: 0.5, cursor: 'wait' }, "css": { "borderWidth": "0px", top: ($(window).height() - 100) / 2 + 'px', left: ($(window).width()) / 2 + 'px', width: '0px' } });

            };

        

        

            HawkSearch.hideRecsBlockUI = function () {

                $(".hawk-recommendation").css("height", "auto");

                $(".hawk-recommendation").unblock({ "fadeOut": 0 });

            };

        

        

            HawkSearch.refreshResults = function (backbutton) {

        

                log('RefreshResults');

        

                if ($("#hawkitemlist").length > 0) {

        

                    var lpurl = HawkSearch.getCustomUrl();

                    var hash = HawkSearch.getHash();

                    var hawkcustom = $("#hdnhawkcustom").val();

                    var queryGuid = $("#hdnhawkquery").val();

                    var full = HawkSearch.BaseUrl + "/?" + (hash != '' ? hash + '&' : '') + "ajax=1&json=1" + (lpurl != '' ? "&lpurl=" + encodeURIComponent(lpurl) : "") + (hawkcustom != '' ? "&hawkcustom=" + encodeURIComponent(hawkcustom) : "");

                    full += '&hawkvisitorid=' + HawkSearch.lilBro.event.getVisitorId();

        

        

                    // notice we use global jQuery to be able to track global events for ajax calls

                    // used by miniprofiler and possibly other libraries

                    window.jQuery.ajax({

                        type: "GET",

                        data: "",

                        async: "true",

                        contentType: "application/json; charset=utf-8",

                        url: full,

                        dataType: "jsonp",

                        success: function (json) {

                            HawkSearch.processFacets(hash, json, queryGuid, backbutton);

                        }

                    });

                };

            };

        

            HawkSearch.getUrl = function () {

                var url = window.location.toString();

                if (url.indexOf("?") > -1) url = url.substring(0, url.indexOf("?"));

                if (url.indexOf("#") > -1) url = url.substring(0, url.indexOf("#"));

        

                return url;

            };

        

        

            HawkSearch.copyValue = function (objs, name) {

                var obj = objs.find(name);

                if (obj != null && obj.length > 0) $(name).html(obj.html());

            };

        

            HawkSearch.copyCustomBanners = function (objs) {

        

                $(objs).find(".hawk-bannerZone").each(function () {

                    var name = "#" + $(this).attr("id");

                    var obj = objs.find(name);

                    if (obj != null && obj.length > 0 && obj.html().trim() != "") {

                        if ($("#hdnhawkprv").val() == "1") {

                            $(obj).prepend('<span class="hawk-customBannerTitle">' + obj.attr("title") + '</span>')

                        }

                        $(name).html(obj.html());

                    }

                    else {

                        $(name).html("");

                    }

                })

            };

        

        

            HawkSearch.processFacets = function (hash, json, queryGuid, backbutton) {

                var html = json.html;

                var location = json.location;

                if (!location == '') {

                    window.location.replace(location);

                }

        

                // update the page contents

                var objs = $(html);

                var obj;

                HawkSearch.copyValue(objs, "#hawktitle");

                HawkSearch.copyValue(objs, "#hawkitemlist");

                HawkSearch.copyValue(objs, "#hawktoptext");

                HawkSearch.copyValue(objs, "#hawkfacets");

                HawkSearch.copyValue(objs, "#hawkbreadcrumb");

                HawkSearch.copyValue(objs, "#hawktoppager");

                HawkSearch.copyValue(objs, "#hawkbottompager");

                HawkSearch.copyValue(objs, "#hawkbannertop");

                HawkSearch.copyValue(objs, "#hawkbannerbottom");

                HawkSearch.copyValue(objs, "#hawkbannerlefttop");

                HawkSearch.copyValue(objs, "#hawkbannerleftbottom");

                HawkSearch.copyValue(objs, "#hawksmartbug");

                HawkSearch.copyValue(objs, "#hdnhawktrackingid");

                HawkSearch.copyValue(objs, "#hawktabs");

                HawkSearch.copyValue(objs, '#hawkflags');

                HawkSearch.copyValue(objs, '#hawkaid');

                HawkSearch.copyValue(objs, '#hawkp');

        

                HawkSearch.copyCustomBanners(objs);

        

                if (queryGuid !== undefined) {

                    $("#hdnhawkquery").val(queryGuid);

                }

        

                // related terms are loaded only first time

                if ($("#hawkrelated").html() == '') {

                    HawkSearch.copyValue(objs, "#hawkrelated");

                }

        

                obj = objs.find("#errormsg");

                if (obj != null && obj.length > 0) alert(obj.html());

        

                // register trackingre

                HawkSearch.regTracking();

                HawkSearch.Tracking.writeSearch();

        

                // register facets (sliders, etc)

                HawkSearch.regFacets();

        

                if ($.isFunction(HawkCompare.reload)) HawkCompare.reload();

        

                // clear the pager click and the loading timer & unblock the page

                HawkSearch.processing = false;

                clearTimeout(HawkSearch.loadtimer);

                HawkSearch.hideBlockUI();

                if (HawkSearch.GetRecentSearches !== undefined) {

                    HawkSearch.GetRecentSearches();

                }

                HawkSearch.BindPreviewInformation();

                HawkSearch.BindFacetTooltip();

                HawkSearch.BindBackToTop();

        

        

                if ($(window).scrollTop() > 0 && !backbutton) {

                    $('html,body').animate({ scrollTop: 0 }, 500, function () { HawkSearch.scroll = false; HawkSearch.hideBlockUI(); });

                } else {

                    HawkSearch.scroll = false; HawkSearch.hideBlockUI();

                }

        

            };

        

            HawkSearch.clearAllFacets = function () {

                var keyword = $("#hdnhawkkeyword").val();

                var prv = $("#hdnhawkprv").val();

                var lp = $("#hdnhawklp").val();

                var adv = $("#hdnhawkadv").val();

                var mpp = $("#hdnhawkmpp").val();

                var sort = $("#hdnhawksortby").val();

                var it = $("#hdnhawkit").val();

                var items = $("#hdnhawkcompare").val();

                var operator = $("#hdnhawkoperator").val();

                var expand = $("#hdnhawkexpand").val();

                var hawkb = $("#hdnhawkb").val();

                var defaultmpp = $("#hdnhawkdefaultmpp").val();

                var keywordfield = $("#hdnhawkkeywordfield").val();

                var hawkflags = $('#hdnhawkflags').val();

                var qs = '';

                var aid = $("#hdnhawkaid").val();

        

                if (keyword && keyword !== "") qs += (qs === "" ? "" : "&") + keywordfield + "=" + encodeURIComponent(keyword);

                if (prv && prv !== "") qs += (qs === "" ? "" : "&") + "prv=" + encodeURIComponent(prv);

                if (lp && lp !== "") qs += (qs === "" ? "" : "&") + "lp=" + encodeURIComponent(lp);

                if (adv && adv !== "") qs += (qs === "" ? "" : "&") + "adv=" + encodeURIComponent(adv);

                if (mpp && mpp !== "" && mpp !== defaultmpp) qs += (qs === "" ? "" : "&") + "mpp=" + encodeURIComponent(mpp);

                if (sort && sort !== "") qs += (qs === "" ? "" : "&") + "sort=" + encodeURIComponent(sort);

                if (it && it !== "") qs += (qs === "" ? "" : "&") + "it=" + encodeURIComponent(it);

                if (items && items !== "") qs += (qs === "" ? "" : "&") + "items=" + encodeURIComponent(items);

                if (operator && operator !== "") qs += (qs === "" ? "" : "&") + "operator=" + encodeURIComponent(operator);

                if (expand && expand !== "") qs += (qs === "" ? "" : "&") + "expand=" + encodeURIComponent(expand);

                if (hawkb && hawkb !== "") qs += (qs === "" ? "" : "&") + "hawkb=" + encodeURIComponent(hawkb);

                if (hawkflags && hawkflags !== "") qs += (qs === "" ? "" : "&") + "hawkflags=" + encodeURIComponent(hawkflags);

                if (aid && aid !== "") qs += (qs === "" ? "" : "&") + "hawkaid=" + encodeURIComponent(aid);

        

                if (HawkSearch.disableAjax()) {

                    var url = window.location.toString();

                    if (url.indexOf("?") > -1) url = url.substring(0, url.indexOf("?"));

                    if (url.indexOf("#") > -1) url = url.substring(0, url.indexOf("#"));

                    window.location = url + '?' + qs;

                } else {

                    if (qs) {

                        window.history.pushState({}, {}, "?" + qs);

                        HawkSearch.refreshResults();

                    } else {

                        window.history.pushState({}, {}, window.location.pathname);

                        HawkSearch.refreshResults();

                    }

        

                }

            };

        

            HawkSearch.getHashOrQueryVariable = function (variable) {

                var query = HawkSearch.getHash();

                var vars = query.split("&");

                for (var i = 0; i < vars.length; i++) {

                    var pair = vars[i].split("=");

                    if (pair[0].toLowerCase() == variable.toLowerCase()) {

                        return pair[1];

                    }

                }

                return HawkSearch.getQueryVariable(window.location.search.substring(1), variable);

            };

        

            HawkSearch.getHashOrQueryVariableOrder = function (variable) {

                var query = HawkSearch.getHash();

        

                var vars = query.split("&");

        

                for (var i = 0; i < vars.length; i++) {

                    var pair = vars[i].split("=");

                    if (pair[0].toLowerCase() == variable.toLowerCase()) {

                        return i;

                    }

                }

                //since there is no variable return big int number

                return 100000;

            }

        

            HawkSearch.getHashOrQueryVariableOrder = function (variable) {

                var query = HawkSearch.getHash();

        

                var vars = query.split("&");

        

                for (var i = 0; i < vars.length; i++) {

                    var pair = vars[i].split("=");

                    if (pair[0].toLowerCase() == variable.toLowerCase()) {

                        return i;

                    }

                }

                //since there is no variable return big int number

                return 100000;

            }

        

            HawkSearch.getQueryVariable = function (url, variable) {

                if (variable === undefined || variable === null) {

                    return "";

                }

        

                var query = url;

                var vars = query.split("&");

                for (var i = 0; i < vars.length; i++) {

                    var pair = vars[i].split("=");

                    if (pair[0].toLowerCase() == variable.toLowerCase()) {

                        return pair[1];

                    }

                }

                return "";

            };

        

            HawkSearch.getRecommenderUrl = function () {

                if (HawkSearch.RecommenderUrl === undefined || HawkSearch.RecommenderUrl === "") {

                    return null;

                }

                else {

                    return HawkSearch.RecommenderUrl;

                }

            }

        

            HawkSearch.link = function (event, id, i, pk, mlt) {

                if (event.currentTarget === undefined || event.currentTarget.href === undefined) {

                    return true;

                }

        

                if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2) {

                    HawkSearch.Tracking.writeClick(event, i, mlt, pk, id);

                }

                else if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2AndSql) {

                    HawkSearch.Tracking.writeClick(event, i, mlt, pk, id);

                    HawkSearch.Tracking.V1.link(event, id, i, pk, mlt);

                }

                else {

                    HawkSearch.Tracking.V1.link(event, id, i, pk, mlt);

                }

        

                return true;

            };

        

            HawkSearch.bannerLink = function (el, id) {

                if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2) {

                    HawkSearch.Tracking.writeBannerClick(el, id);

                }

                else if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2AndSql) {

                    HawkSearch.Tracking.writeBannerClick(el, id);

                    HawkSearch.Tracking.V1.bannerLink(el, id);

                }

                else {

                    HawkSearch.Tracking.V1.bannerLink(el, id);

                }

        

                return true;

            };

        

            HawkSearch.formatCurrency = function (num) {

                num = num.toString().replace(/\$|\,/g, '');

                if (isNaN(num))

                    num = "0";

                var sign = (num == (num = Math.abs(num)));

                num = Math.floor(num * 100 + 0.50000000001);

                var cents = num % 100;

                num = Math.floor(num / 100).toString();

                if (cents < 10)

                    cents = "0" + cents;

                for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)

                    num = num.substring(0, num.length - (4 * i + 3)) + ',' +

                        num.substring(num.length - (4 * i + 3));

                return (((sign) ? '' : '-') + '$' + num + '.' + cents);

            };

        

            HawkSearch.Mobile = {};

        

        

            HawkSearch.Mobile.closeWindow = function () {

                $('#mobileSearchOption').hide();

            }

        

        

            HawkSearch.Mobile.openWindow = function () {

                $('#mobileSearchOption').toggle();

                $('.mobile-searchInput').focus();

            }

        

        

            // HawkSearch Suggest initialize

            HawkSearch.suggestInit = function (suggesters) {

        

                suggesters.forEach(function (item, index) {

                    HawkSearch.SuggesterGlobal.items.push({

                        queryField: item.queryField,

                        settings: item.settings

                    });

        

                    $.fn.hawksearchSuggest = function (settings) {

                        settings = $.extend({

                            isAutoWidth: false,

                            isInstatSearch: false,

                            value: $('#hdnhawkkeyword').val()

                        }, settings);

        

                        return optionsHandler(this, settings);

        

                        // configures options and settings for hawk search suggest

        

                        function optionsHandler(suggestQueryField, settings) {

        

                            var suggestQueryFieldNode = $(suggestQueryField)[0];

        

                        

        

                            // for some reason, Firefox 1.0 doesn't allow us to set autocomplete to off

        

                            // this way, so you should manually set autocomplete="off" in the input tag

        

                            // if you can -- we'll try to set it here in case you forget

        

                            suggestQueryFieldNode.autocomplete = "off";

        

                            $(suggestQueryField).val(settings.value);

        

                            var suggesterInstanceSettings = HawkSearch.SuggesterGlobal.getSuggester('#' + suggestQueryFieldNode.id).settings;

        

                            suggesterInstanceSettings.defaultKeyword = settings.value;

        

                            $(suggestQueryField).on("keyup", keypressHandler);

        

                        

        

                            suggestQueryField.on("focus", function (e) {

        

                                suggesterInstanceSettings.focus = true;

        

                                this.value = '';

        

                            });

        

                        

        

                            if (settings.hiddenDivName) {

        

                                suggesterInstanceSettings.divName = settings.hiddenDivName;

        

                            } else {

        

                                suggesterInstanceSettings.divName = "querydiv";

        

                            };

        

                        

        

                            // This is the function that monitors the queryField, and calls the lookup functions when the queryField value changes.

        

                            function suggestLookup(suggestQueryField) {

        

                                var suggesterInstance = HawkSearch.SuggesterGlobal.getSuggester('#' + suggestQueryFieldNode.id);

        

                                var val = suggestQueryField.val();

        

                                if ((suggesterInstance.settings.lastVal != val || suggesterInstance.settings.lastVal != "") && suggesterInstance.settings.focus && HawkSearch.SuggesterGlobal.searching == false) {

        

                                    suggesterInstance.settings.lastVal = val;

        

                                    suggestDoRemoteQuery(suggesterInstance, escape(val));

        

                                }

        

                                return true;

        

                            };

        

                        

        

                            function suggestDoRemoteQuery(suggester, val) {

        

                                HawkSearch.SuggesterGlobal.searching = true;

        

                                //var suggesterInstance = HawkSearch.SuggesterGlobal.getSuggester('#' + suggestQueryFieldNode.id);

        

                        

        

                                var req = suggester.settings.lookupUrlPrefix;

        

                                var visitorId = HawkSearch.lilBro.event.getVisitorId();

        

                                var keywordField = $("#hdnhawkkeywordfield").val();

        

                                var kw = $(suggester.queryField).val();

        

                        

        

                                var hawkb = HawkSearch.GetQueryStringValue["hawkb"];

        

                                if (hawkb !== undefined) {

        

                                    req = req + '&hawkb=' + hawkb;

        

                                }

        

                        

        

                                jQuery.ajax({

        

                                    type: "GET",

        

                                    contentType: "application/json; charset=utf-8",

        

                                    url: req + '&q=' + escape(val) + '&hawkvisitorid=' + visitorId + '&' + keywordField + '=' + encodeURIComponent(kw) + "&ssfid=" + encodeURIComponent($("#hdnhawkssfid").val()),

        

                                    data: "",

        

                                    dataType: "jsonp",

        

                                    success: function (autoSuggestResult) {

        

                                        showQueryDiv(suggester, autoSuggestResult);

        

                                        HawkSearch.SuggesterGlobal.searching = false;

        

                                    },

        

                                    error: function () {

        

                                        try { hideSuggest(); } catch (error) { };

        

                                        HawkSearch.SuggesterGlobal.searching = false;

        

                                    }

        

                                });

        

                            };

        

                        

        

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

        

                                    suggester.settings.queryDiv = $("#" + divId);

        

                                }

        

                        

        

                                if (suggestQueryField && (suggestQueryField.offset().left != suggester.settings.storedOffset)) {

        

                                    // figure out where the top corner of the div should be, based on the

        

                                    // bottom left corner of the input field

        

                                    var x = suggestQueryField.offset().left,

        

                                        y = suggestQueryField.offset().top + suggestQueryField.outerHeight(),

        

                                        fieldID = suggestQueryField.attr("id");

        

                        

        

                                    suggester.settings.storedOffset = x;

        

                        

        

                                    // add some formatting to the div, if we haven't already

        

                                    if (!suggester.settings.divFormatted) {

        

                                        // set positioning and apply identifier class using ID of corresponding search field

        

                                        suggester.settings.queryDiv.removeAttr("style").css({

        

                                            "left": x,

        

                                            "top": y

        

                                        }).attr("class", "hawk-searchQuery hawk-searchQuery-" + fieldID);

        

                        

        

                                        // check to see if 'isAutoWidth' is enabled

        

                                        // if enabled apply width based on search field width

        

                                        if (settings && settings.isAutoWidth) {

        

                                            var queryWidth = suggestQueryField.outerWidth();

        

                                            var minValue = 250;

        

                                            if (queryWidth < minValue) {

        

                                                queryWidth = minValue;

        

                                            }

        

                                            suggester.settings.queryDiv.css("width", queryWidth);

        

                                        }

        

                        

        

                                        if (suggester.settings.isMobile) {

        

                                            $(suggester.settings.queryDiv).closest('input').focus();

        

                                            suggester.settings.queryDiv.removeAttr("style");

        

                                            suggester.settings.queryDiv.css("width", "100%");

        

                                            suggester.settings.queryDiv.css("height", "100%");

        

                                            suggester.settings.queryDiv.css("top", "120px");

        

                                            suggester.settings.queryDiv.css("background", 'rgba(30,30,30,0.8)');

        

                                            suggester.settings.queryDiv.css("color", "white");

        

                                            suggester.settings.queryDiv.attr("class", "hawk-searchQuery hawk-searchQuery-" + fieldID);

        

                                        }

        

                        

        

                                        //HawkSearch.SuggesterGlobal.divFormatted = true;

        

                                    };

        

                                };

        

                                return suggester.settings.queryDiv;

        

                            };

        

                        

        

                            function suggestIsAbove(suggester) {

        

                                if (suggester.settings.isAbove) {

        

                        

        

                                    var queryHeight = suggester.settings.queryDiv.outerHeight(true);

        

                                    var y = suggestQueryField.offset().top - queryHeight;

        

                        

        

                                    suggester.settings.queryDiv.css({

        

                                        "top": y

        

                                    });

        

                        

        

                                    if (!suggester.settings.queryDiv.hasClass("hawk-queryAbove")) {

        

                                        suggester.settings.queryDiv.addClass("hawk-queryAbove");

        

                                    }

        

                                };

        

                        

        

                            };

        

                        

        

                            // This is the key handler function, for when a user presses the up arrow, down arrow, tab key, or enter key from the input field.

        

                            function keypressHandler(e) {

        

                                var suggestDiv = getSuggestDiv(HawkSearch.SuggesterGlobal.getSuggester('#' + e.target.id)),

        

                                    divNode = suggestDiv[0];

        

                        

        

                                // don't do anything if the div is hidden

        

                                if (suggestDiv.is(":hidden")) {

        

                                    //return true;

        

                                }

        

                        

        

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

        

                        

        

                                if ((key != KEYUP) && (key != KEYDOWN) && (key != KEYENTER) && (key != KEYTAB)) {

        

                                    suggestLookup(suggestQueryField, settings, e);

        

                                    return true;

        

                                };

        

                        

        

                                // get the span that's currently selected, and perform an appropriate action

        

                                var selectedIndex = getSelectedItem(suggestDiv);

        

                                //var selSpan = HawkSearch.suggest.setSelectedSpan(div, selNum);

        

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

        

                                        };

        

                                    } else {

        

                                        hideSuggest(e);

        

                                        return true;

        

                                    };

        

                                } else if (key == KEYTAB) {

        

                                    if ((selectedIndex + 1) < suggestDiv.find(".hawk-sqItem").length) {

        

                                        e.cancelBubble = true;

        

                                        e.preventDefault();

        

                                        selectedItem = setSelectedItem(suggestDiv, selectedIndex + 1);

        

                                    } else {

        

                                        hideSuggest(e)

        

                                    };

        

                                } else {

        

                                    if (key == KEYUP) {

        

                                        selectedItem = setSelectedItem(suggestDiv, selectedIndex - 1);

        

                                    } else if (key == KEYDOWN) {

        

                                        selectedItem = setSelectedItem(suggestDiv, selectedIndex + 1);

        

                                    };

        

                                };

        

                        

        

                                return true;

        

                            };

        

                        

        

                            // displays query div and query results

        

                            function showQueryDiv(suggester, autoSuggestResult) {

        

                                var suggestDiv = getSuggestDiv(suggester),

        

                                    divNode = suggestDiv[0];

        

                        

        

                                if (autoSuggestResult === null ||

        

                                    (

        

                                        autoSuggestResult.Count === 0 &&

        

                                        autoSuggestResult.ContentCount === 0 &&

        

                                        (autoSuggestResult.Categories == null || autoSuggestResult.Categories.length === 0) &&

        

                                        (autoSuggestResult.Popular == null || autoSuggestResult.Popular.length === 0)

        

                                    )) {

        

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

        

                                if (autoSuggestResult.PopularHeading != "" && autoSuggestResult.PopularHeading != null) {

        

                                    popularHeading = autoSuggestResult.PopularHeading;

        

                                }

        

                        

        

                                showTerms(popular, popularHeading, HawkSearch.LilBro.Schema.AutoCompleteClick.AutoCompleteType.popular, suggester, trackingVersion);

        

                        

        

                                var categoryHeading = "Top Product Categories";

        

                                if (autoSuggestResult.CategoryHeading != "" && autoSuggestResult.CategoryHeading != null) {

        

                                    categoryHeading = autoSuggestResult.CategoryHeading;

        

                                }

        

                                showTerms(categories, categoryHeading, HawkSearch.LilBro.Schema.AutoCompleteClick.AutoCompleteType.category, suggester, trackingVersion);

        

                        

        

                                var productsTitle = (products.length == 1 ? "Top Product Match" : "Top " + products.length + " Product Matches");

        

                                if (autoSuggestResult.ProductHeading != "" && autoSuggestResult.ProductHeading != null) {

        

                                    productsTitle = autoSuggestResult.ProductHeading;

        

                                }

        

                        

        

                                showProducts(suggestDiv, products, productsTitle, trackingVersion);

        

                        

        

                                var contentTitle = (content.length == 1 ? "Top Content Match" : "Top " + content.length + " Content Matches");

        

                                if (autoSuggestResult.ContentHeading != "" && autoSuggestResult.ContentHeading != null) {

        

                                    contentTitle = autoSuggestResult.ContentHeading;

        

                                }

        

                        

        

                                showContent(suggestDiv, content, contentTitle, trackingVersion);

        

                        

        

                                if (categories.length > 0 || popular.length > 0 || products.length > 0 || content.length > 0) {

        

                                    showFooter(suggestDiv, autoSuggestResult, suggester);

        

                                    showSuggest(suggester, true);

        

                                }

        

                        

        

                                if (suggester.settings.isMobile) {

        

                                    $(suggester.settings.queryDiv).find(".hawk-sqHeader").each(function (item) {

        

                                        this.style.setProperty("color", "white", "important");

        

                                        this.style.setProperty("background", "#616161", "important");

        

                                        this.style.setProperty("text-transform", "uppercase", "important");

        

                                        this.style.setProperty("padding", "20px", "important");

        

                                    });

        

                        

        

                                    $(suggester.settings.queryDiv).find(".hawk-sqFooter").each(function (item) {

        

                                        this.style.setProperty("color", "white", "important");

        

                                        this.style.setProperty("background", "#616161", "important");

        

                                        this.style.setProperty("text-transform", "uppercase", "important");

        

                                        this.style.setProperty("padding", "20px", "important");

        

                                    });

        

                        

        

                                    $(suggester.settings.queryDiv).find(".hawk-searchQuery").each(function (item) {

        

                                        this.style.setProperty("background", "rgba(30,30,30,0.8)", "important");

        

                                        this.style.setProperty("color", "white", "important");

        

                                    });

        

                        

        

                                    $(suggester.settings.queryDiv).find(".hawk-sqItemName").each(function (item) {

        

                                        this.style.setProperty("color", "white", "important");

        

                                        this.style.setProperty("background", "transparent", "important");

        

                                    });

        

                        

        

                                    $(suggester.settings.queryDiv).find(".hawk-sqItem").each(function (item) {

        

                                        this.style.setProperty("color", "white", "important");

        

                                        this.style.setProperty("background", "transparent", "important");

        

                                        this.style.setProperty("text-transform", "uppercase", "important");

        

                                        this.style.setProperty("padding", "20px", "important");

        

                                        this.style.setProperty("border", "none", "important");

        

                        

        

                                        $(this).hover(function () {

        

                                            this.style.setProperty("background", "#a0a0a0", "important");

        

                                        }, function () {

        

                                            this.style.setProperty("background", "inherit", "important");

        

                                        });

        

                                    });

        

                        

        

                                    $(suggester.settings.queryDiv).find(".hawk-sqContent").each(function (item) {

        

                                        this.style.setProperty("color", "white", "important");

        

                                        this.style.setProperty("background", "rgba(30,30,30,0.8)", "important");

        

                                        this.style.setProperty("text-transform", "uppercase", "important");

        

                                        this.style.setProperty("padding", "20px", "important");

        

                                        this.style.setProperty("border", "none", "important");

        

                                    });

        

                                }

        

                            };

        

                        

        

                            // controls the visibility of the result lookup based on the "show" parameter

        

                            function showSuggest(suggester, show) {

        

                                if (show === false) {

        

                                    HawkSearch.SuggesterGlobal.items.forEach(function (item) {

        

                                        $(item.settings.globalDiv).hide();

        

                                    });

        

                                    $("body").off("click", hideSuggest);

        

                                } else {

        

                                    var suggestDisplay = getSuggestDiv(suggester);

        

                                    suggestDisplay.show();

        

                                    $("body").on("click", hideSuggest);

        

                                };

        

                            };

        

                        

        

                            // We originally used showSuggest as the function that was called by the onBlur

        

                            // event of the field, but it turns out that Firefox will pass an event as the first

        

                            // parameter of the function, which would cause the div to always be visible.

        

                            function hideSuggest(e) {

        

                                var updatedDisplay = false;

        

                                if (!updatedDisplay && $(e.target).closest(".hawk-searchQuery").length <= 0) {

        

                                    showSuggest(null, false);

        

                                    updatedDisplay = true;

        

                                };

        

                            };

        

                        

        

                            function isEven(num) {

        

                                if (num !== false && num !== true && !isNaN(num)) {

        

                                    return num % 2 == 0;

        

                                } else return false;

        

                            };

        

                        

        

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

        

                        

        

                                        resultItem.setAttribute('data-url', term.Url);

        

                                        resultItem.setAttribute("data-autoCompleteType", type);

        

                                        // check for odd/even alternative styling

        

                                        if (isEven(i)) {

        

                                            resultItem.className = "hawk-sqItem term";

        

                                        } else {

        

                                            resultItem.className = "hawk-sqItem hawk-sqItemAlt term";

        

                                        };

        

                        

        

                                        var resultItemContent = document.createElement("h1");

        

                                        resultItemContent.className = "hawk-sqItemName";

        

                                        resultItemContent.innerHTML = term.Value

        

                        

        

                                        resultItem.appendChild(resultItemContent);

        

                        

        

                                        // append results of suggest options to the suggest content container

        

                                        suggestContent.appendChild(resultItem);

        

                                    };

        

                        

        

                                    // find all newly added suggest options

        

                                    var suggestItems = $(suggester.settings.globalDiv).find(".hawk-sqContent .hawk-sqItem");

        

                        

        

                                    // pass suggestItems to 'suggestItemHandler' to handle events

        

                                    suggestItemHandler(trackingVersion, suggestItems);

        

                        

        

                                    // check to see if query div should show above field

        

                                    suggestIsAbove(suggester);

        

                                };

        

                            };

        

                        

        

                            function showProducts(suggestDiv, products, title, trackingVersion) {

        

                                if (products.length >= 1) {

        

                        

        

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

        

                                    for (var i = 0; i < products.length; i++) {

        

                                        var product = products[i];

        

                        

        

                                        var resultItem = document.createElement("li");

        

                        

        

                                        // check for odd/even alternative styling

        

                                        if (isEven(i)) {

        

                                            resultItem.className = "hawk-sqItem";

        

                                        } else {

        

                                            resultItem.className = "hawk-sqItem hawk-sqItemAlt";

        

                                        };

        

                        

        

                                        resultItem.setAttribute('data-url', product.Url);

        

                                        resultItem.setAttribute("data-autoCompleteType", HawkSearch.LilBro.Schema.AutoCompleteClick.AutoCompleteType.product);

        

                                        resultItem.innerHTML = product.Html;

        

                        

        

                                        // append results of suggest options to the suggest content container

        

                                        suggestContent.appendChild(resultItem);

        

                                    };

        

                        

        

                                    // find all newly added suggest options

        

                                    var suggestItems = suggestDiv.find(".hawk-sqContent .hawk-sqItem");

        

                        

        

                                    // pass suggestItems to 'suggestItemHandler' to handle events

        

                                    suggestItemHandler(trackingVersion, suggestItems);

        

                                    ;

        

                                };

        

                            };

        

                        

        

                            function showFooter(suggestDiv, autoSuggestResult, suggester) {

        

                                // creating the footer container

        

                        

        

                                var footerContainer = document.createElement("div");

        

                                footerContainer.className = "hawk-sqFooter";

        

                        

        

                                //creating the footer link

        

                                var footerLink = document.createElement("a");

        

                                footerLink.href = "javascript:void(0);";

        

                                footerLink.setAttribute("onclick", "window.location='" + autoSuggestResult.SearchWebsiteUrl + "?" + $("#hdnhawkkeywordfield").val() + "=" + escape($(suggester.queryField).val()) + HawkSearch.preserveUrlParams() + "'");

        

                        

        

                                footerLink.innerHTML = "View All Matches";

        

                        

        

                                if (autoSuggestResult.ViewAllButtonLabel != "" && autoSuggestResult.ViewAllButtonLabel != null) {

        

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

        

                                    footerCountText += con + autoSuggestResult.ContentCount + " content item(s)";

        

                                }

        

                        

        

                                if (footerCountText !== "") {

        

                                    footerCount.innerHTML = footerCountText;

        

                                    footerContainer.appendChild(footerCount);

        

                                }      

        

                        

        

                                //appending link and count to container

        

                                footerContainer.appendChild(footerLink);

        

                        

        

                                //appending container to suggestDiv

        

                                suggestDiv.append(footerContainer);

        

                        

        

                                // check to see if query div should show above field

        

                                suggestIsAbove(suggester);

        

                            };

        

                        

        

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

        

                                        };

        

                                        resultItem.setAttribute('data-url', product.Url);

        

                                        resultItem.setAttribute("data-autoCompleteType", HawkSearch.LilBro.Schema.AutoCompleteClick.AutoCompleteType.content);

        

                                        resultItem.innerHTML = product.Html

        

                        

        

                                        // append results of suggest options to the suggest content container

        

                                        suggestContent.appendChild(resultItem);

        

                                    };

        

                        

        

                                    // find all newly added suggest options

        

                                    var suggestItems = suggestDiv.find(".hawk-sqContent .hawk-sqItem");

        

                        

        

                                    // pass suggestItems to 'suggestItemHandler' to handle events

        

                                    suggestItemHandler(trackingVersion, suggestItems);

        

                                };

        

                            };

        

                        

        

                        

        

                            // sets up events for suggest items

        

                            function suggestItemHandler(trackingVersion, suggestItems) {

        

                                // bind mouseenter/mouseleave to suggest options

        

                                // toggles active state on mouseenter

        

                                suggestItems.on("mouseenter mouseleave", function (e) {

        

                                    var sqItem = $(e.currentTarget);

        

                                    if (e.type === "mouseenter") {

        

                                        highlightResult(sqItem);

        

                                    } else {

        

                                        unhighlightResult(sqItem);

        

                                    }

        

                                });

        

                        

        

                                // bind 'mousedown' event to suggest options to go to url

        

                                // using 'mousedown' instead of 'click' due to 'blur' event blocking the 'click' event from firing

        

                                suggestItems.off('click').on("click", function (e) {

        

                                    SuggestedItemClick(trackingVersion, e);

        

                                });

        

                            };

        

                        

        

                            function SuggestedItemClick(trackingVersion, e) {

        

                                e.preventDefault();

        

                                var suggest_type = $(e.target).closest("li").attr("data-autoCompleteType");

        

                                var name = $(e.target).text().replace(/\u00bb/g, "&raquo;");

        

                                if (name === "") {

        

                                    name = $(e.target).parents(".hawk-sqActive").find("div.hawk-sqItemContent h1").text();

        

                                }

        

                                var itemUrl = $(e.currentTarget).data("url");

        

                                var keyword = $("#" + $("#hdnhawkkeywordfield").val()).val();

        

                        

        

                                if (trackingVersion == HawkSearch.Tracking.Version.v2) {

        

                                    HawkSearch.Tracking.writeAutoCompleteClick(keyword, e, suggest_type, name, itemUrl);

        

                                }

        

                                else if (trackingVersion == HawkSearch.Tracking.Version.v2AndSQL) {

        

                                    HawkSearch.Tracking.writeAutoCompleteClick(keyword, e, suggest_type, name, itemUrl);

        

                                    HawkSearch.Tracking.V1.autosuggestClick(keyword, name, itemUrl, suggest_type);

        

                                }

        

                                else {

        

                                    HawkSearch.Tracking.V1.autosuggestClick(keyword, name, itemUrl, suggest_type);

        

                                }

        

                        

        

                                window.location = itemUrl;

        

                            };

        

                        

        

                            // This is called whenever the user clicks one of the lookup results.

        

                            // It puts the value of the result in the queryField and hides the lookup div.

        

                            function selectResult(item) {

        

                                _selectResult(item);

        

                            };

        

                            // This actually fills the field with the selected result and hides the div

        

                            function _selectResult(item) {

        

                                itemUrl = item.data("url");

        

                                window.location = itemUrl;

        

                            };

        

                        

        

                        

        

                            // This is called when a user mouses over a lookup result

        

                            function highlightResult(item) {

        

                                _highlightResult(item);

        

                            };

        

                            // This actually highlights the selected result

        

                            function _highlightResult(item) {

        

                                if (item == null) return;

        

                                item.addClass("hawk-sqActive");

        

                            };

        

                        

        

                        

        

                            // This is called when a user mouses away from a lookup result

        

                            function unhighlightResult(item) {

        

                                _unhighlightResult(item);

        

                            };

        

                            // This actually unhighlights the selected result

        

                            function _unhighlightResult(item) {

        

                                item.removeClass("hawk-sqActive");

        

                            };

        

                        

        

                        

        

                            // Get the number of the result that's currently selected/highlighted

        

                            // (the first result is 0, the second is 1, etc.)

        

                            function getSelectedItem(suggestDiv) {

        

                                var count = -1;

        

                                var sqItems = suggestDiv.find(".hawk-sqItem");

        

                        

        

                                if (sqItems) {

        

                                    if (sqItems.filter(".hawk-sqActive").length == 1) {

        

                                        count = sqItems.index(sqItems.filter(".hawk-sqActive"));

        

                                    };

        

                                }

        

                                return count

        

                            };

        

                        

        

                        

        

                            // Select and highlight the result at the given position

        

                            function setSelectedItem(suggestDiv, selectedIndex) {

        

                                var count = -1;

        

                                var selectedItem = null;

        

                                var first = null;

        

                                var sqItems = suggestDiv.find(".hawk-sqItem");

        

                        

        

                                if (sqItems) {

        

                                    for (var i = 0; i < sqItems.length; i++) {

        

                                        if (first == null) {

        

                                            first = sqItems.eq(i);

        

                                        };

        

                        

        

                                        if (++count == selectedIndex) {

        

                                            _highlightResult(sqItems.eq(i));

        

                                            selectedItem = sqItems.eq(i);

        

                                        } else {

        

                                            _unhighlightResult(sqItems.eq(i));

        

                                        }

        

                                    };

        

                                };

        

                        

        

                                // handle if nothing is select yet to select first

        

                                // or loop through results if at the end/beginning.

        

                                if (selectedItem == null && (selectedIndex < 0)) {

        

                                    selectedItem = sqItems.eq(-1);

        

                                    _highlightResult(selectedItem);

        

                                } else if (selectedItem == null) {

        

                                    selectedItem = first;

        

                                    _highlightResult(selectedItem);

        

                                };

        

                        

        

                                return selectedItem;

        

                            };

        

                        };

                    };

        

                    $(item.queryField).hawksearchSuggest(item.settings);

        

                });

            };

        

        

            HawkSearch.preserveUrlParams = function () {

                var prv = HawkSearch.GetQueryStringValue["prv"] + '';

                var adv = HawkSearch.GetQueryStringValue["adv"] + '';

                var aid = HawkSearch.GetQueryStringValue["hawkaid"] + '';

                var hawkflags = HawkSearch.GetQueryStringValue["hawkflags"] + '';

                var ret = '';

        

                if (prv != "undefined" && prv != '') ret += '&prv=' + escape(prv);

                if (adv != "undefined" && adv != '') ret += '&adv=' + escape(adv);

                if (aid != "undefined" && aid != '') ret += '&hawkaid=' + escape(aid);

                if (hawkflags != "undefined" && hawkflags != '') ret += '&hawkflags=' + escape(hawkflags);

        

                return ret;

            };

        

        

            //Recent Searches

        

            HawkSearch.clearRelatedSearches = function () {

                $.cookie("recent-searches", "", { expires: -1 });

                $(".hawk-recentSearches .hawk-navGroupContent > ul").empty();

                $(".hawk-recentSearches").hide();

            };

        

            HawkSearch.GetRecentSearches = function () {

                var recentSearchesStr = $.cookie("recent-searches");

                var recentSearches = [];

                if (recentSearchesStr != null) {

                    var rsObjeArr = recentSearchesStr.split(",");

                    $(rsObjeArr).each(function () {

                        var obj = this.split("|");

                        if (obj.length > 1) {

                            var srch = {};

                            srch.keyword = obj[0];

                            srch.count = obj[1];

                            recentSearches.push(srch);

                        }

                    });

                }

        

                var keyword = HawkSearch.RecentSearchesKeyword;

                var count = HawkSearch.RecentSearchesCount;

                if (keyword !== "" && count > 0) {

                    var exists = false;

                    var removeIndex = 0;

                    for (var i = 0; i < recentSearches.length; i++) {

                        if (recentSearches[i].keyword == encodeURIComponent(keyword)) {

                            exists = true;

                            removeIndex = i;

                            break;

                        }

                    }

                    //element exists and remove it at existing position then add on top

                    if (exists) {

                        recentSearches.splice(removeIndex, 1);

                    }

                    var search = new Object();

                    search.keyword = encodeURIComponent(keyword);

                    search.count = count;

                    recentSearches.unshift(search);

                }

                if (recentSearches.length == 0) {

                    $(".hawk-recentSearches").hide();

                }

                var maxRecentSearchesCount = HawkSearch.RecentSearchesRecentSearchesCount;

                var numberOrSearches = Math.min(recentSearches.length, maxRecentSearchesCount);

                for (var j = 0; j < numberOrSearches; j++) {

                    var k = recentSearches[j].keyword;

                    var c = recentSearches[j].count;

                    $(".hawk-recentSearches .hawk-navGroupContent > ul").append("<li><a href='" + HawkSearch.RecentSearchesUrl + "?" + $("#hdnhawkkeywordfield").val() + "=" + k + "' rel='nofolow'>" + decodeURIComponent(k) + "<span class='count'> (" + c + ")</span></a></li>");

                }

        

                $(".hawk-recentSearches .hawk-navGroupContent > ul li a").click(function () {

                    window.location = $(this).attr("href");

                });

                var tempArray = [];

                $(recentSearches).each(function () {

                    tempArray.push(this.keyword + "|" + this.count);

                });

                recentSearchesStr = tempArray.join(",");

                $.cookie("recent-searches", recentSearchesStr, { expires: 365 });

            };

        

            HawkSearch.getTipPlacementFunction = function (defaultPosition, width, height) {

                return function (tip, element) {

                    var position, top, bottom, left, right;

        

                    var $element = $(element);

                    var boundTop = $(document).scrollTop();

                    var boundLeft = $(document).scrollLeft();

                    var boundRight = boundLeft + $(window).width();

                    var boundBottom = boundTop + $(window).height();

        

                    var pos = $.extend({}, $element.offset(), {

                        width: element.offsetWidth,

                        height: element.offsetHeight

                    });

        

                    var isWithinBounds = function (elPos) {

                        return boundTop < elPos.top && boundLeft < elPos.left && boundRight > (elPos.left + width) && boundBottom > (elPos.top + height);

                    };

        

                    var testTop = function () {

                        if (top === false) return false;

                        top = isWithinBounds({

                            top: pos.top - height,

                            left: pos.left + pos.width / 2 - width / 2

                        });

                        return top ? "top" : false;

                    };

        

                    var testBottom = function () {

                        if (bottom === false) return false;

                        bottom = isWithinBounds({

                            top: pos.top + pos.height,

                            left: pos.left + pos.width / 2 - width / 2

                        });

                        return bottom ? "bottom" : false;

                    };

        

                    var testLeft = function () {

                        if (left === false) return false;

                        left = isWithinBounds({

                            top: pos.top + pos.height / 2 - height / 2,

                            left: pos.left - width

                        });

                        return left ? "left" : false;

                    };

        

                    var testRight = function () {

                        if (right === false) return false;

                        right = isWithinBounds({

                            top: pos.top + pos.height / 2 - height / 2,

                            left: pos.left + pos.width

                        });

                        return right ? "right" : false;

                    };

        

                    switch (defaultPosition) {

                        case "top":

                            if (position = testTop()) return position;

                        case "bottom":

                            if (position = testBottom()) return position;

                        case "left":

                            if (position = testLeft()) return position;

                        case "right":

                            if (position = testRight()) return position;

                        default:

                            if (position = testTop()) return position;

                            if (position = testBottom()) return position;

                            if (position = testLeft()) return position;

                            if (position = testRight()) return position;

                            return defaultPosition;

                    }

                }

            };

        

            HawkSearch.PopoverShow = function ($this) {

                $this.addClass("bounded");

                var tip = $this.popover();

                var popover = $(tip).data("bs.popover");

                if ($this.data("tipclass") !== undefined) {

                    popover.tip().addClass($this.data("tipclass"));

                }

                tip.on("shown.bs.popover", function (e) {

                    $this.mouseleave(function () {

                        setTimeout(function () {

                            HawkSearch.TipMouseLeave($this);

                        }, 250);

                    });

        

                    popover.tip().hover(function () {

                        $(this).addClass("hover");

                    },

                        function () {

                            $(this).removeClass("hover");

                        });

        

                    popover.tip().mouseleave(function () {

                        setTimeout(function () {

                            HawkSearch.TipMouseLeave($this);

                        }, 250);

                    });

                });

        

                $this.data("popover");

                $this.popover('show');

            }

        

            HawkSearch.TipMouseLeave = function (that) {

                var tip = that.data("bs.popover").tip();

                if (tip.hasClass("hover")) {

                    return;

                } else {

                    tip.hide();

                    that.removeClass("hover");

                }

            }

        

            HawkSearch.BindPreviewInformation = function () {

                $(".on-off-cb").onoff();

                var hdnItemPinned = $(this).parents(".hawk-itemWrapper").find(".hdn-itemPinned");

        

                $("body").off("change", "input.toggle-item-pin").on("change", "input.toggle-item-pin", function () {

                    var isPinned = $(this).prop("checked");

                    var primaryKey = $(this).data("primary-key");

                    if (isPinned) {

                        HawkSearch.addToTop(this, primaryKey);

                        var hdnItemPinned = $(this).parents(".hawk-itemWrapper").find(".hdn-itemPinned");

                        hdnItemPinned.val(isPinned);

                    } else {

                        HawkSearch.unpinItem(this, primaryKey);

                        var hdnItemPinned = $(this).parents(".hawk-itemWrapper").find(".hdn-itemPinned");

                        hdnItemPinned.val(isPinned);

                    }

        

                    $(this).parents(".hawk-itemWrapper").find(".hdn-itemPinned").val(isPinned);

        

                    $("#hawkitemlist").sortable("option", "disabled", true);

                    $(".preview-info").addClass("no-sortable");

                });

                $(".preview-info.explain-info").on("hidden.bs.tooltip", function () {

                    $(this).css("display", "");

                });

        

        

                $(".preview-info").each(function () {

                    var content = $(this).parent().find(".preview-info-content").html();

        

                    $(this).popover({

                        html: true,

                        placement: HawkSearch.getTipPlacementFunction('right', 360, 200),

                        content: content

                    });

        

                    $(this).mouseover(function () {

                        if ($(this).parents(".grid_3").hasClass('ui-sortable-helper')) {

                            return;

                        }

                        $(this).addClass("hover");

                        var $this = $(this);

                        if ($this.hasClass("bounded")) {

                            var popup = $(this).parent().find(".popover");

                            if (!popup.is(":visible")) {

                                $this.popover("show");

                            }

                            return;

                        }

                        HawkSearch.PopoverShow($(this));

                    });

                    $(this).on("shown.bs.popover", function () {

                        var itemWrapper = $(this).parents(".hawk-itemWrapper")

                        var hdnItemPinned = itemWrapper.find(".hdn-itemPinned");

                        var cbToggleItemPin = itemWrapper.find(".popover").find("input.toggle-item-pin");

                        var checked = hdnItemPinned.val() === "true";

                        cbToggleItemPin.prop("checked", checked);

                    });

                });

        

        

                $("#hawkitemlist").sortable({

                    items: '.grid_3.hawk-itemPinned',

                    placeholder: "grid_3 hawk-itemWrapper-placeholder",

                    appendTo: "#hawkitemlist",

                    handle: ".preview-info",

                    cursor: "move",

                    start: function (e, ui) {

                        $(this).find(".popover").popover("hide");

                        ui.placeholder.hide();

                        var wrapper = ui.item.find(".hawk-itemWrapper");

                        var height = wrapper.outerHeight() - 4;

                        var width = wrapper.width() - 2;

                        ui.placeholder.height(height).width(width);

                        ui.placeholder.show();

        

        

                    },

                    update: function (e, ui) {

                        var docIdList = $(this).sortable('toArray', { attribute: 'data-hawk-id' }).toString();

                        HawkSearch.updatePinOrder(docIdList);

                    }

                });

        

            };

        

            HawkSearch.BindFacetTooltip = function () {

                $(".hawk-facet-tooltip").each(function () {

                    $(this).click(function (e) {

                        e.preventDefault();

                        e.stopPropagation();

                    });

                    var content = $(this).parent().find(".hawk-facet-tooltip-content").html();

                    $(this).popover({

                        html: true,

                        placement: 'right',

                        content: content,

                        container: 'body'

                    });

                    $(this).mouseover(function () {

                        $(this).addClass("hover");

                        var $this = $(this);

                        if ($this.hasClass("bounded")) {

                            var popup = $(this).parent().find(".popover");

                            if (!popup.is(":visible")) {

                                $this.popover("show");

                            }

                            return;

                        }

                        HawkSearch.PopoverShow($(this));

                    });

                });

            }

        

            HawkSearch.BindBackToTop = function () {

                $(window).scroll(function () {

                    var divBackToTop = $("#hawk-backToTop");

                    if ($(window).scrollTop() > 0) {

                        if (!divBackToTop.is(":visible")) {

                            divBackToTop.fadeIn({ duration: 200, queue: false });

                        }

                    }

                    else {

                        if (divBackToTop.is(":visible")) {

                            divBackToTop.fadeOut({ duration: 200, queue: false });

                        }

                    }

                });

                $("#hawk-backToTop").hover(function () {

                    $(this).toggleClass("hover");

                });

                $("#hawk-backToTop").on("click", function () {

                    $('html,body').animate({ scrollTop: 0 }, 500);

                });

            }

        

            HawkSearch.SetFacetScrollPosition = function () {

                var menuYloc = $(".hawk-facetScollingContainer").offset().top - $(".hawk-facetScollingContainer").position().top;

                var footerHeight = $(".footer").outerHeight();

                var footerOffsetTop = $(".footer").offset().top;

        

        

                var menuHeight = $(".hawk-facetScollingContainer").outerHeight();

                var winHeight = $(window).height();

                var offset = 0;

                var docScroll = $(document).scrollTop();

                var diff = menuHeight - winHeight;

                if (winHeight < menuHeight) {

                    offset = docScroll - diff - menuYloc;

                    if (docScroll < diff) {

                        offset = 0;

                    }

        

                } else {

                    offset = docScroll - menuYloc + 10;

                }

        

                if (offset < 0) {

                    offset = 0;

                }

        

                if (offset + menuHeight + menuYloc >= footerOffsetTop) {

                    offset = footerOffsetTop - menuHeight - menuYloc - 20;

                }

        

                $(".hawk-facetScollingContainer").animate({ top: offset }, { duration: 500, queue: false });

            }

        

            HawkSearch.FacetContainerScrollable = function () {

                $(window).scroll(function () {

                    HawkSearch.SetFacetScrollPosition();

        

                });

        

            }

        

            // exposes custom jQuery events to the body

            HawkSearch.ExposeEvents = function (type, args) {

                var callback = $.Event('hawk' + type, args);

                $('body').trigger(callback);

        

                // if prevent default block execution

                return !callback.isDefaultPrevented();

            }

        

            HawkSearch.Tracking.setReady($);

        

            if (HawkSearch.getHashOrQueryVariable("hawkRegVisitor") !== "") {

                parent.postMessage(HawkSearch.lilBro.event.getVisitorId(), "*");

            }

        

            HawkSearch.Recommender.ToggleRecPreview();

        }(window.HawkSearch = window.HawkSearch || {}, jQuery));
        (function (HawkCompare, $) {
            HawkCompare.process = function () {
                var itemIds = $("#hdnhawkcompare").val();
                if (itemIds === "") return;
                //alert('Compare feature is not available on demo site');
                var itemIds = $("#hdnhawkcompare").val();
                if (itemIds === "") return;
        
                var url = HawkSearch.BaseUrl + "?fn=compare&Items=" + itemIds;
                $.get(url, function (data) {
                    var html = data;
                    HawkSearch.bootbox.dialog({
                        title: 'Compare Items',
                        message: html,
                        className: 'hawk-compare hawk-preview',
                        buttons: {
                            main: {
                                label: "Close"
                            }
                        }
                    });
                    $(".item.span3 .product-shop .product-name").matchHeights();
                });
            };
        
            HawkCompare.addItem = function (itemVal) {
                var index = HawkCompare.countItems();
                window['hawktocompare'][index] = itemVal;
                if (HawkCompare.countItems() != 0) {
                    $(".hawk-subControls.clearfix").css("display", "block");
                }
            };
        
            HawkCompare.getImage = function (itemVal) {
                // sets up query and cache
                var compareQuery = HawkSearch.BaseUrl + "/default.aspx?fn=ajax&F=GetItemImageToCompare&ItemId=" + itemVal;
                var cacheResp = window[compareQuery];
                // check for cache; process and output ajax query
                if (cacheResp) {
                    HawkCompare.addImage(cacheResp.Image);
                } else {
                    $.ajax({
                        type: "GET",
                        contentType: "application/json; charset=utf-8",
                        url: compareQuery,
                        dataType: 'jsonp',
                        data: "",
                        async: false,
                        success: function (json) {
                            window[compareQuery] = json;
                            HawkCompare.addImage(json.Image);
                        }
                    });
                };
            };
        
            HawkCompare.addImage = function (htmlLi) {
                $(".hawk-compareList>ul").each(function () {
                    $(this).find("li").each(function () {
                        if ($(this).html() == "" || $(this).html() == "&nbsp;") {
                            $(this).html(htmlLi);
                            return false;
                        }
                        return true;
                    });
                });
            };
        
            HawkCompare.countItems = function () {
                return window['hawktocompare'].length;
            };
        
            HawkCompare.reload = function () {
                $.each(window['hawktocompare'], function (i, value) {
                    HawkCompare.getImage(value);
                    $("#chkItemCompare" + value).attr("checked", true);
                });
            };
        
            HawkCompare.removeItem = function (itemVal) {
                $(".hawk-compareList>ul").each(function () {
                    var cItem = $(this).find("a#" + itemVal).parent();
                    cItem.parent().append("<li>&nbsp;</li>");
                    cItem.remove();
                });
                $("#chkItemCompare" + itemVal).attr("checked", false);
        
                var index = window['hawktocompare'].indexOf(itemVal);
                window['hawktocompare'].splice(index, 1);
        
                if (HawkCompare.countItems() == 0) {
                    $(".hawk-subControls.clearfix").css("display", "none");
                }
        
            };
        
        }(window.HawkCompare = window.HawkCompare || {}, jQuery));

        // END Namespaced HawkSearch block.

        window.onpopstate = function () {
            log("onhashchagne event handler");
            HawkSearch.refreshResults(true);
        }

        HawkSearch.loadRecommender = function () {
            $(".hawk-recommendation").empty();
            HawkSearch.showRecsBlockUI();
            var recommender = new HawkSearch.Recommender(HawkSearch.jQuery);
        }

        $(document).ready(function () {
            // initialize auto-suggest
            if (HawkSearch.initAutoSuggest !== undefined) {
                HawkSearch.initAutoSuggest();
            }

            $(document).on('click', '#explainDetailsTabs .tab-links a', function (e) {
                var currentAttrValue = $(this).data('nav');
                $('.tabs #' + currentAttrValue).show().siblings().hide();
                $(this).parent('li').addClass('active').siblings().removeClass('active');
                e.preventDefault();
            });

            HawkSearch.loadRecommender();

            $("#divSmartBug").delegate(".bugExplain", "click", function () {
                $("#hdnhawkadv").val($(this).attr("href"));
                HawkSearch.refreshUrl(null, true);
                return false;
            });

            if (!$("#hawkitemlist").length) {
                //HawkSearch.regSmartBug();
                return;
            }
            // load items to compare
            var items = decodeURIComponent(HawkSearch.getHashOrQueryVariable("items"));
            if (items != "") {
                window['hawktocompare'] = items.split(",");
                if ($.isFunction(window.HawkCompare.reload)) HawkCompare.reload();
            } else {
                window['hawktocompare'] = new Array();
            }

            HawkSearch.regFacets();

            // bind the click event to the anchor tags
            $("#hawkfacets").on("click", ".slider-clear, .hawk-facetFilters a", function (event) {

                // clear the current page
                $("#hdnhawkpg").val("");
                var options = $(this).data().options;
                var ul = $(this).parents("ul.hawk-facetFilters");
                if (ul.hasClass("singlefacet")) {
                    ul.find(".hawkFacet-active a").each(function () {
                        var opt = $(this).data().options;
                        if (options.value !== opt.value) {
                            $(this).parent().removeClass("hawkFacet-active");
                        }
                    });
                }

                if (typeof (options.hash) !== "undefined") {
                    if (HawkSearch.disableAjax()) {
                        window.location = $(this).attr("href");
                    } else {
                        window.history.pushState({}, {}, "?" + options.hash);
                    }
                } else {
                    HawkSearch.refreshUrl
                        (event);
                }

                return false;
            });

            if (!HawkSearch.disableAjax()) {
                var newHash = window.location.search.substring(1);
                if (newHash === "" || (window.location.search.substring(1) !== "" && window.location.href.indexOf("#") > -1)) newHash = HawkSearch.getHash();
                if (window.location.search.substring(1) !== newHash) {
                    window.history.pushState({}, {}, "?" + newHash);
                }
            }

            // hawk pagination
            $("#hawktoppager, #hawkbottompager").on("click", ".hawk-pageLink", function (e) {
                e.preventDefault();
                if ($(this).hasClass("disabled") || $("#hdnhawkpg").val() === $(this).attr("page")) return false;

                $("#hdnhawkpg").val($(this).attr("page"));
                HawkSearch.refreshUrl();
                return false;
            });

            // hawk sorting
            $("#hawktoppager, #hawkbottompager").on("change", ".hawksortby", function (e) {
                // clear the current page
                $("#hdnhawkpg").val("");

                $("#hdnhawksortby").val($(this).val());
                $(".hawksortby").val($(this).val());

                HawkSearch.refreshUrl(e);
                return false;
            });


            // hawk change per page
            $("#hawktoppager, #hawkbottompager").on("change", ".hawkmpp", function (event) {
                // clear the current page
                $("#hdnhawkpg").val("");

                $("#hdnhawkmpp").val($(this).val());
                $(".hawkmpp").val($(this).val());

                HawkSearch.refreshUrl(event);
                return false;
            });

            var hawkmpp = $(".hawkmpp");
            if (hawkmpp.length > 0 && hawkmpp.eq(0).val() !== "" && $("#hdnhawkmpp").val() === "") {
                $("#hdnhawkmpp").val(hawkmpp.eq(0).val());
                hawkmpp.val($("#hdnhawkmpp").val());
            }

            $("#hawkfacets").on("click", ".hawk-selectedGroup a", function (e) {
                e.preventDefault();
                if (HawkSearch.disableAjax()) {
                    window.location = $(this).attr("href");
                } else {
                    var options = $(this).data().options;
                    if (window.location.hash == options.hash) {
                        window.history.pushState({}, {}, window.location.pathname);
                        HawkSearch.refreshResults();;
                    } else {
                        window.history.pushState({}, {}, "?" + options.hash);
                        HawkSearch.refreshResults();
                    }

                }
                return false;
            });

            $("#hawktoppager, #hawkbottompager").on("click", ".btnCompareItems", function () {
                if (HawkCompare.countItems() < 2) {
                    alert('You should select at least 2 items');
                    return false;
                } else {
                    $("#hdnhawkcompare").val(window['hawktocompare'].join(","));
                    HawkCompare.process();
                }
                return true;
            });

            $("#hawkitemlist").on("change", "input.ckbItemCompare", function () {
                if ($(this).is(':checked')) {
                    if (HawkCompare.countItems() >= 5) {
                        alert('You can compare up to 5 items');
                        $(this).attr('checked', false);
                        return false;
                    } else {
                        HawkCompare.getImage($(this).val());
                        HawkCompare.addItem($(this).val());
                    }
                } else {
                    HawkCompare.removeItem($(this).val());
                }
                return true;
            });

            $("#hawkfacets").on("click", ".hawk-resultsSearch:first .hawk-searchWithinButton", function (e) {
                // clear the current page
                $("#hdnhawkpg").val("");

                e.preventDefault();
            });

            //initial load
            if ($("#hawkitemlist").html() == '' || (!HawkSearch.disableAjax() && window.location.hash)) {
                HawkSearch.refreshResults();
            }
            else {
                HawkSearch.Tracking.writeSearch();
                HawkSearch.regTracking();
            }

            if (HawkSearch.GetRecentSearches !== undefined) {
                HawkSearch.GetRecentSearches();
            }

            $(window).on("debouncedresize", function (event) {
                $("#hawkitemlist .itemWrapper").css("min-height", 0);
                $("#hawkbannertop .itemWrapper").css("min-height", 0);
                HawkSearch.normalizeHeights();
                log("resize");

            });

            HawkSearch.BindPreviewInformation();
            HawkSearch.BindFacetTooltip();

            if ($(".hawk-facetScollingContainer").length) {
                HawkSearch.FacetContainerScrollable();
            }

            HawkSearch.BindBackToTop();

        });



        $.expr[':'].containsNoCase = function (a, i, m) {
            var regex = /(.*?)\s\(\d+?\)/;
            var textNode = a.textContent || a.innerText || "";
            var matches = textNode.match(regex);
            if (matches == null) {
                return null;
            }

            return (matches[1]).toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
        };

        $.fn.filterThatList = function (options) {
            // if there are no passed options create an empty options object
            if (options === undefined || options === null) {
                options = {};
            }
            ;

            // set up default options
            var defaults = {
                searchTarget: $(this) // the search input
            };

            return this.each(function () {
                // merge passed options with default options to create settings
                var settings = $.extend(defaults, options);

                settings.searchTarget.change(function () {
                    // get the value of the input which is used to filter against
                    var filter = $(this).val();
                    var searchList = settings.list;
                    var isNestedFacet = settings.list.hasClass("hawk-nestedfacet");
                    //when nested facet prepare flat facet
                    if (isNestedFacet) {
                        var flatUlId = settings.list.attr("id") + "_flat";
                        if ($("#" + flatUlId).size() == 0) {
                            var searchList = $(settings.list[0].cloneNode(false));
                            searchList.removeClass("hawk-navTruncateList");
                            searchList.addClass("hawk-scrollList");
                            searchList.attr("id", flatUlId);
                            searchList.appendTo(settings.list.parent());

                            $(settings.list).find("li").each(function () {
                                var pathArr = [];
                                $(this).parentsUntil("#" + settings.list.attr("id"), "li").each(function () {
                                    var text = $($($(this).children("a")).children("span").contents()[0]).text();
                                    text = text.trim();
                                    pathArr.unshift(text);
                                });

                                var li = $("<li>");
                                if ($(this).hasClass("hawkFacet-active")) {
                                    li.addClass("hawkFacet-active");
                                }

                                li.appendTo(searchList);
                                var anchor = $(this).children("a").clone();
                                if (pathArr.length > 0) {
                                    var textSpan = anchor.children("span")
                                    var spanCount = textSpan.children(".hawk-facetCount").remove()
                                    pathArr.push(textSpan.text());
                                    textSpan.html(pathArr.join(" &raquo; "));
                                    textSpan.append(spanCount);
                                }

                                anchor.appendTo(li);
                            });
                            var liHeight = searchList.children("li").first().outerHeight();
                            //set search list for max 20 elements
                            searchList.css("max-height", (liHeight * 20) + "px");
                            settings.list.hide();
                        }
                        else {
                            searchList = $("#" + flatUlId);
                            searchList.show();
                            settings.list.hide();
                        }
                    }
                    var noResults = ("<li><span>No Results Found</span></li>");

                    if (filter) {
                        searchList
                            // hide items that do not match input filter
                            .find("li:not(:containsNoCase(" + filter + "))").hide()
                            // show items that match input filter
                            .end().find("li:containsNoCase(" + filter + ")").show();

                        var items = searchList.find("li:containsNoCase(" + filter + ")");

                        // nothing matches filter
                        // add no results found
                        if (items.length == 0) {
                            var item = $(noResults);
                            searchList.prepend(item);
                            return;
                        }

                        //check if more results
                        var options = settings.list.data().options;
                        var moreItems = items.filter(function (index) {
                            return index >= options.cutoff;
                        });
                        moreItems.hide();

                        //if no more results
                        if (moreItems.size() == 0) {
                            return;
                        }

                        //otherwise 
                        //remove no results
                        items.find(":contains('No Results Found')").remove();

                        if (moreItems) {
                            //add more button and handle it's click event
                            var more = settings.list.find("li.hawk-navMore");
                            more.off("click").find("span").text("(+) Show " + moreItems.size() + " More");
                            more.show();

                            more.on("click", function (event) {
                                var moreTrigger = $(this);
                                if ($(this).hasClass("hawk-navMoreActive")) {
                                    searchList
                                    // hide items that do not match input filter
                                    .find("li:not(:containsNoCase(" + filter + "))").hide()
                                    // show items that match input filter
                                    .end().find("li:containsNoCase(" + filter + ")").show();

                                    items = searchList.find("li:containsNoCase(" + filter + ")");

                                    moreItems = items.filter(function (index) {
                                        return index >= options.cutoff;
                                    });
                                    moreItems.hide();

                                    moreTrigger.find("span").text("(+) Show " + moreItems.size() + " More");
                                    moreTrigger.removeClass("hawk-navMoreActive");
                                    window["hawkexpfacet_" + searchList.attr("id")] = null;
                                    moreTrigger.show();
                                } else {
                                    searchList
                                   // hide items that do not match input filter
                                   .find("li:not(:containsNoCase(" + filter + "))").hide()
                                   // show items that match input filter
                                   .end().find("li:containsNoCase(" + filter + ")").show();

                                    items = searchList.find("li:containsNoCase(" + filter + ")");

                                    // nothing matches filter
                                    if (items.length == 0) {
                                        var item = $(noResults);
                                        searchList.prepend(item);
                                        return;
                                    }
                                    moreTrigger.addClass("hawk-navMoreActive").find("span").text(options.lessText);
                                    moreTrigger.show();
                                    window["hawkexpfacet_" + searchList.attr("id")] = true;
                                };
                            });

                        }
                        //no filter
                    } else {
                        //remove no results option
                        settings.list.find(":contains('No Results Found')").remove();

                        // if nothing is entered display all items in list
                        if (isNestedFacet) {
                            searchList.hide();
                            settings.list.show();
                        }
                        else {
                            if (settings.list.hasClass("hawk-navTruncateList")) {
                                var wasExpanded = settings.list.find("li.hawk-navMore > span").hasClass("hawk-navMoreActive");

                                if (wasExpanded) {
                                    settings.list.find("li").show();
                                }
                                else {
                                    var options = settings.list.data().options;
                                    var items = settings.list.find("li:not(.hawk-navMore)");

                                    items.each(function (i, el) {
                                        if (i < options.cutoff) {
                                            $(this).show();
                                        } else {
                                            $(this).hide();
                                        }
                                    });


                                    //check if more results
                                    var options = settings.list.data().options;
                                    var moreItems = items.filter(function (index) {
                                        return index >= options.cutoff;
                                    });
                                    moreItems.hide();

                                    //if no more results
                                    if (moreItems.size() == 0) {
                                        return;
                                    }

                                    if (moreItems) {
                                        var more = settings.list.find("li.hawk-navMore");
                                        more.off("click").find("span").text(options.moreText);
                                        more.show();

                                        more.on("click", function (event) {
                                            var moreTrigger = $(this);
                                            if ($(this).hasClass("hawk-navMoreActive")) {
                                                moreTrigger.hide();
                                                moreTrigger.removeClass("hawk-navMoreActive").find("span").text(options.moreText);
                                                window["hawkexpfacet_" + searchList.attr("id")] = null;
                                                moreTrigger.show();
                                            } else {
                                                moreTrigger.addClass("hawk-navMoreActive").find("span").text(options.lessText);
                                                window["hawkexpfacet_" + searchList.attr("id")] = true;
                                                moreTrigger.show();
                                            };
                                        });
                                    }

                                }
                            } else {
                                settings.list.find("li").show();
                            }
                        }
                    }
                }).keyup(function () {
                    //trigger above actions at every keyup
                    $(this).change();
                });

            });
        };

             /************************/

                /* Custom Plugins Below */

                /************************/

        

                //requireJS, these are not the plugins you are looking for

                //TRUST ME. THIS IS GOOD. PLEASE DON'T REMOVE THIS.

                var define = undefined;

        

                /*!

        		 * jQuery blockUI plugin

        		 * Version 2.66.0-2013.10.09

        		 * Requires jQuery v1.7 or later

        		 *

        		 * Examples at: http://malsup.com/jquery/block/

        		 * Copyright (c) 2007-2013 M. Alsup

        		 * Dual licensed under the MIT and GPL licenses:

        		 * http://www.opensource.org/licenses/mit-license.php

        		 * http://www.gnu.org/licenses/gpl.html

        		 *

        		 * Thanks to Amir-Hossein Sobhi for some excellent contributions!

        		 */

                (function () {

                    function p(b) {

                        function p(c, a) {

                            var f, h, e = c == window, g = a && void 0 !== a.message ? a.message : void 0; a = b.extend({}, b.blockUI.defaults, a || {}); if (!a.ignoreIfBlocked || !b(c).data("blockUI.isBlocked")) {

                                a.overlayCSS = b.extend({}, b.blockUI.defaults.overlayCSS, a.overlayCSS || {}); f = b.extend({}, b.blockUI.defaults.css, a.css || {}); a.onOverlayClick && (a.overlayCSS.cursor = "pointer"); h = b.extend({}, b.blockUI.defaults.themedCSS, a.themedCSS || {}); g = void 0 === g ? a.message : g; e && l && s(window, { fadeOut: 0 }); if (g && "string" != typeof g &&

                                (g.parentNode || g.jquery)) {

                                    var k = g.jquery ? g[0] : g, d = {}; b(c).data("blockUI.history", d); d.el = k; d.parent = k.parentNode; d.display = k.style.display; d.position = k.style.position; d.parent && d.parent.removeChild(k)

                                } b(c).data("blockUI.onUnblock", a.onUnblock); var d = a.baseZ, m; m = t || a.forceIframe ? b('<iframe class="blockUI" style="z-index:' + d++ + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + a.iframeSrc + '"></iframe>') : b('<div class="blockUI" style="display:none"></div>');

                                k = a.theme ? b('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:' + d++ + ';display:none"></div>') : b('<div class="blockUI blockOverlay" style="z-index:' + d++ + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>'); a.theme && e ? (d = '<div class="blockUI ' + a.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + (d + 10) + ';display:none;position:fixed">', a.title && (d += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' +

                                (a.title || "&nbsp;") + "</div>"), d += '<div class="ui-widget-content ui-dialog-content"></div></div>') : a.theme ? (d = '<div class="blockUI ' + a.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + (d + 10) + ';display:none;position:absolute">', a.title && (d += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (a.title || "&nbsp;") + "</div>"), d += '<div class="ui-widget-content ui-dialog-content"></div>', d += "</div>") : d = e ? '<div class="blockUI ' + a.blockMsgClass + ' blockPage" style="z-index:' +

                                (d + 10) + ';display:none;position:fixed"></div>' : '<div class="blockUI ' + a.blockMsgClass + ' blockElement" style="z-index:' + (d + 10) + ';display:none;position:absolute"></div>'; d = b(d); g && (a.theme ? (d.css(h), d.addClass("ui-widget-content")) : d.css(f)); a.theme || k.css(a.overlayCSS); k.css("position", e ? "fixed" : "absolute"); (t || a.forceIframe) && m.css("opacity", 0); f = [m, k, d]; var r = e ? b("body") : b(c); b.each(f, function () { this.appendTo(r) }); a.theme && a.draggable && b.fn.draggable && d.draggable({ handle: ".ui-dialog-titlebar", cancel: "li" });

                                h = A && (!b.support.boxModel || 0 < b("object,embed", e ? null : c).length); if (v || h) {

                                    e && a.allowBodyStretch && b.support.boxModel && b("html,body").css("height", "100%"); if ((v || !b.support.boxModel) && !e) {

                                        h = parseInt(b.css(c, "borderTopWidth"), 10) || 0; var q = parseInt(b.css(c, "borderLeftWidth"), 10) || 0, w = h ? "(0 - " + h + ")" : 0, x = q ? "(0 - " + q + ")" : 0

                                    } b.each(f, function (b, c) {

                                        var d = c[0].style; d.position = "absolute"; if (2 > b) e ? d.setExpression("height", "Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:" +

                                        a.quirksmodeOffsetHack + ') + "px"') : d.setExpression("height", 'this.parentNode.offsetHeight + "px"'), e ? d.setExpression("width", 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"') : d.setExpression("width", 'this.parentNode.offsetWidth + "px"'), x && d.setExpression("left", x), w && d.setExpression("top", w); else if (a.centerY) e && d.setExpression("top", '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"'),

                                        d.marginTop = 0; else if (!a.centerY && e) {

                                            var f = "((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + " + (a.css && a.css.top ? parseInt(a.css.top, 10) : 0) + ') + "px"'; d.setExpression("top", f)

                                        }

                                    })

                                } g && (a.theme ? d.find(".ui-widget-content").append(g) : d.append(g), (g.jquery || g.nodeType) && b(g).show()); (t || a.forceIframe) && a.showOverlay && m.show(); if (a.fadeIn) f = a.onBlock ? a.onBlock : u, m = a.showOverlay && !g ? f : u, f = g ? f : u, a.showOverlay && k._fadeIn(a.fadeIn, m), g && d._fadeIn(a.fadeIn,

                                f); else if (a.showOverlay && k.show(), g && d.show(), a.onBlock) a.onBlock(); y(1, c, a); e ? (l = d[0], n = b(a.focusableElements, l), a.focusInput && setTimeout(z, 20)) : B(d[0], a.centerX, a.centerY); a.timeout && (g = setTimeout(function () { e ? b.unblockUI(a) : b(c).unblock(a) }, a.timeout), b(c).data("blockUI.timeout", g))

                            }

                        } function s(c, a) {

                            var f, h = c == window, e = b(c), g = e.data("blockUI.history"), k = e.data("blockUI.timeout"); k && (clearTimeout(k), e.removeData("blockUI.timeout")); a = b.extend({}, b.blockUI.defaults, a || {}); y(0, c, a); null === a.onUnblock &&

                            (a.onUnblock = e.data("blockUI.onUnblock"), e.removeData("blockUI.onUnblock")); var d; d = h ? b("body").children().filter(".blockUI").add("body > .blockUI") : e.find(">.blockUI"); a.cursorReset && (1 < d.length && (d[1].style.cursor = a.cursorReset), 2 < d.length && (d[2].style.cursor = a.cursorReset)); h && (l = n = null); a.fadeOut ? (f = d.length, d.stop().fadeOut(a.fadeOut, function () { 0 === --f && r(d, g, a, c) })) : r(d, g, a, c)

                        } function r(c, a, f, h) {

                            var e = b(h); if (!e.data("blockUI.isBlocked")) {

                                c.each(function (a, b) { this.parentNode && this.parentNode.removeChild(this) });

                                a && a.el && (a.el.style.display = a.display, a.el.style.position = a.position, a.parent && a.parent.appendChild(a.el), e.removeData("blockUI.history")); e.data("blockUI.static") && e.css("position", "static"); if ("function" == typeof f.onUnblock) f.onUnblock(h, f); c = b(document.body); a = c.width(); f = c[0].style.width; c.width(a - 1).width(a); c[0].style.width = f

                            }

                        } function y(c, a, f) {

                            var h = a == window; a = b(a); if (c || (!h || l) && (h || a.data("blockUI.isBlocked"))) a.data("blockUI.isBlocked", c), h && f.bindEvents && (!c || f.showOverlay) && (c ? b(document).bind("mousedown mouseup keydown keypress keyup touchstart touchend touchmove",

                            f, q) : b(document).unbind("mousedown mouseup keydown keypress keyup touchstart touchend touchmove", q))

                        } function q(c) {

                            if ("keydown" === c.type && c.keyCode && 9 == c.keyCode && l && c.data.constrainTabKey) { var a = n, f = c.shiftKey && c.target === a[0]; if (!c.shiftKey && c.target === a[a.length - 1] || f) return setTimeout(function () { z(f) }, 10), !1 } var a = c.data, h = b(c.target); if (h.hasClass("blockOverlay") && a.onOverlayClick) a.onOverlayClick(c); return 0 < h.parents("div." + a.blockMsgClass).length ? !0 : 0 === h.parents().children().filter("div.blockUI").length

                        }

                        function z(b) {

                            n && (b = n[!0 === b ? n.length - 1 : 0]) && b.focus()

                        } function B(c, a, f) {

                            var h = c.parentNode, e = c.style, g = (h.offsetWidth - c.offsetWidth) / 2 - (parseInt(b.css(h, "borderLeftWidth"), 10) || 0); c = (h.offsetHeight - c.offsetHeight) / 2 - (parseInt(b.css(h, "borderTopWidth"), 10) || 0); a && (e.left = 0 < g ? g + "px" : "0"); f && (e.top = 0 < c ? c + "px" : "0")

                        } b.fn._fadeIn = b.fn.fadeIn; var u = b.noop || function () { }, t = /MSIE/.test(navigator.userAgent), v = /MSIE 6.0/.test(navigator.userAgent) && !/MSIE 8.0/.test(navigator.userAgent), A = b.isFunction(document.createElement("div").style.setExpression);

                        b.blockUI = function (b) {

                            p(window, b)

                        }; b.unblockUI = function (b) {

                            s(window, b)

                        }; b.growlUI = function (c, a, f, h) {

                            var e = b('<div class="growlUI"></div>'); c && e.append("<h1>" + c + "</h1>"); a && e.append("<h2>" + a + "</h2>"); void 0 === f && (f = 3E3); var g = function (a) {

                                a = a || {}; b.blockUI({ message: e, fadeIn: "undefined" !== typeof a.fadeIn ? a.fadeIn : 700, fadeOut: "undefined" !== typeof a.fadeOut ? a.fadeOut : 1E3, timeout: "undefined" !== typeof a.timeout ? a.timeout : f, centerY: !1, showOverlay: !1, onUnblock: h, css: b.blockUI.defaults.growlCSS })

                            }; g(); e.css("opacity");

                            e.mouseover(function () { g({ fadeIn: 0, timeout: 3E4 }); var a = b(".blockMsg"); a.stop(); a.fadeTo(300, 1) }).mouseout(function () { b(".blockMsg").fadeOut(1E3) })

                        }; b.fn.block = function (c) {

                            if (this[0] === window) return b.blockUI(c), this; var a = b.extend({}, b.blockUI.defaults, c || {}); this.each(function () { var c = b(this); a.ignoreIfBlocked && c.data("blockUI.isBlocked") || c.unblock({ fadeOut: 0 }) }); return this.each(function () {

                                "static" == b.css(this, "position") && (this.style.position = "relative", b(this).data("blockUI.static", !0)); this.style.zoom =

                                1; p(this, c)

                            })

                        }; b.fn.unblock = function (c) {

                            return this[0] === window ? (b.unblockUI(c), this) : this.each(function () { s(this, c) })

                        }; b.blockUI.version = 2.66; b.blockUI.defaults = {

                            message: "<h1>Please wait...</h1>", title: null, draggable: !0, theme: !1, css: {

                                padding: 0, margin: 0, width: "30%", top: "40%", left: "35%", textAlign: "center", color: "#000", border: "3px solid #aaa", backgroundColor: "#fff", cursor: "wait"

                            }, themedCSS: {

                                width: "30%", top: "40%", left: "35%"

                            }, overlayCSS: {

                                backgroundColor: "#000", opacity: 0.6, cursor: "wait"

                            }, cursorReset: "default",

                            growlCSS: {

                                width: "350px", top: "10px", left: "", right: "10px", border: "none", padding: "5px", opacity: 0.6, cursor: "default", color: "#fff", backgroundColor: "#000", "-webkit-border-radius": "10px", "-moz-border-radius": "10px", "border-radius": "10px"

                            }, iframeSrc: /^https/i.test(window.location.href || "") ? "javascript:false" : "about:blank", forceIframe: !1, baseZ: 1E3, centerX: !0, centerY: !0, allowBodyStretch: !0, bindEvents: !0, constrainTabKey: !0, fadeIn: 200, fadeOut: 400, timeout: 0, showOverlay: !0, focusInput: !0, focusableElements: ":input:enabled:visible",

                            onBlock: null, onUnblock: null, onOverlayClick: null, quirksmodeOffsetHack: 4, blockMsgClass: "blockMsg", ignoreIfBlocked: !1

                        }; var l = null, n = []

                    } "function" === typeof define && define.amd && define.amd.jQuery ? define(["jquery"], p) : p(jQuery)

                })();

        

        

                /*

        		 * Match Heights jQuery Plugin

        		 * 

        		 * Version 1.7.2 (Updated 7/31/2013)

        		 * Copyright (c) 2010-2013 Mike Avello

        		 * Dual licensed under the MIT and GPL licenses:

        		 * http://www.opensource.org/licenses/mit-license.php

        		 * http://www.gnu.org/licenses/gpl.html

        		 *

        		 */

                (function (d) { d.fn.matchHeights = function (a) { a = jQuery.extend(this, { minHeight: null, maxHeight: null, extension: 0, overflow: null, includeMargin: !1 }, a); var e = a.extension, b = a.minHeight ? a.minHeight : 0; this.each(function () { b = Math.max(b, d(this).outerHeight()) }); a.maxHeight && b > a.maxHeight && (b = a.maxHeight); return this.each(function () { var c = d(this), f = c.innerHeight() - c.height() + (c.outerHeight(a.includeMargin) - c.innerHeight()); a.overflow ? c.css({ height: b - f + e, overflow: a.overflow }) : c.css({ "min-height": b - f + e }) }) } })(jQuery);

        

        

                /*!

                 * imagesLoaded PACKAGED v3.1.8

                 * JavaScript is all like "You images are done yet or what?"

                 * MIT License

                 *

                 * Hawk Note: Had to romove this line from the plguin to keep our encapsulation. var $ = window.jQuery;

                 *

                 */

                (function () { function e() { } function i(e, t) { var n = e.length; while (n--) { if (e[n].listener === t) { return n } } return -1 } function s(e) { return function () { return this[e].apply(this, arguments) } } var t = e.prototype; var n = this; var r = n.EventEmitter; t.getListeners = function (t) { var n = this._getEvents(); var r; var i; if (typeof t === "object") { r = {}; for (i in n) { if (n.hasOwnProperty(i) && t.test(i)) { r[i] = n[i] } } } else { r = n[t] || (n[t] = []) } return r }; t.flattenListeners = function (t) { var n = []; var r; for (r = 0; r < t.length; r += 1) { n.push(t[r].listener) } return n }; t.getListenersAsObject = function (t) { var n = this.getListeners(t); var r; if (n instanceof Array) { r = {}; r[t] = n } return r || n }; t.addListener = function (t, n) { var r = this.getListenersAsObject(t); var s = typeof n === "object"; var o; for (o in r) { if (r.hasOwnProperty(o) && i(r[o], n) === -1) { r[o].push(s ? n : { listener: n, once: false }) } } return this }; t.on = s("addListener"); t.addOnceListener = function (t, n) { return this.addListener(t, { listener: n, once: true }) }; t.once = s("addOnceListener"); t.defineEvent = function (t) { this.getListeners(t); return this }; t.defineEvents = function (t) { for (var n = 0; n < t.length; n += 1) { this.defineEvent(t[n]) } return this }; t.removeListener = function (t, n) { var r = this.getListenersAsObject(t); var s; var o; for (o in r) { if (r.hasOwnProperty(o)) { s = i(r[o], n); if (s !== -1) { r[o].splice(s, 1) } } } return this }; t.off = s("removeListener"); t.addListeners = function (t, n) { return this.manipulateListeners(false, t, n) }; t.removeListeners = function (t, n) { return this.manipulateListeners(true, t, n) }; t.manipulateListeners = function (t, n, r) { var i; var s; var o = t ? this.removeListener : this.addListener; var u = t ? this.removeListeners : this.addListeners; if (typeof n === "object" && !(n instanceof RegExp)) { for (i in n) { if (n.hasOwnProperty(i) && (s = n[i])) { if (typeof s === "function") { o.call(this, i, s) } else { u.call(this, i, s) } } } } else { i = r.length; while (i--) { o.call(this, n, r[i]) } } return this }; t.removeEvent = function (t) { var n = typeof t; var r = this._getEvents(); var i; if (n === "string") { delete r[t] } else if (n === "object") { for (i in r) { if (r.hasOwnProperty(i) && t.test(i)) { delete r[i] } } } else { delete this._events } return this }; t.removeAllListeners = s("removeEvent"); t.emitEvent = function (t, n) { var r = this.getListenersAsObject(t); var i; var s; var o; var u; for (o in r) { if (r.hasOwnProperty(o)) { s = r[o].length; while (s--) { i = r[o][s]; if (i.once === true) { this.removeListener(t, i.listener) } u = i.listener.apply(this, n || []); if (u === this._getOnceReturnValue()) { this.removeListener(t, i.listener) } } } } return this }; t.trigger = s("emitEvent"); t.emit = function (t) { var n = Array.prototype.slice.call(arguments, 1); return this.emitEvent(t, n) }; t.setOnceReturnValue = function (t) { this._onceReturnValue = t; return this }; t._getOnceReturnValue = function () { if (this.hasOwnProperty("_onceReturnValue")) { return this._onceReturnValue } else { return true } }; t._getEvents = function () { return this._events || (this._events = {}) }; e.noConflict = function () { n.EventEmitter = r; return e }; if (typeof define === "function" && define.amd) { define("eventEmitter/EventEmitter", [], function () { return e }) } else if (typeof module === "object" && module.exports) { module.exports = e } else { this.EventEmitter = e } }).call(this); (function (e) { function r(t) { var n = e.event; n.target = n.target || n.srcElement || t; return n } var t = document.documentElement; var n = function () { }; if (t.addEventListener) { n = function (e, t, n) { e.addEventListener(t, n, false) } } else if (t.attachEvent) { n = function (e, t, n) { e[t + n] = n.handleEvent ? function () { var t = r(e); n.handleEvent.call(n, t) } : function () { var t = r(e); n.call(e, t) }; e.attachEvent("on" + t, e[t + n]) } } var i = function () { }; if (t.removeEventListener) { i = function (e, t, n) { e.removeEventListener(t, n, false) } } else if (t.detachEvent) { i = function (e, t, n) { e.detachEvent("on" + t, e[t + n]); try { delete e[t + n] } catch (r) { e[t + n] = undefined } } } var s = { bind: n, unbind: i }; if (typeof define === "function" && define.amd) { define("eventie/eventie", s) } else { e.eventie = s } })(this); (function (e, t) { if (typeof define === "function" && define.amd) { define(["eventEmitter/EventEmitter", "eventie/eventie"], function (n, r) { return t(e, n, r) }) } else if (typeof exports === "object") { module.exports = t(e, require("wolfy87-eventemitter"), require("eventie")) } else { e.imagesLoaded = t(e, e.EventEmitter, e.eventie) } })(window, function (t, n, r) { function o(e, t) { for (var n in t) { e[n] = t[n] } return e } function a(e) { return u.call(e) === "[object Array]" } function f(e) { var t = []; if (a(e)) { t = e } else if (typeof e.length === "number") { for (var n = 0, r = e.length; n < r; n++) { t.push(e[n]) } } else { t.push(e) } return t } function l(e, t, n) { if (!(this instanceof l)) { return new l(e, t) } if (typeof e === "string") { e = document.querySelectorAll(e) } this.elements = f(e); this.options = o({}, this.options); if (typeof t === "function") { n = t } else { o(this.options, t) } if (n) { this.on("always", n) } this.getImages(); if ($) { this.jqDeferred = new $.Deferred } var r = this; setTimeout(function () { r.check() }) } function c(e) { this.img = e } function p(e) { this.src = e; h[e] = this } var i = t.console; var s = typeof i !== "undefined"; var u = Object.prototype.toString; l.prototype = new n; l.prototype.options = {}; l.prototype.getImages = function () { this.images = []; for (var e = 0, t = this.elements.length; e < t; e++) { var n = this.elements[e]; if (n.nodeName === "IMG") { this.addImage(n) } var r = n.nodeType; if (!r || !(r === 1 || r === 9 || r === 11)) { continue } var i = n.querySelectorAll("img"); for (var s = 0, o = i.length; s < o; s++) { var u = i[s]; this.addImage(u) } } }; l.prototype.addImage = function (e) { var t = new c(e); this.images.push(t) }; l.prototype.check = function () { function r(r, o) { if (e.options.debug && s) { i.log("confirm", r, o) } e.progress(r); t++; if (t === n) { e.complete() } return true } var e = this; var t = 0; var n = this.images.length; this.hasAnyBroken = false; if (!n) { this.complete(); return } for (var o = 0; o < n; o++) { var u = this.images[o]; u.on("confirm", r); u.check() } }; l.prototype.progress = function (e) { this.hasAnyBroken = this.hasAnyBroken || !e.isLoaded; var t = this; setTimeout(function () { t.emit("progress", t, e); if (t.jqDeferred && t.jqDeferred.notify) { t.jqDeferred.notify(t, e) } }) }; l.prototype.complete = function () { var e = this.hasAnyBroken ? "fail" : "done"; this.isComplete = true; var t = this; setTimeout(function () { t.emit(e, t); t.emit("always", t); if (t.jqDeferred) { var n = t.hasAnyBroken ? "reject" : "resolve"; t.jqDeferred[n](t) } }) }; if ($) { $.fn.imagesLoaded = function (e, t) { var n = new l(this, e, t); return n.jqDeferred.promise($(this)) } } c.prototype = new n; c.prototype.check = function () { var e = h[this.img.src] || new p(this.img.src); if (e.isConfirmed) { this.confirm(e.isLoaded, "cached was confirmed"); return } if (this.img.complete && this.img.naturalWidth !== undefined) { this.confirm(this.img.naturalWidth !== 0, "naturalWidth"); return } var t = this; e.on("confirm", function (e, n) { t.confirm(e.isLoaded, n); return true }); e.check() }; c.prototype.confirm = function (e, t) { this.isLoaded = e; this.emit("confirm", this, t) }; var h = {}; p.prototype = new n; p.prototype.check = function () { if (this.isChecked) { return } var e = new Image; r.bind(e, "load", this); r.bind(e, "error", this); e.src = this.src; this.isChecked = true }; p.prototype.handleEvent = function (e) { var t = "on" + e.type; if (this[t]) { this[t](e) } }; p.prototype.onload = function (e) { this.confirm(true, "onload"); this.unbindProxyEvents(e) }; p.prototype.onerror = function (e) { this.confirm(false, "onerror"); this.unbindProxyEvents(e) }; p.prototype.confirm = function (e, t) { this.isConfirmed = true; this.isLoaded = e; this.emit("confirm", this, t) }; p.prototype.unbindProxyEvents = function (e) { r.unbind(e.target, "load", this); r.unbind(e.target, "error", this) }; return l })

        

        

                /*

                * jQuery cookie

                */

                HawkSearch.jQuery.cookie = function (name, value, options) {

                    if (typeof value != 'undefined') { // name and value given, set cookie

                        options = options || {

                        };

                        if (value === null) {

                            value = '';

                            options.expires = -1;

                        }

                        var expires = '';

                        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {

                            var date;

                            if (typeof options.expires == 'number') {

                                date = new Date();

                                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));

                            } else {

                                date = options.expires;

                            }

                            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE

                        }

                        // CAUTION: Needed to parenthesize options.path and options.domain

                        // in the following expressions, otherwise they evaluate to undefined

                        // in the packed version for some reason...

                        var path = options.path ? '; path=' + (options.path) : '';

                        var domain = options.domain ? '; domain=' + (options.domain) : '';

                        var secure = options.secure ? '; secure' : '';

                        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');

                    } else { // only name given, get cookie

                        var cookieValue = null;

                        if (document.cookie && document.cookie != '') {

                            var cookies = document.cookie.split(';');

                            for (var i = 0; i < cookies.length; i++) {

                                var cookie = $.trim(cookies[i]);

                                // Does this cookie string begin with the name we want?

                                if (cookie.substring(0, name.length + 1) == (name + '=')) {

                                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

                                    break;

                                }

                            }

                        }

                        return cookieValue;

                    }

                };

        

        

                // register indexOf() method if browser does not natively support it

                // this algorithm is exactly as specified in ECMA-262 standard, 5th edition, assuming Object, TypeError, Number, Math.floor, Math.abs, and Math.max have their original value.  

                // see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf for more details

                if (!Array.prototype.indexOf) {

                    Array.prototype.indexOf = function (searchElement /*, fromIndex */) {

                        "use strict";

                        if (this == null) {

                            throw new TypeError();

                        }

                        var t = Object(this);

                        var len = t.length >>> 0;

                        if (len === 0) {

                            return -1;

                        }

                        var n = 0;

                        if (arguments.length > 0) {

                            n = Number(arguments[1]);

                            if (n != n) { // shortcut for verifying if it's NaN

                                n = 0;

                            } else if (n != 0 && n != Infinity && n != -Infinity) {

                                n = (n > 0 || -1) * Math.floor(Math.abs(n));

                            }

                        }

                        if (n >= len) {

                            return -1;

                        }

                        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

                        for (; k < len; k++) {

                            if (k in t && t[k] === searchElement) {

                                return k;

                            }

                        }

                        return -1;

                    }

                };

        

                // if bootstrap3 is already on the site, do not load this bootstrap.

                if (!bootstrap3_enabled) {

                    log("Loading: local bootstrap");

        

                    /**

                    * Bootstrap.js by @fat & @mdo

                    * plugins: bootstrap-modal.js, bootstrap-tooltip.js, bootstrap-popover.js

                    * Copyright 2013 Twitter, Inc.

                    * http://www.apache.org/licenses/LICENSE-2.0.txt

                    */

                    !function (a) { var b = function (b, c) { this.options = c, this.$element = a(b).delegate('[data-dismiss="modal"]', "click.dismiss.modal", a.proxy(this.hide, this)), this.options.remote && this.$element.find(".modal-body").load(this.options.remote) }; b.prototype = { constructor: b, toggle: function () { return this[this.isShown ? "hide" : "show"]() }, show: function () { var b = this, c = a.Event("show"); this.$element.trigger(c); if (this.isShown || c.isDefaultPrevented()) return; this.isShown = !0, this.escape(), this.backdrop(function () { var c = a.support.transition && b.$element.hasClass("fade"); b.$element.parent().length || b.$element.appendTo(document.body), b.$element.show(), c && b.$element[0].offsetWidth, b.$element.addClass("in").attr("aria-hidden", !1), b.enforceFocus(), c ? b.$element.one(a.support.transition.end, function () { b.$element.focus().trigger("shown") }) : b.$element.focus().trigger("shown") }) }, hide: function (b) { b && b.preventDefault(); var c = this; b = a.Event("hide"), this.$element.trigger(b); if (!this.isShown || b.isDefaultPrevented()) return; this.isShown = !1, this.escape(), a(document).off("focusin.modal"), this.$element.removeClass("in").attr("aria-hidden", !0), a.support.transition && this.$element.hasClass("fade") ? this.hideWithTransition() : this.hideModal() }, enforceFocus: function () { var b = this; a(document).on("focusin.modal", function (a) { b.$element[0] !== a.target && !b.$element.has(a.target).length && b.$element.focus() }) }, escape: function () { var a = this; this.isShown && this.options.keyboard ? this.$element.on("keyup.dismiss.modal", function (b) { b.which == 27 && a.hide() }) : this.isShown || this.$element.off("keyup.dismiss.modal") }, hideWithTransition: function () { var b = this, c = setTimeout(function () { b.$element.off(a.support.transition.end), b.hideModal() }, 500); this.$element.one(a.support.transition.end, function () { clearTimeout(c), b.hideModal() }) }, hideModal: function () { var a = this; this.$element.hide(), this.backdrop(function () { a.removeBackdrop(), a.$element.trigger("hidden") }) }, removeBackdrop: function () { this.$backdrop && this.$backdrop.remove(), this.$backdrop = null }, backdrop: function (b) { var c = this, d = this.$element.hasClass("fade") ? "fade" : ""; if (this.isShown && this.options.backdrop) { var e = a.support.transition && d; this.$backdrop = a('<div class="modal-backdrop ' + d + '" />').appendTo(document.body), this.$backdrop.click(this.options.backdrop == "static" ? a.proxy(this.$element[0].focus, this.$element[0]) : a.proxy(this.hide, this)), e && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"); if (!b) return; e ? this.$backdrop.one(a.support.transition.end, b) : b() } else !this.isShown && this.$backdrop ? (this.$backdrop.removeClass("in"), a.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one(a.support.transition.end, b) : b()) : b && b() } }; var c = a.fn.modal; a.fn.modal = function (c) { return this.each(function () { var d = a(this), e = d.data("modal"), f = a.extend({}, a.fn.modal.defaults, d.data(), typeof c == "object" && c); e || d.data("modal", e = new b(this, f)), typeof c == "string" ? e[c]() : f.show && e.show() }) }, a.fn.modal.defaults = { backdrop: !0, keyboard: !0, show: !0 }, a.fn.modal.Constructor = b, a.fn.modal.noConflict = function () { return a.fn.modal = c, this }, a(document).on("click.modal.data-api", '[data-toggle="modal"]', function (b) { var c = a(this), d = c.attr("href"), e = a(c.attr("data-target") || d && d.replace(/.*(?=#[^\s]+$)/, "")), f = e.data("modal") ? "toggle" : a.extend({ remote: !/#/.test(d) && d }, e.data(), c.data()); b.preventDefault(), e.modal(f).one("hide", function () { c.focus() }) }) }(jQuery), !function (a) { var b = function (a, b) { this.init("tooltip", a, b) }; b.prototype = { constructor: b, init: function (b, c, d) { var e, f, g, h, i; this.type = b, this.$element = a(c), this.options = this.getOptions(d), this.enabled = !0, g = this.options.trigger.split(" "); for (i = g.length; i--;) h = g[i], h == "click" ? this.$element.on("click." + this.type, this.options.selector, a.proxy(this.toggle, this)) : h != "manual" && (e = h == "hover" ? "mouseenter" : "focus", f = h == "hover" ? "mouseleave" : "blur", this.$element.on(e + "." + this.type, this.options.selector, a.proxy(this.enter, this)), this.$element.on(f + "." + this.type, this.options.selector, a.proxy(this.leave, this))); this.options.selector ? this._options = a.extend({}, this.options, { trigger: "manual", selector: "" }) : this.fixTitle() }, getOptions: function (b) { return b = a.extend({}, a.fn[this.type].defaults, this.$element.data(), b), b.delay && typeof b.delay == "number" && (b.delay = { show: b.delay, hide: b.delay }), b }, enter: function (b) { var c = a.fn[this.type].defaults, d = {}, e; this._options && a.each(this._options, function (a, b) { c[a] != b && (d[a] = b) }, this), e = a(b.currentTarget)[this.type](d).data(this.type); if (!e.options.delay || !e.options.delay.show) return e.show(); clearTimeout(this.timeout), e.hoverState = "in", this.timeout = setTimeout(function () { e.hoverState == "in" && e.show() }, e.options.delay.show) }, leave: function (b) { var c = a(b.currentTarget)[this.type](this._options).data(this.type); this.timeout && clearTimeout(this.timeout); if (!c.options.delay || !c.options.delay.hide) return c.hide(); c.hoverState = "out", this.timeout = setTimeout(function () { c.hoverState == "out" && c.hide() }, c.options.delay.hide) }, show: function () { var b, c, d, e, f, g, h = a.Event("show"); if (this.hasContent() && this.enabled) { this.$element.trigger(h); if (h.isDefaultPrevented()) return; b = this.tip(), this.setContent(), this.options.animation && b.addClass("fade"), f = typeof this.options.placement == "function" ? this.options.placement.call(this, b[0], this.$element[0]) : this.options.placement, b.detach().css({ top: 0, left: 0, display: "block" }), this.options.container ? b.appendTo(this.options.container) : b.insertAfter(this.$element), c = this.getPosition(), d = b[0].offsetWidth, e = b[0].offsetHeight; switch (f) { case "bottom": g = { top: c.top + c.height, left: c.left + c.width / 2 - d / 2 }; break; case "top": g = { top: c.top - e, left: c.left + c.width / 2 - d / 2 }; break; case "left": g = { top: c.top + c.height / 2 - e / 2, left: c.left - d }; break; case "right": g = { top: c.top + c.height / 2 - e / 2, left: c.left + c.width } } this.applyPlacement(g, f), this.$element.trigger("shown") } }, applyPlacement: function (a, b) { var c = this.tip(), d = c[0].offsetWidth, e = c[0].offsetHeight, f, g, h, i; c.offset(a).addClass(b).addClass("in"), f = c[0].offsetWidth, g = c[0].offsetHeight, b == "top" && g != e && (a.top = a.top + e - g, i = !0), b == "bottom" || b == "top" ? (h = 0, a.left < 0 && (h = a.left * -2, a.left = 0, c.offset(a), f = c[0].offsetWidth, g = c[0].offsetHeight), this.replaceArrow(h - d + f, f, "left")) : this.replaceArrow(g - e, g, "top"), i && c.offset(a) }, replaceArrow: function (a, b, c) { this.arrow().css(c, a ? 50 * (1 - a / b) + "%" : "") }, setContent: function () { var a = this.tip(), b = this.getTitle(); a.find(".tooltip-inner")[this.options.html ? "html" : "text"](b), a.removeClass("fade in top bottom left right") }, hide: function () { function e() { var b = setTimeout(function () { c.off(a.support.transition.end).detach() }, 500); c.one(a.support.transition.end, function () { clearTimeout(b), c.detach() }) } var b = this, c = this.tip(), d = a.Event("hide"); this.$element.trigger(d); if (d.isDefaultPrevented()) return; return c.removeClass("in"), a.support.transition && this.$tip.hasClass("fade") ? e() : c.detach(), this.$element.trigger("hidden"), this }, fixTitle: function () { var a = this.$element; (a.attr("title") || typeof a.attr("data-original-title") != "string") && a.attr("data-original-title", a.attr("title") || "").attr("title", "") }, hasContent: function () { return this.getTitle() }, getPosition: function () { var b = this.$element[0]; return a.extend({}, typeof b.getBoundingClientRect == "function" ? b.getBoundingClientRect() : { width: b.offsetWidth, height: b.offsetHeight }, this.$element.offset()) }, getTitle: function () { var a, b = this.$element, c = this.options; return a = b.attr("data-original-title") || (typeof c.title == "function" ? c.title.call(b[0]) : c.title), a }, tip: function () { return this.$tip = this.$tip || a(this.options.template) }, arrow: function () { return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow") }, validate: function () { this.$element[0].parentNode || (this.hide(), this.$element = null, this.options = null) }, enable: function () { this.enabled = !0 }, disable: function () { this.enabled = !1 }, toggleEnabled: function () { this.enabled = !this.enabled }, toggle: function (b) { var c = b ? a(b.currentTarget)[this.type](this._options).data(this.type) : this; c.tip().hasClass("in") ? c.hide() : c.show() }, destroy: function () { this.hide().$element.off("." + this.type).removeData(this.type) } }; var c = a.fn.tooltip; a.fn.tooltip = function (c) { return this.each(function () { var d = a(this), e = d.data("tooltip"), f = typeof c == "object" && c; e || d.data("tooltip", e = new b(this, f)), typeof c == "string" && e[c]() }) }, a.fn.tooltip.Constructor = b, a.fn.tooltip.defaults = { animation: !0, placement: "top", selector: !1, template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>', trigger: "hover focus", title: "", delay: 0, html: !1, container: !1 }, a.fn.tooltip.noConflict = function () { return a.fn.tooltip = c, this } }(jQuery), !function (e) { "use strict"; var t = function (t, n) { this.$element = e(t), this.options = e.extend({}, e.fn.collapse.defaults, n), this.options.parent && (this.$parent = e(this.options.parent)), this.options.toggle && this.toggle() }; t.prototype = { constructor: t, dimension: function () { var e = this.$element.hasClass("width"); return e ? "width" : "height" }, show: function () { var t, n, r, i; if (this.transitioning || this.$element.hasClass("in")) return; t = this.dimension(), n = e.camelCase(["scroll", t].join("-")), r = this.$parent && this.$parent.find("> .accordion-group > .in"); if (r && r.length) { i = r.data("collapse"); if (i && i.transitioning) return; r.collapse("hide"), i || r.data("collapse", null) } this.$element[t](0), this.transition("addClass", e.Event("show"), "shown"), e.support.transition && this.$element[t](this.$element[0][n]) }, hide: function () { var t; if (this.transitioning || !this.$element.hasClass("in")) return; t = this.dimension(), this.reset(this.$element[t]()), this.transition("removeClass", e.Event("hide"), "hidden"), this.$element[t](0) }, reset: function (e) { var t = this.dimension(); return this.$element.removeClass("collapse")[t](e || "auto")[0].offsetWidth, this.$element[e !== null ? "addClass" : "removeClass"]("collapse"), this }, transition: function (t, n, r) { var i = this, s = function () { n.type == "show" && i.reset(), i.transitioning = 0, i.$element.trigger(r) }; this.$element.trigger(n); if (n.isDefaultPrevented()) return; this.transitioning = 1, this.$element[t]("in"), e.support.transition && this.$element.hasClass("collapse") ? this.$element.one(e.support.transition.end, s) : s() }, toggle: function () { this[this.$element.hasClass("in") ? "hide" : "show"]() } }; var n = e.fn.collapse; e.fn.collapse = function (n) { return this.each(function () { var r = e(this), i = r.data("collapse"), s = e.extend({}, e.fn.collapse.defaults, r.data(), typeof n == "object" && n); i || r.data("collapse", i = new t(this, s)), typeof n == "string" && i[n]() }) }, e.fn.collapse.defaults = { toggle: !0 }, e.fn.collapse.Constructor = t, e.fn.collapse.noConflict = function () { return e.fn.collapse = n, this }, e(document).on("click.collapse.data-api", "[data-toggle=collapse]", function (t) { var n = e(this), r, i = n.attr("data-target") || t.preventDefault() || (r = n.attr("href")) && r.replace(/.*(?=#[^\s]+$)/, ""), s = e(i).data("collapse") ? "toggle" : n.data(); n[e(i).hasClass("in") ? "addClass" : "removeClass"]("collapsed"), e(i).collapse(s) }) }(jQuery), !function (a) { var b = function (a, b) { this.init("popover", a, b) }; b.prototype = a.extend({}, a.fn.tooltip.Constructor.prototype, { constructor: b, setContent: function () { var a = this.tip(), b = this.getTitle(), c = this.getContent(); a.find(".popover-title")[this.options.html ? "html" : "text"](b), a.find(".popover-content")[this.options.html ? "html" : "text"](c), a.removeClass("fade top bottom left right in") }, hasContent: function () { return this.getTitle() || this.getContent() }, getContent: function () { var a, b = this.$element, c = this.options; return a = (typeof c.content == "function" ? c.content.call(b[0]) : c.content) || b.attr("data-content"), a }, tip: function () { return this.$tip || (this.$tip = a(this.options.template)), this.$tip }, destroy: function () { this.hide().$element.off("." + this.type).removeData(this.type) } }); var c = a.fn.popover; a.fn.popover = function (c) { return this.each(function () { var d = a(this), e = d.data("popover"), f = typeof c == "object" && c; e || d.data("popover", e = new b(this, f)), typeof c == "string" && e[c]() }) }, a.fn.popover.Constructor = b, a.fn.popover.defaults = a.extend({}, a.fn.tooltip.defaults, { placement: "right", trigger: "click", content: "", template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>' }), a.fn.popover.noConflict = function () { return a.fn.popover = c, this } }(HawkSearch.jQuery)

                }

        

                /* ========================================================================

        		 * Bootstrap: tooltip.js v3.3.4

        		 * http://getbootstrap.com/javascript/#tooltip

        		 * Inspired by the original jQuery.tipsy by Jason Frame

        		 * ========================================================================

        		 * Copyright 2011-2015 Twitter, Inc.

        		 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)

        		 * ======================================================================== */

                +function (e) {

                    var d = function (b, a) {

                        this.$element = this.hoverState = this.timeout = this.enabled = this.options = this.type = null; this.init("tooltip", b, a)

                    }; d.VERSION = "3.3.4"; d.TRANSITION_DURATION = 150; d.DEFAULTS = {

                        animation: !0, placement: "top", selector: !1, template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>', trigger: "hover focus", title: "", delay: 0, html: !1, container: !1, viewport: { selector: "body", padding: 0 }

                    }; d.prototype.init = function (b, a, c) {

                        this.enabled =

                        !0; this.type = b; this.$element = e(a); this.options = this.getOptions(c); this.$viewport = this.options.viewport && e(this.options.viewport.selector || this.options.viewport); if (this.$element[0] instanceof document.constructor && !this.options.selector) throw Error("`selector` option must be specified when initializing " + this.type + " on the window.document object!"); b = this.options.trigger.split(" "); for (a = b.length; a--;) if (c = b[a], "click" == c) this.$element.on("click." + this.type, this.options.selector, e.proxy(this.toggle,

                        this)); else if ("manual" != c) {

                            var f = "hover" == c ? "mouseleave" : "focusout"; this.$element.on(("hover" == c ? "mouseenter" : "focusin") + "." + this.type, this.options.selector, e.proxy(this.enter, this)); this.$element.on(f + "." + this.type, this.options.selector, e.proxy(this.leave, this))

                        } this.options.selector ? this._options = e.extend({}, this.options, { trigger: "manual", selector: "" }) : this.fixTitle()

                    }; d.prototype.getDefaults = function () {

                        return d.DEFAULTS

                    }; d.prototype.getOptions = function (b) {

                        b = e.extend({

                        }, this.getDefaults(), this.$element.data(),

                        b); b.delay && "number" == typeof b.delay && (b.delay = { show: b.delay, hide: b.delay }); return b

                    }; d.prototype.getDelegateOptions = function () {

                        var b = {}, a = this.getDefaults(); this._options && e.each(this._options, function (c, f) { a[c] != f && (b[c] = f) }); return b

                    }; d.prototype.enter = function (b) {

                        var a = b instanceof this.constructor ? b : e(b.currentTarget).data("bs." + this.type); if (a && a.$tip && a.$tip.is(":visible")) a.hoverState = "in"; else {

                            a || (a = new this.constructor(b.currentTarget, this.getDelegateOptions()), e(b.currentTarget).data("bs." +

                            this.type, a)); clearTimeout(a.timeout); a.hoverState = "in"; if (!a.options.delay || !a.options.delay.show) return a.show(); a.timeout = setTimeout(function () { "in" == a.hoverState && a.show() }, a.options.delay.show)

                        }

                    }; d.prototype.leave = function (b) {

                        var a = b instanceof this.constructor ? b : e(b.currentTarget).data("bs." + this.type); a || (a = new this.constructor(b.currentTarget, this.getDelegateOptions()), e(b.currentTarget).data("bs." + this.type, a)); clearTimeout(a.timeout); a.hoverState = "out"; if (!a.options.delay || !a.options.delay.hide) return a.hide();

                        a.timeout = setTimeout(function () { "out" == a.hoverState && a.hide() }, a.options.delay.hide)

                    }; d.prototype.show = function () {

                        var b = e.Event("show.bs." + this.type); if (this.hasContent() && this.enabled) {

                            this.$element.trigger(b); var a = e.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]); if (!b.isDefaultPrevented() && a) {

                                var c = this, b = this.tip(), a = this.getUID(this.type); this.setContent(); b.attr("id", a); this.$element.attr("aria-describedby", a); this.options.animation && b.addClass("fade"); var a = "function" ==

                                typeof this.options.placement ? this.options.placement.call(this, b[0], this.$element[0]) : this.options.placement, f = /\s?auto?\s?/i, l = f.test(a); l && (a = a.replace(f, "") || "top"); b.detach().css({ top: 0, left: 0, display: "block" }).addClass(a).data("bs." + this.type, this); this.options.container ? b.appendTo(this.options.container) : b.insertAfter(this.$element); var f = this.getPosition(), h = b[0].offsetWidth, g = b[0].offsetHeight; if (l) {

                                    var l = a, k = this.options.container ? e(this.options.container) : this.$element.parent(), k = this.getPosition(k),

                                    a = "bottom" == a && f.bottom + g > k.bottom ? "top" : "top" == a && f.top - g < k.top ? "bottom" : "right" == a && f.right + h > k.width ? "left" : "left" == a && f.left - h < k.left ? "right" : a; b.removeClass(l).addClass(a)

                                } f = this.getCalculatedOffset(a, f, h, g); this.applyPlacement(f, a); a = function () {

                                    var a = c.hoverState; c.$element.trigger("shown.bs." + c.type); c.hoverState = null; "out" == a && c.leave(c)

                                }; e.support.transition && this.$tip.hasClass("fade") ? b.one("bsTransitionEnd", a).emulateTransitionEnd(d.TRANSITION_DURATION) : a()

                            }

                        }

                    }; d.prototype.applyPlacement =

                    function (b, a) {

                        var c = this.tip(), f = c[0].offsetWidth, d = c[0].offsetHeight, h = parseInt(c.css("margin-top"), 10), g = parseInt(c.css("margin-left"), 10); isNaN(h) && (h = 0); isNaN(g) && (g = 0); b.top += h; b.left += g; e.offset.setOffset(c[0], e.extend({ using: function (a) { c.css({ top: Math.round(a.top), left: Math.round(a.left) }) } }, b), 0); c.addClass("in"); var g = c[0].offsetWidth, k = c[0].offsetHeight; "top" == a && k != d && (b.top = b.top + d - k); var m = this.getViewportAdjustedDelta(a, b, g, k); m.left ? b.left += m.left : b.top += m.top; f = (h = /top|bottom/.test(a)) ?

                        2 * m.left - f + g : 2 * m.top - d + k; d = h ? "offsetWidth" : "offsetHeight"; c.offset(b); this.replaceArrow(f, c[0][d], h)

                    }; d.prototype.replaceArrow = function (b, a, c) {

                        this.arrow().css(c ? "left" : "top", 50 * (1 - b / a) + "%").css(c ? "top" : "left", "")

                    }; d.prototype.setContent = function () {

                        var b = this.tip(), a = this.getTitle(); b.find(".tooltip-inner")[this.options.html ? "html" : "text"](a); b.removeClass("fade in top bottom left right")

                    }; d.prototype.hide = function (b) {

                        function a() {

                            "in" != c.hoverState && f.detach(); c.$element.removeAttr("aria-describedby").trigger("hidden.bs." +

                            c.type); b && b()

                        } var c = this, f = e(this.$tip), l = e.Event("hide.bs." + this.type); this.$element.trigger(l); if (!l.isDefaultPrevented()) return f.removeClass("in"), e.support.transition && f.hasClass("fade") ? f.one("bsTransitionEnd", a).emulateTransitionEnd(d.TRANSITION_DURATION) : a(), this.hoverState = null, this

                    }; d.prototype.fixTitle = function () {

                        var b = this.$element; (b.attr("title") || "string" != typeof b.attr("data-original-title")) && b.attr("data-original-title", b.attr("title") || "").attr("title", "")

                    }; d.prototype.hasContent =

                    function () {

                        return this.getTitle()

                    }; d.prototype.getPosition = function (b) {

                        b = b || this.$element; var a = b[0], c = "BODY" == a.tagName, a = a.getBoundingClientRect(); null == a.width && (a = e.extend({}, a, { width: a.right - a.left, height: a.bottom - a.top })); var d = c ? { top: 0, left: 0 } : b.offset(); b = { scroll: c ? document.documentElement.scrollTop || document.body.scrollTop : b.scrollTop() }; c = c ? { width: e(window).width(), height: e(window).height() } : null; return e.extend({}, a, b, c, d)

                    }; d.prototype.getCalculatedOffset = function (b, a, c, d) {

                        return "bottom" ==

                        b ? { top: a.top + a.height, left: a.left + a.width / 2 - c / 2 } : "top" == b ? { top: a.top - d, left: a.left + a.width / 2 - c / 2 } : "left" == b ? { top: a.top + a.height / 2 - d / 2, left: a.left - c } : {

                            top: a.top + a.height / 2 - d / 2, left: a.left + a.width

                        }

                    }; d.prototype.getViewportAdjustedDelta = function (b, a, c, d) {

                        var e = {

                            top: 0, left: 0

                        }; if (!this.$viewport) return e; var h = this.options.viewport && this.options.viewport.padding || 0, g = this.getPosition(this.$viewport); /right|left/.test(b) ? (c = a.top - h - g.scroll, a = a.top + h - g.scroll + d, c < g.top ? e.top = g.top - c : a > g.top + g.height && (e.top =

                        g.top + g.height - a)) : (d = a.left - h, a = a.left + h + c, d < g.left ? e.left = g.left - d : a > g.width && (e.left = g.left + g.width - a)); return e

                    }; d.prototype.getTitle = function () {

                        var b = this.$element, a = this.options; return b.attr("data-original-title") || ("function" == typeof a.title ? a.title.call(b[0]) : a.title)

                    }; d.prototype.getUID = function (b) {

                        do b += ~~(1E6 * Math.random()); while (document.getElementById(b)); return b

                    }; d.prototype.tip = function () {

                        return this.$tip = this.$tip || e(this.options.template)

                    }; d.prototype.arrow = function () {

                        return this.$arrow =

                        this.$arrow || this.tip().find(".tooltip-arrow")

                    }; d.prototype.enable = function () {

                        this.enabled = !0

                    }; d.prototype.disable = function () {

                        this.enabled = !1

                    }; d.prototype.toggleEnabled = function () {

                        this.enabled = !this.enabled

                    }; d.prototype.toggle = function (b) {

                        var a = this; b && (a = e(b.currentTarget).data("bs." + this.type), a || (a = new this.constructor(b.currentTarget, this.getDelegateOptions()), e(b.currentTarget).data("bs." + this.type, a))); a.tip().hasClass("in") ? a.leave(a) : a.enter(a)

                    }; d.prototype.destroy = function () {

                        var b = this; clearTimeout(this.timeout);

                        this.hide(function () { b.$element.off("." + b.type).removeData("bs." + b.type) })

                    }; var n = e.fn.tooltip; e.fn.tooltip = function (b) {

                        return this.each(function () { var a = e(this), c = a.data("bs.tooltip"), f = "object" == typeof b && b; if (c || !/destroy|hide/.test(b)) if (c || a.data("bs.tooltip", c = new d(this, f)), "string" == typeof b) c[b]() })

                    }; e.fn.tooltip.Constructor = d; e.fn.tooltip.noConflict = function () {

                        e.fn.tooltip = n; return this

                    }

                }(jQuery);

        

        

                /* ========================================================================

        		 * Bootstrap: popover.js v3.3.4

        		 * http://getbootstrap.com/javascript/#popovers

        		 * ========================================================================

        		 * Copyright 2011-2015 Twitter, Inc.

        		 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)

        		 * ======================================================================== */

                +function (b) {

                    var a = function (c, a) {

                        this.init("popover", c, a)

                    }; if (!b.fn.tooltip) throw Error("Popover requires tooltip.js"); a.VERSION = "3.3.4"; a.DEFAULTS = b.extend({}, b.fn.tooltip.Constructor.DEFAULTS, { placement: "right", trigger: "click", content: "", template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>' }); a.prototype = b.extend({}, b.fn.tooltip.Constructor.prototype); a.prototype.constructor = a; a.prototype.getDefaults = function () {

                        return a.DEFAULTS

                    };

                    a.prototype.setContent = function () {

                        var c = this.tip(), a = this.getTitle(), b = this.getContent(); c.find(".popover-title")[this.options.html ? "html" : "text"](a); c.find(".popover-content").children().detach().end()[this.options.html ? "string" == typeof b ? "html" : "append" : "text"](b); c.removeClass("fade top bottom left right in"); c.find(".popover-title").html() || c.find(".popover-title").hide()

                    }; a.prototype.hasContent = function () {

                        return this.getTitle() || this.getContent()

                    }; a.prototype.getContent = function () {

                        var a = this.$element,

                        b = this.options; return a.attr("data-content") || ("function" == typeof b.content ? b.content.call(a[0]) : b.content)

                    }; a.prototype.arrow = function () {

                        return this.$arrow = this.$arrow || this.tip().find(".arrow")

                    }; var e = b.fn.popover; b.fn.popover = function (c) {

                        return this.each(function () { var f = b(this), d = f.data("bs.popover"), e = "object" == typeof c && c; if (d || !/destroy|hide/.test(c)) if (d || f.data("bs.popover", d = new a(this, e)), "string" == typeof c) d[c]() })

                    }; b.fn.popover.Constructor = a; b.fn.popover.noConflict = function () {

                        b.fn.popover =

                    e; return this

                    }

                }(jQuery);

        

        

                /**

                 * bootbox.js v4.2.0

                 *

                 * http://bootboxjs.com/license.txt

                 */

                !function (a, b) { "use strict"; "function" == typeof define && define.amd ? define(["jquery"], b) : "object" == typeof exports ? module.exports = b(require("jquery")) : HawkSearch.bootbox = b(HawkSearch.jQuery) }(this, function a(b, c) { "use strict"; function d(a) { var b = q[o.locale]; return b ? b[a] : q.en[a] } function e(a, c, d) { a.stopPropagation(), a.preventDefault(); var e = b.isFunction(d) && d(a) === !1; e || c.modal("hide") } function f(a) { var b, c = 0; for (b in a) c++; return c } function g(a, c) { var d = 0; b.each(a, function (a, b) { c(a, b, d++) }) } function h(a) { var c, d; if ("object" != typeof a) throw new Error("Please supply an object of options"); if (!a.message) throw new Error("Please specify a message"); return a = b.extend({}, o, a), a.buttons || (a.buttons = {}), a.backdrop = a.backdrop ? "static" : !1, c = a.buttons, d = f(c), g(c, function (a, e, f) { if (b.isFunction(e) && (e = c[a] = { callback: e }), "object" !== b.type(e)) throw new Error("button with key " + a + " must be an object"); e.label || (e.label = a), e.className || (e.className = 2 >= d && f === d - 1 ? "btn-primary" : "btn-default") }), a } function i(a, b) { var c = a.length, d = {}; if (1 > c || c > 2) throw new Error("Invalid argument length"); return 2 === c || "string" == typeof a[0] ? (d[b[0]] = a[0], d[b[1]] = a[1]) : d = a[0], d } function j(a, c, d) { return b.extend(!0, {}, a, i(c, d)) } function k(a, b, c, d) { var e = { className: "bootbox-" + a, buttons: l.apply(null, b) }; return m(j(e, d, c), b) } function l() { for (var a = {}, b = 0, c = arguments.length; c > b; b++) { var e = arguments[b], f = e.toLowerCase(), g = e.toUpperCase(); a[f] = { label: d(g) } } return a } function m(a, b) { var d = {}; return g(b, function (a, b) { d[b] = !0 }), g(a.buttons, function (a) { if (d[a] === c) throw new Error("button key " + a + " is not allowed (options are " + b.join("\n") + ")") }), a } var n = { dialog: "<div class='bootbox modal' tabindex='-1' role='dialog'><div class='modal-dialog'><div class='modal-content'><div class='modal-body'><div class='bootbox-body'></div></div></div></div></div>", header: "<div class='modal-header'><h4 class='modal-title'></h4></div>", footer: "<div class='modal-footer'></div>", closeButton: "<button type='button' class='bootbox-close-button close' data-dismiss='modal' aria-hidden='true'>&times;</button>", form: "<form class='bootbox-form'></form>", inputs: { text: "<input class='bootbox-input bootbox-input-text form-control' autocomplete=off type=text />", textarea: "<textarea class='bootbox-input bootbox-input-textarea form-control'></textarea>", email: "<input class='bootbox-input bootbox-input-email form-control' autocomplete='off' type='email' />", select: "<select class='bootbox-input bootbox-input-select form-control'></select>", checkbox: "<div class='checkbox'><label><input class='bootbox-input bootbox-input-checkbox' type='checkbox' /></label></div>", date: "<input class='bootbox-input bootbox-input-date form-control' autocomplete=off type='date' />", time: "<input class='bootbox-input bootbox-input-time form-control' autocomplete=off type='time' />", number: "<input class='bootbox-input bootbox-input-number form-control' autocomplete=off type='number' />", password: "<input class='bootbox-input bootbox-input-password form-control' autocomplete='off' type='password' />" } }, o = { locale: "en", backdrop: !0, animate: !0, className: null, closeButton: !0, show: !0, container: "body" }, p = {}; p.alert = function () { var a; if (a = k("alert", ["ok"], ["message", "callback"], arguments), a.callback && !b.isFunction(a.callback)) throw new Error("alert requires callback property to be a function when provided"); return a.buttons.ok.callback = a.onEscape = function () { return b.isFunction(a.callback) ? a.callback() : !0 }, p.dialog(a) }, p.confirm = function () { var a; if (a = k("confirm", ["cancel", "confirm"], ["message", "callback"], arguments), a.buttons.cancel.callback = a.onEscape = function () { return a.callback(!1) }, a.buttons.confirm.callback = function () { return a.callback(!0) }, !b.isFunction(a.callback)) throw new Error("confirm requires a callback"); return p.dialog(a) }, p.prompt = function () { var a, d, e, f, h, i, k; f = b(n.form), d = { className: "bootbox-prompt", buttons: l("cancel", "confirm"), value: "", inputType: "text" }, a = m(j(d, arguments, ["title", "callback"]), ["cancel", "confirm"]), i = a.show === c ? !0 : a.show; var o = ["date", "time", "number"], q = document.createElement("input"); if (q.setAttribute("type", a.inputType), o[a.inputType] && (a.inputType = q.type), a.message = f, a.buttons.cancel.callback = a.onEscape = function () { return a.callback(null) }, a.buttons.confirm.callback = function () { var c; switch (a.inputType) { case "text": case "textarea": case "email": case "select": case "date": case "time": case "number": case "password": c = h.val(); break; case "checkbox": var d = h.find("input:checked"); c = [], g(d, function (a, d) { c.push(b(d).val()) }) } return a.callback(c) }, a.show = !1, !a.title) throw new Error("prompt requires a title"); if (!b.isFunction(a.callback)) throw new Error("prompt requires a callback"); if (!n.inputs[a.inputType]) throw new Error("invalid prompt type"); switch (h = b(n.inputs[a.inputType]), a.inputType) { case "text": case "textarea": case "email": case "date": case "time": case "number": case "password": h.val(a.value); break; case "select": var r = {}; if (k = a.inputOptions || [], !k.length) throw new Error("prompt with select requires options"); g(k, function (a, d) { var e = h; if (d.value === c || d.text === c) throw new Error("given options in wrong format"); d.group && (r[d.group] || (r[d.group] = b("<optgroup/>").attr("label", d.group)), e = r[d.group]), e.append("<option value='" + d.value + "'>" + d.text + "</option>") }), g(r, function (a, b) { h.append(b) }), h.val(a.value); break; case "checkbox": var s = b.isArray(a.value) ? a.value : [a.value]; if (k = a.inputOptions || [], !k.length) throw new Error("prompt with checkbox requires options"); if (!k[0].value || !k[0].text) throw new Error("given options in wrong format"); h = b("<div/>"), g(k, function (c, d) { var e = b(n.inputs[a.inputType]); e.find("input").attr("value", d.value), e.find("label").append(d.text), g(s, function (a, b) { b === d.value && e.find("input").prop("checked", !0) }), h.append(e) }) } return a.placeholder && h.attr("placeholder", a.placeholder), a.pattern && h.attr("pattern", a.pattern), f.append(h), f.on("submit", function (a) { a.preventDefault(), e.find(".btn-primary").click() }), e = p.dialog(a), e.off("shown.bs.modal"), e.on("shown.bs.modal", function () { h.focus() }), i === !0 && e.modal("show"), e }, p.dialog = function (a) { a = h(a); var c = b(n.dialog), d = c.find(".modal-body"), f = a.buttons, i = "", j = { onEscape: a.onEscape }; if (g(f, function (a, b) { i += "<button data-bb-handler='" + a + "' type='button' class='btn " + b.className + "'>" + b.label + "</button>", j[a] = b.callback }), d.find(".bootbox-body").html(a.message), a.animate === !0 && c.addClass("fade"), a.className && c.addClass(a.className), a.title && d.before(n.header), a.closeButton) { var k = b(n.closeButton); a.title ? c.find(".modal-header").prepend(k) : k.css("margin-top", "-10px").prependTo(d) } return a.title && c.find(".modal-title").html(a.title), i.length && (d.after(n.footer), c.find(".modal-footer").html(i)), c.on("hidden.bs.modal", function (a) { a.target === this && c.remove() }), c.on("shown.bs.modal", function () { c.find(".btn-primary:first").focus() }), c.on("escape.close.bb", function (a) { j.onEscape && e(a, c, j.onEscape) }), c.on("click", ".modal-footer button", function (a) { var d = b(this).data("bb-handler"); e(a, c, j[d]) }), c.on("click", ".bootbox-close-button", function (a) { e(a, c, j.onEscape) }), c.on("keyup", function (a) { 27 === a.which && c.trigger("escape.close.bb") }), b(a.container).append(c), c.modal({ backdrop: a.backdrop, keyboard: !1, show: !1 }), a.show && c.modal("show"), c }, p.setDefaults = function () { var a = {}; 2 === arguments.length ? a[arguments[0]] = arguments[1] : a = arguments[0], b.extend(o, a) }, p.hideAll = function () { b(".bootbox").modal("hide") }; var q = { br: { OK: "OK", CANCEL: "Cancelar", CONFIRM: "Sim" }, da: { OK: "OK", CANCEL: "Annuller", CONFIRM: "Accepter" }, de: { OK: "OK", CANCEL: "Abbrechen", CONFIRM: "Akzeptieren" }, en: { OK: "OK", CANCEL: "Cancel", CONFIRM: "OK" }, es: { OK: "OK", CANCEL: "Cancelar", CONFIRM: "Aceptar" }, fi: { OK: "OK", CANCEL: "Peruuta", CONFIRM: "OK" }, fr: { OK: "OK", CANCEL: "Annuler", CONFIRM: "D'accord" }, he: { OK: "אישור", CANCEL: "ביטול", CONFIRM: "אישור" }, it: { OK: "OK", CANCEL: "Annulla", CONFIRM: "Conferma" }, lt: { OK: "Gerai", CANCEL: "Atšaukti", CONFIRM: "Patvirtinti" }, lv: { OK: "Labi", CANCEL: "Atcelt", CONFIRM: "Apstiprināt" }, nl: { OK: "OK", CANCEL: "Annuleren", CONFIRM: "Accepteren" }, no: { OK: "OK", CANCEL: "Avbryt", CONFIRM: "OK" }, pl: { OK: "OK", CANCEL: "Anuluj", CONFIRM: "Potwierdź" }, ru: { OK: "OK", CANCEL: "Отмена", CONFIRM: "Применить" }, sv: { OK: "OK", CANCEL: "Avbryt", CONFIRM: "OK" }, tr: { OK: "Tamam", CANCEL: "İptal", CONFIRM: "Onayla" }, zh_CN: { OK: "OK", CANCEL: "取消", CONFIRM: "确认" }, zh_TW: { OK: "OK", CANCEL: "取消", CONFIRM: "確認" } }; return p.init = function (c) { return a(c || b) }, p });

        

                /*

                 * debouncedresize: special jQuery event that happens once after a window resize

                 *

                 * latest version and complete README available on Github:

                 * https://github.com/louisremi/jquery-smartresize

                 *

                 * Copyright 2012 @louis_remi

                 * Licensed under the MIT license.

                 *

                 * This saved you an hour of work? 

                 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON

                 */

                (function ($) {

        

                    var $event = $.event,

                        $special,

                        resizeTimeout;

        

                    $special = $event.special.debouncedresize = {

                        setup: function () {

                            $(this).on("resize", $special.handler);

                        },

                        teardown: function () {

                            $(this).off("resize", $special.handler);

                        },

                        handler: function (event, execAsap) {

                            // Save the context

                            var context = this,

                                args = arguments,

                                dispatch = function () {

                                    // set correct event type

                                    event.type = "debouncedresize";

                                    $event.dispatch.apply(context, args);

                                };

        

                            if (resizeTimeout) {

                                clearTimeout(resizeTimeout);

                            }

        

                            execAsap ?

                                dispatch() :

                                resizeTimeout = setTimeout(dispatch, $special.threshold);

                        },

                        threshold: 150

                    };

        

                })(jQuery);

        

                /*

                     _ _      _       _

                 ___| (_) ___| | __  (_)___

                / __| | |/ __| |/ /  | / __|

                \__ \ | | (__|   < _ | \__ \

                |___/_|_|\___|_|\_(_)/ |___/

                                   |__/

        

                 Version: 1.4.1

                  Author: Ken Wheeler

                 Website: http://kenwheeler.github.io

                    Docs: http://kenwheeler.github.io/slick

                    Repo: http://github.com/kenwheeler/slick

                  Issues: http://github.com/kenwheeler/slick/issues

        

                 */

        

                !function (a) { "use strict"; "function" == typeof define && define.amd ? define(["jquery"], a) : "undefined" != typeof exports ? module.exports = a(require("jquery")) : a(jQuery) }(function (a) {

                    "use strict"; var b = window.Slick || {

                    }; b = function () { function c(c, d) { var f, g, h, e = this; if (e.defaults = { accessibility: !0, adaptiveHeight: !1, appendArrows: a(c), appendDots: a(c), arrows: !0, asNavFor: null, prevArrow: '<button type="button" data-role="none" class="slick-prev">Previous</button>', nextArrow: '<button type="button" data-role="none" class="slick-next">Next</button>', autoplay: !1, autoplaySpeed: 3e3, centerMode: !1, centerPadding: "50px", cssEase: "ease", customPaging: function (a, b) { return '<button type="button" data-role="none">' + (b + 1) + "</button>" }, dots: !1, dotsClass: "slick-dots", draggable: !0, easing: "linear", edgeFriction: .35, fade: !1, focusOnSelect: !1, infinite: !0, initialSlide: 0, lazyLoad: "ondemand", mobileFirst: !1, pauseOnHover: !0, pauseOnDotsHover: !1, respondTo: "window", responsive: null, rtl: !1, slide: "", slidesToShow: 1, slidesToScroll: 1, speed: 500, swipe: !0, swipeToSlide: !1, touchMove: !0, touchThreshold: 5, useCSS: !0, variableWidth: !1, vertical: !1, waitForAnimate: !0 }, e.initials = { animating: !1, dragging: !1, autoPlayTimer: null, currentDirection: 0, currentLeft: null, currentSlide: 0, direction: 1, $dots: null, listWidth: null, listHeight: null, loadIndex: 0, $nextArrow: null, $prevArrow: null, slideCount: null, slideWidth: null, $slideTrack: null, $slides: null, sliding: !1, slideOffset: 0, swipeLeft: null, $list: null, touchObject: {}, transformsEnabled: !1 }, a.extend(e, e.initials), e.activeBreakpoint = null, e.animType = null, e.animProp = null, e.breakpoints = [], e.breakpointSettings = [], e.cssTransitions = !1, e.hidden = "hidden", e.paused = !1, e.positionProp = null, e.respondTo = null, e.shouldClick = !0, e.$slider = a(c), e.$slidesCache = null, e.transformType = null, e.transitionType = null, e.visibilityChange = "visibilitychange", e.windowWidth = 0, e.windowTimer = null, f = a(c).data("slick") || {}, e.options = a.extend({}, e.defaults, f, d), e.currentSlide = e.options.initialSlide, e.originalSettings = e.options, g = e.options.responsive || null, g && g.length > -1) { e.respondTo = e.options.respondTo || "window"; for (h in g) g.hasOwnProperty(h) && (e.breakpoints.push(g[h].breakpoint), e.breakpointSettings[g[h].breakpoint] = g[h].settings); e.breakpoints.sort(function (a, b) { return e.options.mobileFirst === !0 ? a - b : b - a }) } "undefined" != typeof document.mozHidden ? (e.hidden = "mozHidden", e.visibilityChange = "mozvisibilitychange") : "undefined" != typeof document.msHidden ? (e.hidden = "msHidden", e.visibilityChange = "msvisibilitychange") : "undefined" != typeof document.webkitHidden && (e.hidden = "webkitHidden", e.visibilityChange = "webkitvisibilitychange"), e.autoPlay = a.proxy(e.autoPlay, e), e.autoPlayClear = a.proxy(e.autoPlayClear, e), e.changeSlide = a.proxy(e.changeSlide, e), e.clickHandler = a.proxy(e.clickHandler, e), e.selectHandler = a.proxy(e.selectHandler, e), e.setPosition = a.proxy(e.setPosition, e), e.swipeHandler = a.proxy(e.swipeHandler, e), e.dragHandler = a.proxy(e.dragHandler, e), e.keyHandler = a.proxy(e.keyHandler, e), e.autoPlayIterator = a.proxy(e.autoPlayIterator, e), e.instanceUid = b++, e.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/, e.init(), e.checkResponsive(!0) } var b = 0; return c }(), b.prototype.addSlide = b.prototype.slickAdd = function (b, c, d) { var e = this; if ("boolean" == typeof c) d = c, c = null; else if (0 > c || c >= e.slideCount) return !1; e.unload(), "number" == typeof c ? 0 === c && 0 === e.$slides.length ? a(b).appendTo(e.$slideTrack) : d ? a(b).insertBefore(e.$slides.eq(c)) : a(b).insertAfter(e.$slides.eq(c)) : d === !0 ? a(b).prependTo(e.$slideTrack) : a(b).appendTo(e.$slideTrack), e.$slides = e.$slideTrack.children(this.options.slide), e.$slideTrack.children(this.options.slide).detach(), e.$slideTrack.append(e.$slides), e.$slides.each(function (b, c) { a(c).attr("data-slick-index", b) }), e.$slidesCache = e.$slides, e.reinit() }, b.prototype.animateHeight = function () { var a = this; if (1 === a.options.slidesToShow && a.options.adaptiveHeight === !0 && a.options.vertical === !1) { var b = a.$slides.eq(a.currentSlide).outerHeight(!0); a.$list.animate({ height: b }, a.options.speed) } }, b.prototype.animateSlide = function (b, c) { var d = {}, e = this; e.animateHeight(), e.options.rtl === !0 && e.options.vertical === !1 && (b = -b), e.transformsEnabled === !1 ? e.options.vertical === !1 ? e.$slideTrack.animate({ left: b }, e.options.speed, e.options.easing, c) : e.$slideTrack.animate({ top: b }, e.options.speed, e.options.easing, c) : e.cssTransitions === !1 ? (e.options.rtl === !0 && (e.currentLeft = -e.currentLeft), a({ animStart: e.currentLeft }).animate({ animStart: b }, { duration: e.options.speed, easing: e.options.easing, step: function (a) { a = Math.ceil(a), e.options.vertical === !1 ? (d[e.animType] = "translate(" + a + "px, 0px)", e.$slideTrack.css(d)) : (d[e.animType] = "translate(0px," + a + "px)", e.$slideTrack.css(d)) }, complete: function () { c && c.call() } })) : (e.applyTransition(), b = Math.ceil(b), d[e.animType] = e.options.vertical === !1 ? "translate3d(" + b + "px, 0px, 0px)" : "translate3d(0px," + b + "px, 0px)", e.$slideTrack.css(d), c && setTimeout(function () { e.disableTransition(), c.call() }, e.options.speed)) }, b.prototype.asNavFor = function (b) { var c = this, d = null !== c.options.asNavFor ? a(c.options.asNavFor).slick("getSlick") : null; null !== d && d.slideHandler(b, !0) }, b.prototype.applyTransition = function (a) { var b = this, c = {}; c[b.transitionType] = b.options.fade === !1 ? b.transformType + " " + b.options.speed + "ms " + b.options.cssEase : "opacity " + b.options.speed + "ms " + b.options.cssEase, b.options.fade === !1 ? b.$slideTrack.css(c) : b.$slides.eq(a).css(c) }, b.prototype.autoPlay = function () { var a = this; a.autoPlayTimer && clearInterval(a.autoPlayTimer), a.slideCount > a.options.slidesToShow && a.paused !== !0 && (a.autoPlayTimer = setInterval(a.autoPlayIterator, a.options.autoplaySpeed)) }, b.prototype.autoPlayClear = function () { var a = this; a.autoPlayTimer && clearInterval(a.autoPlayTimer) }, b.prototype.autoPlayIterator = function () { var a = this; a.options.infinite === !1 ? 1 === a.direction ? (a.currentSlide + 1 === a.slideCount - 1 && (a.direction = 0), a.slideHandler(a.currentSlide + a.options.slidesToScroll)) : (0 === a.currentSlide - 1 && (a.direction = 1), a.slideHandler(a.currentSlide - a.options.slidesToScroll)) : a.slideHandler(a.currentSlide + a.options.slidesToScroll) }, b.prototype.buildArrows = function () { var b = this; b.options.arrows === !0 && b.slideCount > b.options.slidesToShow && (b.$prevArrow = a(b.options.prevArrow), b.$nextArrow = a(b.options.nextArrow), b.htmlExpr.test(b.options.prevArrow) && b.$prevArrow.appendTo(b.options.appendArrows), b.htmlExpr.test(b.options.nextArrow) && b.$nextArrow.appendTo(b.options.appendArrows), b.options.infinite !== !0 && b.$prevArrow.addClass("slick-disabled")) }, b.prototype.buildDots = function () { var c, d, b = this; if (b.options.dots === !0 && b.slideCount > b.options.slidesToShow) { for (d = '<ul class="' + b.options.dotsClass + '">', c = 0; c <= b.getDotCount() ; c += 1) d += "<li>" + b.options.customPaging.call(this, b, c) + "</li>"; d += "</ul>", b.$dots = a(d).appendTo(b.options.appendDots), b.$dots.find("li").first().addClass("slick-active") } }, b.prototype.buildOut = function () { var b = this; b.$slides = b.$slider.children(b.options.slide + ":not(.slick-cloned)").addClass("slick-slide"), b.slideCount = b.$slides.length, b.$slides.each(function (b, c) { a(c).attr("data-slick-index", b) }), b.$slidesCache = b.$slides, b.$slider.addClass("slick-slider"), b.$slideTrack = 0 === b.slideCount ? a('<div class="slick-track"/>').appendTo(b.$slider) : b.$slides.wrapAll('<div class="slick-track"/>').parent(), b.$list = b.$slideTrack.wrap('<div class="slick-list"/>').parent(), b.$slideTrack.css("opacity", 0), (b.options.centerMode === !0 || b.options.swipeToSlide === !0) && (b.options.slidesToScroll = 1), a("img[data-lazy]", b.$slider).not("[src]").addClass("slick-loading"), b.setupInfinite(), b.buildArrows(), b.buildDots(), b.updateDots(), b.options.accessibility === !0 && b.$list.prop("tabIndex", 0), b.setSlideClasses("number" == typeof this.currentSlide ? this.currentSlide : 0), b.options.draggable === !0 && b.$list.addClass("draggable") }, b.prototype.checkResponsive = function (b) { var d, e, f, c = this, g = c.$slider.width(), h = window.innerWidth || a(window).width(); if ("window" === c.respondTo ? f = h : "slider" === c.respondTo ? f = g : "min" === c.respondTo && (f = Math.min(h, g)), c.originalSettings.responsive && c.originalSettings.responsive.length > -1 && null !== c.originalSettings.responsive) { e = null; for (d in c.breakpoints) c.breakpoints.hasOwnProperty(d) && (c.originalSettings.mobileFirst === !1 ? f < c.breakpoints[d] && (e = c.breakpoints[d]) : f > c.breakpoints[d] && (e = c.breakpoints[d])); null !== e ? null !== c.activeBreakpoint ? e !== c.activeBreakpoint && (c.activeBreakpoint = e, "unslick" === c.breakpointSettings[e] ? c.unslick() : (c.options = a.extend({}, c.originalSettings, c.breakpointSettings[e]), b === !0 && (c.currentSlide = c.options.initialSlide), c.refresh())) : (c.activeBreakpoint = e, "unslick" === c.breakpointSettings[e] ? c.unslick() : (c.options = a.extend({}, c.originalSettings, c.breakpointSettings[e]), b === !0 && (c.currentSlide = c.options.initialSlide), c.refresh())) : null !== c.activeBreakpoint && (c.activeBreakpoint = null, c.options = c.originalSettings, b === !0 && (c.currentSlide = c.options.initialSlide), c.refresh()) } }, b.prototype.changeSlide = function (b, c) { var f, g, h, d = this, e = a(b.target); switch (e.is("a") && b.preventDefault(), h = 0 !== d.slideCount % d.options.slidesToScroll, f = h ? 0 : (d.slideCount - d.currentSlide) % d.options.slidesToScroll, b.data.message) { case "previous": g = 0 === f ? d.options.slidesToScroll : d.options.slidesToShow - f, d.slideCount > d.options.slidesToShow && d.slideHandler(d.currentSlide - g, !1, c); break; case "next": g = 0 === f ? d.options.slidesToScroll : f, d.slideCount > d.options.slidesToShow && d.slideHandler(d.currentSlide + g, !1, c); break; case "index": var i = 0 === b.data.index ? 0 : b.data.index || a(b.target).parent().index() * d.options.slidesToScroll; d.slideHandler(d.checkNavigable(i), !1, c); break; default: return } }, b.prototype.checkNavigable = function (a) { var c, d, b = this; if (c = b.getNavigableIndexes(), d = 0, a > c[c.length - 1]) a = c[c.length - 1]; else for (var e in c) { if (a < c[e]) { a = d; break } d = c[e] } return a }, b.prototype.clickHandler = function (a) { var b = this; b.shouldClick === !1 && (a.stopImmediatePropagation(), a.stopPropagation(), a.preventDefault()) }, b.prototype.destroy = function () { var b = this; b.autoPlayClear(), b.touchObject = {}, a(".slick-cloned", b.$slider).remove(), b.$dots && b.$dots.remove(), b.$prevArrow && "object" != typeof b.options.prevArrow && b.$prevArrow.remove(), b.$nextArrow && "object" != typeof b.options.nextArrow && b.$nextArrow.remove(), b.$slides.removeClass("slick-slide slick-active slick-center slick-visible").removeAttr("data-slick-index").css({ position: "", left: "", top: "", zIndex: "", opacity: "", width: "" }), b.$slider.removeClass("slick-slider"), b.$slider.removeClass("slick-initialized"), b.$list.off(".slick"), a(window).off(".slick-" + b.instanceUid), a(document).off(".slick-" + b.instanceUid), b.$slider.html(b.$slides) }, b.prototype.disableTransition = function (a) { var b = this, c = {}; c[b.transitionType] = "", b.options.fade === !1 ? b.$slideTrack.css(c) : b.$slides.eq(a).css(c) }, b.prototype.fadeSlide = function (a, b) { var c = this; c.cssTransitions === !1 ? (c.$slides.eq(a).css({ zIndex: 1e3 }), c.$slides.eq(a).animate({ opacity: 1 }, c.options.speed, c.options.easing, b)) : (c.applyTransition(a), c.$slides.eq(a).css({ opacity: 1, zIndex: 1e3 }), b && setTimeout(function () { c.disableTransition(a), b.call() }, c.options.speed)) }, b.prototype.filterSlides = b.prototype.slickFilter = function (a) { var b = this; null !== a && (b.unload(), b.$slideTrack.children(this.options.slide).detach(), b.$slidesCache.filter(a).appendTo(b.$slideTrack), b.reinit()) }, b.prototype.getCurrent = b.prototype.slickCurrentSlide = function () { var a = this; return a.currentSlide }, b.prototype.getDotCount = function () { var a = this, b = 0, c = 0, d = 0; if (a.options.infinite === !0) d = Math.ceil(a.slideCount / a.options.slidesToScroll); else if (a.options.centerMode === !0) d = a.slideCount; else for (; b < a.slideCount;)++d, b = c + a.options.slidesToShow, c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow; return d - 1 }, b.prototype.getLeft = function (a) { var c, d, f, b = this, e = 0; return b.slideOffset = 0, d = b.$slides.first().outerHeight(), b.options.infinite === !0 ? (b.slideCount > b.options.slidesToShow && (b.slideOffset = -1 * b.slideWidth * b.options.slidesToShow, e = -1 * d * b.options.slidesToShow), 0 !== b.slideCount % b.options.slidesToScroll && a + b.options.slidesToScroll > b.slideCount && b.slideCount > b.options.slidesToShow && (a > b.slideCount ? (b.slideOffset = -1 * (b.options.slidesToShow - (a - b.slideCount)) * b.slideWidth, e = -1 * (b.options.slidesToShow - (a - b.slideCount)) * d) : (b.slideOffset = -1 * b.slideCount % b.options.slidesToScroll * b.slideWidth, e = -1 * b.slideCount % b.options.slidesToScroll * d))) : a + b.options.slidesToShow > b.slideCount && (b.slideOffset = (a + b.options.slidesToShow - b.slideCount) * b.slideWidth, e = (a + b.options.slidesToShow - b.slideCount) * d), b.slideCount <= b.options.slidesToShow && (b.slideOffset = 0, e = 0), b.options.centerMode === !0 && b.options.infinite === !0 ? b.slideOffset += b.slideWidth * Math.floor(b.options.slidesToShow / 2) - b.slideWidth : b.options.centerMode === !0 && (b.slideOffset = 0, b.slideOffset += b.slideWidth * Math.floor(b.options.slidesToShow / 2)), c = b.options.vertical === !1 ? -1 * a * b.slideWidth + b.slideOffset : -1 * a * d + e, b.options.variableWidth === !0 && (f = b.slideCount <= b.options.slidesToShow || b.options.infinite === !1 ? b.$slideTrack.children(".slick-slide").eq(a) : b.$slideTrack.children(".slick-slide").eq(a + b.options.slidesToShow), c = f[0] ? -1 * f[0].offsetLeft : 0, b.options.centerMode === !0 && (f = b.options.infinite === !1 ? b.$slideTrack.children(".slick-slide").eq(a) : b.$slideTrack.children(".slick-slide").eq(a + b.options.slidesToShow + 1), c = f[0] ? -1 * f[0].offsetLeft : 0, c += (b.$list.width() - f.outerWidth()) / 2)), c }, b.prototype.getOption = b.prototype.slickGetOption = function (a) { var b = this; return b.options[a] }, b.prototype.getNavigableIndexes = function () { var e, a = this, b = 0, c = 0, d = []; for (a.options.infinite === !1 ? (e = a.slideCount - a.options.slidesToShow + 1, a.options.centerMode === !0 && (e = a.slideCount)) : (b = -1 * a.slideCount, c = -1 * a.slideCount, e = 2 * a.slideCount) ; e > b;) d.push(b), b = c + a.options.slidesToScroll, c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow; return d }, b.prototype.getSlick = function () { return this }, b.prototype.getSlideCount = function () { var c, d, e, b = this; return e = b.options.centerMode === !0 ? b.slideWidth * Math.floor(b.options.slidesToShow / 2) : 0, b.options.swipeToSlide === !0 ? (b.$slideTrack.find(".slick-slide").each(function (c, f) { return f.offsetLeft - e + a(f).outerWidth() / 2 > -1 * b.swipeLeft ? (d = f, !1) : void 0 }), c = Math.abs(a(d).attr("data-slick-index") - b.currentSlide) || 1) : b.options.slidesToScroll }, b.prototype.goTo = b.prototype.slickGoTo = function (a, b) { var c = this; c.changeSlide({ data: { message: "index", index: parseInt(a) } }, b) }, b.prototype.init = function () { var b = this; a(b.$slider).hasClass("slick-initialized") || (a(b.$slider).addClass("slick-initialized"), b.buildOut(), b.setProps(), b.startLoad(), b.loadSlider(), b.initializeEvents(), b.updateArrows(), b.updateDots()), b.$slider.trigger("init", [b]) }, b.prototype.initArrowEvents = function () { var a = this; a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.on("click.slick", { message: "previous" }, a.changeSlide), a.$nextArrow.on("click.slick", { message: "next" }, a.changeSlide)) }, b.prototype.initDotEvents = function () { var b = this; b.options.dots === !0 && b.slideCount > b.options.slidesToShow && a("li", b.$dots).on("click.slick", { message: "index" }, b.changeSlide), b.options.dots === !0 && b.options.pauseOnDotsHover === !0 && b.options.autoplay === !0 && a("li", b.$dots).on("mouseenter.slick", function () { b.paused = !0, b.autoPlayClear() }).on("mouseleave.slick", function () { b.paused = !1, b.autoPlay() }) }, b.prototype.initializeEvents = function () { var b = this; b.initArrowEvents(), b.initDotEvents(), b.$list.on("touchstart.slick mousedown.slick", { action: "start" }, b.swipeHandler), b.$list.on("touchmove.slick mousemove.slick", { action: "move" }, b.swipeHandler), b.$list.on("touchend.slick mouseup.slick", { action: "end" }, b.swipeHandler), b.$list.on("touchcancel.slick mouseleave.slick", { action: "end" }, b.swipeHandler), b.$list.on("click.slick", b.clickHandler), b.options.autoplay === !0 && (a(document).on(b.visibilityChange, function () { b.visibility() }), b.options.pauseOnHover === !0 && (b.$list.on("mouseenter.slick", function () { b.paused = !0, b.autoPlayClear() }), b.$list.on("mouseleave.slick", function () { b.paused = !1, b.autoPlay() }))), b.options.accessibility === !0 && b.$list.on("keydown.slick", b.keyHandler), b.options.focusOnSelect === !0 && a(b.$slideTrack).children().on("click.slick", b.selectHandler), a(window).on("orientationchange.slick.slick-" + b.instanceUid, function () { b.checkResponsive(), b.setPosition() }), a(window).on("resize.slick.slick-" + b.instanceUid, function () { a(window).width() !== b.windowWidth && (clearTimeout(b.windowDelay), b.windowDelay = window.setTimeout(function () { b.windowWidth = a(window).width(), b.checkResponsive(), b.setPosition() }, 50)) }), a("*[draggable!=true]", b.$slideTrack).on("dragstart", function (a) { a.preventDefault() }), a(window).on("load.slick.slick-" + b.instanceUid, b.setPosition), a(document).on("ready.slick.slick-" + b.instanceUid, b.setPosition) }, b.prototype.initUI = function () { var a = this; a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.show(), a.$nextArrow.show()), a.options.dots === !0 && a.slideCount > a.options.slidesToShow && a.$dots.show(), a.options.autoplay === !0 && a.autoPlay() }, b.prototype.keyHandler = function (a) { var b = this; 37 === a.keyCode && b.options.accessibility === !0 ? b.changeSlide({ data: { message: "previous" } }) : 39 === a.keyCode && b.options.accessibility === !0 && b.changeSlide({ data: { message: "next" } }) }, b.prototype.lazyLoad = function () { function g(b) { a("img[data-lazy]", b).each(function () { var b = a(this), c = a(this).attr("data-lazy"); b.load(function () { b.animate({ opacity: 1 }, 200) }).css({ opacity: 0 }).attr("src", c).removeAttr("data-lazy").removeClass("slick-loading") }) } var c, d, e, f, b = this; b.options.centerMode === !0 ? b.options.infinite === !0 ? (e = b.currentSlide + (b.options.slidesToShow / 2 + 1), f = e + b.options.slidesToShow + 2) : (e = Math.max(0, b.currentSlide - (b.options.slidesToShow / 2 + 1)), f = 2 + (b.options.slidesToShow / 2 + 1) + b.currentSlide) : (e = b.options.infinite ? b.options.slidesToShow + b.currentSlide : b.currentSlide, f = e + b.options.slidesToShow, b.options.fade === !0 && (e > 0 && e--, f <= b.slideCount && f++)), c = b.$slider.find(".slick-slide").slice(e, f), g(c), b.slideCount <= b.options.slidesToShow ? (d = b.$slider.find(".slick-slide"), g(d)) : b.currentSlide >= b.slideCount - b.options.slidesToShow ? (d = b.$slider.find(".slick-cloned").slice(0, b.options.slidesToShow), g(d)) : 0 === b.currentSlide && (d = b.$slider.find(".slick-cloned").slice(-1 * b.options.slidesToShow), g(d)) }, b.prototype.loadSlider = function () { var a = this; a.setPosition(), a.$slideTrack.css({ opacity: 1 }), a.$slider.removeClass("slick-loading"), a.initUI(), "progressive" === a.options.lazyLoad && a.progressiveLazyLoad() }, b.prototype.next = b.prototype.slickNext = function () { var a = this; a.changeSlide({ data: { message: "next" } }) }, b.prototype.pause = b.prototype.slickPause = function () { var a = this; a.autoPlayClear(), a.paused = !0 }, b.prototype.play = b.prototype.slickPlay = function () { var a = this; a.paused = !1, a.autoPlay() }, b.prototype.postSlide = function (a) { var b = this; b.$slider.trigger("afterChange", [b, a]), b.animating = !1, b.setPosition(), b.swipeLeft = null, b.options.autoplay === !0 && b.paused === !1 && b.autoPlay() }, b.prototype.prev = b.prototype.slickPrev = function () { var a = this; a.changeSlide({ data: { message: "previous" } }) }, b.prototype.progressiveLazyLoad = function () { var c, d, b = this; c = a("img[data-lazy]", b.$slider).length, c > 0 && (d = a("img[data-lazy]", b.$slider).first(), d.attr("src", d.attr("data-lazy")).removeClass("slick-loading").load(function () { d.removeAttr("data-lazy"), b.progressiveLazyLoad() }).error(function () { d.removeAttr("data-lazy"), b.progressiveLazyLoad() })) }, b.prototype.refresh = function () { var b = this, c = b.currentSlide; b.destroy(), a.extend(b, b.initials), b.init(), b.changeSlide({ data: { message: "index", index: c } }, !0) }, b.prototype.reinit = function () { var b = this; b.$slides = b.$slideTrack.children(b.options.slide).addClass("slick-slide"), b.slideCount = b.$slides.length, b.currentSlide >= b.slideCount && 0 !== b.currentSlide && (b.currentSlide = b.currentSlide - b.options.slidesToScroll), b.slideCount <= b.options.slidesToShow && (b.currentSlide = 0), b.setProps(), b.setupInfinite(), b.buildArrows(), b.updateArrows(), b.initArrowEvents(), b.buildDots(), b.updateDots(), b.initDotEvents(), b.options.focusOnSelect === !0 && a(b.$slideTrack).children().on("click.slick", b.selectHandler), b.setSlideClasses(0), b.setPosition(), b.$slider.trigger("reInit", [b]) }, b.prototype.removeSlide = b.prototype.slickRemove = function (a, b, c) { var d = this; return "boolean" == typeof a ? (b = a, a = b === !0 ? 0 : d.slideCount - 1) : a = b === !0 ? --a : a, d.slideCount < 1 || 0 > a || a > d.slideCount - 1 ? !1 : (d.unload(), c === !0 ? d.$slideTrack.children().remove() : d.$slideTrack.children(this.options.slide).eq(a).remove(), d.$slides = d.$slideTrack.children(this.options.slide), d.$slideTrack.children(this.options.slide).detach(), d.$slideTrack.append(d.$slides), d.$slidesCache = d.$slides, d.reinit(), void 0) }, b.prototype.setCSS = function (a) { var d, e, b = this, c = {}; b.options.rtl === !0 && (a = -a), d = "left" == b.positionProp ? Math.ceil(a) + "px" : "0px", e = "top" == b.positionProp ? Math.ceil(a) + "px" : "0px", c[b.positionProp] = a, b.transformsEnabled === !1 ? b.$slideTrack.css(c) : (c = {}, b.cssTransitions === !1 ? (c[b.animType] = "translate(" + d + ", " + e + ")", b.$slideTrack.css(c)) : (c[b.animType] = "translate3d(" + d + ", " + e + ", 0px)", b.$slideTrack.css(c))) }, b.prototype.setDimensions = function () { var a = this; if (a.options.vertical === !1 ? a.options.centerMode === !0 && a.$list.css({ padding: "0px " + a.options.centerPadding }) : (a.$list.height(a.$slides.first().outerHeight(!0) * a.options.slidesToShow), a.options.centerMode === !0 && a.$list.css({ padding: a.options.centerPadding + " 0px" })), a.listWidth = a.$list.width(), a.listHeight = a.$list.height(), a.options.vertical === !1 && a.options.variableWidth === !1) a.slideWidth = Math.ceil(a.listWidth / a.options.slidesToShow), a.$slideTrack.width(Math.ceil(a.slideWidth * a.$slideTrack.children(".slick-slide").length)); else if (a.options.variableWidth === !0) { var b = 0; a.slideWidth = Math.ceil(a.listWidth / a.options.slidesToShow), a.$slideTrack.children(".slick-slide").each(function () { b += a.listWidth }), a.$slideTrack.width(Math.ceil(b) + 1) } else a.slideWidth = Math.ceil(a.listWidth), a.$slideTrack.height(Math.ceil(a.$slides.first().outerHeight(!0) * a.$slideTrack.children(".slick-slide").length)); var c = a.$slides.first().outerWidth(!0) - a.$slides.first().width(); a.options.variableWidth === !1 && a.$slideTrack.children(".slick-slide").width(a.slideWidth - c) }, b.prototype.setFade = function () { var c, b = this; b.$slides.each(function (d, e) { c = -1 * b.slideWidth * d, b.options.rtl === !0 ? a(e).css({ position: "relative", right: c, top: 0, zIndex: 800, opacity: 0 }) : a(e).css({ position: "relative", left: c, top: 0, zIndex: 800, opacity: 0 }) }), b.$slides.eq(b.currentSlide).css({ zIndex: 900, opacity: 1 }) }, b.prototype.setHeight = function () { var a = this; if (1 === a.options.slidesToShow && a.options.adaptiveHeight === !0 && a.options.vertical === !1) { var b = a.$slides.eq(a.currentSlide).outerHeight(!0); a.$list.css("height", b) } }, b.prototype.setOption = b.prototype.slickSetOption = function (a, b, c) { var d = this; d.options[a] = b, c === !0 && (d.unload(), d.reinit()) }, b.prototype.setPosition = function () { var a = this; a.setDimensions(), a.setHeight(), a.options.fade === !1 ? a.setCSS(a.getLeft(a.currentSlide)) : a.setFade(), a.$slider.trigger("setPosition", [a]) }, b.prototype.setProps = function () { var a = this, b = document.body.style; a.positionProp = a.options.vertical === !0 ? "top" : "left", "top" === a.positionProp ? a.$slider.addClass("slick-vertical") : a.$slider.removeClass("slick-vertical"), (void 0 !== b.WebkitTransition || void 0 !== b.MozTransition || void 0 !== b.msTransition) && a.options.useCSS === !0 && (a.cssTransitions = !0), void 0 !== b.OTransform && (a.animType = "OTransform", a.transformType = "-o-transform", a.transitionType = "OTransition", void 0 === b.perspectiveProperty && void 0 === b.webkitPerspective && (a.animType = !1)), void 0 !== b.MozTransform && (a.animType = "MozTransform", a.transformType = "-moz-transform", a.transitionType = "MozTransition", void 0 === b.perspectiveProperty && void 0 === b.MozPerspective && (a.animType = !1)), void 0 !== b.webkitTransform && (a.animType = "webkitTransform", a.transformType = "-webkit-transform", a.transitionType = "webkitTransition", void 0 === b.perspectiveProperty && void 0 === b.webkitPerspective && (a.animType = !1)), void 0 !== b.msTransform && (a.animType = "msTransform", a.transformType = "-ms-transform", a.transitionType = "msTransition", void 0 === b.msTransform && (a.animType = !1)), void 0 !== b.transform && a.animType !== !1 && (a.animType = "transform", a.transformType = "transform", a.transitionType = "transition"), a.transformsEnabled = null !== a.animType && a.animType !== !1 }, b.prototype.setSlideClasses = function (a) { var c, d, e, f, b = this; b.$slider.find(".slick-slide").removeClass("slick-active").removeClass("slick-center"), d = b.$slider.find(".slick-slide"), b.options.centerMode === !0 ? (c = Math.floor(b.options.slidesToShow / 2), b.options.infinite === !0 && (a >= c && a <= b.slideCount - 1 - c ? b.$slides.slice(a - c, a + c + 1).addClass("slick-active") : (e = b.options.slidesToShow + a, d.slice(e - c + 1, e + c + 2).addClass("slick-active")), 0 === a ? d.eq(d.length - 1 - b.options.slidesToShow).addClass("slick-center") : a === b.slideCount - 1 && d.eq(b.options.slidesToShow).addClass("slick-center")), b.$slides.eq(a).addClass("slick-center")) : a >= 0 && a <= b.slideCount - b.options.slidesToShow ? b.$slides.slice(a, a + b.options.slidesToShow).addClass("slick-active") : d.length <= b.options.slidesToShow ? d.addClass("slick-active") : (f = b.slideCount % b.options.slidesToShow, e = b.options.infinite === !0 ? b.options.slidesToShow + a : a, b.options.slidesToShow == b.options.slidesToScroll && b.slideCount - a < b.options.slidesToShow ? d.slice(e - (b.options.slidesToShow - f), e + f).addClass("slick-active") : d.slice(e, e + b.options.slidesToShow).addClass("slick-active")), "ondemand" === b.options.lazyLoad && b.lazyLoad() }, b.prototype.setupInfinite = function () { var c, d, e, b = this; if (b.options.fade === !0 && (b.options.centerMode = !1), b.options.infinite === !0 && b.options.fade === !1 && (d = null, b.slideCount > b.options.slidesToShow)) { for (e = b.options.centerMode === !0 ? b.options.slidesToShow + 1 : b.options.slidesToShow, c = b.slideCount; c > b.slideCount - e; c -= 1) d = c - 1, a(b.$slides[d]).clone(!0).attr("id", "").attr("data-slick-index", d - b.slideCount).prependTo(b.$slideTrack).addClass("slick-cloned"); for (c = 0; e > c; c += 1) d = c, a(b.$slides[d]).clone(!0).attr("id", "").attr("data-slick-index", d + b.slideCount).appendTo(b.$slideTrack).addClass("slick-cloned"); b.$slideTrack.find(".slick-cloned").find("[id]").each(function () { a(this).attr("id", "") }) } }, b.prototype.selectHandler = function (b) { var c = this, d = parseInt(a(b.target).parents(".slick-slide").attr("data-slick-index")); return d || (d = 0), c.slideCount <= c.options.slidesToShow ? (c.$slider.find(".slick-slide").removeClass("slick-active"), c.$slides.eq(d).addClass("slick-active"), c.options.centerMode === !0 && (c.$slider.find(".slick-slide").removeClass("slick-center"), c.$slides.eq(d).addClass("slick-center")), c.asNavFor(d), void 0) : (c.slideHandler(d), void 0) }, b.prototype.slideHandler = function (a, b, c) { var d, e, f, g, h = null, i = this; return b = b || !1, i.animating === !0 && i.options.waitForAnimate === !0 || i.options.fade === !0 && i.currentSlide === a || i.slideCount <= i.options.slidesToShow ? void 0 : (b === !1 && i.asNavFor(a), d = a, h = i.getLeft(d), g = i.getLeft(i.currentSlide), i.currentLeft = null === i.swipeLeft ? g : i.swipeLeft, i.options.infinite === !1 && i.options.centerMode === !1 && (0 > a || a > i.getDotCount() * i.options.slidesToScroll) ? (i.options.fade === !1 && (d = i.currentSlide, c !== !0 ? i.animateSlide(g, function () { i.postSlide(d) }) : i.postSlide(d)), void 0) : i.options.infinite === !1 && i.options.centerMode === !0 && (0 > a || a > i.slideCount - i.options.slidesToScroll) ? (i.options.fade === !1 && (d = i.currentSlide, c !== !0 ? i.animateSlide(g, function () { i.postSlide(d) }) : i.postSlide(d)), void 0) : (i.options.autoplay === !0 && clearInterval(i.autoPlayTimer), e = 0 > d ? 0 !== i.slideCount % i.options.slidesToScroll ? i.slideCount - i.slideCount % i.options.slidesToScroll : i.slideCount + d : d >= i.slideCount ? 0 !== i.slideCount % i.options.slidesToScroll ? 0 : d - i.slideCount : d, i.animating = !0, i.$slider.trigger("beforeChange", [i, i.currentSlide, e]), f = i.currentSlide, i.currentSlide = e, i.setSlideClasses(i.currentSlide), i.updateDots(), i.updateArrows(), i.options.fade === !0 ? (c !== !0 ? i.fadeSlide(e, function () { i.postSlide(e) }) : i.postSlide(e), i.animateHeight(), void 0) : (c !== !0 ? i.animateSlide(h, function () { i.postSlide(e) }) : i.postSlide(e), void 0))) }, b.prototype.startLoad = function () { var a = this; a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.hide(), a.$nextArrow.hide()), a.options.dots === !0 && a.slideCount > a.options.slidesToShow && a.$dots.hide(), a.$slider.addClass("slick-loading") }, b.prototype.swipeDirection = function () { var a, b, c, d, e = this; return a = e.touchObject.startX - e.touchObject.curX, b = e.touchObject.startY - e.touchObject.curY, c = Math.atan2(b, a), d = Math.round(180 * c / Math.PI), 0 > d && (d = 360 - Math.abs(d)), 45 >= d && d >= 0 ? e.options.rtl === !1 ? "left" : "right" : 360 >= d && d >= 315 ? e.options.rtl === !1 ? "left" : "right" : d >= 135 && 225 >= d ? e.options.rtl === !1 ? "right" : "left" : "vertical" }, b.prototype.swipeEnd = function () { var c, b = this; if (b.dragging = !1, b.shouldClick = b.touchObject.swipeLength > 10 ? !1 : !0, void 0 === b.touchObject.curX) return !1; if (b.touchObject.edgeHit === !0 && b.$slider.trigger("edge", [b, b.swipeDirection()]), b.touchObject.swipeLength >= b.touchObject.minSwipe) switch (b.swipeDirection()) { case "left": c = b.options.swipeToSlide ? b.checkNavigable(b.currentSlide + b.getSlideCount()) : b.currentSlide + b.getSlideCount(), b.slideHandler(c), b.currentDirection = 0, b.touchObject = {}, b.$slider.trigger("swipe", [b, "left"]); break; case "right": c = b.options.swipeToSlide ? b.checkNavigable(b.currentSlide - b.getSlideCount()) : b.currentSlide - b.getSlideCount(), b.slideHandler(c), b.currentDirection = 1, b.touchObject = {}, b.$slider.trigger("swipe", [b, "right"]) } else b.touchObject.startX !== b.touchObject.curX && (b.slideHandler(b.currentSlide), b.touchObject = {}) }, b.prototype.swipeHandler = function (a) { var b = this; if (!(b.options.swipe === !1 || "ontouchend" in document && b.options.swipe === !1 || b.options.draggable === !1 && -1 !== a.type.indexOf("mouse"))) switch (b.touchObject.fingerCount = a.originalEvent && void 0 !== a.originalEvent.touches ? a.originalEvent.touches.length : 1, b.touchObject.minSwipe = b.listWidth / b.options.touchThreshold, a.data.action) { case "start": b.swipeStart(a); break; case "move": b.swipeMove(a); break; case "end": b.swipeEnd(a) } }, b.prototype.swipeMove = function (a) { var d, e, f, g, h, b = this; return h = void 0 !== a.originalEvent ? a.originalEvent.touches : null, !b.dragging || h && 1 !== h.length ? !1 : (d = b.getLeft(b.currentSlide), b.touchObject.curX = void 0 !== h ? h[0].pageX : a.clientX, b.touchObject.curY = void 0 !== h ? h[0].pageY : a.clientY, b.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(b.touchObject.curX - b.touchObject.startX, 2))), e = b.swipeDirection(), "vertical" !== e ? (void 0 !== a.originalEvent && b.touchObject.swipeLength > 4 && a.preventDefault(), g = (b.options.rtl === !1 ? 1 : -1) * (b.touchObject.curX > b.touchObject.startX ? 1 : -1), f = b.touchObject.swipeLength, b.touchObject.edgeHit = !1, b.options.infinite === !1 && (0 === b.currentSlide && "right" === e || b.currentSlide >= b.getDotCount() && "left" === e) && (f = b.touchObject.swipeLength * b.options.edgeFriction, b.touchObject.edgeHit = !0), b.swipeLeft = b.options.vertical === !1 ? d + f * g : d + f * (b.$list.height() / b.listWidth) * g, b.options.fade === !0 || b.options.touchMove === !1 ? !1 : b.animating === !0 ? (b.swipeLeft = null, !1) : (b.setCSS(b.swipeLeft), void 0)) : void 0) }, b.prototype.swipeStart = function (a) { var c, b = this; return 1 !== b.touchObject.fingerCount || b.slideCount <= b.options.slidesToShow ? (b.touchObject = {}, !1) : (void 0 !== a.originalEvent && void 0 !== a.originalEvent.touches && (c = a.originalEvent.touches[0]), b.touchObject.startX = b.touchObject.curX = void 0 !== c ? c.pageX : a.clientX, b.touchObject.startY = b.touchObject.curY = void 0 !== c ? c.pageY : a.clientY, b.dragging = !0, void 0) }, b.prototype.unfilterSlides = b.prototype.slickUnfilter = function () { var a = this; null !== a.$slidesCache && (a.unload(), a.$slideTrack.children(this.options.slide).detach(), a.$slidesCache.appendTo(a.$slideTrack), a.reinit()) }, b.prototype.unload = function () { var b = this; a(".slick-cloned", b.$slider).remove(), b.$dots && b.$dots.remove(), b.$prevArrow && "object" != typeof b.options.prevArrow && b.$prevArrow.remove(), b.$nextArrow && "object" != typeof b.options.nextArrow && b.$nextArrow.remove(), b.$slides.removeClass("slick-slide slick-active slick-visible").css("width", "") }, b.prototype.unslick = function () { var a = this; a.destroy() }, b.prototype.updateArrows = function () {

                        var b, a = this; b = Math.floor(a.options.slidesToShow / 2), a.options.arrows === !0 && a.options.infinite !== !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.removeClass("slick-disabled"), a.$nextArrow.removeClass("slick-disabled"), 0 === a.currentSlide ? (a.$prevArrow.addClass("slick-disabled"), a.$nextArrow.removeClass("slick-disabled")) : a.currentSlide >= a.slideCount - a.options.slidesToShow && a.options.centerMode === !1 ? (a.$nextArrow.addClass("slick-disabled"), a.$prevArrow.removeClass("slick-disabled")) : a.currentSlide >= a.slideCount - 1 && a.options.centerMode === !0 && (a.$nextArrow.addClass("slick-disabled"), a.$prevArrow.removeClass("slick-disabled")))

                    }, b.prototype.updateDots = function () { var a = this; null !== a.$dots && (a.$dots.find("li").removeClass("slick-active"), a.$dots.find("li").eq(Math.floor(a.currentSlide / a.options.slidesToScroll)).addClass("slick-active")) }, b.prototype.visibility = function () { var a = this; document[a.hidden] ? (a.paused = !0, a.autoPlayClear()) : (a.paused = !1, a.autoPlay()) }, a.fn.slick = function () { var g, a = this, c = arguments[0], d = Array.prototype.slice.call(arguments, 1), e = a.length, f = 0; for (f; e > f; f++) if ("object" == typeof c || "undefined" == typeof c ? a[f].slick = new b(a[f], c) : g = a[f].slick[c].apply(a[f].slick, d), "undefined" != typeof g) return g; return a }, a(function () { a("[data-slick]").slick() })

                });

        

        

                /*

                 *

                 * Copyright (c) 2006-2011 Sam Collett (http://www.texotela.co.uk)

                 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)

                 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.

                 * 

                 * Version 1.3

                 * Demo: http://www.texotela.co.uk/code/jquery/numeric/

                 *

                 */

                (function (e) { e.fn.numeric = function (t, n) { if (typeof t === "boolean") { t = { decimal: t } } t = t || {}; if (typeof t.negative == "undefined") t.negative = true; var r = t.decimal === false ? "" : t.decimal || "."; var i = t.negative === true ? true : false; var n = typeof n == "function" ? n : function () { }; return this.data("numeric.decimal", r).data("numeric.negative", i).data("numeric.callback", n).keypress(e.fn.numeric.keypress).keyup(e.fn.numeric.keyup).blur(e.fn.numeric.blur) }; e.fn.numeric.keypress = function (t) { var n = e.data(this, "numeric.decimal"); var r = e.data(this, "numeric.negative"); var i = t.charCode ? t.charCode : t.keyCode ? t.keyCode : 0; if (i == 13 && this.nodeName.toLowerCase() == "input") { return true } else if (i == 13) { return false } var s = false; if (t.ctrlKey && i == 97 || t.ctrlKey && i == 65) return true; if (t.ctrlKey && i == 120 || t.ctrlKey && i == 88) return true; if (t.ctrlKey && i == 99 || t.ctrlKey && i == 67) return true; if (t.ctrlKey && i == 122 || t.ctrlKey && i == 90) return true; if (t.ctrlKey && i == 118 || t.ctrlKey && i == 86 || t.shiftKey && i == 45) return true; if (i < 48 || i > 57) { if (this.value.indexOf("-") != 0 && r && i == 45 && (this.value.length == 0 || e.fn.getSelectionStart(this) == 0)) return true; if (n && i == n.charCodeAt(0) && this.value.indexOf(n) != -1) { s = false } if (i != 8 && i != 9 && i != 13 && i != 35 && i != 36 && i != 37 && i != 39 && i != 46) { s = false } else { if (typeof t.charCode != "undefined") { if (t.keyCode == t.which && t.which != 0) { s = true; if (t.which == 46) s = false } else if (t.keyCode != 0 && t.charCode == 0 && t.which == 0) { s = true } } } if (n && i == n.charCodeAt(0)) { if (this.value.indexOf(n) == -1) { s = true } else { s = false } } } else { s = true } return s }; e.fn.numeric.keyup = function (t) { var n = this.value; if (n.length > 0) { var r = e.fn.getSelectionStart(this); var i = e.data(this, "numeric.decimal"); var s = e.data(this, "numeric.negative"); if (i != "") { var o = n.indexOf(i); if (o == 0) { this.value = "0" + n } if (o == 1 && n.charAt(0) == "-") { this.value = "-0" + n.substring(1) } n = this.value } var u = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "-", i]; var a = n.length; for (var f = a - 1; f >= 0; f--) { var l = n.charAt(f); if (f != 0 && l == "-") { n = n.substring(0, f) + n.substring(f + 1) } else if (f == 0 && !s && l == "-") { n = n.substring(1) } var c = false; for (var h = 0; h < u.length; h++) { if (l == u[h]) { c = true; break } } if (!c || l == " ") { n = n.substring(0, f) + n.substring(f + 1) } } var p = n.indexOf(i); if (p > 0) { for (var f = a - 1; f > p; f--) { var l = n.charAt(f); if (l == i) { n = n.substring(0, f) + n.substring(f + 1) } } } this.value = n; e.fn.setSelection(this, r) } }; e.fn.numeric.blur = function () { var t = e.data(this, "numeric.decimal"); var n = e.data(this, "numeric.callback"); var r = this.value; if (r != "") { var i = new RegExp("^\\d+$|\\d*" + t + "\\d+"); if (!i.exec(r)) { n.apply(this) } } }; e.fn.removeNumeric = function () { return this.data("numeric.decimal", null).data("numeric.negative", null).data("numeric.callback", null).unbind("keypress", e.fn.numeric.keypress).unbind("blur", e.fn.numeric.blur) }; e.fn.getSelectionStart = function (e) { if (e.createTextRange) { var t = document.selection.createRange().duplicate(); t.moveEnd("character", e.value.length); if (t.text == "") return e.value.length; return e.value.lastIndexOf(t.text) } else return e.selectionStart }; e.fn.setSelection = function (e, t) { if (typeof t == "number") t = [t, t]; if (t && t.constructor == Array && t.length == 2) { if (e.createTextRange) { var n = e.createTextRange(); n.collapse(true); n.moveStart("character", t[0]); n.moveEnd("character", t[1]); n.select() } else if (e.setSelectionRange) { e.focus(); e.setSelectionRange(t[0], t[1]) } } } })(jQuery)

        

                /*! waitForImages jQuery Plugin 2013-07-20 */

                !function (a) { var b = "waitForImages"; a.waitForImages = { hasImageProperties: ["backgroundImage", "listStyleImage", "borderImage", "borderCornerImage", "cursor"] }, a.expr[":"].uncached = function (b) { if (!a(b).is('img[src!=""]')) return !1; var c = new Image; return c.src = b.src, !c.complete }, a.fn.waitForImages = function (c, d, e) { var f = 0, g = 0; if (a.isPlainObject(arguments[0]) && (e = arguments[0].waitForAll, d = arguments[0].each, c = arguments[0].finished), c = c || a.noop, d = d || a.noop, e = !!e, !a.isFunction(c) || !a.isFunction(d)) throw new TypeError("An invalid callback was supplied."); return this.each(function () { var h = a(this), i = [], j = a.waitForImages.hasImageProperties || [], k = /url\(\s*(['"]?)(.*?)\1\s*\)/g; e ? h.find("*").addBack().each(function () { var b = a(this); b.is("img:uncached") && i.push({ src: b.attr("src"), element: b[0] }), a.each(j, function (a, c) { var d, e = b.css(c); if (!e) return !0; for (; d = k.exec(e) ;) i.push({ src: d[2], element: b[0] }) }) }) : h.find("img:uncached").each(function () { i.push({ src: this.src, element: this }) }), f = i.length, g = 0, 0 === f && c.call(h[0]), a.each(i, function (e, i) { var j = new Image; a(j).on("load." + b + " error." + b, function (a) { return g++, d.call(i.element, g, f, "load" == a.type), g == f ? (c.call(h[0]), !1) : void 0 }), j.src = i.src }) }) } }(jQuery);

        

                //! moment.js

                //! version : 2.10.3

                //! authors : Tim Wood, Iskren Chernev, Moment.js contributors

                //! license : MIT

                //! momentjs.com

                !function (a, b) { "object" == typeof exports && "undefined" != typeof module ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.moment = b() }(this, function () {

                    "use strict"; function a() {

                        return Dc.apply(null, arguments)

                    } function b(a) {

                        Dc = a

                    } function c(a) {

                        return "[object Array]" === Object.prototype.toString.call(a)

                    } function d(a) {

                        return a instanceof Date || "[object Date]" === Object.prototype.toString.call(a)

                    } function e(a, b) {

                        var c, d = []; for (c = 0; c < a.length; ++c) d.push(b(a[c], c)); return d

                    } function f(a, b) {

                        return Object.prototype.hasOwnProperty.call(a, b)

                    } function g(a, b) {

                        for (var c in b) f(b, c) && (a[c] = b[c]); return f(b, "toString") && (a.toString = b.toString), f(b, "valueOf") && (a.valueOf = b.valueOf), a

                    } function h(a, b, c, d) {

                        return za(a, b, c, d, !0).utc()

                    } function i() {

                        return { empty: !1, unusedTokens: [], unusedInput: [], overflow: -2, charsLeftOver: 0, nullInput: !1, invalidMonth: null, invalidFormat: !1, userInvalidated: !1, iso: !1 }

                    } function j(a) {

                        return null == a._pf && (a._pf = i()), a._pf

                    } function k(a) {

                        if (null == a._isValid) { var b = j(a); a._isValid = !isNaN(a._d.getTime()) && b.overflow < 0 && !b.empty && !b.invalidMonth && !b.nullInput && !b.invalidFormat && !b.userInvalidated, a._strict && (a._isValid = a._isValid && 0 === b.charsLeftOver && 0 === b.unusedTokens.length && void 0 === b.bigHour) } return a._isValid

                    } function l(a) {

                        var b = h(0 / 0); return null != a ? g(j(b), a) : j(b).userInvalidated = !0, b

                    } function m(a, b) {

                        var c, d, e; if ("undefined" != typeof b._isAMomentObject && (a._isAMomentObject = b._isAMomentObject), "undefined" != typeof b._i && (a._i = b._i), "undefined" != typeof b._f && (a._f = b._f), "undefined" != typeof b._l && (a._l = b._l), "undefined" != typeof b._strict && (a._strict = b._strict), "undefined" != typeof b._tzm && (a._tzm = b._tzm), "undefined" != typeof b._isUTC && (a._isUTC = b._isUTC), "undefined" != typeof b._offset && (a._offset = b._offset), "undefined" != typeof b._pf && (a._pf = j(b)), "undefined" != typeof b._locale && (a._locale = b._locale), Fc.length > 0) for (c in Fc) d = Fc[c], e = b[d], "undefined" != typeof e && (a[d] = e); return a

                    } function n(b) {

                        m(this, b), this._d = new Date(+b._d), Gc === !1 && (Gc = !0, a.updateOffset(this), Gc = !1)

                    } function o(a) {

                        return a instanceof n || null != a && null != a._isAMomentObject

                    } function p(a) {

                        var b = +a, c = 0; return 0 !== b && isFinite(b) && (c = b >= 0 ? Math.floor(b) : Math.ceil(b)), c

                    } function q(a, b, c) {

                        var d, e = Math.min(a.length, b.length), f = Math.abs(a.length - b.length), g = 0; for (d = 0; e > d; d++) (c && a[d] !== b[d] || !c && p(a[d]) !== p(b[d])) && g++; return g + f

                    } function r() {

                    } function s(a) {

                        return a ? a.toLowerCase().replace("_", "-") : a

                    } function t(a) {

                        for (var b, c, d, e, f = 0; f < a.length;) { for (e = s(a[f]).split("-"), b = e.length, c = s(a[f + 1]), c = c ? c.split("-") : null; b > 0;) { if (d = u(e.slice(0, b).join("-"))) return d; if (c && c.length >= b && q(e, c, !0) >= b - 1) break; b-- } f++ } return null

                    } function u(a) {

                        var b = null; if (!Hc[a] && "undefined" != typeof module && module && module.exports) try { b = Ec._abbr, require("./locale/" + a), v(b) } catch (c) { } return Hc[a]

                    } function v(a, b) {

                        var c; return a && (c = "undefined" == typeof b ? x(a) : w(a, b), c && (Ec = c)), Ec._abbr

                    } function w(a, b) {

                        return null !== b ? (b.abbr = a, Hc[a] || (Hc[a] = new r), Hc[a].set(b), v(a), Hc[a]) : (delete Hc[a], null)

                    } function x(a) {

                        var b; if (a && a._locale && a._locale._abbr && (a = a._locale._abbr), !a) return Ec; if (!c(a)) { if (b = u(a)) return b; a = [a] } return t(a)

                    } function y(a, b) {

                        var c = a.toLowerCase(); Ic[c] = Ic[c + "s"] = Ic[b] = a

                    } function z(a) {

                        return "string" == typeof a ? Ic[a] || Ic[a.toLowerCase()] : void 0

                    } function A(a) {

                        var b, c, d = {}; for (c in a) f(a, c) && (b = z(c), b && (d[b] = a[c])); return d

                    } function B(b, c) {

                        return function (d) { return null != d ? (D(this, b, d), a.updateOffset(this, c), this) : C(this, b) }

                    } function C(a, b) {

                        return a._d["get" + (a._isUTC ? "UTC" : "") + b]()

                    } function D(a, b, c) {

                        return a._d["set" + (a._isUTC ? "UTC" : "") + b](c)

                    } function E(a, b) {

                        var c; if ("object" == typeof a) for (c in a) this.set(c, a[c]); else if (a = z(a), "function" == typeof this[a]) return this[a](b); return this

                    } function F(a, b, c) {

                        for (var d = "" + Math.abs(a), e = a >= 0; d.length < b;) d = "0" + d; return (e ? c ? "+" : "" : "-") + d

                    } function G(a, b, c, d) {

                        var e = d; "string" == typeof d && (e = function () { return this[d]() }), a && (Mc[a] = e), b && (Mc[b[0]] = function () { return F(e.apply(this, arguments), b[1], b[2]) }), c && (Mc[c] = function () { return this.localeData().ordinal(e.apply(this, arguments), a) })

                    } function H(a) {

                        return a.match(/\[[\s\S]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "")

                    } function I(a) {

                        var b, c, d = a.match(Jc); for (b = 0, c = d.length; c > b; b++) Mc[d[b]] ? d[b] = Mc[d[b]] : d[b] = H(d[b]); return function (e) { var f = ""; for (b = 0; c > b; b++) f += d[b] instanceof Function ? d[b].call(e, a) : d[b]; return f }

                    } function J(a, b) {

                        return a.isValid() ? (b = K(b, a.localeData()), Lc[b] || (Lc[b] = I(b)), Lc[b](a)) : a.localeData().invalidDate()

                    } function K(a, b) {

                        function c(a) { return b.longDateFormat(a) || a } var d = 5; for (Kc.lastIndex = 0; d >= 0 && Kc.test(a) ;) a = a.replace(Kc, c), Kc.lastIndex = 0, d -= 1; return a

                    } function L(a, b, c) {

                        _c[a] = "function" == typeof b ? b : function (a) { return a && c ? c : b }

                    } function M(a, b) {

                        return f(_c, a) ? _c[a](b._strict, b._locale) : new RegExp(N(a))

                    } function N(a) {

                        return a.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (a, b, c, d, e) { return b || c || d || e }).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")

                    } function O(a, b) {

                        var c, d = b; for ("string" == typeof a && (a = [a]), "number" == typeof b && (d = function (a, c) { c[b] = p(a) }), c = 0; c < a.length; c++) ad[a[c]] = d

                    } function P(a, b) {

                        O(a, function (a, c, d, e) { d._w = d._w || {}, b(a, d._w, d, e) })

                    } function Q(a, b, c) {

                        null != b && f(ad, a) && ad[a](b, c._a, c, a)

                    } function R(a, b) {

                        return new Date(Date.UTC(a, b + 1, 0)).getUTCDate()

                    } function S(a) {

                        return this._months[a.month()]

                    } function T(a) {

                        return this._monthsShort[a.month()]

                    } function U(a, b, c) {

                        var d, e, f; for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), d = 0; 12 > d; d++) { if (e = h([2e3, d]), c && !this._longMonthsParse[d] && (this._longMonthsParse[d] = new RegExp("^" + this.months(e, "").replace(".", "") + "$", "i"), this._shortMonthsParse[d] = new RegExp("^" + this.monthsShort(e, "").replace(".", "") + "$", "i")), c || this._monthsParse[d] || (f = "^" + this.months(e, "") + "|^" + this.monthsShort(e, ""), this._monthsParse[d] = new RegExp(f.replace(".", ""), "i")), c && "MMMM" === b && this._longMonthsParse[d].test(a)) return d; if (c && "MMM" === b && this._shortMonthsParse[d].test(a)) return d; if (!c && this._monthsParse[d].test(a)) return d }

                    } function V(a, b) {

                        var c; return "string" == typeof b && (b = a.localeData().monthsParse(b), "number" != typeof b) ? a : (c = Math.min(a.date(), R(a.year(), b)), a._d["set" + (a._isUTC ? "UTC" : "") + "Month"](b, c), a)

                    } function W(b) {

                        return null != b ? (V(this, b), a.updateOffset(this, !0), this) : C(this, "Month")

                    } function X() {

                        return R(this.year(), this.month())

                    } function Y(a) {

                        var b, c = a._a; return c && -2 === j(a).overflow && (b = c[cd] < 0 || c[cd] > 11 ? cd : c[dd] < 1 || c[dd] > R(c[bd], c[cd]) ? dd : c[ed] < 0 || c[ed] > 24 || 24 === c[ed] && (0 !== c[fd] || 0 !== c[gd] || 0 !== c[hd]) ? ed : c[fd] < 0 || c[fd] > 59 ? fd : c[gd] < 0 || c[gd] > 59 ? gd : c[hd] < 0 || c[hd] > 999 ? hd : -1, j(a)._overflowDayOfYear && (bd > b || b > dd) && (b = dd), j(a).overflow = b), a

                    } function Z(b) {

                        a.suppressDeprecationWarnings === !1 && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + b)

                    } function $(a, b) {

                        var c = !0, d = a + "\n" + (new Error).stack; return g(function () { return c && (Z(d), c = !1), b.apply(this, arguments) }, b)

                    } function _(a, b) {

                        kd[a] || (Z(b), kd[a] = !0)

                    } function aa(a) {

                        var b, c, d = a._i, e = ld.exec(d); if (e) { for (j(a).iso = !0, b = 0, c = md.length; c > b; b++) if (md[b][1].exec(d)) { a._f = md[b][0] + (e[6] || " "); break } for (b = 0, c = nd.length; c > b; b++) if (nd[b][1].exec(d)) { a._f += nd[b][0]; break } d.match(Yc) && (a._f += "Z"), ta(a) } else a._isValid = !1

                    } function ba(b) {

                        var c = od.exec(b._i); return null !== c ? void (b._d = new Date(+c[1])) : (aa(b), void (b._isValid === !1 && (delete b._isValid, a.createFromInputFallback(b))))

                    } function ca(a, b, c, d, e, f, g) {

                        var h = new Date(a, b, c, d, e, f, g); return 1970 > a && h.setFullYear(a), h

                    } function da(a) {

                        var b = new Date(Date.UTC.apply(null, arguments)); return 1970 > a && b.setUTCFullYear(a), b

                    } function ea(a) {

                        return fa(a) ? 366 : 365

                    } function fa(a) {

                        return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0

                    } function ga() {

                        return fa(this.year())

                    } function ha(a, b, c) {

                        var d, e = c - b, f = c - a.day(); return f > e && (f -= 7), e - 7 > f && (f += 7), d = Aa(a).add(f, "d"), { week: Math.ceil(d.dayOfYear() / 7), year: d.year() }

                    } function ia(a) {

                        return ha(a, this._week.dow, this._week.doy).week

                    } function ja() {

                        return this._week.dow

                    } function ka() {

                        return this._week.doy

                    } function la(a) {

                        var b = this.localeData().week(this); return null == a ? b : this.add(7 * (a - b), "d")

                    } function ma(a) {

                        var b = ha(this, 1, 4).week; return null == a ? b : this.add(7 * (a - b), "d")

                    } function na(a, b, c, d, e) {

                        var f, g, h = da(a, 0, 1).getUTCDay(); return h = 0 === h ? 7 : h, c = null != c ? c : e, f = e - h + (h > d ? 7 : 0) - (e > h ? 7 : 0), g = 7 * (b - 1) + (c - e) + f + 1, { year: g > 0 ? a : a - 1, dayOfYear: g > 0 ? g : ea(a - 1) + g }

                    } function oa(a) {

                        var b = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1; return null == a ? b : this.add(a - b, "d")

                    } function pa(a, b, c) {

                        return null != a ? a : null != b ? b : c

                    } function qa(a) {

                        var b = new Date; return a._useUTC ? [b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()] : [b.getFullYear(), b.getMonth(), b.getDate()]

                    } function ra(a) {

                        var b, c, d, e, f = []; if (!a._d) { for (d = qa(a), a._w && null == a._a[dd] && null == a._a[cd] && sa(a), a._dayOfYear && (e = pa(a._a[bd], d[bd]), a._dayOfYear > ea(e) && (j(a)._overflowDayOfYear = !0), c = da(e, 0, a._dayOfYear), a._a[cd] = c.getUTCMonth(), a._a[dd] = c.getUTCDate()), b = 0; 3 > b && null == a._a[b]; ++b) a._a[b] = f[b] = d[b]; for (; 7 > b; b++) a._a[b] = f[b] = null == a._a[b] ? 2 === b ? 1 : 0 : a._a[b]; 24 === a._a[ed] && 0 === a._a[fd] && 0 === a._a[gd] && 0 === a._a[hd] && (a._nextDay = !0, a._a[ed] = 0), a._d = (a._useUTC ? da : ca).apply(null, f), null != a._tzm && a._d.setUTCMinutes(a._d.getUTCMinutes() - a._tzm), a._nextDay && (a._a[ed] = 24) }

                    } function sa(a) {

                        var b, c, d, e, f, g, h; b = a._w, null != b.GG || null != b.W || null != b.E ? (f = 1, g = 4, c = pa(b.GG, a._a[bd], ha(Aa(), 1, 4).year), d = pa(b.W, 1), e = pa(b.E, 1)) : (f = a._locale._week.dow, g = a._locale._week.doy, c = pa(b.gg, a._a[bd], ha(Aa(), f, g).year), d = pa(b.w, 1), null != b.d ? (e = b.d, f > e && ++d) : e = null != b.e ? b.e + f : f), h = na(c, d, e, g, f), a._a[bd] = h.year, a._dayOfYear = h.dayOfYear

                    } function ta(b) {

                        if (b._f === a.ISO_8601) return void aa(b); b._a = [], j(b).empty = !0; var c, d, e, f, g, h = "" + b._i, i = h.length, k = 0; for (e = K(b._f, b._locale).match(Jc) || [], c = 0; c < e.length; c++) f = e[c], d = (h.match(M(f, b)) || [])[0], d && (g = h.substr(0, h.indexOf(d)), g.length > 0 && j(b).unusedInput.push(g), h = h.slice(h.indexOf(d) + d.length), k += d.length), Mc[f] ? (d ? j(b).empty = !1 : j(b).unusedTokens.push(f), Q(f, d, b)) : b._strict && !d && j(b).unusedTokens.push(f); j(b).charsLeftOver = i - k, h.length > 0 && j(b).unusedInput.push(h), j(b).bigHour === !0 && b._a[ed] <= 12 && b._a[ed] > 0 && (j(b).bigHour = void 0), b._a[ed] = ua(b._locale, b._a[ed], b._meridiem), ra(b), Y(b)

                    } function ua(a, b, c) {

                        var d; return null == c ? b : null != a.meridiemHour ? a.meridiemHour(b, c) : null != a.isPM ? (d = a.isPM(c), d && 12 > b && (b += 12), d || 12 !== b || (b = 0), b) : b

                    } function va(a) {

                        var b, c, d, e, f; if (0 === a._f.length) return j(a).invalidFormat = !0, void (a._d = new Date(0 / 0)); for (e = 0; e < a._f.length; e++) f = 0, b = m({}, a), null != a._useUTC && (b._useUTC = a._useUTC), b._f = a._f[e], ta(b), k(b) && (f += j(b).charsLeftOver, f += 10 * j(b).unusedTokens.length, j(b).score = f, (null == d || d > f) && (d = f, c = b)); g(a, c || b)

                    } function wa(a) {

                        if (!a._d) { var b = A(a._i); a._a = [b.year, b.month, b.day || b.date, b.hour, b.minute, b.second, b.millisecond], ra(a) }

                    } function xa(a) {

                        var b, e = a._i, f = a._f; return a._locale = a._locale || x(a._l), null === e || void 0 === f && "" === e ? l({ nullInput: !0 }) : ("string" == typeof e && (a._i = e = a._locale.preparse(e)), o(e) ? new n(Y(e)) : (c(f) ? va(a) : f ? ta(a) : d(e) ? a._d = e : ya(a), b = new n(Y(a)), b._nextDay && (b.add(1, "d"), b._nextDay = void 0), b))

                    } function ya(b) {

                        var f = b._i; void 0 === f ? b._d = new Date : d(f) ? b._d = new Date(+f) : "string" == typeof f ? ba(b) : c(f) ? (b._a = e(f.slice(0), function (a) { return parseInt(a, 10) }), ra(b)) : "object" == typeof f ? wa(b) : "number" == typeof f ? b._d = new Date(f) : a.createFromInputFallback(b)

                    } function za(a, b, c, d, e) {

                        var f = {}; return "boolean" == typeof c && (d = c, c = void 0), f._isAMomentObject = !0, f._useUTC = f._isUTC = e, f._l = c, f._i = a, f._f = b, f._strict = d, xa(f)

                    } function Aa(a, b, c, d) {

                        return za(a, b, c, d, !1)

                    } function Ba(a, b) {

                        var d, e; if (1 === b.length && c(b[0]) && (b = b[0]), !b.length) return Aa(); for (d = b[0], e = 1; e < b.length; ++e) b[e][a](d) && (d = b[e]); return d

                    } function Ca() {

                        var a = [].slice.call(arguments, 0); return Ba("isBefore", a)

                    } function Da() {

                        var a = [].slice.call(arguments, 0); return Ba("isAfter", a)

                    } function Ea(a) {

                        var b = A(a), c = b.year || 0, d = b.quarter || 0, e = b.month || 0, f = b.week || 0, g = b.day || 0, h = b.hour || 0, i = b.minute || 0, j = b.second || 0, k = b.millisecond || 0; this._milliseconds = +k + 1e3 * j + 6e4 * i + 36e5 * h, this._days = +g + 7 * f, this._months = +e + 3 * d + 12 * c, this._data = {}, this._locale = x(), this._bubble()

                    } function Fa(a) {

                        return a instanceof Ea

                    } function Ga(a, b) {

                        G(a, 0, 0, function () { var a = this.utcOffset(), c = "+"; return 0 > a && (a = -a, c = "-"), c + F(~~(a / 60), 2) + b + F(~~a % 60, 2) })

                    } function Ha(a) {

                        var b = (a || "").match(Yc) || [], c = b[b.length - 1] || [], d = (c + "").match(td) || ["-", 0, 0], e = +(60 * d[1]) + p(d[2]); return "+" === d[0] ? e : -e

                    } function Ia(b, c) {

                        var e, f; return c._isUTC ? (e = c.clone(), f = (o(b) || d(b) ? +b : +Aa(b)) - +e, e._d.setTime(+e._d + f), a.updateOffset(e, !1), e) : Aa(b).local(); return c._isUTC ? Aa(b).zone(c._offset || 0) : Aa(b).local()

                    } function Ja(a) {

                        return 15 * -Math.round(a._d.getTimezoneOffset() / 15)

                    } function Ka(b, c) {

                        var d, e = this._offset || 0; return null != b ? ("string" == typeof b && (b = Ha(b)), Math.abs(b) < 16 && (b = 60 * b), !this._isUTC && c && (d = Ja(this)), this._offset = b, this._isUTC = !0, null != d && this.add(d, "m"), e !== b && (!c || this._changeInProgress ? $a(this, Va(b - e, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, a.updateOffset(this, !0), this._changeInProgress = null)), this) : this._isUTC ? e : Ja(this)

                    } function La(a, b) {

                        return null != a ? ("string" != typeof a && (a = -a), this.utcOffset(a, b), this) : -this.utcOffset()

                    } function Ma(a) {

                        return this.utcOffset(0, a)

                    } function Na(a) {

                        return this._isUTC && (this.utcOffset(0, a), this._isUTC = !1, a && this.subtract(Ja(this), "m")), this

                    } function Oa() {

                        return this._tzm ? this.utcOffset(this._tzm) : "string" == typeof this._i && this.utcOffset(Ha(this._i)), this

                    } function Pa(a) {

                        return a = a ? Aa(a).utcOffset() : 0, (this.utcOffset() - a) % 60 === 0

                    } function Qa() {

                        return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset()

                    } function Ra() {

                        if (this._a) { var a = this._isUTC ? h(this._a) : Aa(this._a); return this.isValid() && q(this._a, a.toArray()) > 0 } return !1

                    } function Sa() {

                        return !this._isUTC

                    } function Ta() {

                        return this._isUTC

                    } function Ua() {

                        return this._isUTC && 0 === this._offset

                    } function Va(a, b) {

                        var c, d, e, g = a, h = null; return Fa(a) ? g = { ms: a._milliseconds, d: a._days, M: a._months } : "number" == typeof a ? (g = {}, b ? g[b] = a : g.milliseconds = a) : (h = ud.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = { y: 0, d: p(h[dd]) * c, h: p(h[ed]) * c, m: p(h[fd]) * c, s: p(h[gd]) * c, ms: p(h[hd]) * c }) : (h = vd.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = { y: Wa(h[2], c), M: Wa(h[3], c), d: Wa(h[4], c), h: Wa(h[5], c), m: Wa(h[6], c), s: Wa(h[7], c), w: Wa(h[8], c) }) : null == g ? g = {} : "object" == typeof g && ("from" in g || "to" in g) && (e = Ya(Aa(g.from), Aa(g.to)), g = {}, g.ms = e.milliseconds, g.M = e.months), d = new Ea(g), Fa(a) && f(a, "_locale") && (d._locale = a._locale), d

                    } function Wa(a, b) {

                        var c = a && parseFloat(a.replace(",", ".")); return (isNaN(c) ? 0 : c) * b

                    } function Xa(a, b) {

                        var c = { milliseconds: 0, months: 0 }; return c.months = b.month() - a.month() + 12 * (b.year() - a.year()), a.clone().add(c.months, "M").isAfter(b) && --c.months, c.milliseconds = +b - +a.clone().add(c.months, "M"), c

                    } function Ya(a, b) {

                        var c; return b = Ia(b, a), a.isBefore(b) ? c = Xa(a, b) : (c = Xa(b, a), c.milliseconds = -c.milliseconds, c.months = -c.months), c

                    } function Za(a, b) {

                        return function (c, d) { var e, f; return null === d || isNaN(+d) || (_(b, "moment()." + b + "(period, number) is deprecated. Please use moment()." + b + "(number, period)."), f = c, c = d, d = f), c = "string" == typeof c ? +c : c, e = Va(c, d), $a(this, e, a), this }

                    } function $a(b, c, d, e) {

                        var f = c._milliseconds, g = c._days, h = c._months; e = null == e ? !0 : e, f && b._d.setTime(+b._d + f * d), g && D(b, "Date", C(b, "Date") + g * d), h && V(b, C(b, "Month") + h * d), e && a.updateOffset(b, g || h)

                    } function _a(a) {

                        var b = a || Aa(), c = Ia(b, this).startOf("day"), d = this.diff(c, "days", !0), e = -6 > d ? "sameElse" : -1 > d ? "lastWeek" : 0 > d ? "lastDay" : 1 > d ? "sameDay" : 2 > d ? "nextDay" : 7 > d ? "nextWeek" : "sameElse"; return this.format(this.localeData().calendar(e, this, Aa(b)))

                    } function ab() {

                        return new n(this)

                    } function bb(a, b) {

                        var c; return b = z("undefined" != typeof b ? b : "millisecond"), "millisecond" === b ? (a = o(a) ? a : Aa(a), +this > +a) : (c = o(a) ? +a : +Aa(a), c < +this.clone().startOf(b))

                    } function cb(a, b) {

                        var c; return b = z("undefined" != typeof b ? b : "millisecond"), "millisecond" === b ? (a = o(a) ? a : Aa(a), +a > +this) : (c = o(a) ? +a : +Aa(a), +this.clone().endOf(b) < c)

                    } function db(a, b, c) {

                        return this.isAfter(a, c) && this.isBefore(b, c)

                    } function eb(a, b) {

                        var c; return b = z(b || "millisecond"), "millisecond" === b ? (a = o(a) ? a : Aa(a), +this === +a) : (c = +Aa(a), +this.clone().startOf(b) <= c && c <= +this.clone().endOf(b))

                    } function fb(a) {

                        return 0 > a ? Math.ceil(a) : Math.floor(a)

                    } function gb(a, b, c) {

                        var d, e, f = Ia(a, this), g = 6e4 * (f.utcOffset() - this.utcOffset()); return b = z(b), "year" === b || "month" === b || "quarter" === b ? (e = hb(this, f), "quarter" === b ? e /= 3 : "year" === b && (e /= 12)) : (d = this - f, e = "second" === b ? d / 1e3 : "minute" === b ? d / 6e4 : "hour" === b ? d / 36e5 : "day" === b ? (d - g) / 864e5 : "week" === b ? (d - g) / 6048e5 : d), c ? e : fb(e)

                    } function hb(a, b) {

                        var c, d, e = 12 * (b.year() - a.year()) + (b.month() - a.month()), f = a.clone().add(e, "months"); return 0 > b - f ? (c = a.clone().add(e - 1, "months"), d = (b - f) / (f - c)) : (c = a.clone().add(e + 1, "months"), d = (b - f) / (c - f)), -(e + d)

                    } function ib() {

                        return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")

                    } function jb() {

                        var a = this.clone().utc(); return 0 < a.year() && a.year() <= 9999 ? "function" == typeof Date.prototype.toISOString ? this.toDate().toISOString() : J(a, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : J(a, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")

                    } function kb(b) {

                        var c = J(this, b || a.defaultFormat); return this.localeData().postformat(c)

                    } function lb(a, b) {

                        return this.isValid() ? Va({ to: this, from: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate()

                    } function mb(a) {

                        return this.from(Aa(), a)

                    } function nb(a, b) {

                        return this.isValid() ? Va({ from: this, to: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate()

                    } function ob(a) {

                        return this.to(Aa(), a)

                    } function pb(a) {

                        var b; return void 0 === a ? this._locale._abbr : (b = x(a), null != b && (this._locale = b), this)

                    } function qb() {

                        return this._locale

                    } function rb(a) {

                        switch (a = z(a)) { case "year": this.month(0); case "quarter": case "month": this.date(1); case "week": case "isoWeek": case "day": this.hours(0); case "hour": this.minutes(0); case "minute": this.seconds(0); case "second": this.milliseconds(0) } return "week" === a && this.weekday(0), "isoWeek" === a && this.isoWeekday(1), "quarter" === a && this.month(3 * Math.floor(this.month() / 3)), this

                    } function sb(a) {

                        return a = z(a), void 0 === a || "millisecond" === a ? this : this.startOf(a).add(1, "isoWeek" === a ? "week" : a).subtract(1, "ms")

                    } function tb() {

                        return +this._d - 6e4 * (this._offset || 0)

                    } function ub() {

                        return Math.floor(+this / 1e3)

                    } function vb() {

                        return this._offset ? new Date(+this) : this._d

                    } function wb() {

                        var a = this; return [a.year(), a.month(), a.date(), a.hour(), a.minute(), a.second(), a.millisecond()]

                    } function xb() {

                        return k(this)

                    } function yb() {

                        return g({}, j(this))

                    } function zb() {

                        return j(this).overflow

                    } function Ab(a, b) {

                        G(0, [a, a.length], 0, b)

                    } function Bb(a, b, c) {

                        return ha(Aa([a, 11, 31 + b - c]), b, c).week

                    } function Cb(a) {

                        var b = ha(this, this.localeData()._week.dow, this.localeData()._week.doy).year; return null == a ? b : this.add(a - b, "y")

                    } function Db(a) {

                        var b = ha(this, 1, 4).year; return null == a ? b : this.add(a - b, "y")

                    } function Eb() {

                        return Bb(this.year(), 1, 4)

                    } function Fb() {

                        var a = this.localeData()._week; return Bb(this.year(), a.dow, a.doy)

                    } function Gb(a) {

                        return null == a ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (a - 1) + this.month() % 3)

                    } function Hb(a, b) {

                        if ("string" == typeof a) if (isNaN(a)) { if (a = b.weekdaysParse(a), "number" != typeof a) return null } else a = parseInt(a, 10); return a

                    } function Ib(a) {

                        return this._weekdays[a.day()]

                    } function Jb(a) {

                        return this._weekdaysShort[a.day()]

                    } function Kb(a) {

                        return this._weekdaysMin[a.day()]

                    } function Lb(a) {

                        var b, c, d; for (this._weekdaysParse || (this._weekdaysParse = []), b = 0; 7 > b; b++) if (this._weekdaysParse[b] || (c = Aa([2e3, 1]).day(b), d = "^" + this.weekdays(c, "") + "|^" + this.weekdaysShort(c, "") + "|^" + this.weekdaysMin(c, ""), this._weekdaysParse[b] = new RegExp(d.replace(".", ""), "i")), this._weekdaysParse[b].test(a)) return b

                    } function Mb(a) {

                        var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay(); return null != a ? (a = Hb(a, this.localeData()), this.add(a - b, "d")) : b

                    } function Nb(a) {

                        var b = (this.day() + 7 - this.localeData()._week.dow) % 7; return null == a ? b : this.add(a - b, "d")

                    } function Ob(a) {

                        return null == a ? this.day() || 7 : this.day(this.day() % 7 ? a : a - 7)

                    } function Pb(a, b) {

                        G(a, 0, 0, function () { return this.localeData().meridiem(this.hours(), this.minutes(), b) })

                    } function Qb(a, b) {

                        return b._meridiemParse

                    } function Rb(a) {

                        return "p" === (a + "").toLowerCase().charAt(0)

                    } function Sb(a, b, c) {

                        return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM"

                    } function Tb(a) {

                        G(0, [a, 3], 0, "millisecond")

                    } function Ub() {

                        return this._isUTC ? "UTC" : ""

                    } function Vb() {

                        return this._isUTC ? "Coordinated Universal Time" : ""

                    } function Wb(a) {

                        return Aa(1e3 * a)

                    } function Xb() {

                        return Aa.apply(null, arguments).parseZone()

                    } function Yb(a, b, c) {

                        var d = this._calendar[a]; return "function" == typeof d ? d.call(b, c) : d

                    } function Zb(a) {

                        var b = this._longDateFormat[a]; return !b && this._longDateFormat[a.toUpperCase()] && (b = this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (a) { return a.slice(1) }), this._longDateFormat[a] = b), b

                    } function $b() {

                        return this._invalidDate

                    } function _b(a) {

                        return this._ordinal.replace("%d", a)

                    } function ac(a) {

                        return a

                    } function bc(a, b, c, d) {

                        var e = this._relativeTime[c]; return "function" == typeof e ? e(a, b, c, d) : e.replace(/%d/i, a)

                    } function cc(a, b) {

                        var c = this._relativeTime[a > 0 ? "future" : "past"]; return "function" == typeof c ? c(b) : c.replace(/%s/i, b)

                    } function dc(a) {

                        var b, c; for (c in a) b = a[c], "function" == typeof b ? this[c] = b : this["_" + c] = b; this._ordinalParseLenient = new RegExp(this._ordinalParse.source + "|" + /\d{1,2}/.source)

                    } function ec(a, b, c, d) {

                        var e = x(), f = h().set(d, b); return e[c](f, a)

                    } function fc(a, b, c, d, e) {

                        if ("number" == typeof a && (b = a, a = void 0), a = a || "", null != b) return ec(a, b, c, e); var f, g = []; for (f = 0; d > f; f++) g[f] = ec(a, f, c, e); return g

                    } function gc(a, b) {

                        return fc(a, b, "months", 12, "month")

                    } function hc(a, b) {

                        return fc(a, b, "monthsShort", 12, "month")

                    } function ic(a, b) {

                        return fc(a, b, "weekdays", 7, "day")

                    } function jc(a, b) {

                        return fc(a, b, "weekdaysShort", 7, "day")

                    } function kc(a, b) {

                        return fc(a, b, "weekdaysMin", 7, "day")

                    } function lc() {

                        var a = this._data; return this._milliseconds = Rd(this._milliseconds), this._days = Rd(this._days), this._months = Rd(this._months), a.milliseconds = Rd(a.milliseconds), a.seconds = Rd(a.seconds), a.minutes = Rd(a.minutes), a.hours = Rd(a.hours), a.months = Rd(a.months), a.years = Rd(a.years), this

                    } function mc(a, b, c, d) {

                        var e = Va(b, c); return a._milliseconds += d * e._milliseconds, a._days += d * e._days, a._months += d * e._months, a._bubble()

                    } function nc(a, b) {

                        return mc(this, a, b, 1)

                    } function oc(a, b) {

                        return mc(this, a, b, -1)

                    } function pc() {

                        var a, b, c, d = this._milliseconds, e = this._days, f = this._months, g = this._data, h = 0; return g.milliseconds = d % 1e3, a = fb(d / 1e3), g.seconds = a % 60, b = fb(a / 60), g.minutes = b % 60, c = fb(b / 60), g.hours = c % 24, e += fb(c / 24), h = fb(qc(e)), e -= fb(rc(h)), f += fb(e / 30), e %= 30, h += fb(f / 12), f %= 12, g.days = e, g.months = f, g.years = h, this

                    } function qc(a) {

                        return 400 * a / 146097

                    } function rc(a) {

                        return 146097 * a / 400

                    } function sc(a) {

                        var b, c, d = this._milliseconds; if (a = z(a), "month" === a || "year" === a) return b = this._days + d / 864e5, c = this._months + 12 * qc(b), "month" === a ? c : c / 12; switch (b = this._days + Math.round(rc(this._months / 12)), a) { case "week": return b / 7 + d / 6048e5; case "day": return b + d / 864e5; case "hour": return 24 * b + d / 36e5; case "minute": return 1440 * b + d / 6e4; case "second": return 86400 * b + d / 1e3; case "millisecond": return Math.floor(864e5 * b) + d; default: throw new Error("Unknown unit " + a) }

                    } function tc() {

                        return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * p(this._months / 12)

                    } function uc(a) {

                        return function () { return this.as(a) }

                    } function vc(a) {

                        return a = z(a), this[a + "s"]()

                    } function wc(a) {

                        return function () { return this._data[a] }

                    } function xc() {

                        return fb(this.days() / 7)

                    } function yc(a, b, c, d, e) {

                        return e.relativeTime(b || 1, !!c, a, d)

                    } function zc(a, b, c) {

                        var d = Va(a).abs(), e = fe(d.as("s")), f = fe(d.as("m")), g = fe(d.as("h")), h = fe(d.as("d")), i = fe(d.as("M")), j = fe(d.as("y")), k = e < ge.s && ["s", e] || 1 === f && ["m"] || f < ge.m && ["mm", f] || 1 === g && ["h"] || g < ge.h && ["hh", g] || 1 === h && ["d"] || h < ge.d && ["dd", h] || 1 === i && ["M"] || i < ge.M && ["MM", i] || 1 === j && ["y"] || ["yy", j]; return k[2] = b, k[3] = +a > 0, k[4] = c, yc.apply(null, k)

                    } function Ac(a, b) {

                        return void 0 === ge[a] ? !1 : void 0 === b ? ge[a] : (ge[a] = b, !0)

                    } function Bc(a) {

                        var b = this.localeData(), c = zc(this, !a, b); return a && (c = b.pastFuture(+this, c)), b.postformat(c)

                    } function Cc() {

                        var a = he(this.years()), b = he(this.months()), c = he(this.days()), d = he(this.hours()), e = he(this.minutes()), f = he(this.seconds() + this.milliseconds() / 1e3), g = this.asSeconds(); return g ? (0 > g ? "-" : "") + "P" + (a ? a + "Y" : "") + (b ? b + "M" : "") + (c ? c + "D" : "") + (d || e || f ? "T" : "") + (d ? d + "H" : "") + (e ? e + "M" : "") + (f ? f + "S" : "") : "P0D"

                    } var Dc, Ec, Fc = a.momentProperties = [], Gc = !1, Hc = {}, Ic = {}, Jc = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g, Kc = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, Lc = {}, Mc = {}, Nc = /\d/, Oc = /\d\d/, Pc = /\d{3}/, Qc = /\d{4}/, Rc = /[+-]?\d{6}/, Sc = /\d\d?/, Tc = /\d{1,3}/, Uc = /\d{1,4}/, Vc = /[+-]?\d{1,6}/, Wc = /\d+/, Xc = /[+-]?\d+/, Yc = /Z|[+-]\d\d:?\d\d/gi, Zc = /[+-]?\d+(\.\d{1,3})?/, $c = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, _c = {}, ad = {}, bd = 0, cd = 1, dd = 2, ed = 3, fd = 4, gd = 5, hd = 6; G("M", ["MM", 2], "Mo", function () { return this.month() + 1 }), G("MMM", 0, 0, function (a) { return this.localeData().monthsShort(this, a) }), G("MMMM", 0, 0, function (a) { return this.localeData().months(this, a) }), y("month", "M"), L("M", Sc), L("MM", Sc, Oc), L("MMM", $c), L("MMMM", $c), O(["M", "MM"], function (a, b) { b[cd] = p(a) - 1 }), O(["MMM", "MMMM"], function (a, b, c, d) { var e = c._locale.monthsParse(a, d, c._strict); null != e ? b[cd] = e : j(c).invalidMonth = a }); var id = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), jd = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), kd = {

                    }; a.suppressDeprecationWarnings = !1; var ld = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, md = [["YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/], ["YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/], ["GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/], ["GGGG-[W]WW", /\d{4}-W\d{2}/], ["YYYY-DDD", /\d{4}-\d{3}/]], nd = [["HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss", /(T| )\d\d:\d\d:\d\d/], ["HH:mm", /(T| )\d\d:\d\d/], ["HH", /(T| )\d\d/]], od = /^\/?Date\((\-?\d+)/i; a.createFromInputFallback = $("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.", function (a) { a._d = new Date(a._i + (a._useUTC ? " UTC" : "")) }), G(0, ["YY", 2], 0, function () { return this.year() % 100 }), G(0, ["YYYY", 4], 0, "year"), G(0, ["YYYYY", 5], 0, "year"), G(0, ["YYYYYY", 6, !0], 0, "year"), y("year", "y"), L("Y", Xc), L("YY", Sc, Oc), L("YYYY", Uc, Qc), L("YYYYY", Vc, Rc), L("YYYYYY", Vc, Rc), O(["YYYY", "YYYYY", "YYYYYY"], bd), O("YY", function (b, c) { c[bd] = a.parseTwoDigitYear(b) }), a.parseTwoDigitYear = function (a) {

                        return p(a) + (p(a) > 68 ? 1900 : 2e3)

                    }; var pd = B("FullYear", !1); G("w", ["ww", 2], "wo", "week"), G("W", ["WW", 2], "Wo", "isoWeek"), y("week", "w"), y("isoWeek", "W"), L("w", Sc), L("ww", Sc, Oc), L("W", Sc), L("WW", Sc, Oc), P(["w", "ww", "W", "WW"], function (a, b, c, d) { b[d.substr(0, 1)] = p(a) }); var qd = {

                        dow: 0, doy: 6

                    }; G("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), y("dayOfYear", "DDD"), L("DDD", Tc), L("DDDD", Pc), O(["DDD", "DDDD"], function (a, b, c) { c._dayOfYear = p(a) }), a.ISO_8601 = function () {

                    }; var rd = $("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548", function () { var a = Aa.apply(null, arguments); return this > a ? this : a }), sd = $("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548", function () { var a = Aa.apply(null, arguments); return a > this ? this : a }); Ga("Z", ":"), Ga("ZZ", ""), L("Z", Yc), L("ZZ", Yc), O(["Z", "ZZ"], function (a, b, c) { c._useUTC = !0, c._tzm = Ha(a) }); var td = /([\+\-]|\d\d)/gi; a.updateOffset = function () {

                    }; var ud = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, vd = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/; Va.fn = Ea.prototype; var wd = Za(1, "add"), xd = Za(-1, "subtract"); a.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ"; var yd = $("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function (a) { return void 0 === a ? this.localeData() : this.locale(a) }); G(0, ["gg", 2], 0, function () { return this.weekYear() % 100 }), G(0, ["GG", 2], 0, function () { return this.isoWeekYear() % 100 }), Ab("gggg", "weekYear"), Ab("ggggg", "weekYear"), Ab("GGGG", "isoWeekYear"), Ab("GGGGG", "isoWeekYear"), y("weekYear", "gg"), y("isoWeekYear", "GG"), L("G", Xc), L("g", Xc), L("GG", Sc, Oc), L("gg", Sc, Oc), L("GGGG", Uc, Qc), L("gggg", Uc, Qc), L("GGGGG", Vc, Rc), L("ggggg", Vc, Rc), P(["gggg", "ggggg", "GGGG", "GGGGG"], function (a, b, c, d) { b[d.substr(0, 2)] = p(a) }), P(["gg", "GG"], function (b, c, d, e) { c[e] = a.parseTwoDigitYear(b) }), G("Q", 0, 0, "quarter"), y("quarter", "Q"), L("Q", Nc), O("Q", function (a, b) { b[cd] = 3 * (p(a) - 1) }), G("D", ["DD", 2], "Do", "date"), y("date", "D"), L("D", Sc), L("DD", Sc, Oc), L("Do", function (a, b) { return a ? b._ordinalParse : b._ordinalParseLenient }), O(["D", "DD"], dd), O("Do", function (a, b) { b[dd] = p(a.match(Sc)[0], 10) }); var zd = B("Date", !0); G("d", 0, "do", "day"), G("dd", 0, 0, function (a) { return this.localeData().weekdaysMin(this, a) }), G("ddd", 0, 0, function (a) { return this.localeData().weekdaysShort(this, a) }), G("dddd", 0, 0, function (a) { return this.localeData().weekdays(this, a) }), G("e", 0, 0, "weekday"), G("E", 0, 0, "isoWeekday"), y("day", "d"), y("weekday", "e"), y("isoWeekday", "E"), L("d", Sc), L("e", Sc), L("E", Sc), L("dd", $c), L("ddd", $c), L("dddd", $c), P(["dd", "ddd", "dddd"], function (a, b, c) { var d = c._locale.weekdaysParse(a); null != d ? b.d = d : j(c).invalidWeekday = a }), P(["d", "e", "E"], function (a, b, c, d) { b[d] = p(a) }); var Ad = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), Bd = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), Cd = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"); G("H", ["HH", 2], 0, "hour"), G("h", ["hh", 2], 0, function () { return this.hours() % 12 || 12 }), Pb("a", !0), Pb("A", !1), y("hour", "h"), L("a", Qb), L("A", Qb), L("H", Sc), L("h", Sc), L("HH", Sc, Oc), L("hh", Sc, Oc), O(["H", "HH"], ed), O(["a", "A"], function (a, b, c) { c._isPm = c._locale.isPM(a), c._meridiem = a }), O(["h", "hh"], function (a, b, c) { b[ed] = p(a), j(c).bigHour = !0 }); var Dd = /[ap]\.?m?\.?/i, Ed = B("Hours", !0); G("m", ["mm", 2], 0, "minute"), y("minute", "m"), L("m", Sc), L("mm", Sc, Oc), O(["m", "mm"], fd); var Fd = B("Minutes", !1); G("s", ["ss", 2], 0, "second"), y("second", "s"), L("s", Sc), L("ss", Sc, Oc), O(["s", "ss"], gd); var Gd = B("Seconds", !1); G("S", 0, 0, function () { return ~~(this.millisecond() / 100) }), G(0, ["SS", 2], 0, function () { return ~~(this.millisecond() / 10) }), Tb("SSS"), Tb("SSSS"), y("millisecond", "ms"), L("S", Tc, Nc), L("SS", Tc, Oc), L("SSS", Tc, Pc), L("SSSS", Wc), O(["S", "SS", "SSS", "SSSS"], function (a, b) { b[hd] = p(1e3 * ("0." + a)) }); var Hd = B("Milliseconds", !1); G("z", 0, 0, "zoneAbbr"), G("zz", 0, 0, "zoneName"); var Id = n.prototype; Id.add = wd, Id.calendar = _a, Id.clone = ab, Id.diff = gb, Id.endOf = sb, Id.format = kb, Id.from = lb, Id.fromNow = mb, Id.to = nb, Id.toNow = ob, Id.get = E, Id.invalidAt = zb, Id.isAfter = bb, Id.isBefore = cb, Id.isBetween = db, Id.isSame = eb, Id.isValid = xb, Id.lang = yd, Id.locale = pb, Id.localeData = qb, Id.max = sd, Id.min = rd, Id.parsingFlags = yb, Id.set = E, Id.startOf = rb, Id.subtract = xd, Id.toArray = wb, Id.toDate = vb, Id.toISOString = jb, Id.toJSON = jb, Id.toString = ib, Id.unix = ub, Id.valueOf = tb, Id.year = pd, Id.isLeapYear = ga, Id.weekYear = Cb, Id.isoWeekYear = Db, Id.quarter = Id.quarters = Gb, Id.month = W, Id.daysInMonth = X, Id.week = Id.weeks = la, Id.isoWeek = Id.isoWeeks = ma, Id.weeksInYear = Fb, Id.isoWeeksInYear = Eb, Id.date = zd, Id.day = Id.days = Mb, Id.weekday = Nb, Id.isoWeekday = Ob, Id.dayOfYear = oa, Id.hour = Id.hours = Ed, Id.minute = Id.minutes = Fd, Id.second = Id.seconds = Gd, Id.millisecond = Id.milliseconds = Hd, Id.utcOffset = Ka, Id.utc = Ma, Id.local = Na, Id.parseZone = Oa, Id.hasAlignedHourOffset = Pa, Id.isDST = Qa, Id.isDSTShifted = Ra, Id.isLocal = Sa, Id.isUtcOffset = Ta, Id.isUtc = Ua, Id.isUTC = Ua, Id.zoneAbbr = Ub, Id.zoneName = Vb, Id.dates = $("dates accessor is deprecated. Use date instead.", zd), Id.months = $("months accessor is deprecated. Use month instead", W), Id.years = $("years accessor is deprecated. Use year instead", pd), Id.zone = $("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779", La); var Jd = Id, Kd = { sameDay: "[Today at] LT", nextDay: "[Tomorrow at] LT", nextWeek: "dddd [at] LT", lastDay: "[Yesterday at] LT", lastWeek: "[Last] dddd [at] LT", sameElse: "L" }, Ld = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY LT", LLLL: "dddd, MMMM D, YYYY LT" }, Md = "Invalid date", Nd = "%d", Od = /\d{1,2}/, Pd = {

                        future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour",

                        hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years"

                    }, Qd = r.prototype; Qd._calendar = Kd, Qd.calendar = Yb, Qd._longDateFormat = Ld, Qd.longDateFormat = Zb, Qd._invalidDate = Md, Qd.invalidDate = $b, Qd._ordinal = Nd, Qd.ordinal = _b, Qd._ordinalParse = Od, Qd.preparse = ac, Qd.postformat = ac, Qd._relativeTime = Pd, Qd.relativeTime = bc, Qd.pastFuture = cc, Qd.set = dc, Qd.months = S, Qd._months = id, Qd.monthsShort = T, Qd._monthsShort = jd, Qd.monthsParse = U, Qd.week = ia, Qd._week = qd, Qd.firstDayOfYear = ka, Qd.firstDayOfWeek = ja, Qd.weekdays = Ib, Qd._weekdays = Ad, Qd.weekdaysMin = Kb, Qd._weekdaysMin = Cd, Qd.weekdaysShort = Jb, Qd._weekdaysShort = Bd, Qd.weekdaysParse = Lb, Qd.isPM = Rb, Qd._meridiemParse = Dd, Qd.meridiem = Sb, v("en", { ordinalParse: /\d{1,2}(th|st|nd|rd)/, ordinal: function (a) { var b = a % 10, c = 1 === p(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th"; return a + c } }), a.lang = $("moment.lang is deprecated. Use moment.locale instead.", v), a.langData = $("moment.langData is deprecated. Use moment.localeData instead.", x); var Rd = Math.abs, Sd = uc("ms"), Td = uc("s"), Ud = uc("m"), Vd = uc("h"), Wd = uc("d"), Xd = uc("w"), Yd = uc("M"), Zd = uc("y"), $d = wc("milliseconds"), _d = wc("seconds"), ae = wc("minutes"), be = wc("hours"), ce = wc("days"), de = wc("months"), ee = wc("years"), fe = Math.round, ge = { s: 45, m: 45, h: 22, d: 26, M: 11 }, he = Math.abs, ie = Ea.prototype; ie.abs = lc, ie.add = nc, ie.subtract = oc, ie.as = sc, ie.asMilliseconds = Sd, ie.asSeconds = Td, ie.asMinutes = Ud, ie.asHours = Vd, ie.asDays = Wd, ie.asWeeks = Xd, ie.asMonths = Yd, ie.asYears = Zd, ie.valueOf = tc, ie._bubble = pc, ie.get = vc, ie.milliseconds = $d, ie.seconds = _d, ie.minutes = ae, ie.hours = be, ie.days = ce, ie.weeks = xc, ie.months = de, ie.years = ee, ie.humanize = Bc, ie.toISOString = Cc, ie.toString = Cc, ie.toJSON = Cc, ie.locale = pb, ie.localeData = qb, ie.toIsoString = $("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", Cc), ie.lang = yd, G("X", 0, 0, "unix"), G("x", 0, 0, "valueOf"), L("x", Xc), L("X", Zc), O("X", function (a, b, c) { c._d = new Date(1e3 * parseFloat(a, 10)) }), O("x", function (a, b, c) { c._d = new Date(p(a)) }), a.version = "2.10.3", b(Aa), a.fn = Jd, a.min = Ca, a.max = Da, a.utc = h, a.unix = Wb, a.months = gc, a.isDate = d, a.locale = v, a.invalid = l, a.duration = Va, a.isMoment = o, a.weekdays = ic, a.parseZone = Xb, a.localeData = x, a.isDuration = Fa, a.monthsShort = hc, a.weekdaysMin = kc, a.defineLocale = w, a.weekdaysShort = jc, a.normalizeUnits = z, a.relativeTimeThreshold = Ac; var je = a; return je

                });

        

        

                /*

                 The MIT License (MIT)

                

                 Copyright (c) 2015 Jonathan Peterson

                

                 Permission is hereby granted, free of charge, to any person obtaining a copy

                 of this software and associated documentation files (the "Software"), to deal

                 in the Software without restriction, including without limitation the rights

                 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell

                 copies of the Software, and to permit persons to whom the Software is

                 furnished to do so, subject to the following conditions:

                

                 The above copyright notice and this permission notice shall be included in

                 all copies or substantial portions of the Software.

                

                 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR

                 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,

                 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE

                 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER

                 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,

                 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN

                 THE SOFTWARE.

                 */

                !function (e) { "use strict"; if ("function" == typeof define && define.amd) define(["jquery", "moment"], e); else if ("object" == typeof exports) e(require("jquery"), require("moment")); else { if ("undefined" == typeof jQuery) throw "bootstrap-datetimepicker requires jQuery to be loaded first"; if ("undefined" == typeof moment) throw "bootstrap-datetimepicker requires Moment.js to be loaded first"; e(jQuery, moment) } }(function (e, t) { "use strict"; if (!t) throw new Error("bootstrap-datetimepicker requires Moment.js to be loaded first"); var a = function (a, n) { var r, i, o, s, d, p = {}, l = t().startOf("d"), c = l.clone(), u = !0, f = !1, m = !1, h = 0, g = [{ clsName: "days", navFnc: "M", navStep: 1 }, { clsName: "months", navFnc: "y", navStep: 1 }, { clsName: "years", navFnc: "y", navStep: 10 }], y = ["days", "months", "years"], w = ["top", "bottom", "auto"], b = ["left", "right", "auto"], v = ["default", "top", "bottom"], k = { up: 38, 38: "up", down: 40, 40: "down", left: 37, 37: "left", right: 39, 39: "right", tab: 9, 9: "tab", escape: 27, 27: "escape", enter: 13, 13: "enter", pageUp: 33, 33: "pageUp", pageDown: 34, 34: "pageDown", shift: 16, 16: "shift", control: 17, 17: "control", space: 32, 32: "space", t: 84, 84: "t", "delete": 46, 46: "delete" }, C = {}, x = function (e) { if ("string" != typeof e || e.length > 1) throw new TypeError("isEnabled expects a single character string parameter"); switch (e) { case "y": return -1 !== o.indexOf("Y"); case "M": return -1 !== o.indexOf("M"); case "d": return -1 !== o.toLowerCase().indexOf("d"); case "h": case "H": return -1 !== o.toLowerCase().indexOf("h"); case "m": return -1 !== o.indexOf("m"); case "s": return -1 !== o.indexOf("s"); default: return !1 } }, D = function () { return x("h") || x("m") || x("s") }, T = function () { return x("y") || x("M") || x("d") }, M = function () { var t = e("<thead>").append(e("<tr>").append(e("<th>").addClass("prev").attr("data-action", "previous").append(e("<span>").addClass(n.icons.previous))).append(e("<th>").addClass("picker-switch").attr("data-action", "pickerSwitch").attr("colspan", n.calendarWeeks ? "6" : "5")).append(e("<th>").addClass("next").attr("data-action", "next").append(e("<span>").addClass(n.icons.next)))), a = e("<tbody>").append(e("<tr>").append(e("<td>").attr("colspan", n.calendarWeeks ? "8" : "7"))); return [e("<div>").addClass("datepicker-days").append(e("<table>").addClass("table-condensed").append(t).append(e("<tbody>"))), e("<div>").addClass("datepicker-months").append(e("<table>").addClass("table-condensed").append(t.clone()).append(a.clone())), e("<div>").addClass("datepicker-years").append(e("<table>").addClass("table-condensed").append(t.clone()).append(a.clone()))] }, O = function () { var t = e("<tr>"), a = e("<tr>"), r = e("<tr>"); return x("h") && (t.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "incrementHours").append(e("<span>").addClass(n.icons.up)))), a.append(e("<td>").append(e("<span>").addClass("timepicker-hour").attr("data-time-component", "hours").attr("data-action", "showHours"))), r.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "decrementHours").append(e("<span>").addClass(n.icons.down))))), x("m") && (x("h") && (t.append(e("<td>").addClass("separator")), a.append(e("<td>").addClass("separator").html(":")), r.append(e("<td>").addClass("separator"))), t.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "incrementMinutes").append(e("<span>").addClass(n.icons.up)))), a.append(e("<td>").append(e("<span>").addClass("timepicker-minute").attr("data-time-component", "minutes").attr("data-action", "showMinutes"))), r.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "decrementMinutes").append(e("<span>").addClass(n.icons.down))))), x("s") && (x("m") && (t.append(e("<td>").addClass("separator")), a.append(e("<td>").addClass("separator").html(":")), r.append(e("<td>").addClass("separator"))), t.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "incrementSeconds").append(e("<span>").addClass(n.icons.up)))), a.append(e("<td>").append(e("<span>").addClass("timepicker-second").attr("data-time-component", "seconds").attr("data-action", "showSeconds"))), r.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "decrementSeconds").append(e("<span>").addClass(n.icons.down))))), i || (t.append(e("<td>").addClass("separator")), a.append(e("<td>").append(e("<button>").addClass("btn btn-primary").attr("data-action", "togglePeriod"))), r.append(e("<td>").addClass("separator"))), e("<div>").addClass("timepicker-picker").append(e("<table>").addClass("table-condensed").append([t, a, r])) }, E = function () { var t = e("<div>").addClass("timepicker-hours").append(e("<table>").addClass("table-condensed")), a = e("<div>").addClass("timepicker-minutes").append(e("<table>").addClass("table-condensed")), n = e("<div>").addClass("timepicker-seconds").append(e("<table>").addClass("table-condensed")), r = [O()]; return x("h") && r.push(t), x("m") && r.push(a), x("s") && r.push(n), r }, P = function () { var t = []; return n.showTodayButton && t.push(e("<td>").append(e("<a>").attr("data-action", "today").append(e("<span>").addClass(n.icons.today)))), !n.sideBySide && T() && D() && t.push(e("<td>").append(e("<a>").attr("data-action", "togglePicker").append(e("<span>").addClass(n.icons.time)))), n.showClear && t.push(e("<td>").append(e("<a>").attr("data-action", "clear").append(e("<span>").addClass(n.icons.clear)))), n.showClose && t.push(e("<td>").append(e("<a>").attr("data-action", "close").append(e("<span>").addClass(n.icons.close)))), e("<table>").addClass("table-condensed").append(e("<tbody>").append(e("<tr>").append(t))) }, S = function () { var t = e("<div>").addClass("bootstrap-datetimepicker-widget dropdown-menu"), a = e("<div>").addClass("datepicker").append(M()), r = e("<div>").addClass("timepicker").append(E()), o = e("<ul>").addClass("list-unstyled"), s = e("<li>").addClass("picker-switch" + (n.collapse ? " accordion-toggle" : "")).append(P()); return n.inline && t.removeClass("dropdown-menu"), i && t.addClass("usetwentyfour"), n.sideBySide && T() && D() ? (t.addClass("timepicker-sbs"), t.append(e("<div>").addClass("row").append(a.addClass("col-sm-6")).append(r.addClass("col-sm-6"))), t.append(s), t) : ("top" === n.toolbarPlacement && o.append(s), T() && o.append(e("<li>").addClass(n.collapse && D() ? "collapse in" : "").append(a)), "default" === n.toolbarPlacement && o.append(s), D() && o.append(e("<li>").addClass(n.collapse && T() ? "collapse" : "").append(r)), "bottom" === n.toolbarPlacement && o.append(s), t.append(o)) }, B = function () { var t, r = {}; return t = a.is("input") || n.inline ? a.data() : a.find("input").data(), t.dateOptions && t.dateOptions instanceof Object && (r = e.extend(!0, r, t.dateOptions)), e.each(n, function (e) { var a = "date" + e.charAt(0).toUpperCase() + e.slice(1); void 0 !== t[a] && (r[e] = t[a]) }), r }, j = function () { var t, r = (f || a).position(), i = (f || a).offset(), o = n.widgetPositioning.vertical, s = n.widgetPositioning.horizontal; if (n.widgetParent) t = n.widgetParent.append(m); else if (a.is("input")) t = a.parent().append(m); else { if (n.inline) return void (t = a.append(m)); t = a, a.children().first().after(m) } if ("auto" === o && (o = i.top + 1.5 * m.height() >= e(window).height() + e(window).scrollTop() && m.height() + a.outerHeight() < i.top ? "top" : "bottom"), "auto" === s && (s = t.width() < i.left + m.outerWidth() / 2 && i.left + m.outerWidth() > e(window).width() ? "right" : "left"), "top" === o ? m.addClass("top").removeClass("bottom") : m.addClass("bottom").removeClass("top"), "right" === s ? m.addClass("pull-right") : m.removeClass("pull-right"), "relative" !== t.css("position") && (t = t.parents().filter(function () { return "relative" === e(this).css("position") }).first()), 0 === t.length) throw new Error("datetimepicker component should be placed within a relative positioned container"); var d = e(a).parents().filter(function () { return "fixed" === e(this).css("position") }).length > 0; if ("fixed" === m.css("position") && d) { var i = a.offset(), p = i.left, l = jQuery(window).height() - (jQuery(a).offset().top - jQuery(window).scrollTop()); m.css({ bottom: l, left: p }) } else m.css({ top: "top" === o ? "auto" : r.top + a.outerHeight(), bottom: "top" === o ? r.top + a.outerHeight() : "auto", left: "left" === s ? t.css("padding-left") : "auto", right: "left" === s ? "auto" : t.width() - a.outerWidth() }) }, H = function (e) { "dp.change" === e.type && (e.date && e.date.isSame(e.oldDate) || !e.date && !e.oldDate) || a.trigger(e) }, I = function (e) { m && (e && (d = Math.max(h, Math.min(2, d + e))), m.find(".datepicker > div").hide().filter(".datepicker-" + g[d].clsName).show()) }, F = function () { var t = e("<tr>"), a = c.clone().startOf("w"); for (n.calendarWeeks === !0 && t.append(e("<th>").addClass("cw").text("#")) ; a.isBefore(c.clone().endOf("w")) ;) t.append(e("<th>").addClass("dow").text(a.format("dd"))), a.add(1, "d"); m.find(".datepicker-days thead").append(t) }, L = function (e) { return n.disabledDates[e.format("YYYY-MM-DD")] === !0 }, Y = function (e) { return n.enabledDates[e.format("YYYY-MM-DD")] === !0 }, W = function (e, t) { return e.isValid() ? n.disabledDates && L(e) && "M" !== t ? !1 : n.enabledDates && !Y(e) && "M" !== t ? !1 : n.minDate && e.isBefore(n.minDate, t) ? !1 : n.maxDate && e.isAfter(n.maxDate, t) ? !1 : "d" === t && -1 !== n.daysOfWeekDisabled.indexOf(e.day()) ? !1 : !0 : !1 }, q = function () { for (var t = [], a = c.clone().startOf("y").hour(12) ; a.isSame(c, "y") ;) t.push(e("<span>").attr("data-action", "selectMonth").addClass("month").text(a.format("MMM"))), a.add(1, "M"); m.find(".datepicker-months td").empty().append(t) }, z = function () { var t = m.find(".datepicker-months"), a = t.find("th"), n = t.find("tbody").find("span"); t.find(".disabled").removeClass("disabled"), W(c.clone().subtract(1, "y"), "y") || a.eq(0).addClass("disabled"), a.eq(1).text(c.year()), W(c.clone().add(1, "y"), "y") || a.eq(2).addClass("disabled"), n.removeClass("active"), l.isSame(c, "y") && n.eq(l.month()).addClass("active"), n.each(function (t) { W(c.clone().month(t), "M") || e(this).addClass("disabled") }) }, A = function () { var e = m.find(".datepicker-years"), t = e.find("th"), a = c.clone().subtract(5, "y"), r = c.clone().add(6, "y"), i = ""; for (e.find(".disabled").removeClass("disabled"), n.minDate && n.minDate.isAfter(a, "y") && t.eq(0).addClass("disabled"), t.eq(1).text(a.year() + "-" + r.year()), n.maxDate && n.maxDate.isBefore(r, "y") && t.eq(2).addClass("disabled") ; !a.isAfter(r, "y") ;) i += '<span data-action="selectYear" class="year' + (a.isSame(l, "y") ? " active" : "") + (W(a, "y") ? "" : " disabled") + '">' + a.year() + "</span>", a.add(1, "y"); e.find("td").html(i) }, V = function () { var a, r, i, o = m.find(".datepicker-days"), s = o.find("th"), d = []; if (T()) { for (o.find(".disabled").removeClass("disabled"), s.eq(1).text(c.format(n.dayViewHeaderFormat)), W(c.clone().subtract(1, "M"), "M") || s.eq(0).addClass("disabled"), W(c.clone().add(1, "M"), "M") || s.eq(2).addClass("disabled"), a = c.clone().startOf("M").startOf("week") ; !c.clone().endOf("M").endOf("w").isBefore(a, "d") ;) 0 === a.weekday() && (r = e("<tr>"), n.calendarWeeks && r.append('<td class="cw">' + a.week() + "</td>"), d.push(r)), i = "", a.isBefore(c, "M") && (i += " old"), a.isAfter(c, "M") && (i += " new"), a.isSame(l, "d") && !u && (i += " active"), W(a, "d") || (i += " disabled"), a.isSame(t(), "d") && (i += " today"), (0 === a.day() || 6 === a.day()) && (i += " weekend"), r.append('<td data-action="selectDay" class="day' + i + '">' + a.date() + "</td>"), a.add(1, "d"); o.find("tbody").empty().append(d), z(), A() } }, N = function () { var t = m.find(".timepicker-hours table"), a = c.clone().startOf("d"), n = [], r = e("<tr>"); for (c.hour() > 11 && !i && a.hour(12) ; a.isSame(c, "d") && (i || c.hour() < 12 && a.hour() < 12 || c.hour() > 11) ;) a.hour() % 4 === 0 && (r = e("<tr>"), n.push(r)), r.append('<td data-action="selectHour" class="hour' + (W(a, "h") ? "" : " disabled") + '">' + a.format(i ? "HH" : "hh") + "</td>"), a.add(1, "h"); t.empty().append(n) }, Q = function () { for (var t = m.find(".timepicker-minutes table"), a = c.clone().startOf("h"), r = [], i = e("<tr>"), o = 1 === n.stepping ? 5 : n.stepping; c.isSame(a, "h") ;) a.minute() % (4 * o) === 0 && (i = e("<tr>"), r.push(i)), i.append('<td data-action="selectMinute" class="minute' + (W(a, "m") ? "" : " disabled") + '">' + a.format("mm") + "</td>"), a.add(o, "m"); t.empty().append(r) }, R = function () { for (var t = m.find(".timepicker-seconds table"), a = c.clone().startOf("m"), n = [], r = e("<tr>") ; c.isSame(a, "m") ;) a.second() % 20 === 0 && (r = e("<tr>"), n.push(r)), r.append('<td data-action="selectSecond" class="second' + (W(a, "s") ? "" : " disabled") + '">' + a.format("ss") + "</td>"), a.add(5, "s"); t.empty().append(n) }, U = function () { var e = m.find(".timepicker span[data-time-component]"); i || m.find(".timepicker [data-action=togglePeriod]").text(l.format("A")), e.filter("[data-time-component=hours]").text(l.format(i ? "HH" : "hh")), e.filter("[data-time-component=minutes]").text(l.format("mm")), e.filter("[data-time-component=seconds]").text(l.format("ss")), N(), Q(), R() }, G = function () { m && (V(), U()) }, J = function (e) { var t = u ? null : l; return e ? (e = e.clone().locale(n.locale), 1 !== n.stepping && e.minutes(Math.round(e.minutes() / n.stepping) * n.stepping % 60).seconds(0), void (W(e) ? (l = e, c = l.clone(), r.val(l.format(o)), a.data("date", l.format(o)), G(), u = !1, H({ type: "dp.change", date: l.clone(), oldDate: t })) : (n.keepInvalid || r.val(u ? "" : l.format(o)), H({ type: "dp.error", date: e })))) : (u = !0, r.val(""), a.data("date", ""), H({ type: "dp.change", date: null, oldDate: t }), void G()) }, K = function () { var t = !1; return m ? (m.find(".collapse").each(function () { var a = e(this).data("collapse"); return a && a.transitioning ? (t = !0, !1) : !0 }), t ? p : (f && f.hasClass("btn") && f.toggleClass("active"), m.hide(), e(window).off("resize", j), m.off("click", "[data-action]"), m.off("mousedown", !1), m.remove(), m = !1, H({ type: "dp.hide", date: l.clone() }), p)) : p }, X = function () { J(null) }, Z = { next: function () { c.add(g[d].navStep, g[d].navFnc), V() }, previous: function () { c.subtract(g[d].navStep, g[d].navFnc), V() }, pickerSwitch: function () { I(1) }, selectMonth: function (t) { var a = e(t.target).closest("tbody").find("span").index(e(t.target)); c.month(a), d === h ? (J(l.clone().year(c.year()).month(c.month())), n.inline || K()) : (I(-1), V()) }, selectYear: function (t) { var a = parseInt(e(t.target).text(), 10) || 0; c.year(a), d === h ? (J(l.clone().year(c.year())), n.inline || K()) : (I(-1), V()) }, selectDay: function (t) { var a = c.clone(); e(t.target).is(".old") && a.subtract(1, "M"), e(t.target).is(".new") && a.add(1, "M"), J(a.date(parseInt(e(t.target).text(), 10))), D() || n.keepOpen || n.inline || K() }, incrementHours: function () { J(l.clone().add(1, "h")) }, incrementMinutes: function () { J(l.clone().add(n.stepping, "m")) }, incrementSeconds: function () { J(l.clone().add(1, "s")) }, decrementHours: function () { J(l.clone().subtract(1, "h")) }, decrementMinutes: function () { J(l.clone().subtract(n.stepping, "m")) }, decrementSeconds: function () { J(l.clone().subtract(1, "s")) }, togglePeriod: function () { J(l.clone().add(l.hours() >= 12 ? -12 : 12, "h")) }, togglePicker: function (t) { var a, r = e(t.target), i = r.closest("ul"), o = i.find(".in"), s = i.find(".collapse:not(.in)"); if (o && o.length) { if (a = o.data("collapse"), a && a.transitioning) return; o.collapse ? (o.collapse("hide"), s.collapse("show")) : (o.removeClass("in"), s.addClass("in")), r.is("span") ? r.toggleClass(n.icons.time + " " + n.icons.date) : r.find("span").toggleClass(n.icons.time + " " + n.icons.date) } }, showPicker: function () { m.find(".timepicker > div:not(.timepicker-picker)").hide(), m.find(".timepicker .timepicker-picker").show() }, showHours: function () { m.find(".timepicker .timepicker-picker").hide(), m.find(".timepicker .timepicker-hours").show() }, showMinutes: function () { m.find(".timepicker .timepicker-picker").hide(), m.find(".timepicker .timepicker-minutes").show() }, showSeconds: function () { m.find(".timepicker .timepicker-picker").hide(), m.find(".timepicker .timepicker-seconds").show() }, selectHour: function (t) { var a = parseInt(e(t.target).text(), 10); i || (l.hours() >= 12 ? 12 !== a && (a += 12) : 12 === a && (a = 0)), J(l.clone().hours(a)), Z.showPicker.call(p) }, selectMinute: function (t) { J(l.clone().minutes(parseInt(e(t.target).text(), 10))), Z.showPicker.call(p) }, selectSecond: function (t) { J(l.clone().seconds(parseInt(e(t.target).text(), 10))), Z.showPicker.call(p) }, clear: X, today: function () { J(t()) }, close: K }, $ = function (t) { return e(t.currentTarget).is(".disabled") ? !1 : (Z[e(t.currentTarget).data("action")].apply(p, arguments), !1) }, _ = function () { var a, i = { year: function (e) { return e.month(0).date(1).hours(0).seconds(0).minutes(0) }, month: function (e) { return e.date(1).hours(0).seconds(0).minutes(0) }, day: function (e) { return e.hours(0).seconds(0).minutes(0) }, hour: function (e) { return e.seconds(0).minutes(0) }, minute: function (e) { return e.seconds(0) } }; return r.prop("disabled") || !n.ignoreReadonly && r.prop("readonly") || m ? p : (n.useCurrent && u && (r.is("input") && 0 === r.val().trim().length || n.inline) && (a = t(), "string" == typeof n.useCurrent && (a = i[n.useCurrent](a)), J(a)), m = S(), F(), q(), m.find(".timepicker-hours").hide(), m.find(".timepicker-minutes").hide(), m.find(".timepicker-seconds").hide(), G(), I(), e(window).on("resize", j), m.on("click", "[data-action]", $), m.on("mousedown", !1), f && f.hasClass("btn") && f.toggleClass("active"), m.show(), j(), r.is(":focus") || r.focus(), H({ type: "dp.show" }), p) }, et = function () { return m ? K() : _() }, tt = function (e) { return e = t.isMoment(e) || e instanceof Date ? t(e) : t(e, s, n.useStrict), e.locale(n.locale), e }, at = function (e) { var t, a, r, i, o = null, s = [], d = {}, l = e.which, c = "p"; C[l] = c; for (t in C) C.hasOwnProperty(t) && C[t] === c && (s.push(t), parseInt(t, 10) !== l && (d[t] = !0)); for (t in n.keyBinds) if (n.keyBinds.hasOwnProperty(t) && "function" == typeof n.keyBinds[t] && (r = t.split(" "), r.length === s.length && k[l] === r[r.length - 1])) { for (i = !0, a = r.length - 2; a >= 0; a--) if (!(k[r[a]] in d)) { i = !1; break } if (i) { o = n.keyBinds[t]; break } } o && (o.call(p, m), e.stopPropagation(), e.preventDefault()) }, nt = function (e) { C[e.which] = "r", e.stopPropagation(), e.preventDefault() }, rt = function (t) { var a = e(t.target).val().trim(), n = a ? tt(a) : null; return J(n), t.stopImmediatePropagation(), !1 }, it = function () { r.on({ change: rt, blur: n.debug ? "" : K, keydown: at, keyup: nt }), a.is("input") ? r.on({ focus: _ }) : f && (f.on("click", et), f.on("mousedown", !1)) }, ot = function () { r.off({ change: rt, blur: K, keydown: at, keyup: nt }), a.is("input") ? r.off({ focus: _ }) : f && (f.off("click", et), f.off("mousedown", !1)) }, st = function (t) { var a = {}; return e.each(t, function () { var e = tt(this); e.isValid() && (a[e.format("YYYY-MM-DD")] = !0) }), Object.keys(a).length ? a : !1 }, dt = function () { var e = n.format || "L LT"; o = e.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (e) { var t = l.localeData().longDateFormat(e) || e; return t.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (e) { return l.localeData().longDateFormat(e) || e }) }), s = n.extraFormats ? n.extraFormats.slice() : [], s.indexOf(e) < 0 && s.indexOf(o) < 0 && s.push(o), i = o.toLowerCase().indexOf("a") < 1 && o.indexOf("h") < 1, x("y") && (h = 2), x("M") && (h = 1), x("d") && (h = 0), d = Math.max(h, d), u || J(l) }; if (p.destroy = function () { K(), ot(), a.removeData("DateTimePicker"), a.removeData("date") }, p.toggle = et, p.show = _, p.hide = K, p.disable = function () { return K(), f && f.hasClass("btn") && f.addClass("disabled"), r.prop("disabled", !0), p }, p.enable = function () { return f && f.hasClass("btn") && f.removeClass("disabled"), r.prop("disabled", !1), p }, p.ignoreReadonly = function (e) { if (0 === arguments.length) return n.ignoreReadonly; if ("boolean" != typeof e) throw new TypeError("ignoreReadonly () expects a boolean parameter"); return n.ignoreReadonly = e, p }, p.options = function (t) { if (0 === arguments.length) return e.extend(!0, {}, n); if (!(t instanceof Object)) throw new TypeError("options() options parameter should be an object"); return e.extend(!0, n, t), e.each(n, function (e, t) { if (void 0 === p[e]) throw new TypeError("option " + e + " is not recognized!"); p[e](t) }), p }, p.date = function (e) { if (0 === arguments.length) return u ? null : l.clone(); if (!(null === e || "string" == typeof e || t.isMoment(e) || e instanceof Date)) throw new TypeError("date() parameter must be one of [null, string, moment or Date]"); return J(null === e ? null : tt(e)), p }, p.format = function (e) { if (0 === arguments.length) return n.format; if ("string" != typeof e && ("boolean" != typeof e || e !== !1)) throw new TypeError("format() expects a sting or boolean:false parameter " + e); return n.format = e, o && dt(), p }, p.dayViewHeaderFormat = function (e) { if (0 === arguments.length) return n.dayViewHeaderFormat; if ("string" != typeof e) throw new TypeError("dayViewHeaderFormat() expects a string parameter"); return n.dayViewHeaderFormat = e, p }, p.extraFormats = function (e) { if (0 === arguments.length) return n.extraFormats; if (e !== !1 && !(e instanceof Array)) throw new TypeError("extraFormats() expects an array or false parameter"); return n.extraFormats = e, s && dt(), p }, p.disabledDates = function (t) { if (0 === arguments.length) return n.disabledDates ? e.extend({}, n.disabledDates) : n.disabledDates; if (!t) return n.disabledDates = !1, G(), p; if (!(t instanceof Array)) throw new TypeError("disabledDates() expects an array parameter"); return n.disabledDates = st(t), n.enabledDates = !1, G(), p }, p.enabledDates = function (t) { if (0 === arguments.length) return n.enabledDates ? e.extend({}, n.enabledDates) : n.enabledDates; if (!t) return n.enabledDates = !1, G(), p; if (!(t instanceof Array)) throw new TypeError("enabledDates() expects an array parameter"); return n.enabledDates = st(t), n.disabledDates = !1, G(), p }, p.daysOfWeekDisabled = function (e) { if (0 === arguments.length) return n.daysOfWeekDisabled.splice(0); if (!(e instanceof Array)) throw new TypeError("daysOfWeekDisabled() expects an array parameter"); return n.daysOfWeekDisabled = e.reduce(function (e, t) { return t = parseInt(t, 10), t > 6 || 0 > t || isNaN(t) ? e : (-1 === e.indexOf(t) && e.push(t), e) }, []).sort(), G(), p }, p.maxDate = function (e) { if (0 === arguments.length) return n.maxDate ? n.maxDate.clone() : n.maxDate; if ("boolean" == typeof e && e === !1) return n.maxDate = !1, G(), p; "string" == typeof e && ("now" === e || "moment" === e) && (e = t()); var a = tt(e); if (!a.isValid()) throw new TypeError("maxDate() Could not parse date parameter: " + e); if (n.minDate && a.isBefore(n.minDate)) throw new TypeError("maxDate() date parameter is before options.minDate: " + a.format(o)); return n.maxDate = a, n.maxDate.isBefore(e) && J(n.maxDate), c.isAfter(a) && (c = a.clone()), G(), p }, p.minDate = function (e) { if (0 === arguments.length) return n.minDate ? n.minDate.clone() : n.minDate; if ("boolean" == typeof e && e === !1) return n.minDate = !1, G(), p; "string" == typeof e && ("now" === e || "moment" === e) && (e = t()); var a = tt(e); if (!a.isValid()) throw new TypeError("minDate() Could not parse date parameter: " + e); if (n.maxDate && a.isAfter(n.maxDate)) throw new TypeError("minDate() date parameter is after options.maxDate: " + a.format(o)); return n.minDate = a, n.minDate.isAfter(e) && J(n.minDate), c.isBefore(a) && (c = a.clone()), G(), p }, p.defaultDate = function (e) { if (0 === arguments.length) return n.defaultDate ? n.defaultDate.clone() : n.defaultDate; if (!e) return n.defaultDate = !1, p; "string" == typeof e && ("now" === e || "moment" === e) && (e = t()); var a = tt(e); if (!a.isValid()) throw new TypeError("defaultDate() Could not parse date parameter: " + e); if (!W(a)) throw new TypeError("defaultDate() date passed is invalid according to component setup validations"); return n.defaultDate = a, n.defaultDate && "" === r.val().trim() && void 0 === r.attr("placeholder") && J(n.defaultDate), p }, p.locale = function (e) { if (0 === arguments.length) return n.locale; if (!t.localeData(e)) throw new TypeError("locale() locale " + e + " is not loaded from moment locales!"); return n.locale = e, l.locale(n.locale), c.locale(n.locale), o && dt(), m && (K(), _()), p }, p.stepping = function (e) { return 0 === arguments.length ? n.stepping : (e = parseInt(e, 10), (isNaN(e) || 1 > e) && (e = 1), n.stepping = e, p) }, p.useCurrent = function (e) { var t = ["year", "month", "day", "hour", "minute"]; if (0 === arguments.length) return n.useCurrent; if ("boolean" != typeof e && "string" != typeof e) throw new TypeError("useCurrent() expects a boolean or string parameter"); if ("string" == typeof e && -1 === t.indexOf(e.toLowerCase())) throw new TypeError("useCurrent() expects a string parameter of " + t.join(", ")); return n.useCurrent = e, p }, p.collapse = function (e) { if (0 === arguments.length) return n.collapse; if ("boolean" != typeof e) throw new TypeError("collapse() expects a boolean parameter"); return n.collapse === e ? p : (n.collapse = e, m && (K(), _()), p) }, p.icons = function (t) { if (0 === arguments.length) return e.extend({}, n.icons); if (!(t instanceof Object)) throw new TypeError("icons() expects parameter to be an Object"); return e.extend(n.icons, t), m && (K(), _()), p }, p.useStrict = function (e) { if (0 === arguments.length) return n.useStrict; if ("boolean" != typeof e) throw new TypeError("useStrict() expects a boolean parameter"); return n.useStrict = e, p }, p.sideBySide = function (e) { if (0 === arguments.length) return n.sideBySide; if ("boolean" != typeof e) throw new TypeError("sideBySide() expects a boolean parameter"); return n.sideBySide = e, m && (K(), _()), p }, p.viewMode = function (e) { if (0 === arguments.length) return n.viewMode; if ("string" != typeof e) throw new TypeError("viewMode() expects a string parameter"); if (-1 === y.indexOf(e)) throw new TypeError("viewMode() parameter must be one of (" + y.join(", ") + ") value"); return n.viewMode = e, d = Math.max(y.indexOf(e), h), I(), p }, p.toolbarPlacement = function (e) { if (0 === arguments.length) return n.toolbarPlacement; if ("string" != typeof e) throw new TypeError("toolbarPlacement() expects a string parameter"); if (-1 === v.indexOf(e)) throw new TypeError("toolbarPlacement() parameter must be one of (" + v.join(", ") + ") value"); return n.toolbarPlacement = e, m && (K(), _()), p }, p.widgetPositioning = function (t) { if (0 === arguments.length) return e.extend({}, n.widgetPositioning); if ("[object Object]" !== {}.toString.call(t)) throw new TypeError("widgetPositioning() expects an object variable"); if (t.horizontal) { if ("string" != typeof t.horizontal) throw new TypeError("widgetPositioning() horizontal variable must be a string"); if (t.horizontal = t.horizontal.toLowerCase(), -1 === b.indexOf(t.horizontal)) throw new TypeError("widgetPositioning() expects horizontal parameter to be one of (" + b.join(", ") + ")"); n.widgetPositioning.horizontal = t.horizontal } if (t.vertical) { if ("string" != typeof t.vertical) throw new TypeError("widgetPositioning() vertical variable must be a string"); if (t.vertical = t.vertical.toLowerCase(), -1 === w.indexOf(t.vertical)) throw new TypeError("widgetPositioning() expects vertical parameter to be one of (" + w.join(", ") + ")"); n.widgetPositioning.vertical = t.vertical } return G(), p }, p.calendarWeeks = function (e) { if (0 === arguments.length) return n.calendarWeeks; if ("boolean" != typeof e) throw new TypeError("calendarWeeks() expects parameter to be a boolean value"); return n.calendarWeeks = e, G(), p }, p.showTodayButton = function (e) { if (0 === arguments.length) return n.showTodayButton; if ("boolean" != typeof e) throw new TypeError("showTodayButton() expects a boolean parameter"); return n.showTodayButton = e, m && (K(), _()), p }, p.showClear = function (e) { if (0 === arguments.length) return n.showClear; if ("boolean" != typeof e) throw new TypeError("showClear() expects a boolean parameter"); return n.showClear = e, m && (K(), _()), p }, p.widgetParent = function (t) { if (0 === arguments.length) return n.widgetParent; if ("string" == typeof t && (t = e(t)), null !== t && "string" != typeof t && !(t instanceof e)) throw new TypeError("widgetParent() expects a string or a jQuery object parameter"); return n.widgetParent = t, m && (K(), _()), p }, p.keepOpen = function (e) { if (0 === arguments.length) return n.keepOpen; if ("boolean" != typeof e) throw new TypeError("keepOpen() expects a boolean parameter"); return n.keepOpen = e, p }, p.inline = function (e) { if (0 === arguments.length) return n.inline; if ("boolean" != typeof e) throw new TypeError("inline() expects a boolean parameter"); return n.inline = e, p }, p.clear = function () { return X(), p }, p.keyBinds = function (e) { return n.keyBinds = e, p }, p.debug = function (e) { if ("boolean" != typeof e) throw new TypeError("debug() expects a boolean parameter"); return n.debug = e, p }, p.showClose = function (e) { if (0 === arguments.length) return n.showClose; if ("boolean" != typeof e) throw new TypeError("showClose() expects a boolean parameter"); return n.showClose = e, p }, p.keepInvalid = function (e) { if (0 === arguments.length) return n.keepInvalid; if ("boolean" != typeof e) throw new TypeError("keepInvalid() expects a boolean parameter"); return n.keepInvalid = e, p }, p.datepickerInput = function (e) { if (0 === arguments.length) return n.datepickerInput; if ("string" != typeof e) throw new TypeError("datepickerInput() expects a string parameter"); return n.datepickerInput = e, p }, a.is("input")) r = a; else if (r = a.find(n.datepickerInput), 0 === r.size()) r = a.find("input"); else if (!r.is("input")) throw new Error('CSS class "' + n.datepickerInput + '" cannot be applied to non input element'); if (a.hasClass("input-group") && (f = a.find(0 === a.find(".datepickerbutton").size() ? '[class^="input-group-"]' : ".datepickerbutton")), !n.inline && !r.is("input")) throw new Error("Could not initialize DateTimePicker without an input element"); return e.extend(!0, n, B()), p.options(n), dt(), it(), r.prop("disabled") && p.disable(), r.is("input") && 0 !== r.val().trim().length ? J(tt(r.val().trim())) : n.defaultDate && void 0 === r.attr("placeholder") && J(n.defaultDate), n.inline && _(), p }; e.fn.datetimepicker = function (t) { return this.each(function () { var n = e(this); n.data("DateTimePicker") || (t = e.extend(!0, {}, e.fn.datetimepicker.defaults, t), n.data("DateTimePicker", a(n, t))) }) }, e.fn.datetimepicker.defaults = { format: !1, dayViewHeaderFormat: "MMMM YYYY", extraFormats: !1, stepping: 1, minDate: !1, maxDate: !1, useCurrent: !0, collapse: !0, locale: t.locale(), defaultDate: !1, disabledDates: !1, enabledDates: !1, icons: { time: "glyphicon glyphicon-time", date: "glyphicon glyphicon-calendar", up: "glyphicon glyphicon-chevron-up", down: "glyphicon glyphicon-chevron-down", previous: "glyphicon glyphicon-chevron-left", next: "glyphicon glyphicon-chevron-right", today: "glyphicon glyphicon-screenshot", clear: "glyphicon glyphicon-trash", close: "glyphicon glyphicon-remove" }, useStrict: !1, sideBySide: !1, daysOfWeekDisabled: [], calendarWeeks: !1, viewMode: "days", toolbarPlacement: "default", showTodayButton: !1, showClear: !1, showClose: !1, widgetPositioning: { horizontal: "auto", vertical: "auto" }, widgetParent: null, ignoreReadonly: !1, keepOpen: !1, inline: !1, keepInvalid: !1, datepickerInput: ".datepickerinput", keyBinds: { up: function (e) { if (e) { var a = this.date() || t(); this.date(e.find(".datepicker").is(":visible") ? a.clone().subtract(7, "d") : a.clone().add(1, "m")) } }, down: function (e) { if (!e) return void this.show(); var a = this.date() || t(); this.date(e.find(".datepicker").is(":visible") ? a.clone().add(7, "d") : a.clone().subtract(1, "m")) }, "control up": function (e) { if (e) { var a = this.date() || t(); this.date(e.find(".datepicker").is(":visible") ? a.clone().subtract(1, "y") : a.clone().add(1, "h")) } }, "control down": function (e) { if (e) { var a = this.date() || t(); this.date(e.find(".datepicker").is(":visible") ? a.clone().add(1, "y") : a.clone().subtract(1, "h")) } }, left: function (e) { if (e) { var a = this.date() || t(); e.find(".datepicker").is(":visible") && this.date(a.clone().subtract(1, "d")) } }, right: function (e) { if (e) { var a = this.date() || t(); e.find(".datepicker").is(":visible") && this.date(a.clone().add(1, "d")) } }, pageUp: function (e) { if (e) { var a = this.date() || t(); e.find(".datepicker").is(":visible") && this.date(a.clone().subtract(1, "M")) } }, pageDown: function (e) { if (e) { var a = this.date() || t(); e.find(".datepicker").is(":visible") && this.date(a.clone().add(1, "M")) } }, enter: function () { this.hide() }, escape: function () { this.hide() }, "control space": function (e) { e.find(".timepicker").is(":visible") && e.find('.btn[data-action="togglePeriod"]').click() }, t: function () { this.date(t()) }, "delete": function () { this.clear() } }, debug: !1 } });

        

                /** jquery.onoff - v0.3.5 - 2014-05-12

                * https://github.com/timmywil/jquery.onoff

                * Copyright (c) 2014 Timmy Willison; Licensed MIT */

                !function (a, b) { "function" == typeof define && define.amd ? define(["jquery"], b) : "object" == typeof exports ? b(require("jquery")) : b(a.HawkSearch.jQuery) }(this, function (a) { "use strict"; function b(c, d) { if (!(this instanceof b)) return new b(c, d); if ("input" !== c.nodeName.toLowerCase() || "checkbox" !== c.type) return a.error("OnOff should be called on checkboxes"); var e = a.data(c, b.datakey); return e ? e : (this.options = d = a.extend({}, b.defaults, d), this.elem = c, this.$elem = a(c).addClass(d.className), this.$doc = a(c.ownerDocument || document), d.namespace += a.guid++, c.id || (c.id = "onoffswitch" + g++), this.enable(), a.data(c, b.datakey, this), void 0) } var c = "over out down up move enter leave cancel".split(" "), d = a.extend({}, a.event.mouseHooks), e = {}; if (window.PointerEvent) a.each(c, function (b, c) { a.event.fixHooks[e[c] = "pointer" + c] = d }); else { var f = d.props; d.props = f.concat(["touches", "changedTouches", "targetTouches", "altKey", "ctrlKey", "metaKey", "shiftKey"]), d.filter = function (a, b) { var c, d = f.length; if (!b.pageX && b.touches && (c = b.touches[0])) for (; d--;) a[f[d]] = c[f[d]]; return a }, a.each(c, function (b, c) { if (2 > b) e[c] = "mouse" + c; else { var f = "touch" + ("down" === c ? "start" : "up" === c ? "end" : c); a.event.fixHooks[f] = d, e[c] = f + " mouse" + c } }) } a.pointertouch = e; var g = 1, h = Array.prototype.slice; return b.datakey = "_onoff", b.defaults = { namespace: ".onoff", className: "onoffswitch-checkbox" }, b.prototype = { constructor: b, instance: function () { return this }, wrap: function () { var b = this.elem, c = this.$elem, d = this.options, e = c.parent(".onoffswitch"); e.length || (c.wrap('<div class="onoffswitch"></div>'), e = c.parent().addClass(b.className.replace(d.className, ""))), this.$con = e; var f = c.next('label[for="' + b.id + '"]'); f.length || (f = a("<label/>").attr("for", b.id).insertAfter(b)), this.$label = f.addClass("onoffswitch-label"); var g = f.find(".onoffswitch-inner"); g.length || (g = a("<div/>").addClass("onoffswitch-inner").prependTo(f)), this.$inner = g; var h = f.find(".onoffswitch-switch"); h.length || (h = a("<div/>").addClass("onoffswitch-switch").appendTo(f)), this.$switch = h }, _handleMove: function (a) { if (!this.disabled) { this.moved = !0, this.lastX = a.pageX; var b = Math.max(Math.min(this.startX - this.lastX, this.maxRight), 0); this.$switch.css("right", b), this.$inner.css("marginLeft", 100 * -(b / this.maxRight) + "%") } }, _startMove: function (b) { b.preventDefault(); var c, d; "pointerdown" === b.type ? (c = "pointermove", d = "pointerup") : "touchstart" === b.type ? (c = "touchmove", d = "touchend") : (c = "mousemove", d = "mouseup"); var e = this.elem, f = this.$elem, g = this.options.namespace, h = this.$switch, i = h[0], j = this.$inner.add(h).css("transition", "none"); this.maxRight = this.$con.width() - h.width() - a.css(i, "margin-left", !0) - a.css(i, "margin-right", !0) - a.css(i, "border-left-width", !0) - a.css(i, "border-right-width", !0); var k = e.checked; this.moved = !1, this.startX = b.pageX + (k ? 0 : this.maxRight); var l = this, m = this.$doc.on(c + g, a.proxy(this._handleMove, this)).on(d + g, function () { j.css("transition", ""), m.off(g), setTimeout(function () { if (l.moved) { var a = l.lastX > l.startX - l.maxRight / 2; e.checked !== a && (e.checked = a, f.trigger("change")) } l.$switch.css("right", ""), l.$inner.css("marginLeft", "") }) }) }, _bind: function () { this._unbind(), this.$switch.on(a.pointertouch.down, a.proxy(this._startMove, this)) }, enable: function () { this.wrap(), this._bind(), this.disabled = !1 }, _unbind: function () { this.$doc.add(this.$switch).off(this.options.namespace) }, disable: function () { this.disabled = !0, this._unbind() }, unwrap: function () { this.disable(), this.$label.remove(), this.$elem.unwrap().removeClass(this.options.className) }, isDisabled: function () { return this.disabled }, destroy: function () { this.disable(), a.removeData(this.elem, b.datakey) }, option: function (b, c) { var d, e = this.options; if (!b) return a.extend({}, e); if ("string" == typeof b) { if (1 === arguments.length) return void 0 !== e[b] ? e[b] : null; d = {}, d[b] = c } else d = b; a.each(d, a.proxy(function (a, b) { switch (a) { case "namespace": this._unbind(); break; case "className": this.$elem.removeClass(e.className) } switch (e[a] = b, a) { case "namespace": this._bind(); break; case "className": this.$elem.addClass(b) } }, this)) } }, a.fn.onoff = function (c) { var d, e, f, g; return "string" == typeof c ? (g = [], e = h.call(arguments, 1), this.each(function () { d = a.data(this, b.datakey), d ? "_" !== c.charAt(0) && "function" == typeof (f = d[c]) && void 0 !== (f = f.apply(d, e)) && g.push(f) : g.push(void 0) }), g.length ? 1 === g.length ? g[0] : g : this) : this.each(function () { new b(this, c) }) }, a.OnOff = b });

        

                // END Plugins
   
    }

}(window.HawkSearchLoader = window.HawkSearchLoader || {}));

    // LilBro schemas

    (function () {

    

        var root = this;

    

        root.LilBro = root.LilBro || {

        };

        root.LilBro.Schema = {

        };

    

        root.LilBro.Schema.version = "default";

    

        root.LilBro.Schema.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            mouse_x: 6,

            mouse_y: 7,

            viewport_width: 8,

            viewport_height: 9,

            scroll_x: 10,

            scroll_y: 11,

            element_id: 12,

            element_id_from: 13,

            element_class: 14,

            element_class_from: 15,

            element_name: 16,

            element_tag: 17,

            element_type: 18,

            element_checked: 19,

            element_value: 20,

            element_x: 21,

            element_y: 22,

            browser: 23,

            browser_version: 24,

            operating_system: 25,

            request_path: 26,

            qs: 27,

            tracking_id: 28,

            unique_id: 29,

            element_no: 30,

            mlt: 31,

            keyword: 32,

            current_page: 33,

            max_per_page: 34,

            items_count: 35,

            sorting: 36,

            is_custom: 37

        };

    

        root.LilBro.Schema.type_map = {

            PageLoad: 1,

            Search: 2,

            Click: 3,

            Add2Cart: 4,

            Rate: 5,

            Sale: 6,

            BannerClick: 7,

            BannerImpression: 8,

            Login: 9,

            RecommendationClick: 10,

            AutoCompleteClick: 11,

            Add2CartMultiple: 14,

            CopyRequestTracking: 15

        };

    

        root.LilBro.Schema.PageLoad = {

        };

        root.LilBro.Schema.PageLoad.version = "pl01a";

        root.LilBro.Schema.PageLoad.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            viewport_width: 6,

            viewport_height: 7,

            browser: 8,

            browser_version: 9,

            operating_system: 10,

            request_path: 11,

            qs: 12,

            tracking_properties: 13,

            page_type_id: 14

        }

        root.LilBro.Schema.PageLoad.PageType = {

            itemDetails: 1,

            landingPage: 2,

            shoppingCart: 3,

            orderConfirmation: 4,

            custom: 5

        }

    

        root.LilBro.Schema.Search = {

        };

        root.LilBro.Schema.Search.version = "ref01a";

        root.LilBro.Schema.Search.SearchType = {

            Search: 1,

            Refinement: 2

        };

    

        root.LilBro.Schema.Search.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            viewport_width: 6,

            viewport_height: 7,

            browser: 8,

            browser_version: 9,

            operating_system: 10,

            request_path: 11,

            qs: 12,

            tracking_id: 13,

            query_id: 14,

            type_id: 15

        }

    

        root.LilBro.Schema.Click = {

        };

        root.LilBro.Schema.Click.version = "cli01a";

        root.LilBro.Schema.Click.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            mouse_x: 6,

            mouse_y: 7,

            viewport_width: 8,

            viewport_height: 9,

            scroll_x: 10,

            scroll_y: 11,

            element_id: 12,

            element_id_from: 13,

            element_class: 14,

            element_class_from: 15,

            element_name: 16,

            element_tag: 17,

            element_type: 18,

            element_checked: 19,

            element_value: 20,

            element_x: 21,

            element_y: 22,

            browser: 23,

            browser_version: 24,

            operating_system: 25,

            request_path: 26,

            qs: 27,

            tracking_id: 28,

            unique_id: 29,

            mlt: 30,

            element_no: 31,

            url: 32

        }

    

        root.LilBro.Schema.Rate = {

        };

        root.LilBro.Schema.Rate.version = "rat01a";

        root.LilBro.Schema.Rate.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            value: 6,

            unique_id: 7

        }

    

        root.LilBro.Schema.Sale = {

        };

        root.LilBro.Schema.Sale.version = "sal01a";

        root.LilBro.Schema.Sale.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            order_no: 6,

            item_list: 7,

            total: 8,

            tax: 9,

            currency: 10,

            sub_total: 11

        }

    

        root.LilBro.Schema.Add2Cart = {

        };

        root.LilBro.Schema.Add2Cart.version = "a2c01a";

        root.LilBro.Schema.Add2Cart.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            unique_id: 6,

            price: 7,

            quantity: 8,

            currency: 9

        }

    

        root.LilBro.Schema.BannerClick = {

        }

        root.LilBro.Schema.BannerClick.version = "banclk01a";

        root.LilBro.Schema.BannerClick.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            tracking_id: 6,

            banner_id: 7

        }

    

        root.LilBro.Schema.BannerImpression = {

        }

        root.LilBro.Schema.BannerImpression.version = "banimp01a";

        root.LilBro.Schema.BannerImpression.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            tracking_id: 6,

            banner_id: 7

        }

    

    

    

        root.LilBro.Schema.RecommendationClick = {

        }

        root.LilBro.Schema.RecommendationClick.version = "recClick01a";

        root.LilBro.Schema.RecommendationClick.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            widget_guid: 6,

            unique_id: 7,

            item_index: 8,

            request_id: 9

        }

    

        root.LilBro.Schema.AutoCompleteClick = {

        }

        root.LilBro.Schema.AutoCompleteClick.version = "autoComplClick01a";

        root.LilBro.Schema.AutoCompleteClick.key_map = {

            // leave slot 0 for the server timestamp

            version: 1,

            timestamp: 2,

            event_type: 3,

            visitor_id: 4,

            visit_id: 5,

            suggest_type: 6,

            url: 7,

            name: 8,

            keyword: 9

        }

        root.LilBro.Schema.AutoCompleteClick.AutoCompleteType = {

            popular: 1,

            category: 2,

            product: 3,

            content: 4

        }

    

        root.LilBro.Schema.Add2CartMultiple = {

            version: "a2cm01a",

            key_map: {

                // leave slot 0 for the server timestamp

                version: 1,

                timestamp: 2,

                event_type: 3,

                visitor_id: 4,

                visit_id: 5,

                items_list: 6

            }

        };

    

        root.LilBro.Schema.CopyRequestTracking = {

            version: "crt01a",

            key_map: {

                // leave slot 0 for the server timestamp

                version: 1,

                timestamp: 2,

                event_type: 3,

                old_tracking_id: 4,

                new_tracking_id: 5

            }

        };

    

    }).call(HawkSearch);

    HawkSearch.Dictionary = (function () {

        function Dictionary() {

            if (!(this instanceof Dictionary))

                return new Dictionary();

        }

    

        Dictionary.prototype.count = function () {

            var key,

                count = 0;

    

            for (key in this) {

                if (this.hasOwnProperty(key))

                    count += 1;

            }

            return count;

        };

    

        Dictionary.prototype.keys = function () {

            var key,

                keys = [];

    

            for (key in this) {

                if (this.hasOwnProperty(key))

                    keys.push(key);

            }

            return keys;

        };

    

        Dictionary.prototype.values = function () {

            var key,

                values = [];

    

            for (key in this) {

                if (this.hasOwnProperty(key))

                    values.push(this[key]);

            }

            return values;

        };

    

        Dictionary.prototype.keyValuePairs = function () {

            var key,

                keyValuePairs = [];

    

            for (key in this) {

                if (this.hasOwnProperty(key))

                    keyValuePairs.push({

                        Key: key,

                        Value: this[key]

                    });

            }

            return keyValuePairs;

        };

    

        Dictionary.prototype.add = function (key, value) {

            this[key] = value;

        }

    

        Dictionary.prototype.clear = function () {

            var key,

                dummy;

    

            for (key in this) {

                if (this.hasOwnProperty(key))

                    dummy = delete this[key];

            }

        }

    

        Dictionary.prototype.containsKey = function (key) {

            return this.hasOwnProperty(key);

        }

    

        Dictionary.prototype.containsValue = function (value) {

            var key;

    

            for (key in this) {

                if (this.hasOwnProperty(key) && this[key] === value)

                    return true;

            }

            return false;

        }

    

        Dictionary.prototype.remove = function (key) {

            var dummy;

    

            if (this.hasOwnProperty(key)) {

                dummy = delete this[key];

                return true;

            } else

                return false;

        }

    

        return Dictionary;

    }());
    
    HawkSearch.ContextObj = function () {
    
    };
    
    HawkSearch.ContextObj.prototype = new HawkSearch.Dictionary();
    
    HawkSearch.ContextObj.prototype.Custom = new HawkSearch.Dictionary();
    
    HawkSearch.Context = new HawkSearch.ContextObj();
    
    

