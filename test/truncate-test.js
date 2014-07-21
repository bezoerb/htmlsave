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
var truncate = require('../src/modules/truncate.js'),
    utils = require('../src/modules/utils.js'),
    HTMLHint  = require("htmlhint").HTMLHint,
    expect = require('chai').expect;




/*
 Tests for truncate
 */
describe('truncate', function() {

    var text = '<p>Lorem ipsum <a href="#">dolor sit amet</a>, conset<span>etur sadipscing elitr, sed</span>diam <div>nonumy eirmod</div>tempor invidunt ut labore et dolore magna aliquyam</p>';


    /**
     * Truncate string after specified word + offset
     * do basic tests on result
     *
     * @param word
     * @param offset
     * @returns {*}
     */
    function getResultForWord(word, offset,options) {
        var result,length, messages,
            maxLength = utils.stripTags(text).indexOf(word) + word.length;

        if (offset) {
            maxLength += parseInt(offset,10);
        }

        result = truncate(text,maxLength,options);

        messages = HTMLHint.verify(result, {'tag-pair': true});
        length = utils.stripTags(result).length;


        expect(messages.length).to.equals(0,messages.length ? 'Htmlhint errors found: ' + messages[0].message : '');
        expect(length).to.be.at.most(maxLength);

        return result;
    }

    it('should truncate with ellipsis', function() {
        expect(getResultForWord('sit')).to.equals('<p>Lorem ipsum <a href="#">dolor...</a></p>');
    });

    it('should truncate without ellipsis', function() {
        var result = getResultForWord('sit',0,{ellipsis:false});
        expect(result).to.equals('<p>Lorem ipsum <a href="#">dolor sit</a></p>');
    });

    it('should strip the a tag', function() {
        var result = getResultForWord('ipsum',3);
        expect(result).to.equals('<p>Lorem ipsum...</p>');
    });
    it('should remove whitespace before ellipsis', function() {
        var result = getResultForWord('ipsum',2,{ellipsis:'..'});
        expect(result).to.equals('<p>Lorem ipsum..</p>');
    });
    it('should remove ipsum', function() {
        var result = getResultForWord('ipsum',2,{ellipsis:'...'});
        expect(result).to.equals('<p>Lorem...</p>');
    });

    it('should strip the a tag', function() {
        var result = getResultForWord('ipsum', 3, {breakword: true});
        expect(result).to.equals('<p>Lorem ipsum...</p>');
    });

    it('should strip the a tag', function() {
        var result = getResultForWord('ipsum', 0, {breakword: true});
        expect(result).to.equals('<p>Lorem ip...</p>');
    });


});

describe('no truncate needed',function(){
    var options = {breakword:false};

    it('should not add ellipsis', function () {
        var str = '<p>12 3456789</p>',
            res = truncate(str,50,options);

        expect(res).to.equals('<p>12 3456789</p>');
    });
});

describe('truncate html, preserve words with maxlength lower than ellipsis length',function(){
    var options = {breakword:false};

    it('should truncate ellipsis', function () {
        var str = '<p>12 3456789</p>',
            res = truncate(str,1,options);

        expect(res).to.equals('<p>.</p>');
    });

    it('should return empty string', function () {
        var str = '<p>hello my little pony</p>',
            res = truncate(str,0,options);

        expect(res).to.equals('');
    });
});

describe('truncate html,preserve words with negative maxlength',function(){
    var options = {breakword:false};

    it('should truncate ellipsis', function () {
        var str = '<p>12 3456789</p>',
            res = truncate(str,-3,options);

        expect(res).to.equals('<p>12...</p>');
    });

    it('should leave <p></p>', function () {
        var str = '<p>hello my little pony</p>',
            res = truncate(str,-1,options);

        expect(res).to.equals('<p>hello my little...</p>');
    });
});

describe('truncate html and preserve words',function(){
    var options = {breakword:false};

    it('should only leave ellipsis', function () {
        var str = '<p>12 3456789</p>',
            res = truncate(str,8,options);

        expect(res).to.equals('<p>12...</p>');
    });

    it('should leave <p>hello my...</p>', function () {
        var str = '<p>hello my little pony</p>',
            res = truncate(str,15,options);

        expect(res).to.equals('<p>hello my...</p>');
    });

    it('should leave <span>my little...</span>', function () {
        var str = '<span>my little pony inside my house<span>',
            res = truncate(str,15,options);

        expect(res).to.equals('<span>my little...</span>');
    });
});




describe('truncate text',function(){
    it('should only leave ellipsis', function () {
        var str = '123456789',
            res = truncate(str,3);

        expect(res).to.equals('...');
    });

    it('should leave 12345...', function () {
        var str = '123456789',
            res = truncate(str,8);

        expect(res).to.equals('12345...');
    });

    it('should leave 123456...', function () {
        var str = '123456 789',
            res = truncate(str,10);

        expect(res).to.equals('123456...');
    });
});

describe('truncate html',function(){
    it('should only leave ellipsis', function () {
        var str = '<p>12 3456789</p>',
            res = truncate(str,3);

        expect(res).to.equals('<p>...</p>');
    });

    it('should leave 12 + ellipsis', function () {
        var str = '<p>12 3456789</p>',
            res = truncate(str,5);

        expect(res).to.equals('<p>12...</p>');
    });

    it('should leave 12 + ellipsis', function () {
        var str = '<p>12 3456789</p>',
            res = truncate(str,6);

        expect(res).to.equals('<p>12...</p>');
    });

    it('should leave 12345...', function () {
        var str = '<p>12345678</p>9',
            res = truncate(str,8,{breakword:true});

        expect(res).to.equals('<p>12345...</p>');
    });

    it('should leave 123456...', function () {
        var str = '<span>123456 78909876</span>',
            res = truncate(str,10);

        expect(res).to.equals('<span>123456...</span>');
    });
});