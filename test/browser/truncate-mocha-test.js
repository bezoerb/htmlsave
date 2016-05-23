/**
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright Copyright (c) 2014 Ben Zörb
 *
 * Licensed under the MIT license.
 * http://bezoerb.mit-license.org/
 * All rights reserved.
 */
'use strict';
/* jshint -W098 */
/* global describe, it, before, grunt */
var truncate = truncate || require('../dist/htmlsave').truncate;
var expect = expect || require('chai').expect;
var assert = assert || require('chai').assert;

describe('no truncate needed', function () {
    var options = {breakword: false};

    it('should not add ellipsis', function () {
        var str = '<p>12 3456789</p>';
        var res = truncate(str, 50, options);

        expect(res).to.equals('<p>12 3456789</p>');
    });

    it('should throw an error if ellipsis length equals maxlength', function () {
        var str = '<p>12 3456789</p>';

        try {
            var res = truncate(str, 3, {
                ellipsis: '...'
            });
            assert.fail('error expected');
        } catch (err) {
            assert.ok(err);
        }
    });

    it('should throw an error if ellipsis length is greater than maxlength', function () {
        var str = '<p>12 3456789</p>';

        try {
            var res = truncate(str, 1, {
                ellipsis: '...'
            });
            assert.fail('error expected');
        } catch (err) {
            assert.ok(err);
        }
    });
});

describe('truncate html, preserve words with maxlength lower than ellipsis length', function () {
    var options = {breakword: false};

    it('should return empty string', function () {
        var str = '<p>hello my little pony</p>';
        var res = truncate(str, 0, options);

        expect(res).to.equals('');
    });
});

describe('truncate html,preserve words with negative maxlength', function () {
    var options = {breakword: false};

    it('should truncate ellipsis', function () {
        var str = '<p>12 3456789</p>';
        var res = truncate(str, -3, options);

        expect(res).to.equals('<p>12...</p>');
    });

    it('should leave <p></p>', function () {
        var str = '<p>hello my little pony</p>';
        var res = truncate(str, -1, options);

        expect(res).to.equals('<p>hello my little...</p>');
    });
});

describe('truncate html and preserve words', function () {
    var options = {breakword: false};

    it('should only leave ellipsis', function () {
        var str = '<p>12 3456789</p>';
        var res = truncate(str, 8, options);

        expect(res).to.equals('<p>12...</p>');
    });

    it('should leave <p>hello my...</p>', function () {
        var str = '<p>hello my little pony</p>',
            res = truncate(str, 15, options);

        expect(res).to.equals('<p>hello my...</p>');
    });

    it('should leave <span>my little...</span>', function () {
        var str = '<span>my little pony inside my house<span>';
        var res = truncate(str, 15, options);

        expect(res).to.equals('<span>my little...</span>');
    });
});

describe('truncate text', function () {
    it('should leave 12345...', function () {
        var str = '123456789';
        var res = truncate(str, 8);

        expect(res).to.equals('12345...');
    });

    it('should leave 123456...', function () {
        var str = '123456 789';
        var res = truncate(str, 9, {breakword: false});

        expect(res).to.equals('123456...');
    });
});

describe('truncate html', function () {
    it('should leave 12 + ellipsis', function () {
        var str = '<p>12 3456789</p>';
        var res = truncate(str, 5);

        expect(res).to.equals('<p>12...</p>');
    });

    it('should leave 12 + ellipsis', function () {
        var str = '<p>12 3456789</p>';
        var res = truncate(str, 6);

        expect(res).to.equals('<p>12...</p>');
    });

    it('should leave 12345...', function () {
        var str = '<p>12345678</p>9';
        var res = truncate(str, 8, {breakword: true});

        expect(res).to.equals('<p>12345...</p>');
    });

    it('should leave 123456...', function () {
        var str = '<span>123456 78909876</span>';
        var res = truncate(str, 10);

        expect(res).to.equals('<span>123456...</span>');
    });
});
