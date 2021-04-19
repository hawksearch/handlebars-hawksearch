// handlebars -f templatesCompile.js  templates/
//////////////////////////////////////HELPER METHODS///////////////////////////////////////

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
        selectedFacets.push({
          field: selectionField,
          value: value,
        });
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
          // push
          selectedFacets.push({
            field: selectionField,
            value: value,
          });
        } else {
          // remove
          var filtered = selectedFacets.filter((item) => item.value !== value);
          selectedFacets = filtered;
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

  // NOTE: Load facet list
  function loadFacetList(facets) {
    var source = document.getElementById("hawk-facet-list");
    if (!source) {
      return;
    }
    var template = Handlebars.compile(HAWK_FACETLIST_TEMPLATE);
    source.innerHTML = template(facets);
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
