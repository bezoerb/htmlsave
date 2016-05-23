/* eslint-env es6, browser */
import '../node_modules/babel-core/register';
import test from 'ava';
import * as utils from '../src/modules/utils';

const text = '<p>Lorem ipsum <a href="#">dolor sit amet</a>, conset<span>etur sadipscing elitr, sed</span>diam <div>nonumy eirmod</div>tempor invidunt ut labore et dolore magna aliquyam</p>';

/**
 * Offset helper
 *
 * @param word
 * @param offset
 * @returns {*}
 */
const offsetAfter = (word, offset) => text.indexOf(word) + (offset || 0) + word.length;

/*
 * canSplit
 */
test('allow splitting after whitespace', t => {
    t.truthy(utils.canSplit(text, text.indexOf(' ') + 1));
});
test('disallow splitting on 1st character', t => {
    t.false(utils.canSplit(text, 0));
});
test('disallow splitting after last character', t => {
    t.false(utils.canSplit(text, text.length));
});
test('allow splitting right before/after block element', t => {
    let indexBefore = text.indexOf('<div>');
    let indexAfter = text.indexOf('</div>') + 6;
    t.true(utils.canSplit(text, indexBefore));
    t.true(utils.canSplit(text, indexAfter));
});
test('disallow splitting right before/after inline element', t => {
    let indexBefore = text.indexOf('<span>');
    let indexAfter = text.indexOf('</span>') + 7;
    t.false(utils.canSplit(text, indexBefore));
    t.false(utils.canSplit(text, indexAfter));
});
test('disallow splitting inside word', t => {
    let index = text.indexOf('Lorem') + 3;
    t.false(utils.canSplit(text, index));
});
test('disallow splitting inside tag', t => {
    let index = text.indexOf('<span>') - 3;
    t.false(utils.canSplit(text, index));
});
test('disallow splitting before inline tag', t => {
    const str = 'a<span></span>a';
    t.false(utils.canSplit(str, 1));
});
test('disallow splitting after inline tag', t => {
    const str = 'a<span></span>a';
    t.false(utils.canSplit(str, str.length - 1));
});
test('allow splitting before block tag', t => {
    const str = 'b<div></div>b';
    t.true(utils.canSplit(str, 1));
});
test('allow splitting after block tag', t => {
    const str = 'b<div></div>b';
    t.true(utils.canSplit(str, str.length - 1));
});
test('allow split before br', t => {
    const str = '<a href="#content">This is a link<br/>to my contents</a>';
    t.true(utils.canSplit(str, str.indexOf('<br/>')));
});
test('allow split after br', t => {
    const str = '<br/>to my contents</a><span>Test</span>';
    t.true(utils.canSplit(str, 5));
});

/*
 * isVoidElement
 */
test('return false for div', t => {
    t.falsy(utils.isVoidElement('<div>'));
});
test('return true for img (short tag)', t => {
    t.truthy(utils.isVoidElement('<img src="" />'));
});
test('return true for img', t => {
    t.truthy(utils.isVoidElement('<img src="">'));
});

/*
 * whitespacePos
 */
test('find first ws between lorem and ipsum', t => {
    t.is(utils.whitespacePos(text, 3), 5);
});
test('find div start tag', t => {
    t.is(utils.whitespacePos(text, offsetAfter('elitr, ')), 7);
});
test('find pos after dolor', t => {
    t.is(utils.whitespacePos(text, offsetAfter('a hre')), 5);
});
test('allow break direct after the tag is finished', t => {
    t.is(utils.whitespacePos(text, offsetAfter('</d')), 0);
});
test('take first ws inside div container, not after opening div', t => {
    t.is(utils.whitespacePos(text, offsetAfter('<di')), 6);
});
test('take first ws inside div container, not after opening div', t => {
    t.is(utils.whitespacePos('link<br/>to my contents</a><span>Test</span>'), 4);
});
test('find whitespace on whitespace', t => {
    t.is(utils.whitespacePos('    ', 0), 0);
});
test('find whitespace on tab', t => {
    t.is(utils.whitespacePos('\t   ', 0), 0);
});
test('find whitespace before br', t => {
    t.is(utils.whitespacePos('<br/>1 2', 0), 0);
});
test('find whitespace when inside br', t => {
    t.is(utils.whitespacePos('<br/>12 2', 3), 0);
});
test('find whitespace string', t => {
    t.is(utils.whitespacePos('abc def', 0), 3);
});
test('handle tag with missing start', t => {
    t.is(utils.whitespacePos('v class="abc">abc def', 0), 3);
});

/*
 * nextWhitespacePos
 */
test('next whitespace on whitespace', t => {
    t.is(utils.nextWhitespacePos('    ', 0), 1);
});
test('next whitespace on tab', t => {
    t.is(utils.nextWhitespacePos('\t   ', 0), 1);
});
test('next whitespace before br', t => {
    t.is(utils.nextWhitespacePos('<br/>12 2', 0), 2);
});
test('next whitespace inside br', t => {
    t.is(utils.nextWhitespacePos('<br/>12 2', 3), 2);
});
test('next whitespace string', t => {
    t.is(utils.nextWhitespacePos('abc def', 0), 3);
});
test('next whitespace string', t => {
    t.is(utils.nextWhitespacePos('<p>12 3456789</p>', 2), 2);
});
test('next whitespace string', t => {
    t.is(utils.nextWhitespacePos('<p>12 3456789</p>', 3), 2);
});
test('next whitespace string', t => {
    t.is(utils.nextWhitespacePos('<p>12 3456789</p>', 5), 7);
});
test('next whitespace string', t => {
    t.is(utils.nextWhitespacePos('<p>12 3456789</p>', 13), 0);
});

/*
 * is array
 */
test('{} is no array', t => {
    t.false(utils.isArray({}));
});
test('"no array" is no array', t => {
    t.false(utils.isArray('no array'));
});
test('1 is no array', t => {
    t.false(utils.isArray(1));
});
test('function noop(){} is no array', t => {
    t.false(utils.isArray(function noop() {}));
});
test('[] is array', t => {
    t.true(utils.isArray([]));
});

/*
 * assign
 */

test('return the modified target object', t => {
    let target = {};
    let returned = utils.assign(target, {a: 1});
    t.is(returned, target);
});
test('preserve property order', t => {
    let letters = 'abcdefghijklmnopqrst';
    let source = {};
    letters.split('').forEach(function (letter) {
        source[letter] = letter;
    });
    let target = utils.assign({}, source);
    t.is(Object.keys(target).join(''), letters);
});
test('merge multiple objects', t => {
    let source = {};
    let target = utils.assign(source, {a: 1}, {b: 2}, {c: 3});
    t.is(target.a, 1);
    t.is(target.b, 2);
    t.is(target.c, 3);
});
