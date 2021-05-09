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

const breakElements = [...blockLevelElements, ...voidElements];

function canBreak(value) {
  return breakElements.indexOf(value) !== -1;
}

function isVoid(value) {
  return voidElements.indexOf(value) !== -1;
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
  const stringBefore = string.substr(0, i);
  const stringAfter = string.substr(i);

  // Save splitting can be done before and after whitespace ;)
  if (string[i] === ' ' || string[i - 1] === ' ') {
    return true;
  }

  // First check last character before using more expensive regex
  const tagBefore =
    string[i - 1] === '>' && (stringBefore.match(/<\/(\w+)\s*>$/m) || stringBefore.match(/<(\w+)[^>]*\/>$/m));
  const tagAfter =
    stringAfter[0] === '<' && (stringAfter.match(/^<(\w+)[^>]*>/m) || stringAfter.match(/^<(\w+)[^>]*\/>/m));

  return (tagBefore && canBreak(tagBefore[1])) || (tagAfter && canBreak(tagAfter[1]));
}

/**
 * Get array of break indices
 * @param {*} string
 */
export function getWhitespaces(string) {
  const result = [];
  const regex = new RegExp('((?:\\s)|</?(?:(?:' + breakElements.join(')|(?:') + '))(?:/?>|(?:\\s[^>]*>)))', 'gm');

  string.replace(regex, (match, p1, offset, string) => {
    const insideTag = string.lastIndexOf('<', offset) > string.lastIndexOf('>', offset);
    if (match.startsWith('</') || match.endsWith('/>')) {
      result.push(offset + match.length);
    } else if (!insideTag) {
      result.push(offset);
    }

    return match;
  });

  return result;
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
      .match(/<[a-z][a-z\d]*>/g) || []
  ).join('');
  const tags = /<\/?([a-z][a-z\d]*)\b[^>]*>/gi;
  const comments = /<!--[\s\S]*?-->/gi;
  const php = /<\?(?:php)?[\s\S]*?\?>/gi;

  return input
    .replace(comments, '')
    .replace(php, '')
    .replace(tags, ($0, $1) => {
      return validTags.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}
