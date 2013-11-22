/**
 * JS Modul Definition with jQuery as dependency
 * Uses AMD, CommonJS or browser globals to create a module.
 */
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
			breakword: false
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
	library.split = function(string, maxLength, options) {
		var results = [],
			length = string.length,
			tmpLength = 0,
			tmp = '',
			tmpTag = '',
			openTags = [],
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
			if (tmpLength >= maxLength && (options.breakword || string[i] === ' ') || i === length - 1) {
				// starting point for next string
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