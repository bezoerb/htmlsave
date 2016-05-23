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

    function isBlock(val) {
        return blockLevelElements.indexOf(val) !== -1;
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
        return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && typeof value.length === 'number' && Object.prototype.toString.call(value) === '[object Array]' || false;
    }

    function assign(target, source) {
        var from;
        var to = Object(target);
        var symbols;

        for (var s = 1; s < arguments.length; s++) {
            from = Object(arguments[s]);

            for (var key in from) {
                if (Object.prototype.hasOwnProperty.call(from, key)) {
                    to[key] = from[key];
                }
            }

            if (Object.getOwnPropertySymbols) {
                symbols = Object.getOwnPropertySymbols(from);
                for (var i = 0; i < symbols.length; i++) {
                    if (Object.prototype.propertyIsEnumerable.call(from, symbols[i])) {
                        to[symbols[i]] = from[symbols[i]];
                    }
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
    function canSplit(string, i) {
        // i is not within the range of allowed splitting positions
        if (i <= 0 || i >= string.length) {
            return false;
        }

        // save splitting can be done on whitespace ;)
        if (string[i] === ' ') {
            return true;
        }

        // or after closing respectively before opening an block level element
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
        var strBefore = string.substr(0, i);
        var strAfter = string.substr(i);

        // first check last character before using more expensive regex
        var tagBefore = string[i - 1] === '>' && (strBefore.match(/<\/(\w+)\s*>$/m) || strBefore.match(/<(\w+)[^\>]*\/>$/m));
        var tagAfter = strAfter[0] === '<' && (strAfter.match(/^<(\w+)[^\>]*>/m) || strAfter.match(/^<(\w+)[^\>]*\/>/m));

        return tagBefore && isBlock(tagBefore[1]) || tagAfter && isBlock(tagAfter[1]);
    }

    /**
     * Compute the next 'visible' position for a possible cut
     *
     * @param {string} string
     * @param {int} offset
     *
     * @return int
     */
    function whitespacePos(string, offset) {
        var str = string.substr(offset);
        var reg = new RegExp('<\/?((?:' + blockLevelElements.join(')|(?:') + '))');
        var tagMatch = str.match(reg);

        // first check if we are inside a tag
        if (/^[^<]*>/.test(str)) {
            // if we are inside a closing blocklevel element, next possible cut is right after this element
            // because the tags are not counted, we return 0
            var match = string.substr(string.substr(0, offset).lastIndexOf('<')).match(/^<\/(\w+)/);
            if (match && blockLevelElements.indexOf(match[1]) !== -1) {
                return 0;
            }

            // start counting from the end of the tag
            str = str.substr(str.indexOf('>') + 1);
        }

        var p1 = stripTags(str).indexOf(' ');
        var p2 = tagMatch ? stripTags(str.substr(0, str.indexOf(tagMatch[0]))).length : p1 + 1;
        var result = Math.min(p1, p2);

        return result >= 0 ? result : str.length;
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
        breakword: true,
        ellipsis: '...'
    };

    function getMax(val) {
        if (isArray(val)) {
            var _ret = function () {
                var last = val[val.length - 1];
                return {
                    v: function v() {
                        return val.shift() || last;
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
        var ws = 0;
        var restString = string.replace(/<[^>]*>/gm, '');
        var i;
        var j;

        var max = getMax(maxLength);

        var options = assign({}, defaults, params || {});

        for (i = 0; i < length; i++) {
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
                    // void element tag found - just append to string
                    // http://www.w3.org/TR/html-markup/syntax.html#void-element
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

            var notag = tmpTag === '' && (i < string.length - 2 && string.substr(i + 1, 2) !== '</' || i > string.length - 1);
            var lengthcheck = tmpLength + ws >= max() && (options.breakword || canSplit(string, i));

            // break at whitespace if maxlength reached
            if (lengthcheck && notag || i === length - 1) {
                var tmpnew = '';

                // add closing tags if applicable, push to result array and start over
                for (j = openTags.length - 1; j >= 0; j--) {
                    var tag = openTags[j];
                    var type = tag.match(/<\s*(\w+)\s*/)[1];
                    var close = '</' + type + '>';

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
    }

    var defaults$1 = {
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
    function truncate(string, maxLength, options) {
        var length = string.length;
        var tmpLength = 0;
        var tmp = '';
        var elength = 0;
        var tmpTag = '';
        var openTags = [];
        var restString = string.replace(/<[^>]*>/gm, '');
        var i;
        var j;

        // prepare options
        if (typeof options === 'undefined') {
            options = defaults$1;
        } else {
            for (var key in defaults$1) {
                if (typeof options[key] === 'undefined') {
                    options[key] = defaults$1[key];
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

            var notag = tmpTag === '' && (i < string.length - 2 && string.substr(i + 1, 2) !== '</' || i > string.length - 1);
            var ws = options.breakword ? 0 : notag && whitespacePos(string, i + 1);
            var lengthcheck = tmpLength + ws + elength > maxLength && (options.breakword || canSplit(string, i));

            // break at whitespace if maxlength reached
            if (lengthcheck && notag || i === length - 1) {
                // starting point for next string
                if (string[i] === ' ') {
                    tmp = tmp.substr(0, tmp.length - 1);
                    tmpLength--;
                }

                if (tmpLength > maxLength - elength) {
                    var diff = tmp.length + (maxLength - (tmpLength + elength));

                    // check for conflicting tags
                    if (/^<?[^<]*>/.test(tmp.substr(diff))) {
                        // conflicted tag found -> remove from string
                        tmp = tmp.substr(0, diff).substr(0, tmp.lastIndexOf('<'));
                        // and remove from stack
                        openTags.pop();
                    } else {
                        tmp = tmp.substr(0, diff);
                    }
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
    };

    exports.slice = slice;
    exports.truncate = truncate;
});

},{}]},{},[1])(1)
});