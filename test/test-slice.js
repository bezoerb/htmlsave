/* eslint-env es6, browser */
import '../node_modules/babel-core/register';
import test from 'ava';
import {slice} from '../src/htmlsave';

test('slice normal content disabled breakword', t => {
    const options = {breakword: false};
    const str = '<a href="#content">This is a link to my content</a>';
    let parts = slice(str, 0, options);

    t.is(parts.length, 7);
    t.is(parts[0], '<a href="#content">This </a>');
    t.is(parts[1], '<a href="#content">is </a>');
    t.is(parts[2], '<a href="#content">a </a>');
    t.is(parts[3], '<a href="#content">link </a>');
    t.is(parts[4], '<a href="#content">to </a>');
    t.is(parts[5], '<a href="#content">my </a>');
    t.is(parts[6], '<a href="#content">content</a>');
});

test('split text in three parts disabled breakword', t => {
    const options = {breakword: false};
    const str = '<a href="#content">This is a link to my content</a>';
    let parts = slice(str, 13, options);

    t.is(parts.length, 3);
    t.is(parts[0], '<a href="#content">This is a </a>');
    t.is(parts[1], '<a href="#content">link to my </a>');
    t.is(parts[2], '<a href="#content">content</a>');
});

test('slice the string in 3 parts', t => {
    const str = '123456789';
    let parts = slice(str, 3);

    t.is(parts.length, 3);
    t.is(parts[0], '123');
    t.is(parts[1], '456');
    t.is(parts[2], '789');
});

test('add missing tags', t => {
    const str = '<a href="#content">This is a link to my content</a>';
    let parts = slice(str, 14);

    t.is(parts.length, 2);
    t.is(parts[0], '<a href="#content">This is a link</a>');
    t.is(parts[1], '<a href="#content"> to my content</a>');
});

test('add more missing tags', t => {
    const str2 = '<div><a href="#content">This is a link to my content</a></div><span>Test</span>';
    let parts2 = slice(str2, 14);

    t.is(parts2.length, 3);
    t.is(parts2[0], '<div><a href="#content">This is a link</a></div>');
    t.is(parts2[1], '<div><a href="#content"> to my content</a></div>');
    t.is(parts2[2], '<span>Test</span>');
});

test('do nothing', t => {
    const str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>';
    let parts = slice(str, 6);

    t.is(parts.length, 1);
    t.is(parts[0], '<p><span><ul><li>abc</li><li>def</li></ul></span></p>');
});

test('add missing tags', t => {
    const str = '<p><span><ul><li>abc</li><li>def</li></ul></span></p>';
    let parts = slice(str, 3);

    t.is(parts.length, 2);
    t.is(parts[0], '<p><span><ul><li>abc</li></ul></span></p>');
    t.is(parts[1], '<p><span><ul><li>def</li></ul></span></p>');
});

test('handle void elements', t => {
    const str2 = '<a href="#content">This is a link<br/>to my contents</a><span>Test</span>';
    let parts2 = slice(str2, 14, {breakword: false});

    t.is(parts2.length, 3);
    t.is(parts2[0], '<a href="#content">This is a link<br/></a>');
    t.is(parts2[1], '<a href="#content">to my </a>');
    t.is(parts2[2], '<a href="#content">contents</a><span>Test</span>');
});

test('different lengths', t => {
    const str = '<a href="#content">This is a link to my content</a>';
    let parts = slice(str, [1, 2, 5, 7]);

    t.is(parts.length, 6);
    t.is(parts[0], '<a href="#content">T</a>');
    t.is(parts[1], '<a href="#content">hi</a>');
    t.is(parts[2], '<a href="#content">s is </a>');
    t.is(parts[3], '<a href="#content">a link </a>');
    t.is(parts[4], '<a href="#content">to my c</a>');
    t.is(parts[5], '<a href="#content">ontent</a>');
});
