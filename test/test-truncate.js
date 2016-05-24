/* eslint-env es6, browser */
import '../node_modules/babel-core/register';
import test from 'ava';
import {truncate} from '../src/htmlsave';

test('should not add ellipsis', t => {
    const str = '<p>12 3456789</p>';
    t.is(truncate(str, 50, {breakword: false}), str);
});

test('should throw an error if ellipsis length equals maxlength', t => {
    const str = '<p>12 3456789</p>';

    try {
        truncate(str, 3, {ellipsis: '...'});
        t.fail('error expected');
    } catch (err) {
        t.pass(err.message);
    }
});

test('should throw an error if ellipsis length is greater than maxlength', t => {
    const str = '<p>12 3456789</p>';

    try {
        truncate(str, 1, {ellipsis: '...'});
        t.fail('error expected');
    } catch (err) {
        t.pass(err.message);
    }
});

test('should return empty string', t => {
    const str = '<p>hello my little pony</p>';

    t.is(truncate(str, 0, {breakword: false}), '');
});

test('should truncate ellipsis', t => {
    const str = '<p>12 3456789</p>';

    t.is(truncate(str, -3, {breakword: false}), '<p>12...</p>');
});

test('should leave <p></p>', t => {
    const str = '<p>hello my little pony</p>';

    t.is(truncate(str, -1, {breakword: false}), '<p>hello my little...</p>');
});

test('should only leave ellipsis', t => {
    const str = '<p>12 3456789</p>';

    t.is(truncate(str, 8, {breakword: false}), '<p>12...</p>');
});

test('should leave <p>hello my...</p>', t => {
    const str = '<p>hello my little pony</p>';

    t.is(truncate(str, 15, {breakword: false}), '<p>hello my...</p>');
});

test('should leave <span>my little...</span>', t => {
    const str = '<span>my little pony inside my house<span>';

    t.is(truncate(str, 15, {breakword: false}), '<span>my little...</span>');
});

test('should return string 123456...', t => {
    const str = '123456 789';

    t.is(truncate(str, 10, {breakword: true}), str);
});

test('should leave 123456...', t => {
    const str = '123456 789';

    t.is(truncate(str, 9, {breakword: true}), '123456...');
});

test('should leave 12 + ellipsis', t => {
    const str = '<p>12 3456789</p>';

    t.is(truncate(str, 5, {breakword: true}), '<p>12...</p>');
});

test('should leave 12 + ellipsis', t => {
    const str = '<p>12 3456789</p>';

    t.is(truncate(str, 6, {breakword: true}), '<p>12...</p>');
});

test('should leave 12345...', t => {
    const str = '<p>12345678</p>9';

    t.is(truncate(str, 8, {breakword: true}), '<p>12345...</p>');
});

test('should leave 123456...', t => {
    const str = '<span>123456 78909876</span>';

    t.is(truncate(str, 10, {breakword: false}), '<span>123456...</span>');
});

test('should handle void elements', t => {
    const str = '<span>123<br/>456<br/>78909876</span>';

    t.is(truncate(str, 10, {breakword: false}), '<span>123<br/>456...</span>');
});

test('keep tag structure', t => {
    const str = '<div><div><a href="#">Test</a> <span>oder noch was</span></div></div>';
    t.is(truncate(str, 14, {breakword: false}), '<div><div><a href="#">Test</a> <span>oder...</span></div></div>');
});

test('drop too long text', t => {
    const str = 'abcdefghijklmnopqrstuvwxyz';
    t.is(truncate(str, 10, {breakword: false}), '...');
});

test('drop too long text and keep tags', t => {
    const str = '<a href="#">abcdefghijklmnopqrstuvwxyz</a>';
    t.is(truncate(str, 10, {breakword: false}), '<a href="#">...</a>');
});

test('don\'t truncate if it\'s not needed', t => {
    const str = 'this text has 370 characters and we are truncating to 420 sensory claymore mine free-market camera Chiba jeans engine denim tube alcohol. weathered knife papier-mache artisanal corporation boy augmented reality footage otaku table modem digital city dome film boat camera car uplink beef noodles render-farm nodal point wonton soup man hotdog RAF skyscraper market human';
    t.is(truncate(str, 420), str);
});
