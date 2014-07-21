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
/*jshint -W098 */
/* global describe, it, before, grunt */
var utils = require('../src/modules/utils.js'),
    expect = require('chai').expect;



/*
 Tests for helper utils - canSplit
 */
describe('canSplit', function() {

    var text = '<p>Lorem ipsum <a href="#">dolor sit amet</a>, conset<span>etur sadipscing elitr, sed</span>diam <div>nonumy eirmod</div>tempor invidunt ut labore et dolore magna aliquyam</p>';

    it('should allow splitting on whitespace', function() {
        var result = utils.canSplit(text,text.indexOf(' '));
        expect(result).to.equals(true);
    });

    it('should allow splitting right before/after block element', function(){
        var index = text.indexOf('</div>') + 6,
            result = utils.canSplit(text,index);

        expect(result).to.equals(true);

        index = text.indexOf('<div>'),
        result = utils.canSplit(text,index);
        expect(result).to.equals(true);
    });

    it('should disallow splitting right before/after inline element', function(){
        var index = text.indexOf('</span>') + 7,
            result = utils.canSplit(text,index);

        expect(result).to.equals(false);

        index = text.indexOf('<span>'),
            result = utils.canSplit(text,index);
        expect(result).to.equals(false);
    });

    it(' should disallow splitting inside word', function(){
        var index = text.indexOf('Lorem') + 3,
            result = utils.canSplit(text,index);

        expect(result).to.equals(false);
    });

    it(' should disallow splitting inside tag', function(){
        var index = text.indexOf('<span>') + 3,
            result = utils.canSplit(text,index);

        expect(result).to.equals(false);
    });
});

/**
 * Tests for isArray
 */
describe('isArray', function(){
    it('should return false for objects', function() {
        var result = utils.isArray({});
        expect(result).to.equals(false);
    });
    it('should return false for string', function() {
        var result = utils.isArray('no array');
        expect(result).to.equals(false);
    });
    it('should return false for int', function() {
        var result = utils.isArray(1);
        expect(result).to.equals(false);
    });
    it('should return false for function', function() {
        var result = utils.isArray(function noop(){});
        expect(result).to.equals(false);
    });
    it('should return true for array', function() {
        var result = utils.isArray([]);
        expect(result).to.equals(true);
    });
});

/*
 Tests for helper utils - isVoidElement
 */
describe('isVoidElement', function() {
    it('should return false for div', function() {
        var result = utils.isVoidElement('<div>');
        expect(result).to.equals(false);
    });
    it('should return true for img (short tag)', function() {
        var result = utils.isVoidElement('<img src="" />');
        expect(result).to.equals(true);
    });
    it('should return true for img', function() {
        var result = utils.isVoidElement('<img src="">');
        expect(result).to.equals(true);
    });
});

/*
 Tests for helper utils - isVoidElement
 */
describe('findNextWhitespacePosition', function() {
    var text = '<p>Lorem ipsum <a href="#">dolor sit amet</a>, conset<span>etur sadipscing elitr, sed</span>diam<div>nonumy eirmod</div>tempor invidunt ut labore et dolore magna aliquyam</p>';

    /**
     * Truncate string after specified word +1 offset
     * do basic tests on result
     *
     * @param word
     * @param offset
     * @returns {*}
     */
    function nextAfter(word, offset) {
        var p = text.indexOf(word) + (offset || 0) + word.length;
        return utils.findNextWhitespacePosition(text,p);
    }

    it('should find first ws between lorem and ipsum', function() {
        var result = utils.findNextWhitespacePosition(text,1);
        expect(result).to.equals(5);
    });
    it('should find div start tag', function() {
        var result = nextAfter('elitr, ');
        expect(result).to.equals(7);
    });
    it('should find pos after dolor', function() {
        var result = nextAfter('a hre');
        expect(result).to.equals(5);
    });
    it('should allow break direct after the tag is finished', function() {
        var result = nextAfter('</d');
        expect(result).to.equals(0);
    });
    it('should take first ws inside div container, not after opening div', function() {
        var result = nextAfter('<di');
        expect(result).to.equals(6);
    });
});