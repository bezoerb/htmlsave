/* eslint-env node, browser */
/**
 * Created by ben on 06.04.16.
 */
var fs = require('fs');
var path = require('path');
var css = fs.readFileSync(path.join(__dirname, '../fixtures/bootstrap.css'), 'utf8');
var html = fs.readFileSync(path.join(__dirname, '../fixtures/test.html'), 'utf8');

global.document = require('jsdom').jsdom(html);
global.window = document.defaultView;

// append css
var head = global.document.getElementsByTagName('head')[0];
var style = global.document.createElement("style");
style.type = 'text/css';
style.innerHTML = css;
head.appendChild(style);
