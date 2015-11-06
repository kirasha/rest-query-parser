/*
 * REST Query Parser: Effortelessly get your query parametters
 *
 * @author: diokeyolivier@gmail.com
 *
 * MIT Licence
 *
 */

'use strict';

module.exports = function () {

  // define defaults
  var restQuery = {};

  function parse_fields (fields) {
    if (!fields || typeof fields !== 'string') {
      return;
    }

    return fields.split(',');
  }

  function parse_number (number) {
    if (!number) {return;}
    var n = number.replace(',', '');
    return Number(n).valueOf();
  }

  function format_value (val) {
    if (!val) {
      return;
    }
    var number_pattern = /^[,-.0-9]+$/;
    var match = val.match(number_pattern);
    if (match && match.length) {
      return parse_number(match[0]);
    } else {
      return val;
    }
  }

  function parse_filter (filter) {

    var signPattern = /(\w+)(==|!=|~|!~|<=|<|>=|>)(\S+)/i;
    var operatorPattern = /(\w+)(\]|\[)(\S+)(\]|\[)/;
    var parts = filter.match(signPattern);
    if (parts && parts.length === 4) {
      return {
        key: parts[1],
        operator: parts[2],
        value: format_value(parts[3])
      };
    } else {
      var operatorParts = filter.match(operatorPattern);
      if (operatorParts && operatorParts.length === 5) {
        var operator = '';
        var operatorSign = operatorParts[2] + operatorParts[4];
        var val = operatorParts[3];
        var values = [];
        var operatorType = (val.indexOf('-') !== -1) ? 'between' : (val.indexOf(',') !== -1) ? 'in' : '';

        switch (operatorType) {
          case 'between': {
            values = val.split('-').map(parse_number);
            break;
          }
          case 'in': {
            values = val.split(',').map(parse_number);
            break;
          }
        }

        switch (operatorSign) {
          case '[]': {
            operator = operatorType;
            break;
          }
          case '][': {
            operator = 'not ' + operatorType;
            break;
          }
        }

        if (!values.length && !operator) {
          return;
        }

        return {
          key: operatorParts[1],
          operator: operator,
          value: values
        };
      }
    }
  }

  function parse_filters (filters) {
    if (!filters) {
      return;
    }

    filters = filters.split(';');
    if (!filters || !Array.isArray(filters)) {
      return;
    }

    return filters.map(parse_filter);
  }

  function parse_pagination (page, size) {
    if (!page && !size) {
      return;
    }

    if (page && !size) {
      size = 30;
    }

    if (size && !page) {
      page = 1;
    }

    page = parseInt(page, 10);
    size = parseInt(size, 10);

    return { page: page, size: size };
  }

  function parse_sorting (sortOpts) {
    if (!sortOpts) {
      return;
    }

    if (sortOpts instanceof Object) {
      var keys = Object.keys(sortOpts);
      return keys.map(function (key) {
        var retVal = {};

        retVal[key] = sortOpts[key];
        return retVal;
      });
    }

    var options = sortOpts.split(',');

    return options.map(function (opt) {
      var key;
      var value;
      var retVal = {};

      if (typeof opt === 'string') {
        if (opt.indexOf('-') === -1) {
          key = opt;
          value = 'asc';
        } else {
          key = opt.substr(opt.indexOf('-') + 1);
          value = 'desc';
        }
      }
      retVal[key] = value;
      return retVal;
    });
  }

  function parse_embeded (embeded) {
    if (!embeded) {
      return;
    }

    return parse_fields(embeded);
  }

  return function (req, res, next) {
    restQuery.fields = parse_fields(req.query.fields);
    restQuery.filters = parse_filters(req.query.filters);
    var pagination = req.query.pagination || {};
    pagination.page = pagination.page || req.query.page;
    pagination.size = pagination.size || req.query.size;
    restQuery.pagination = parse_pagination(pagination.page, pagination.size);
    restQuery.sorting = parse_sorting(req.query.sorting);
    restQuery.embed = parse_embeded(req.query.embed);
    req.restQuery = restQuery;
    next();
  };

};
