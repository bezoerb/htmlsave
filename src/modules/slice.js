import * as utils from './utils';

const defaults = {
  breakword: true,
};

function getMax(value) {
  if (utils.isArray(value)) {
    const last = value[value.length - 1];
    return (drop) => (drop && value.shift()) || value[0] || last;
  }

  return () => value;
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
export function slice(string, maxLength, parameters) {
  const results = [];
  const length = string.length;
  let temporaryLength = 0;
  let temporary = '';
  let temporaryTag = '';
  const openTags = [];
  const openTagsReverse = [];
  let ws = 0;
  let restString = string.replace(/<[^>]*>/gm, '');
  const max = getMax(maxLength);
  const options = utils.assign({}, defaults, parameters || {});

  const whitespaces = utils.getWhitespaces(string);

  for (let i = 0; i < length; i++) {
    // Remember last whitespace
    if ((i === 0 || string[i] === ' ') && temporaryTag.length === 0 && !options.breakword) {
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
    if (string[i] === '<' || temporaryTag.length > 0) {
      temporaryTag += string[i];
      // Closing Tag foung - remove last from open tags
      if (string[i] === '>' && /<\//.test(temporaryTag)) {
        temporary += temporaryTag;
        temporaryTag = '';
        openTags.pop();
        openTagsReverse.shift();
        // Void element tag found - just append to string
        // http://www.w3.org/TR/html-markup/syntax.html#void-element
      } else if (string[i] === '>' && utils.isVoidElement(temporaryTag)) {
        temporary += temporaryTag;
        temporaryTag = '';
        // Opening tag found
      } else if (string[i] === '>') {
        temporary += temporaryTag;
        openTags.push(temporaryTag);
        openTagsReverse.unshift(temporaryTag.match(/<\s*(\w+)\s*/)[1]);
        temporaryTag = '';
      }
    } else {
      temporaryLength++;
      temporary += string[i];
    }

    // // check if we're inside a tag
    const notag = !temporaryTag;

    let cycleComplete = options.breakword && temporaryLength >= max() && notag;

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
        cycleComplete = temporaryLength + part.length > max();
      }
    }

    // Prevent empty closing tags at the end
    if (cycleComplete && openTagsReverse[0]) {
      const closingRegexp = new RegExp('^</(' + openTagsReverse[0] + ')\\s*>');
      const temporaryMatch = string.substr(i + 1).match(closingRegexp);
      cycleComplete &= !temporaryMatch;
    }

    // Break at whitespace if maxlength reached
    if (cycleComplete || (i === string.length - 1 && temporaryLength)) {
      let tmpnew = '';

      // Decrease max
      max(true);

      // Add closing tags if applicable, push to result array and start over
      for (let j = openTags.length - 1; j >= 0; j--) {
        const tag = openTags[j];
        const type = tag.match(/<\s*(\w+)\s*/)[1];

        // Append closing tag to part x
        temporary += '</' + type + '>';

        // Prepend opening tag to part x+1
        tmpnew = tag + tmpnew;
      }

      results.push(temporary);
      temporary = tmpnew;
      temporaryLength = 0;
    }
  }

  return results;
}
