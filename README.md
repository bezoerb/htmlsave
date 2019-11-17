# htmlsave

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![BrowserStack Status][browserstack-image]][browserstack-url] [![Dependency Status][depstat-image]][depstat-url] [![Download][dlcounter-image]][dlcounter-url] [![Coverage Status][coveralls-image]][coveralls-url]

HTML save string utilities for JavaScript.

## Features

- Truncate HTML String while preserving HTML tags and whole words.
- Split HTML String while preserving HTML tags and whole words.
- It works with all the standard JavaScript loading systems out of the box (CommonJS, AMD, or just as a global)

## Downloading htmlsave

If you're using node, you can run `npm install htmlsave`.

htmlsave is also available via [Bower](https://github.com/bower/bower) (`bower install htmlsave`)

Alternatively if you just want to grab the file yourself, you can download either the current stable [production version][min] or the [development version][max] directly.

[min]: https://raw.github.com/bezoerb/htmlsave/master/dist/htmlsave.min.js
[max]: https://raw.github.com/bezoerb/htmlsave/master/dist/htmlsave.js

## Setting it up

htmlsave supports AMD (e.g. RequireJS), CommonJS (e.g. Node.js) and direct usage (e.g. loading globally with a &lt;script&gt; tag) loading methods.
You should be able to do nearly anything, and then skip to the next section anyway and have it work. Just in case though, here's some specific examples that definitely do the right thing:

### CommonsJS (e.g. Node)

```javascript
var htmlsave = require('htmlsave');
htmlsave.truncate('<p>lorem ipsum html text</p>', 12, {
  breakword: false,
});
```

### AMD (e.g. RequireJS)

```javascript
define(['htmlsave'], function(htmlsave) {
  htmlsave.slice('<span>my extra long html text</span>', 10);
});
```

### Directly in your web page:

```html
<script src="htmlsave.min.js"></script>
<script>
  htmlsave.truncate('another too long text', 5);
</script>
```

## API

- `htmlsave.truncate(input, maxlength,<options>)` method.
- `htmlsave.slice(input, maxlength,<options>)` method.

#### input

_Required_
Type: `string`

#### maxlength

_Required_
Type: `int`

Max characters allowed. Use `0` for `slice` to split by word.

#### options

##### breakword

Type: `boolean`
Default value: `true`

Allow script to truncate words. Disable to only allow truncating on whitespace,
[block-level elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements#Elements) and [void elements](https://www.w3.org/TR/html-markup/syntax.html#syntax-elements).

##### ellipsis

Type: `String`
Default value: `....`

End truncated string with ellipsis. This option has no effect on `slice`.

## License

Copyright (c) 2016 Ben Zörb
Licensed under the [MIT license](http://bezoerb.mit-license.org/).

[npm-url]: https://npmjs.org/package/htmlsave
[npm-image]: https://img.shields.io/npm/v/htmlsave.svg
[travis-url]: https://travis-ci.org/bezoerb/htmlsave
[travis-image]: https://secure.travis-ci.org/bezoerb/htmlsave.svg?branch=master
[depstat-url]: https://david-dm.org/bezoerb/htmlsave
[depstat-image]: https://david-dm.org/bezoerb/htmlsave.svg
[dlcounter-url]: https://www.npmjs.com/package/htmlsave
[dlcounter-image]: https://img.shields.io/npm/dm/htmlsave.svg
[coveralls-url]: https://coveralls.io/github/bezoerb/htmlsave
[coveralls-image]: https://coveralls.io/repos/github/bezoerb/htmlsave/badge.svg
[browserstack-url]: https://automate.browserstack.com/public-build/WXBURm85eG9PUlB5eGhMMnIzQzlPdysvV3ZVMnRoeFdtN0gvbUM3UEZvQT0tLUpuTVd1Zk5ocGQ0Nkk4QmhiZEh1SVE9PQ==--b3f80db5ae4dc1da53a7967a322d741258dd1ded
[browserstack-image]: https://automate.browserstack.com/badge.svg?badge_key=WXBURm85eG9PUlB5eGhMMnIzQzlPdysvV3ZVMnRoeFdtN0gvbUM3UEZvQT0tLUpuTVd1Zk5ocGQ0Nkk4QmhiZEh1SVE9PQ==--b3f80db5ae4dc1da53a7967a322d741258dd1ded
