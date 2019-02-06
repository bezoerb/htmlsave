import * as utils from './utils.js';

const defaults = {
  breakword: true,
  ellipsis: '...',
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
export function truncate(string, maxLength, params) {
  const length = string.length;
  let tmpLength = 0;
  let tmp = '';
  let elength = 0;
  let tmpTag = '';
  const openTags = [];
  const restString = string.replace(/<[^>]*>/gm, '');
  const strippedLength = utils.stripTags(string).length;
  let i;
  let j;

  const options = utils.assign({}, defaults, params || {});

  // Nothing to do
  if (strippedLength <= maxLength) {
    return string;
  }

  // Special case: maxlength: 0
  if (maxLength === 0) {
    return '';
  }

  // Negative maxlength should count from the end
  if (maxLength < 0) {
    maxLength = restString.length + maxLength;
  }

  // Compute length of ellipsis
  if (typeof options.ellipsis === 'string') {
    elength = options.ellipsis.length;
    if (elength > maxLength) {
      options.ellipsis = options.ellipsis.substr(0, maxLength);
      elength = options.ellipsis.length;
    }
  }

  // Throw an error if maxlength is less or equala ellipsis length
  if (elength >= maxLength) {
    throw new Error('htmlsave.truncate: Maxlength is less or equal ellipsis length');
  }

  // Parse string
  for (i = 0; i < length; i++) {
    // Tag found
    if (string[i] === '<' || tmpTag.length) {
      tmpTag += string[i];
      // Closing Tag foung - remove last from open tags
      if (string[i] === '>' && /<\//.test(tmpTag)) {
        tmp += tmpTag;
        tmpTag = '';
        openTags.pop();
        // Tag found which closes itself - just append to string
      } else if (string[i] === '>' && utils.isVoidElement(tmpTag)) {
        tmp += tmpTag;
        tmpTag = '';
        // Opening tag found
      } else if (string[i] === '>') {
        tmp += tmpTag;
        openTags.push(tmpTag);
        tmpTag = '';
      }
    } else {
      tmpLength++;
      tmp += string[i];
    }

    let done = options.breakword && tmpLength === maxLength - elength;

    if (!options.breakword) {
      let possibleEnd = utils.whitespacePos(string, i) === 0;

      // Create trimmed string to get the characters to the "next" whitespace
      const count = utils.nextWhitespacePos(string, i);

      // Check if we need ellipsis
      let next = tmpLength + count - 1;
      if (next < strippedLength) {
        next += elength;
      }

      // Edge case
      // first word is already lomger than max length
      if (tmpLength === 1 && next > maxLength) {
        possibleEnd = true;
        tmpLength--;
        tmp = tmp.substr(0, tmp.length - 1);
      }

      done = possibleEnd && next > maxLength;
    }

    // Break at whitespace if maxlength reached
    if (done || i === length - 1) {
      // Starting point for next string
      if (string[i] === ' ') {
        tmp = tmp.substr(0, tmp.length - 1);
        tmpLength--;
      }

      if (openTags.length === 0 && options.ellipsis && tmp.length < string.length) {
        tmp += options.ellipsis;
      }

      // Add closing tags if applicable, push to result array and start over
      for (j = openTags.length - 1; j >= 0; j--) {
        const tag = openTags[j];
        const type = tag.match(/<\s*(\w+)\s*/)[1];
        const close = '</' + type + '>';

        // Append closing tag to part x
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
