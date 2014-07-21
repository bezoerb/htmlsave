/**
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright Copyright (c) 2014 Ben Zörb
 *
 * Licensed under the MIT license.
 * http://bezoerb.mit-license.org/
 * All rights reserved.
 */

"use Strict";

var blockLevelElements = ['address','article','aside','audio','blockquote','canvas','dd','div','dl','fieldset',
    'figcaption','footer','form','h1','h2','h3','h4','h5','h6','header','hgroup','hr','noscript','ol','output',
    'p','pre','section','table','tfoot','ul','video'];

/**
 * Check if value is an array
 * @param value
 * @returns {*}
 */
function isArray(value) {
    return (value && typeof value === 'object' && typeof value.length === 'number' &&
        Object.prototype.toString.call(value) === '[object Array]') || false;
}

/**
 * check if string can be splitted on position without breaking a word
 *
 *
 * @param {string} string
 * @param {int} i
 * @param {boolean} allowEmptyTags
 * @returns {boolean}
 */
function canSplit(string,i,allowEmptyTags) {
    // i is not within the range of i
    if (i <= 0 || i >= string.length) {
        return false;
    }

    // save splitting can be done on whitespace ;)
    if (string[i] === ' ') {
        return true;
    }

    // or after closing respectively before opening an block level element
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
    var tagBefore,tagAfter;


    if (allowEmptyTags) {
        // fetch closing tag right before i
        tagBefore = (string.substr(0,i).match(/<\/([\w]+)\/?>?$/m) || ['-','-'])[1];
        // fetch opening tag right behind i
        tagAfter = (string.substr(i+1).match(/^<?([\w]+)\/?>/m) || ['-','-'])[1];
    } else {
        // fetch tag right before i
        tagBefore = (string.substr(0,i).match(/<\/?([\w]+)\/?>?$/m) || ['-','-'])[1];
        // fetch tag right behind i
        tagAfter = (string.substr(i+1).match(/^<?\/?([\w]+)\/?>/m) || ['-','-'])[1];
    }

    if (blockLevelElements.indexOf(tagBefore) !== -1 || blockLevelElements.indexOf(tagAfter) !== -1) {
        return true;
    }

    // any other case should return false
    return false;
}

/**
 * Compute the next 'visible' position for a possible cut
 *
 * @param string
 *
 * @return int
 */
function findNextWhitespacePosition(string,offset) {
    var sub = string.substr(offset),
        insideTag = /^[^<]*>/.test(sub),
        reg = new RegExp('<\/?((?:' + blockLevelElements.join(')|(?:') + '))'),
        tagMatch = sub.match(reg);


    // compute next whitespace position
    if (insideTag) {
        // if we are inside a closing blocklevel element, next possible cut is right after this element
        // because the tags are not visible, we return 0
        var match = string.substr(string.substr(0,offset).lastIndexOf('<')).match(/^<\/(\w+)/);
        if (match && blockLevelElements.indexOf(match[1]) !== -1) {
            return 0;
        } else {
            // start counting from the end of the tag
            sub = sub.substr(sub.indexOf('>')+1);
        }
    }

    var p1 = strip_tags(sub).indexOf(' ');
    var p2 = tagMatch ? strip_tags(sub.substr(0,sub.indexOf(tagMatch[0]))).length : p1 +1;
    var result = Math.min(p1,p2);

    return result >= 0 ? result : string.length;
}


/**
 * Check if element is a void element
 * http://www.w3.org/TR/html-markup/syntax.html#void-element
 *
 * @param tag
 * @returns {boolean}
 */
function isBlockLevelElement(tag) {
    // get element type from tag
    var type = (tag.match(/<(\w+)/) || ['-','-'])[1];

    return blockLevelElements.indexOf(type) !== -1;
}


/**
 * Check if element is a void element
 * http://www.w3.org/TR/html-markup/syntax.html#void-element
 *
 * @param tag
 * @returns {boolean}
 */
function isVoidElement(tag) {
    var voidElements = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link',
        'meta', 'param', 'source', 'track', 'wbr'];

    // get element type from tag
    var type = (tag.match(/<(\w+)/) || ['-','-'])[1];

    return voidElements.indexOf(type) !== -1;
}

/**
 * Strip tags
 * @param input
 * @param allowed
 * @returns {XML|string}
 */
function strip_tags(input, allowed) {
    //  discuss at: http://phpjs.org/functions/strip_tags/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Luke Godfrey
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //    input by: Pul
    //    input by: Alex
    //    input by: Marc Palau
    //    input by: Brett Zamir (http://brett-zamir.me)
    //    input by: Bobby Drake
    //    input by: Evertjan Garretsen
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Onno Marsman
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Eric Nagel
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Tomasz Wesolowski
    //  revised by: Rafał Kukawski (http://blog.kukawski.pl/)
    //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
    //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
    //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
    //   returns 2: '<p>Kevin van Zonneveld</p>'
    //   example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
    //   returns 3: "<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>"
    //   example 4: strip_tags('1 < 5 5 > 1');
    //   returns 4: '1 < 5 5 > 1'
    //   example 5: strip_tags('1 <br/> 1');
    //   returns 5: '1  1'
    //   example 6: strip_tags('1 <br/> 1', '<br>');
    //   returns 6: '1 <br/> 1'
    //   example 7: strip_tags('1 <br/> 1', '<br><br/>');
    //   returns 7: '1 <br/> 1'

    allowed = (((allowed || '') + '')
        .toLowerCase()
        .match(/<[a-z][a-z0-9]*>/g) || [])
        .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '')
        .replace(tags, function($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
}

module.exports.isArray = isArray;
module.exports.canSplit = canSplit;
module.exports.isBlockLevelElement = isBlockLevelElement;
module.exports.isVoidElement = isVoidElement;
module.exports.findNextWhitespacePosition = findNextWhitespacePosition;
module.exports.stripTags = strip_tags;