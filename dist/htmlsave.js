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
				} else if (string[i] === '>' &&  /\/>/.test(tmpTag)) {
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




			// break at whitespace if maxlength reached
			if (tmpTag === '' && (tmpLength >= (maxLength -elength) || string[i] === ' ' && (tmpLength + ws) >= (maxLength -elength)) || i === length - 1) {
				// starting point for next string
				if (string[i] === ' ') {
					tmp = tmp.substr(0,tmp.length-1);
				}

				if (tmpLength > (maxLength -elength)) {
					var diff = tmpLength - (maxLength -elength);

					tmp = tmp.substr(diff);
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
	 * @param {Number} maxLength length of truncated string
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
					// tag found which closes itself - just append to string
				} else if (string[i] === '>' &&  /\/>/.test(tmpTag)) {
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
				lengthcheck = (tmpLength + ws) >= maxLength  && (options.breakword || string[i] === ' ');

			// break at whitespace if maxlength reached
			if (lengthcheck && notag || i === length - 1) {
				var tmpnew = '';

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

	return library;
}));