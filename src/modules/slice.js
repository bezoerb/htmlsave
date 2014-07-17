var utils = require('./utils.js');

var defaults = {
    breakword: true,
    ellipsis: '...'
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
module.exports = function(string, maxLength, options) {
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

    if (utils.isArray(maxLength)) {
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
            } else if (string[i] === '>' && utils.isVoidElement(tmpTag) ) {
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
            lengthcheck = (tmpLength + ws) >= max  && (options.breakword || utils.canSplit(string,i,!!options.ellipsis));

        // break at whitespace if maxlength reached
        if (lengthcheck && notag || i === length - 1) {
            var tmpnew = '';

            if (utils.isArray(maxLength) && maxLength.length) {
                max = Array.prototype.shift.call(maxLength);
            } else if (utils.isArray(maxLength)) {
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