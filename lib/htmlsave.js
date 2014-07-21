/*! htmlsave - v0.0.9 - 2013-11-25
 * Copyright (c) 2013 Ben Zörb; Licensed MIT */
/* global define, window, module */
;(function (name, factory) {
    'use strict';
    if (typeof module !== 'undefined') {
        // Node/CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        (this || window)[name] = factory();
    }
}('htmlsave', function () {
    'use strict';
    var library = {},
        defaults = {
            breakword: true,
            ellipsis: '...'
        };


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
     * Truncate HTML string and keep tag safe.
     *
     * @method truncate
     * @param {String} string string needs to be truncated
     * @param {Number} maxLength length of truncated string
     * @param {Object} options (optional)
     * @param {Boolean} [options.breakword] flag to specify if words should be splitted, false by default
     * @param {Boolean|String} [options.ellipsis] omission symbol for truncated string, '...' by default
     * @return {Array} String parts
     */
    library.truncate = function(string, maxLength, options) {
        var length = string.length,
            ws = 0,
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

        // parse string
        for (i = 0; i < length; i++) {
            // remember last whitespace
            if ((i === 0 || string[i] === ' ') && !tmpTag.length && !options.breakword) {
                if (i > 0) {
                    restString = string.substr(i+1).replace(/<[^>]*>/gm,'');
                }
                ws = restString.indexOf(' ');
                // not found, use rest string length
                if (ws < 0) {
                    ws = restString.length;
                }

                if (options.ellipsis) {
                    ws+= options.ellipsis.length;
                }
            }

            // tag found
            if (string[i] === '<' || tmpTag.length) {
                tmpTag += string[i];
                // closing Tag foung - remove last from open tags
                if (string[i] === '>' && (/<\//.test(tmpTag))) {
                    tmp += tmpTag;
                    tmpTag = '';
                    openTags.pop();
                    // tag found which closes itself - just append to string
                } else if (string[i] === '>' && isVoidElement(tmpTag)) {
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

            var notag = tmpTag === '' && ((i < string.length-2 && string.substr(i+1,2) !== '</') || (i > string.length -1)),
                lengthcheck = (tmpLength + ws) >= maxLength  && (options.breakword || canSplit(string,i));


            // break at whitespace if maxlength reached
            if (lengthcheck && notag || i === length - 1) {

                // starting point for next string
                if (string[i] === ' ') {
                    tmp = tmp.substr(0,tmp.length-1);
                }

                if (tmpLength > (maxLength -elength)) {
                    var diff = tmpLength - (tmpLength - (maxLength - elength));

                    tmp = tmp.substr(0,diff);
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
                    if (j === 0 && options.ellipsis) {
                        tmp += options.ellipsis;
                    }
                    tmp += close;
                }



                break;
            }

        }

        return tmp;
    };

    /**
     * Split HTML string and keep tag safe.
     *
     * @method truncate
     * @param {String} string string needs to be truncated
     * @param {Number|Array} maxLength length of truncated string when array is provided use as breakpoints
     * @param {Object} options (optional)
     * @param {Boolean} [options.breakword] flag to specify if words should be splitted, false by default
     * @param {Boolean|String} [options.ellipsis] omission symbol for truncated string, '...' by default
     * @return {Array} String parts
     */
    library.slice = function(string, maxLength, options) {
        var results = [],
            length = string.length,
            tmpLength = 0,
            tmp = '',
            tmpTag = '',
            max,
            openTags = [],
            ws = 0,
            restString = string.replace(/<[^>]*>/gm,''),
            i,j;

        if (typeof options !== 'object') {
            options = defaults;
        } else {
            for (var key in defaults) {
                if (typeof options[key] === 'undefined') {
                    options[key] = defaults[key];
                }
            }
        }

        if (isArray(maxLength)) {
            max = Array.prototype.shift.call(maxLength);
        } else {
            max = maxLength;
        }

        for (i = 0; i < length; i++) {
            // remember last whitespace
            if ((i === 0 || string[i] === ' ') && !tmpTag.length && !options.breakword) {
                if (i > 0) {
                    restString = string.substr(i+1).replace(/<[^>]*>/gm,'');
                }
                ws = restString.indexOf(' ');
                // not found, use rest string length
                if (ws < 0) {
                    ws = restString.length;
                }
            }

            // tag found
            if (string[i] === '<' || tmpTag.length) {
                tmpTag += string[i];
                // closing Tag foung - remove last from open tags
                if (string[i] === '>' && (/<\//.test(tmpTag))) {
                    tmp += tmpTag;
                    tmpTag = '';
                    openTags.pop();
                    // void element tag found - just append to string
                    // http://www.w3.org/TR/html-markup/syntax.html#void-element
                } else if (string[i] === '>' && isVoidElement(tmpTag) ) {
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


            var notag = tmpTag === '' && ((i < string.length-2 && string.substr(i+1,2) !== '</') || (i > string.length -1)),
                lengthcheck = (tmpLength + ws) >= max  && (options.breakword || canSplit(string,i,!!options.ellipsis));

            // break at whitespace if maxlength reached
            if (lengthcheck && notag || i === length - 1) {
                var tmpnew = '';

                if (isArray(maxLength) && maxLength.length) {
                    max = Array.prototype.shift.call(maxLength);
                } else if (isArray(maxLength)) {
                    max = length;
                }

                // add closing tags if applicable, push to result array and start over
                for (j = openTags.length - 1; j >= 0 ; j--) {
                    var tag = openTags[j],
                        type = tag.match(/<\s*(\w+)\s*/)[1],
                        close = '</' + type + '>';

                    // append closing tag to part x
                    tmp += close;
                    // prepend opening tag to part x+1
                    tmpnew = tag + tmpnew;
                }

                results.push(tmp);
                tmp = tmpnew;
                tmpLength = 0;
            }

        }

        return results;
    };

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
        var tagBefore,tagAfter,
            blockLevelElements = ['address','article','aside','audio','blockquote','canvas','dd','div','dl','fieldset',
            'figcaption','footer','form','h1','h2','h3','h4','h5','h6','header','hgroup','hr','noscript','ol','output',
            'p','pre','section','table','tfoot','ul','video'];

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

    return library;
}));
