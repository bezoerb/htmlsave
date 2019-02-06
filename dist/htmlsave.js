(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
(global = global || self, factory(global.htmlsave = {}));
}(this, function (exports) { 'use strict';

/**
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright Copyright (c) 2016 Ben Zörb
 *
 * Licensed under the MIT license.
 * http://bezoerb.mit-license.org/
 * All rights reserved.
 */
const blockLevelElements = ['address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'fieldset', 'figcaption', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'];
const voidElements = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
const breakElements = blockLevelElements.concat(voidElements);

function canBreak(val) {
  return breakElements.indexOf(val) !== -1;
}

function isVoid(val) {
  return voidElements.indexOf(val) !== -1;
}
/**
 * Check if value is an array
 * @param value
 * @returns {*}
 */


function isArray(value) {
  return value && typeof value === 'object' && typeof value.length === 'number' && Object.prototype.toString.call(value) === '[object Array]' || false;
}
/**
 * Stripped es2015 assign
 * @param target
 * @param source
 * @returns {*}
 */

function assign(target, ...source) {
  let from;
  const to = new Object(target);

  for (let s = 0; s < source.length; s++) {
    from = new Object(source[s]);

    for (const key in from) {
      if (Object.prototype.hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
}
/**
 * Check if string can be splitted on position without breaking a word
 *
 *
 * @param {string} string
 * @param {int} i
 * @returns {boolean}
 */

function canSplit(string, i) {
  // I is not within the range of allowed splitting positions
  if (i <= 0 || i >= string.length) {
    return false;
  } // Or after closing respectively before opening an block level element
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements


  const strBefore = string.substr(0, i);
  const strAfter = string.substr(i); // Save splitting can be done before and after whitespace ;)

  if (string[i] === ' ' || string[i - 1] === ' ') {
    return true;
  } // First check last character before using more expensive regex


  const tagBefore = string[i - 1] === '>' && (strBefore.match(/<\/(\w+)\s*>$/m) || strBefore.match(/<(\w+)[^\>]*\/>$/m));
  const tagAfter = strAfter[0] === '<' && (strAfter.match(/^<(\w+)[^\>]*>/m) || strAfter.match(/^<(\w+)[^\>]*\/>/m));
  return tagBefore && canBreak(tagBefore[1]) || tagAfter && canBreak(tagAfter[1]);
}
/**
 * Compute the next 'visible' position for a possible cut
 *
 * @param {string} string
 * @param {int} offset
 *
 * @return int
 */

function whitespacePos(string, offset = 0) {
  let str = string.substr(offset); // If we are inside a tag, rewind the string to the beginning of the tag

  if (/^[^<]*>/.test(str)) {
    const start = string.substr(0, offset).lastIndexOf('<');

    if (start >= 0) {
      // Rewind is posible
      str = string.substr(start);
    } else {
      // Missing tag start token, strip remaining tag
      str = str.replace(/^[^<]*>/, '');
    }
  } // Search for first whitespace


  const stripped = stripTags(str);
  const trimmed = stripped.replace(/^[^\s]*/, '');
  const pos = [stripped.length - trimmed.length];
  const regEnd = new RegExp('</((?:' + breakElements.join(')|(?:') + '))[^>]*>');
  const tagMatchEnd = str.match(regEnd);

  if (tagMatchEnd) {
    const tmp = str.substr(0, str.indexOf(tagMatchEnd[0]));
    pos.push(stripTags(tmp).length);
  }

  const regClose = new RegExp('<((?:' + breakElements.join(')|(?:') + '))[^>]*/>');
  const tagMatchClose = str.match(regClose);

  if (tagMatchClose) {
    const tmp = str.substr(0, str.indexOf(tagMatchClose[0]));
    pos.push(stripTags(tmp).length);
  }

  return Math.min.apply(null, pos);
}
/**
 * Next 'visible' position for a possible cut. Use next one if we are on a whitespace
 * @param string
 * @param offset
 * @returns {Number}
 */

function nextWhitespacePos(string, offset = 0) {
  const wspos = whitespacePos(string, offset); // Use result if we're not sitting right on a whitespace

  if (wspos) {
    return wspos;
  }

  const str = string.substr(offset); // 1st check whitespace

  if (/^\s/.test(str)) {
    const ws = whitespacePos(string, offset + 1);
    return ws || 1;
  } // 2nd remove tag in front  (looks like we're right inside a tag


  const tail = str.replace(/^<?[^>]*>/, '');
  return whitespacePos(tail, 0);
}
/**
 * Check if element is a void element
 * http://www.w3.org/TR/html-markup/syntax.html#void-element
 *
 * @param tag
 * @returns {boolean}
 */

function isVoidElement(tag) {
  // Get element type from tag
  const name = tag.match(/<(\w+)/);
  return name && isVoid(name[1]);
}
/**
 * Strip tags
 * @param input
 * @param allowed
 * @returns {XML|string}
 */

function stripTags(input, allowed) {
  // Making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  const validTags = (String(allowed || '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
  const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  const comments = /<!--[\s\S]*?-->/gi;
  const php = /<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(comments, '').replace(php, '').replace(tags, ($0, $1) => {
    return validTags.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
}

const defaults = {
  breakword: true
};

function getMax(val) {
  if (isArray(val)) {
    const last = val[val.length - 1];
    return drop => drop && val.shift() || val[0] || last;
  }

  return () => val;
}
/**
 * Split HTML string and keep tag safe.
 *
 * @method truncate
 * @param {String} string string needs to be truncated
 * @param {Number|Array} maxLength length of truncated string when array is provided use as breakpoints
 * @param {Object} params (optional)
 * @param {Boolean} [params.breakword] flag to specify if words should be splitted, false by default
 * @param {Boolean|String} [params.ellipsis] omission symbol for truncated string, '...' by default
 * @return {Array} String parts
 */


function slice(string, maxLength, params) {
  const results = [];
  const length = string.length;
  let tmpLength = 0;
  let tmp = '';
  let tmpTag = '';
  const openTags = [];
  const openTagsReverse = [];
  let ws = 0;
  let restString = string.replace(/<[^>]*>/gm, '');
  const max = getMax(maxLength);
  const options = assign({}, defaults, params || {});

  for (let i = 0; i < length; i++) {
    // Remember last whitespace
    if ((i === 0 || string[i] === ' ') && !tmpTag.length && !options.breakword) {
      if (i > 0) {
        restString = string.substr(i + 1).replace(/<[^>]*>/gm, '');
      }

      ws = restString.indexOf(' '); // Not found, use rest string length

      if (ws < 0) {
        ws = restString.length;
      }
    } // Tag found


    if (string[i] === '<' || tmpTag.length) {
      tmpTag += string[i]; // Closing Tag foung - remove last from open tags

      if (string[i] === '>' && /<\//.test(tmpTag)) {
        tmp += tmpTag;
        tmpTag = '';
        openTags.pop();
        openTagsReverse.shift(); // Void element tag found - just append to string
        // http://www.w3.org/TR/html-markup/syntax.html#void-element
      } else if (string[i] === '>' && isVoidElement(tmpTag)) {
        tmp += tmpTag;
        tmpTag = ''; // Opening tag found
      } else if (string[i] === '>') {
        tmp += tmpTag;
        openTags.push(tmpTag);
        openTagsReverse.unshift(tmpTag.match(/<\s*(\w+)\s*/)[1]);
        tmpTag = '';
      }
    } else {
      tmpLength++;
      tmp += string[i];
    } // // check if we're inside a tag


    const notag = !tmpTag;
    let cycleComplete = options.breakword && tmpLength >= max() && notag;

    if (!options.breakword && notag) {
      const possibleEnd = whitespacePos(string, i) === 0; // Create trimmed string to get the characters to the "next" whitespace

      const count = nextWhitespacePos(string, i);
      const next = tmpLength + count;
      cycleComplete = possibleEnd && next > max();
    } // Prevent empty closing tags at the end


    if (cycleComplete && openTagsReverse[0]) {
      const closingRegexp = new RegExp('^</(' + openTagsReverse[0] + ')\\s*>');
      const tmpMatch = string.substr(i + 1).match(closingRegexp);
      cycleComplete &= !tmpMatch;
    } // Break at whitespace if maxlength reached


    if (cycleComplete || i === string.length - 1 && tmpLength) {
      let tmpnew = ''; // Decrease max

      max(true); // Add closing tags if applicable, push to result array and start over

      for (let j = openTags.length - 1; j >= 0; j--) {
        const tag = openTags[j];
        const type = tag.match(/<\s*(\w+)\s*/)[1]; // Append closing tag to part x

        tmp += '</' + type + '>'; // Prepend opening tag to part x+1

        tmpnew = tag + tmpnew;
      }

      results.push(tmp);
      tmp = tmpnew;
      tmpLength = 0;
    }
  }

  return results;
}

const defaults$1 = {
  breakword: true,
  ellipsis: '...'
};
/**
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright Copyright (c) 2014 Ben Zörb
 *
 * Licensed under the MIT license.
 * http://bezoerb.mit-license.org/
 * All rights reserved.
 */

/**
 * Truncate HTML string and keep tag safe.
 *
 * If str is less than maxWidth characters long, return it.
 * Else abbreviate it to (substring(str, 0, max-ellipsis.length) + ellipsis).
 * If maxLength is less or equals than ellipsis.length, throw an Error.
 * In no case will it return a String of length greater than maxWidth.
 *
 * @method truncate
 * @alias abbreviate
 * @param {String} string string needs to be truncated
 * @param {Number} maxLength length of truncated string
 * @param {Object} params (optional)
 * @param {Boolean} [params.breakword] flag to specify if words should be splitted, false by default
 * @param {Boolean|String} [params.ellipsis] omission symbol for truncated string, '...' by default
 * @return {Array} String parts
 */

function truncate(string, maxLength, params) {
  const length = string.length;
  let tmpLength = 0;
  let tmp = '';
  let elength = 0;
  let tmpTag = '';
  const openTags = [];
  const restString = string.replace(/<[^>]*>/gm, '');
  const strippedLength = stripTags(string).length;
  let i;
  let j;
  const options = assign({}, defaults$1, params || {}); // Nothing to do

  if (strippedLength <= maxLength) {
    return string;
  } // Special case: maxlength: 0


  if (maxLength === 0) {
    return '';
  } // Negative maxlength should count from the end


  if (maxLength < 0) {
    maxLength = restString.length + maxLength;
  } // Compute length of ellipsis


  if (typeof options.ellipsis === 'string') {
    elength = options.ellipsis.length;

    if (elength > maxLength) {
      options.ellipsis = options.ellipsis.substr(0, maxLength);
      elength = options.ellipsis.length;
    }
  } // Throw an error if maxlength is less or equala ellipsis length


  if (elength >= maxLength) {
    throw new Error('htmlsave.truncate: Maxlength is less or equal ellipsis length');
  } // Parse string


  for (i = 0; i < length; i++) {
    // Tag found
    if (string[i] === '<' || tmpTag.length) {
      tmpTag += string[i]; // Closing Tag foung - remove last from open tags

      if (string[i] === '>' && /<\//.test(tmpTag)) {
        tmp += tmpTag;
        tmpTag = '';
        openTags.pop(); // Tag found which closes itself - just append to string
      } else if (string[i] === '>' && isVoidElement(tmpTag)) {
        tmp += tmpTag;
        tmpTag = ''; // Opening tag found
      } else if (string[i] === '>') {
        tmp += tmpTag;
        openTags.push(tmpTag);
        tmpTag = '';
      }
    } else {
      tmpLength++;
      tmp += string[i];
    }

    let done = options.breakword && tmpLength === maxLength - elength;

    if (!options.breakword) {
      let possibleEnd = whitespacePos(string, i) === 0; // Create trimmed string to get the characters to the "next" whitespace

      const count = nextWhitespacePos(string, i); // Check if we need ellipsis

      let next = tmpLength + count - 1;

      if (next < strippedLength) {
        next += elength;
      } // Edge case
      // first word is already lomger than max length


      if (tmpLength === 1 && next > maxLength) {
        possibleEnd = true;
        tmpLength--;
        tmp = tmp.substr(0, tmp.length - 1);
      }

      done = possibleEnd && next > maxLength;
    } // Break at whitespace if maxlength reached


    if (done || i === length - 1) {
      // Starting point for next string
      if (string[i] === ' ') {
        tmp = tmp.substr(0, tmp.length - 1);
        tmpLength--;
      }

      if (openTags.length === 0 && options.ellipsis && tmp.length < string.length) {
        tmp += options.ellipsis;
      } // Add closing tags if applicable, push to result array and start over


      for (j = openTags.length - 1; j >= 0; j--) {
        const tag = openTags[j];
        const type = tag.match(/<\s*(\w+)\s*/)[1];
        const close = '</' + type + '>'; // Append closing tag to part x

        if (j === openTags.length - 1 && options.ellipsis) {
          tmp += options.ellipsis;
        }

        tmp += close;
      }

      break;
    }
  }

  return tmp;
}

/**
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright Copyright (c) 2014 Ben Zörb
 *
 * Licensed under the MIT license.
 * http://bezoerb.mit-license.org/
 * All rights reserved.
 */
const utils = {
  assign: assign,
  canSplit,
  isArray,
  isVoidElement,
  nextWhitespacePos,
  stripTags,
  whitespacePos
};

exports.utils = utils;
exports.slice = slice;
exports.truncate = truncate;

Object.defineProperty(exports, '__esModule', { value: true });

}));
