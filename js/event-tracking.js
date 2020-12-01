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
