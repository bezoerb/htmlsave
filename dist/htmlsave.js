(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
module.exports.slice = require('./modules/slice.js');
module.exports.truncate = require('./modules/truncate.js');


},{"./modules/slice.js":2,"./modules/truncate.js":3}],2:[function(require,module,exports){
"use strict";
var utils = require('./utils.js');
var defaults = {
  breakword: true,
  ellipsis: '...'
};
module.exports = function(string, maxLength, options) {
  var results = [],
      length = string.length,
      tmpLength = 0,
      tmp = '',
      tmpTag = '',
      max,
      openTags = [],
      ws = 0,
      restString = string.replace(/<[^>]*>/gm, ''),
      i,
      j;
  if (typeof options !== 'object') {
    options = defaults;
  } else {
    for (var key in defaults) {
      if (typeof options[key] === 'undefined') {
        options[key] = defaults[key];
      }
    }
  }
  if (utils.isArray(maxLength)) {
    max = Array.prototype.shift.call(maxLength);
  } else {
    max = maxLength;
  }
  for (i = 0; i < length; i++) {
    if ((i === 0 || string[i] === ' ') && !tmpTag.length && !options.breakword) {
      if (i > 0) {
        restString = string.substr(i + 1).replace(/<[^>]*>/gm, '');
      }
      ws = restString.indexOf(' ');
      if (ws < 0) {
        ws = restString.length;
      }
    }
    if (string[i] === '<' || tmpTag.length) {
      tmpTag += string[i];
      if (string[i] === '>' && (/<\//.test(tmpTag))) {
        tmp += tmpTag;
        tmpTag = '';
        openTags.pop();
      } else if (string[i] === '>' && utils.isVoidElement(tmpTag)) {
        tmp += tmpTag;
        tmpTag = '';
      } else if (string[i] === '>') {
        tmp += tmpTag;
        openTags.push(tmpTag);
        tmpTag = '';
      }
    } else {
      tmpLength++;
      tmp += string[i];
    }
    var notag = tmpTag === '' && ((i < string.length - 2 && string.substr(i + 1, 2) !== '</') || (i > string.length - 1)),
        lengthcheck = (tmpLength + ws) >= max && (options.breakword || utils.canSplit(string, i, !!options.ellipsis));
    if (lengthcheck && notag || i === length - 1) {
      var tmpnew = '';
      if (utils.isArray(maxLength) && maxLength.length) {
        max = Array.prototype.shift.call(maxLength);
      } else if (utils.isArray(maxLength)) {
        max = length;
      }
      for (j = openTags.length - 1; j >= 0; j--) {
        var tag = openTags[j],
            type = tag.match(/<\s*(\w+)\s*/)[1],
            close = '</' + type + '>';
        tmp += close;
        tmpnew = tag + tmpnew;
      }
      results.push(tmp);
      tmp = tmpnew;
      tmpLength = 0;
    }
  }
  return results;
};


},{"./utils.js":4}],3:[function(require,module,exports){
"use strict";
var utils = require('./utils.js');
var defaults = {
  breakword: false,
  ellipsis: '...'
};
module.exports = function(string, maxLength, options) {
  var length = string.length,
      tmpLength = 0,
      tmp = '',
      elength = 0,
      tmpTag = '',
      openTags = [],
      restString = string.replace(/<[^>]*>/gm, ''),
      i,
      j;
  if (typeof options !== 'object') {
    options = defaults;
  } else {
    for (var key in defaults) {
      if (typeof options[key] === 'undefined') {
        options[key] = defaults[key];
      }
    }
  }
  if (maxLength === 0) {
    return '';
  }
  if (maxLength < 0) {
    maxLength = restString.length + maxLength;
  }
  if (typeof options.ellipsis === 'string') {
    elength = options.ellipsis.length;
    if (elength > maxLength) {
      options.ellipsis = options.ellipsis.substr(0, maxLength);
      elength = options.ellipsis.length;
    }
  }
  for (i = 0; i < length; i++) {
    if (string[i] === '<' || tmpTag.length) {
      tmpTag += string[i];
      if (string[i] === '>' && (/<\//.test(tmpTag))) {
        tmp += tmpTag;
        tmpTag = '';
        openTags.pop();
      } else if (string[i] === '>' && utils.isVoidElement(tmpTag)) {
        tmp += tmpTag;
        tmpTag = '';
      } else if (string[i] === '>') {
        tmp += tmpTag;
        openTags.push(tmpTag);
        tmpTag = '';
      }
    } else {
      tmpLength++;
      tmp += string[i];
    }
    var notag = tmpTag === '' && ((i < string.length - 2 && string.substr(i + 1, 2) !== '</') || (i > string.length - 1));
    var ws = options.breakword ? 0 : notag && utils.findNextWhitespacePosition(string, i + 1);
    var lengthcheck = (tmpLength + ws + elength) > maxLength && (options.breakword || utils.canSplit(string, i));
    if (lengthcheck && notag || i === length - 1) {
      if (string[i] === ' ') {
        tmp = tmp.substr(0, tmp.length - 1);
        tmpLength--;
      }
      if (tmpLength > (maxLength - elength)) {
        var diff = tmp.length + (maxLength - (tmpLength + elength));
        if (/^<?[^<]*>/.test(tmp.substr(diff))) {
          tmp = tmp.substr(0, diff).substr(0, tmp.lastIndexOf('<'));
          openTags.pop();
        } else {
          tmp = tmp.substr(0, diff);
        }
      }
      if (openTags.length === 0 && options.ellipsis && tmp.length < string.length) {
        tmp += options.ellipsis;
      }
      for (j = openTags.length - 1; j >= 0; j--) {
        var tag = openTags[j],
            type = tag.match(/<\s*(\w+)\s*/)[1],
            close = '</' + type + '>';
        if (j === openTags.length - 1 && options.ellipsis) {
          tmp += options.ellipsis;
        }
        tmp += close;
      }
      break;
    }
  }
  return tmp;
};


},{"./utils.js":4}],4:[function(require,module,exports){
"use strict";
"use Strict";
var blockLevelElements = ['address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'fieldset', 'figcaption', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'];
function isArray(value) {
  return (value && typeof value === 'object' && typeof value.length === 'number' && Object.prototype.toString.call(value) === '[object Array]') || false;
}
function canSplit(string, i, allowEmptyTags) {
  if (i <= 0 || i >= string.length) {
    return false;
  }
  if (string[i] === ' ') {
    return true;
  }
  var tagBefore,
      tagAfter;
  if (allowEmptyTags) {
    tagBefore = (string.substr(0, i).match(/<\/([\w]+)\/?>?$/m) || ['-', '-'])[1];
    tagAfter = (string.substr(i + 1).match(/^<?([\w]+)\/?>/m) || ['-', '-'])[1];
  } else {
    tagBefore = (string.substr(0, i).match(/<\/?([\w]+)\/?>?$/m) || ['-', '-'])[1];
    tagAfter = (string.substr(i + 1).match(/^<?\/?([\w]+)\/?>/m) || ['-', '-'])[1];
  }
  if (blockLevelElements.indexOf(tagBefore) !== -1 || blockLevelElements.indexOf(tagAfter) !== -1) {
    return true;
  }
  return false;
}
function findNextWhitespacePosition(string, offset) {
  var sub = string.substr(offset),
      insideTag = /^[^<]*>/.test(sub),
      reg = new RegExp('<\/?((?:' + blockLevelElements.join(')|(?:') + '))'),
      tagMatch = sub.match(reg);
  if (insideTag) {
    var match = string.substr(string.substr(0, offset).lastIndexOf('<')).match(/^<\/(\w+)/);
    if (match && blockLevelElements.indexOf(match[1]) !== -1) {
      return 0;
    } else {
      sub = sub.substr(sub.indexOf('>') + 1);
    }
  }
  var p1 = strip_tags(sub).indexOf(' ');
  var p2 = tagMatch ? strip_tags(sub.substr(0, sub.indexOf(tagMatch[0]))).length : p1 + 1;
  return Math.min(p1, p2);
}
function isBlockLevelElement(tag) {
  var type = (tag.match(/<(\w+)/) || ['-', '-'])[1];
  return blockLevelElements.indexOf(type) !== -1;
}
function isVoidElement(tag) {
  var voidElements = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  var type = (tag.match(/<(\w+)/) || ['-', '-'])[1];
  return voidElements.indexOf(type) !== -1;
}
function strip_tags(input, allowed) {
  allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
      commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
}
;
module.exports.isArray = isArray;
module.exports.canSplit = canSplit;
module.exports.isBlockLevelElement = isBlockLevelElement;
module.exports.isVoidElement = isVoidElement;
module.exports.findNextWhitespacePosition = findNextWhitespacePosition;
module.exports.stripTags = strip_tags;


},{}]},{},[1]);