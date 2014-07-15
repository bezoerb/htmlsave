# htmlsave [![Build Status](https://travis-ci.org/bezoerb/htmlsave.svg?branch=master)](https://travis-ci.org/bezoerb/htmlsave)

HTML save string utilities for JavaScript.

## Features

* Truncate HTML String while preserving HTML tags and whole words.
* Split HTML String while preserving HTML tags and whole words.
* It works with all the standard JavaScript loading systems out of the box (CommonJS, AMD, or just as a global)

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
htmlsave.truncate("<p>lorem ipsum html text</p>",12,{
	breakword: false
});
```

### AMD (e.g. RequireJS)

```javascript
define(['htmlsave'], function(htmlsave) {
   htmlsave.slice("<span>my extra long html text</span>",10);
});
```

### Directly in your web page:

```html
<script src="htmlsave.min.js"></script>
<script>
htmlsave.truncate("another too long text",5);
</script>
```
## Documentation

* `htmlsave.truncate(<string>,<maxlength>,<options>)` method.
* `htmlsave.slice(<string>,<maxlength>,<options>)` method.


## License
Copyright (c) 2013 Ben Zörb
Licensed under the [MIT license](http://bezoerb.mit-license.org/).

