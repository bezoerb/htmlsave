/**
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright Copyright (c) 2016 Ben Zörb
 *
 * Licensed under the MIT license.
 * http://bezoerb.mit-license.org/
 * All rights reserved.
 */

const blockLevelElements = [
  'address',
  'article',
  'aside',
  'audio',
  'blockquote',
  'canvas',
  'dd',
  'div',
  'dl',
  'fieldset',
  'figcaption',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'noscript',
  'ol',
  'output',
  'p',
  'pre',
  'section',
  'table',
  'tfoot',
  'ul',
  'video',
];

const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

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
export function isArray(value) {
  return (
    (value &&
      typeof value === 'object' &&
      typeof value.length === 'number' &&
      Object.prototype.toString.call(value) === '[object Array]') ||
    false
  );
}

/**
 * Stripped es2015 assign
 * @param target
 * @param source
 * @returns {*}
 */
export function assign(target, ...source) {
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
export function canSplit(string, i) {
  // I is not within the range of allowed splitting positions
  if (i <= 0 || i >= string.length) {
    return false;
  }

  // Or after closing respectively before opening an block level element
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
  const strBefore = string.substr(0, i);
  const strAfter = string.substr(i);

  // Save splitting can be done before and after whitespace ;)
  if (string[i] === ' ' || string[i - 1] === ' ') {
    return true;
  }

  // First check last character before using more expensive regex
  const tagBefore =
    string[i - 1] === '>' && (strBefore.match(/<\/(\w+)\s*>$/m) || strBefore.match(/<(\w+)[^\>]*\/>$/m));
  const tagAfter = strAfter[0] === '<' && (strAfter.match(/^<(\w+)[^\>]*>/m) || strAfter.match(/^<(\w+)[^\>]*\/>/m));

  return (tagBefore && canBreak(tagBefore[1])) || (tagAfter && canBreak(tagAfter[1]));
}

/**
 * Compute the next 'visible' position for a possible cut
 *
 * @param {string} string
 * @param {int} offset
 *
 * @return int
 */
export function whitespacePos(string, offset = 0) {
  let str = string.substr(offset);

  // If we are inside a tag, rewind the string to the beginning of the tag
  if (/^[^<]*>/.test(str)) {
    const start = string.substr(0, offset).lastIndexOf('<');

    if (start >= 0) {
      // Rewind is posible
      str = string.substr(start);
    } else {
      // Missing tag start token, strip remaining tag
      str = str.replace(/^[^<]*>/, '');
    }
  }

  // Search for first whitespace
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
export function nextWhitespacePos(string, offset = 0) {
  const wspos = whitespacePos(string, offset);

  // Use result if we're not sitting right on a whitespace
  if (wspos) {
    return wspos;
  }

  const str = string.substr(offset);
  // 1st check whitespace
  if (/^\s/.test(str)) {
    const ws = whitespacePos(string, offset + 1);
    return ws || 1;
  }

  // 2nd remove tag in front  (looks like we're right inside a tag
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
export function isVoidElement(tag) {
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
export function stripTags(input, allowed) {
  // Making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  const validTags = (
    String(allowed || '')
      .toLowerCase()
      .match(/<[a-z][a-z0-9]*>/g) || []
  ).join('');
  const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  const comments = /<!--[\s\S]*?-->/gi;
  const php = /<\?(?:php)?[\s\S]*?\?>/gi;

  return input
    .replace(comments, '')
    .replace(php, '')
    .replace(tags, ($0, $1) => {
      return validTags.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}
