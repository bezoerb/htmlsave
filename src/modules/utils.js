/**
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright Copyright (c) 2016 Ben Zörb
 *
 * Licensed under the MIT license.
 * http://bezoerb.mit-license.org/
 * All rights reserved.
 */

const blockLevelElements = ['address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'fieldset',
    'figcaption', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'noscript', 'ol', 'output',
    'p', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'];

const voidElements = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link',
    'meta', 'param', 'source', 'track', 'wbr'];

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
    return (value && typeof value === 'object' && typeof value.length === 'number' &&
        Object.prototype.toString.call(value) === '[object Array]') || false;
}

/**
 * Stripped es2015 assign
 * @param target
 * @param source
 * @returns {*}
 */
export function assign(target, ...source) {
    var from;
    var to = Object(target);

    for (var s = 0; s < source.length; s++) {
        from = Object(source[s]);

        for (var key in from) {
            if (Object.prototype.hasOwnProperty.call(from, key)) {
                to[key] = from[key];
            }
        }
    }

    return to;
}

/**
 * check if string can be splitted on position without breaking a word
 *
 *
 * @param {string} string
 * @param {int} i
 * @returns {boolean}
 */
export function canSplit(string, i) {
    // i is not within the range of allowed splitting positions
    if (i <= 0 || i >= string.length) {
        return false;
    }

    // or after closing respectively before opening an block level element
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
    let strBefore = string.substr(0, i);
    let strAfter = string.substr(i);

    // save splitting can be done before and after whitespace ;)
    if (string[i] === ' ' || string[i - 1] === ' ') {
        return true;
    }

    // first check last character before using more expensive regex
    let tagBefore = string[i - 1] === '>' && (strBefore.match(/<\/(\w+)\s*>$/m) || strBefore.match(/<(\w+)[^\>]*\/>$/m));
    let tagAfter = strAfter[0] === '<' && (strAfter.match(/^<(\w+)[^\>]*>/m) || strAfter.match(/^<(\w+)[^\>]*\/>/m));

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
export function whitespacePos(string, offset = 0) {
    let str = string.substr(offset);

    // if we are inside a tag, rewind the string to the beginning of the tag
    if (/^[^<]*>/.test(str)) {
        let start = string.substr(0, offset).lastIndexOf('<');

        if (start >= 0) {
            // rewind is posible
            str = string.substr(start);
        } else {
            // missing tag start token, strip remaining tag
            str = str.replace(/^[^<]*>/, '');
        }
    }

    // search for first whitespace
    let stripped = stripTags(str);
    let trimmed = stripped.replace(/^[^\s]*/, '');
    let pos = [stripped.length - trimmed.length];

    let regEnd = new RegExp('<\/((?:' + breakElements.join(')|(?:') + '))[^>]*>');
    let tagMatchEnd = str.match(regEnd);
    if (tagMatchEnd) {
        let tmp = str.substr(0, str.indexOf(tagMatchEnd[0]));
        pos.push(stripTags(tmp).length);
    }

    let regClose = new RegExp('<((?:' + breakElements.join(')|(?:') + '))[^>]*\/>');
    let tagMatchClose = str.match(regClose);
    if (tagMatchClose) {
        let tmp = str.substr(0, str.indexOf(tagMatchClose[0]));
        pos.push(stripTags(tmp).length);
    }

    return Math.min.apply(null, pos);
}

/**
 * next 'visible' position for a possible cut. Use next one if we are on a whitespace
 * @param string
 * @param offset
 * @returns {Number}
 */
export function nextWhitespacePos(string, offset = 0) {
    let wspos = whitespacePos(string, offset);

    // use result if we're not sitting right on a whitespace
    if (wspos) {
        return wspos;
    }

    let str = string.substr(offset);
    // 1st check whitespace
    if (/^\s/.test(str)) {
        let ws = whitespacePos(string, offset + 1);
        return ws || 1;
    }

    // 2nd remove tag in front  (looks like we're right inside a tag
    let tail = str.replace(/^<?[^>]*>/, '');

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
    // get element type from tag
    var name = tag.match(/<(\w+)/);

    return name && isVoid(name[1]);
}

/**
 * Strip tags
 * @param input
 * @param allowed
 * @returns {XML|string}
 */
export function stripTags(input, allowed) {
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    const validTags = (String(allowed || '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    const comments = /<!--[\s\S]*?-->/gi;
    const php = /<\?(?:php)?[\s\S]*?\?>/gi;

    return input.replace(comments, '').replace(php, '').replace(tags, function ($0, $1) {
        return validTags.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}
