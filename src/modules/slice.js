import * as utils from './utils';

const defaults = {
  breakword: true,
};

function getMax(val) {
  if (utils.isArray(val)) {
    const last = val[val.length - 1];
    return drop => (drop && val.shift()) || val[0] || last;
  }

  return () => val;
}

/**
 * Split HTML string and keep tag safe.
 *
 * @method slice
 * @param {String} string string needs to be sliced
 * @param {Number|Array} maxLength length of sliced string when array is provided use as breakpoints
 * @param {Object} params (optional)
 * @param {Boolean} [params.breakword] flag to specify if words should be splitted, false by default
 * @return {Array} String parts
 */
export function slice(string, maxLength, params) {
  const results = [];
  const length = string.length;
  let tmpLength = 0;
  let tmp = '';
  let tmpTag = '';
  const openTags = [];
  const openTagsReverse = [];
  let ws = 0;
  let restString = string.replace(/<[^>]*>/gm, '');
  const max = getMax(maxLength);
  const options = utils.assign({}, defaults, params || {});

  const whitespaces = utils.getWhitespaces(string);

  for (let i = 0; i < length; i++) {
    // Remember last whitespace
    if ((i === 0 || string[i] === ' ') && tmpTag.length === 0 && !options.breakword) {
      if (i > 0) {
        restString = string.substr(i + 1).replace(/<[^>]*>/gm, '');
      }

      ws = restString.indexOf(' ');
      // Not found, use rest string length
      if (ws < 0) {
        ws = restString.length;
      }
    }

    // Tag found
    if (string[i] === '<' || tmpTag.length > 0) {
      tmpTag += string[i];
      // Closing Tag foung - remove last from open tags
      if (string[i] === '>' && /<\//.test(tmpTag)) {
        tmp += tmpTag;
        tmpTag = '';
        openTags.pop();
        openTagsReverse.shift();
        // Void element tag found - just append to string
        // http://www.w3.org/TR/html-markup/syntax.html#void-element
      } else if (string[i] === '>' && utils.isVoidElement(tmpTag)) {
        tmp += tmpTag;
        tmpTag = '';
        // Opening tag found
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
    const notag = !tmpTag;

    let cycleComplete = options.breakword && tmpLength >= max() && notag;

    if (!options.breakword && notag) {
      let index = i;
      let wsi = whitespaces.indexOf(i);
      const fWsi = whitespaces.indexOf(i + 1);
      if (string.length > i && !/\s/.test(string[i + 1]) && fWsi >= 0) {
        wsi = fWsi;
        index = i + 1;
      }

      if (wsi >= 0) {
        const rawpart =
          wsi < whitespaces.length - 1
            ? string.substring(index + 1, whitespaces[wsi + 1])
            : string.substring(index + 1);
        const part = utils.stripTags(rawpart);
        cycleComplete = tmpLength + part.length > max();
      }
    }

    // Prevent empty closing tags at the end
    if (cycleComplete && openTagsReverse[0]) {
      const closingRegexp = new RegExp('^</(' + openTagsReverse[0] + ')\\s*>');
      const tmpMatch = string.substr(i + 1).match(closingRegexp);
      cycleComplete &= !tmpMatch;
    }

    // Break at whitespace if maxlength reached
    if (cycleComplete || (i === string.length - 1 && tmpLength)) {
      let tmpnew = '';

      // Decrease max
      max(true);

      // Add closing tags if applicable, push to result array and start over
      for (let j = openTags.length - 1; j >= 0; j--) {
        const tag = openTags[j];
        const type = tag.match(/<\s*(\w+)\s*/)[1];

        // Append closing tag to part x
        tmp += '</' + type + '>';

        // Prepend opening tag to part x+1
        tmpnew = tag + tmpnew;
      }

      results.push(tmp);
      tmp = tmpnew;
      tmpLength = 0;
    }
  }

  return results;
}
