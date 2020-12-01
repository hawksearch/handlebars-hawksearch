Handlebars.registerHelper("parseHTML", function (_html) {
  return new Handlebars.SafeString(_html);
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
