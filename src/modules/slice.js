import * as utils from './utils.js';
const defaults = {
    breakword: true
};

function getMax(val) {
    if (utils.isArray(val)) {
        let last = val[val.length - 1];
        return (drop) => drop && val.shift() || val[0] || last;
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
export function slice(string, maxLength, params) {
    var results = [];
    var length = string.length;
    var tmpLength = 0;
    var tmp = '';
    var tmpTag = '';
    var openTags = [];
    let openTagsReverse = [];
    var ws = 0;
    var restString = string.replace(/<[^>]*>/gm, '');

    const max = getMax(maxLength);

    let options = utils.assign({}, defaults, params || {});

    for (let i = 0; i < length; i++) {
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
            if (string[i] === '>' && (/<\//.test(tmpTag))) {
                tmp += tmpTag;
                tmpTag = '';
                openTags.pop();
                openTagsReverse.shift();
                // void element tag found - just append to string
                // http://www.w3.org/TR/html-markup/syntax.html#void-element
            } else if (string[i] === '>' && utils.isVoidElement(tmpTag)) {
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
        let notag = !tmpTag;

        let cycleComplete = options.breakword && (tmpLength >= max()) && notag;

        if (!options.breakword && notag) {
            let possibleEnd = utils.whitespacePos(string, i) === 0;

            // create trimmed string to get the characters to the "next" whitespace
            let count = utils.nextWhitespacePos(string, i);

            let next = (tmpLength + count);

            cycleComplete = possibleEnd && next > max();
        }

        // prevent empty closing tags at the end
        if (cycleComplete && openTagsReverse[0]) {
            let closingRegexp = new RegExp('^<\/(' + openTagsReverse[0] + ')\\s*>');
            let tmpMatch = string.substr(i + 1).match(closingRegexp);
            cycleComplete &= !tmpMatch;
        }

        // break at whitespace if maxlength reached
        if (cycleComplete || (i === string.length - 1 && tmpLength)) {
            let tmpnew = '';

            // decrease max
            max(true);

            // add closing tags if applicable, push to result array and start over
            for (let j = openTags.length - 1; j >= 0; j--) {
                let tag = openTags[j];
                let type = tag.match(/<\s*(\w+)\s*/)[1];

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
