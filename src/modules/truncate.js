var utils = require('./utils.js');

var defaults = {
    breakword: false,
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
 * @param {Object} options (optional)
 * @param {Boolean} [options.breakword] flag to specify if words should be splitted, false by default
 * @param {Boolean|String} [options.ellipsis] omission symbol for truncated string, '...' by default
 * @return {Array} String parts
 */
module.exports = function(string, maxLength, options) {
    var length = string.length,
        //ws = 0,
        tmpLength = 0,
        tmp = '',
        elength = 0,
        tmpTag = '',
        openTags = [],
        restString = string.replace(/<[^>]*>/gm,''),
        i,j;

    // prepare options
    if (typeof options !== 'object') {
        options = defaults;
    } else {
        for (var key in defaults) {
            if (typeof options[key] === 'undefined') {
                options[key] = defaults[key];
            }
        }
    }

    // special case: maxlength: 0
    if (maxLength === 0) {
        return '';
    }

    // negative maxlength should count from the end
    if (maxLength < 0) {
        maxLength = restString.length + maxLength;
    }


    // compute length of ellipsis
    if (typeof options.ellipsis === 'string') {
        elength = options.ellipsis.length;
        if (elength > maxLength) {
            options.ellipsis = options.ellipsis.substr(0,maxLength);
            elength = options.ellipsis.length;
        }
    }


    // throw an error if maxlength is less or equala ellipsis length
    if (elength >= maxLength) {
        throw 'htmlsave.truncate: Maxlength is less or equal ellipsis length';
    }

    // parse string
    for (i = 0; i < length; i++) {
        // tag found
        if (string[i] === '<' || tmpTag.length) {
            tmpTag += string[i];
            // closing Tag foung - remove last from open tags
            if (string[i] === '>' && (/<\//.test(tmpTag))) {
                tmp += tmpTag;
                tmpTag = '';
                openTags.pop();
                // tag found which closes itself - just append to string
            } else if (string[i] === '>' && utils.isVoidElement(tmpTag)) {
                tmp += tmpTag;
                tmpTag = '';
                // opening tag found
            } else if (string[i] === '>') {
                tmp += tmpTag;
                openTags.push(tmpTag);
                tmpTag = '';
            }
        } else {
            tmpLength++;
            tmp += string[i];
        }


        var notag = tmpTag === '' && ((i < string.length-2 && string.substr(i+1,2) !== '</') || (i > string.length -1));
        var ws = options.breakword ? 0 : notag && utils.findNextWhitespacePosition(string,i+1);
        var lengthcheck = (tmpLength + ws + elength) > maxLength  && (options.breakword || utils.canSplit(string,i));


        // break at whitespace if maxlength reached
        if (lengthcheck && notag || i === length - 1) {

            // starting point for next string
            if (string[i] === ' ') {
                tmp = tmp.substr(0,tmp.length-1);
                tmpLength--;
            }

            if (tmpLength > (maxLength -elength)) {
                var diff = tmp.length + (maxLength - (tmpLength + elength));



                // check for conflicting tags
                if (/^<?[^<]*>/.test(tmp.substr(diff))) {
                    // conflicted tag found -> remove from string
                    tmp = tmp.substr(0,diff).substr(0,tmp.lastIndexOf('<'));
                    // and remove from stack
                    openTags.pop();
                } else {
                    tmp = tmp.substr(0,diff);
                }
            }

            if (openTags.length === 0 && options.ellipsis && tmp.length < string.length) {
                tmp += options.ellipsis;
            }

            // add closing tags if applicable, push to result array and start over
            for (j = openTags.length - 1; j >= 0 ; j--) {
                var tag = openTags[j],
                    type = tag.match(/<\s*(\w+)\s*/)[1],
                    close = '</' + type + '>';

                // append closing tag to part x
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