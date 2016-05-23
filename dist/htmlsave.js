(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.htmlsave = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.htmlsave = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    /**
     *
     * @author Ben Zörb @bezoerb https://github.com/bezoerb
     * @copyright Copyright (c) 2016 Ben Zörb
     *
     * Licensed under the MIT license.
     * http://bezoerb.mit-license.org/
     * All rights reserved.
     */

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    var blockLevelElements = ['address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'fieldset', 'figcaption', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'];

    var voidElements = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

    var breakElements = blockLevelElements.concat(voidElements);

    function isVoid(val) {
        return voidElements.indexOf(val) !== -1;
    }

    /**
     * Check if value is an array
     * @param value
     * @returns {*}
     */
    function isArray(value) {
        return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && typeof value.length === 'number' && Object.prototype.toString.call(value) === '[object Array]' || false;
    }

    /**
     * Stripped es2015 assign
     * @param target
     * @param source
     * @returns {*}
     */
    function assign(target) {
        var from;
        var to = Object(target);

        for (var _len = arguments.length, source = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            source[_key - 1] = arguments[_key];
        }

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
     * Compute the next 'visible' position for a possible cut
     *
     * @param {string} string
     * @param {int} offset
     *
     * @return int
     */
    function whitespacePos(string) {
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        var str = string.substr(offset);

        // if we are inside a tag, rewind the string to the beginning of the tag
        if (/^[^<]*>/.test(str)) {
            var start = string.substr(0, offset).lastIndexOf('<');

            if (start >= 0) {
                // rewind is posible
                str = string.substr(start);
            } else {
                // missing tag start token, strip remaining tag
                str = str.replace(/^[^<]*>/, '');
            }
        }

        // search for first whitespace
        var stripped = stripTags(str);
        var trimmed = stripped.replace(/^[^\s]*/, '');
        var pos = [stripped.length - trimmed.length];

        var regEnd = new RegExp('<\/((?:' + breakElements.join(')|(?:') + '))[^>]*>');
        var tagMatchEnd = str.match(regEnd);
        if (tagMatchEnd) {
            var tmp = str.substr(0, str.indexOf(tagMatchEnd[0]));
            pos.push(stripTags(tmp).length);
        }

        var regClose = new RegExp('<((?:' + breakElements.join(')|(?:') + '))[^>]*\/>');
        var tagMatchClose = str.match(regClose);
        if (tagMatchClose) {
            var _tmp = str.substr(0, str.indexOf(tagMatchClose[0]));
            pos.push(stripTags(_tmp).length);
        }

        return Math.min.apply(null, pos);
    }

    /**
     * next 'visible' position for a possible cut. Use next one if we are on a whitespace
     * @param string
     * @param offset
     * @returns {Number}
     */
    function nextWhitespacePos(string) {
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        var wspos = whitespacePos(string, offset);

        // use result if we're not sitting right on a whitespace
        if (wspos) {
            return wspos;
        }

        var str = string.substr(offset);
        // 1st check whitespace
        if (/^\s/.test(str)) {
            var ws = whitespacePos(string, offset + 1);
            return ws || 1;
        }

        // 2nd remove tag in front  (looks like we're right inside a tag
        var tail = str.replace(/^<?[^>]*>/, '');

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
    function stripTags(input, allowed) {
        // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var validTags = (String(allowed || '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        var comments = /<!--[\s\S]*?-->/gi;
        var php = /<\?(?:php)?[\s\S]*?\?>/gi;

        return input.replace(comments, '').replace(php, '').replace(tags, function ($0, $1) {
            return validTags.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    }

    var defaults = {
        breakword: true
    };

    function getMax(val) {
        if (isArray(val)) {
            var _ret = function () {
                var last = val[val.length - 1];
                return {
                    v: function v(drop) {
                        return drop && val.shift() || val[0] || last;
                    }
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }

        return function () {
            return val;
        };
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
        var results = [];
        var length = string.length;
        var tmpLength = 0;
        var tmp = '';
        var tmpTag = '';
        var openTags = [];
        var openTagsReverse = [];
        var ws = 0;
        var restString = string.replace(/<[^>]*>/gm, '');

        var max = getMax(maxLength);

        var options = assign({}, defaults, params || {});

        for (var i = 0; i < length; i++) {
            // remember last whitespace
            if ((i === 0 || string[i] === ' ') && !tmpTag.length && !options.breakword) {
                if (i > 0) {
                    restString = string.substr(i + 1).replace(/<[^>]*>/gm, '');
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
                if (string[i] === '>' && /<\//.test(tmpTag)) {
                    tmp += tmpTag;
                    tmpTag = '';
                    openTags.pop();
                    openTagsReverse.shift();
                    // void element tag found - just append to string
                    // http://www.w3.org/TR/html-markup/syntax.html#void-element
                } else if (string[i] === '>' && isVoidElement(tmpTag)) {
                        tmp += tmpTag;
                        tmpTag = '';
                        // opening tag found
                    } else if (string[i] === '>') {
                            tmp += tmpTag;
                            openTags.push(tmpTag);
                            openTagsReverse.unshift(tmpTag.match(/<\s*(\w+)\s*/)[1]);
                            tmpTag = '';
                        }
            } else {
                tmpLength++;
                tmp += string[i];
            }

            // // check if we're inside a tag
            var notag = !tmpTag;

            var cycleComplete = options.breakword && tmpLength >= max() && notag;

            if (!options.breakword && notag) {
                var possibleEnd = whitespacePos(string, i) === 0;

                // create trimmed string to get the characters to the "next" whitespace
                var count = nextWhitespacePos(string, i);

                var next = tmpLength + count;

                cycleComplete = possibleEnd && next > max();
            }

            // prevent empty closing tags at the end
            if (cycleComplete && openTagsReverse[0]) {
                var closingRegexp = new RegExp('^<\/(' + openTagsReverse[0] + ')\\s*>');
                var tmpMatch = string.substr(i + 1).match(closingRegexp);
                cycleComplete &= !tmpMatch;
            }

            // break at whitespace if maxlength reached
            if (cycleComplete || i === string.length - 1 && tmpLength) {
                var tmpnew = '';

                // decrease max
                max(true);

                // add closing tags if applicable, push to result array and start over
                for (var j = openTags.length - 1; j >= 0; j--) {
                    var tag = openTags[j];
                    var type = tag.match(/<\s*(\w+)\s*/)[1];

                    // append closing tag to part x
                    tmp += '</' + type + '>';

                    // prepend opening tag to part x+1
                    tmpnew = tag + tmpnew;
                }

                results.push(tmp);
                tmp = tmpnew;
                tmpLength = 0;
            }
        }

        return results;
    }

    var defaults$1 = {
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
        var length = string.length;
        var tmpLength = 0;
        var tmp = '';
        var elength = 0;
        var tmpTag = '';
        var openTags = [];
        var restString = string.replace(/<[^>]*>/gm, '');
        var strippedLength = stripTags(string).length;
        var i;
        var j;

        var options = assign({}, defaults$1, params || {});

        // nothing to do
        if (strippedLength <= maxLength) {
            return string;
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
                options.ellipsis = options.ellipsis.substr(0, maxLength);
                elength = options.ellipsis.length;
            }
        }

        // throw an error if maxlength is less or equala ellipsis length
        if (elength >= maxLength) {
            throw new Error('htmlsave.truncate: Maxlength is less or equal ellipsis length');
        }

        // parse string
        for (i = 0; i < length; i++) {
            // tag found
            if (string[i] === '<' || tmpTag.length) {
                tmpTag += string[i];
                // closing Tag foung - remove last from open tags
                if (string[i] === '>' && /<\//.test(tmpTag)) {
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

            var done = options.breakword && tmpLength === maxLength - elength;

            if (!options.breakword) {
                var possibleEnd = whitespacePos(string, i) === 0;

                // create trimmed string to get the characters to the "next" whitespace
                var count = nextWhitespacePos(string, i);

                // check if we need ellipsis
                var next = tmpLength + count - 1;
                if (next < strippedLength) {
                    next += elength;
                }

                // edge case
                // first word is already lomger than max length
                if (tmpLength === 1 && next > maxLength) {
                    possibleEnd = true;
                    tmpLength--;
                    tmp = tmp.substr(0, tmp.length - 1);
                }

                done = possibleEnd && next > maxLength;
            }

            // break at whitespace if maxlength reached
            if (done || i === length - 1) {
                // starting point for next string
                if (string[i] === ' ') {
                    tmp = tmp.substr(0, tmp.length - 1);
                    tmpLength--;
                }

                if (openTags.length === 0 && options.ellipsis && tmp.length < string.length) {
                    tmp += options.ellipsis;
                }

                // add closing tags if applicable, push to result array and start over
                for (j = openTags.length - 1; j >= 0; j--) {
                    var tag = openTags[j];
                    var type = tag.match(/<\s*(\w+)\s*/)[1];
                    var close = '</' + type + '>';

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
    }

    exports.slice = slice;
    exports.truncate = truncate;
});

},{}]},{},[1])(1)
});